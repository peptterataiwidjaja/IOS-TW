import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import * as XLSX from 'xlsx';
import { 
  Table2, 
  Download, 
  Printer, 
  Copy, 
  Search, 
  Check, 
  FileSpreadsheet, 
  Layers, 
  Building2, 
  Sparkles,
  FileDown,
  Code2
} from 'lucide-react';

type SheetType = 'STOCK' | 'MUTATION' | 'WORKFLOW' | 'PPIC_PLANNING' | 'SUBCON';

export const SpreadsheetView: React.FC = () => {
  const { stock, transactions, currentStyle, subconTasks, styles, componentAllocations, openPrintModal, setIsGoogleScriptModalOpen } = useApp();

  const [activeSheet, setActiveSheet] = useState<SheetType>('STOCK');
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number; val: string } | null>({
    row: 0,
    col: 0,
    val: stock[0]?.name || ''
  });
  const [searchFilter, setSearchFilter] = useState('');
  const [copied, setCopied] = useState(false);

  // Define data per sheet
  const getSheetData = () => {
    switch (activeSheet) {
      case 'STOCK':
        return {
          title: 'STOK_BAHAN_BAKU_PER_STYLE',
          headers: ['No', 'Kode SKU', 'Nama Bahan Baku', 'Kategori', 'Style Alokasi', 'Stok Aktual', 'Batas Min', 'Satuan', 'Lokasi Rak', 'Harga Satuan (Rp)', 'Total Aset (Rp)', 'Supplier'],
          rows: stock
            .filter(s => s.name.toLowerCase().includes(searchFilter.toLowerCase()) || s.code.toLowerCase().includes(searchFilter.toLowerCase()) || s.styleCode.toLowerCase().includes(searchFilter.toLowerCase()))
            .map((item, idx) => [
              idx + 1,
              item.code,
              item.name,
              item.category,
              item.styleCode,
              item.currentStock,
              item.minStockLevel,
              item.unit,
              item.rackLocation,
              item.unitPrice,
              item.currentStock * item.unitPrice,
              item.supplier
            ])
        };

      case 'MUTATION':
        return {
          title: 'RIWAYAT_MUTASI_DAN_PIC',
          headers: ['No', 'Waktu', 'Tipe', 'Kode Bahan', 'Nama Bahan', 'Style Target', 'Style Asli Item', 'Flag Cross-Style', 'Jumlah', 'Satuan', 'Dept Tujuan', 'PIC Tanggung Jawab', 'Petugas Gudang', 'No. Ref Dokumen', 'Alasan / Kebutuhan'],
          rows: transactions
            .filter(t => t.itemName.toLowerCase().includes(searchFilter.toLowerCase()) || t.picReceiver.toLowerCase().includes(searchFilter.toLowerCase()) || t.styleTarget.toLowerCase().includes(searchFilter.toLowerCase()))
            .map((tx, idx) => [
              idx + 1,
              tx.timestamp,
              tx.type,
              tx.itemCode,
              tx.itemName,
              tx.styleTarget,
              tx.allocatedStyleOfItem,
              tx.isCrossStyle ? 'YA (CROSS-STYLE)' : 'TIDAK',
              tx.quantity,
              tx.unit,
              tx.destinationDept,
              tx.picReceiver,
              tx.picGudang,
              tx.referenceDoc,
              tx.reason || '-'
            ])
        };

      case 'WORKFLOW':
        return {
          title: 'SOP_WORKFLOW_PE_TERATAI',
          headers: ['No Tahap', 'Proses Kerja SOP', 'PIC / Departemen', 'Status', 'Tgl Jadwal', 'Tgl Selesai', 'Output / Kebutuhan Mesin', 'Catatan Teknis PE', 'Nama PIC'],
          rows: currentStyle.steps
            .filter(s => s.process.toLowerCase().includes(searchFilter.toLowerCase()) || s.picDept.toLowerCase().includes(searchFilter.toLowerCase()))
            .map((step) => [
              step.id,
              step.process,
              step.picDept,
              step.status,
              step.dateScheduled,
              step.dateCompleted || '-',
              step.outputDescription,
              step.machineBreakdownNotes || step.notes || '-',
              step.picName || '-'
            ])
        };

      case 'PPIC_PLANNING':
        return {
          title: 'ALOKASI_KOMPONEN_DAN_BOM_PPIC',
          headers: ['No', 'Kode Style', 'Nama Komponen / Panel', 'Kategori Panel', 'Jalur Pengerjaan', 'Lokasi (Line / Subkon)', 'Kebutuhan/Pcs', 'Total Panel Order', 'Proses Kerja', 'Status', 'PIC', 'Target Tgl', 'Catatan'],
          rows: componentAllocations
            .filter(c => c.componentName.toLowerCase().includes(searchFilter.toLowerCase()) || c.styleCode.toLowerCase().includes(searchFilter.toLowerCase()) || c.targetLocation.toLowerCase().includes(searchFilter.toLowerCase()))
            .map((comp, idx) => [
              idx + 1,
              comp.styleCode,
              comp.componentName,
              comp.panelCategory,
              comp.route === 'LINE' ? 'LINE INTERNAL (IN-HOUSE)' : 'MITRA SUBKON LUAR',
              comp.targetLocation,
              comp.qtyPerPcs,
              comp.totalRequiredQty,
              comp.processDescription,
              comp.status,
              comp.picName,
              comp.targetDate || '-',
              comp.notes || '-'
            ])
        };

      case 'SUBCON':
        return {
          title: 'MONITORING_MITRA_SUBCON',
          headers: ['No', 'Nama Mitra Subkon', 'Jenis Pekerjaan', 'Style Target', 'Qty Kirim', 'Qty Kembali', 'Sisa WIP', 'Satuan', 'Tgl Kirim', 'Estimasi Balik', 'Status', 'PIC Subkon', 'PIC Internal', 'Tarif / Pcs (Rp)', 'Total Biaya (Rp)', 'Defect (Pcs)'],
          rows: subconTasks
            .filter(sub => sub.subconName.toLowerCase().includes(searchFilter.toLowerCase()) || sub.styleCode.toLowerCase().includes(searchFilter.toLowerCase()))
            .map((task, idx) => [
              idx + 1,
              task.subconName,
              task.type,
              task.styleCode,
              task.quantitySend,
              task.quantityReceived,
              task.quantitySend - task.quantityReceived,
              task.unit,
              task.sendDate,
              task.estReturnDate,
              task.status,
              task.picSubcon,
              task.picInternal,
              task.ratePerPcs,
              task.totalCost,
              task.defectPcs
            ])
        };
    }
  };

  const currentSheetData = getSheetData();

  // Export to Multi-sheet Excel workbook using SheetJS
  const handleExportFullExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Stock
    const wsStock = XLSX.utils.aoa_to_sheet([
      ['PT TERATAI WIDJAJA - LAPORAN STOK GUDANG GARMEN PER STYLE'],
      [`Tanggal Ekspor: ${new Date().toLocaleString('id-ID')}`],
      [],
      ['No', 'Kode SKU', 'Nama Bahan Baku', 'Kategori', 'Style Alokasi', 'Stok Aktual', 'Batas Min', 'Satuan', 'Lokasi Rak', 'Harga Satuan (Rp)', 'Total Aset (Rp)', 'Supplier'],
      ...stock.map((item, idx) => [
        idx + 1, item.code, item.name, item.category, item.styleCode, item.currentStock, item.minStockLevel, item.unit, item.rackLocation, item.unitPrice, item.currentStock * item.unitPrice, item.supplier
      ])
    ]);
    XLSX.utils.book_append_sheet(wb, wsStock, 'Stok_Gudang');

    // Sheet 2: Transactions
    const wsTx = XLSX.utils.aoa_to_sheet([
      ['PT TERATAI WIDJAJA - RIWAYAT MUTASI & AKUNTABILITAS PIC'],
      [`Tanggal Ekspor: ${new Date().toLocaleString('id-ID')}`],
      [],
      ['No', 'Waktu', 'Tipe', 'Kode Bahan', 'Nama Bahan', 'Style Target', 'Style Asli', 'Cross-Style', 'Jumlah', 'Satuan', 'Dept Tujuan', 'PIC Tanggung Jawab', 'Petugas Gudang', 'No. Ref', 'Alasan'],
      ...transactions.map((tx, idx) => [
        idx + 1, tx.timestamp, tx.type, tx.itemCode, tx.itemName, tx.styleTarget, tx.allocatedStyleOfItem, tx.isCrossStyle ? 'YA' : 'TIDAK', tx.quantity, tx.unit, tx.destinationDept, tx.picReceiver, tx.picGudang, tx.referenceDoc, tx.reason || '-'
      ])
    ]);
    XLSX.utils.book_append_sheet(wb, wsTx, 'Mutasi_PIC');

    // Sheet 3: Workflow SOP
    const wsWorkflow = XLSX.utils.aoa_to_sheet([
      [`PT TERATAI WIDJAJA - SOP WORKFLOW PE STYLE ${currentStyle.code}`],
      [`Buyer: ${currentStyle.buyer} | Target: ${currentStyle.targetQuantityPcs} pcs`],
      [],
      ['No', 'Tahap / Proses', 'PIC / Dept', 'Status', 'Tgl Jadwal', 'Tgl Selesai', 'Output / Mesin', 'Catatan Teknis PE', 'Nama PIC'],
      ...currentStyle.steps.map(step => [
        step.id, step.process, step.picDept, step.status, step.dateScheduled, step.dateCompleted || '-', step.outputDescription, step.machineBreakdownNotes || step.notes || '-', step.picName || '-'
      ])
    ]);
    XLSX.utils.book_append_sheet(wb, wsWorkflow, 'SOP_PE');

    // Sheet 4: PPIC Komponen & BOM
    const wsPPIC = XLSX.utils.aoa_to_sheet([
      ['PT TERATAI WIDJAJA - ALOKASI KOMPONEN & KEBUTUHAN BAHAN PPIC'],
      [`Tanggal Ekspor: ${new Date().toLocaleString('id-ID')}`],
      [],
      ['No', 'Style', 'Nama Komponen', 'Kategori', 'Jalur Pengerjaan', 'Lokasi Line / Subkon', 'Qty/Pcs', 'Total Kebutuhan', 'Proses Kerja', 'Status', 'PIC', 'Target Selesai'],
      ...componentAllocations.map((comp, idx) => [
        idx + 1, comp.styleCode, comp.componentName, comp.panelCategory, comp.route === 'LINE' ? 'Line In-House' : 'Mitra Subkon', comp.targetLocation, comp.qtyPerPcs, comp.totalRequiredQty, comp.processDescription, comp.status, comp.picName, comp.targetDate || '-'
      ])
    ]);
    XLSX.utils.book_append_sheet(wb, wsPPIC, 'PPIC_Komponen');

    // Save file
    XLSX.writeFile(wb, `PT_Teratai_Widjaja_Laporan_Garmen_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleCopyClipboard = () => {
    const text = [
      currentSheetData.headers.join('\t'),
      ...currentSheetData.rows.map(r => r.join('\t'))
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getColLetter = (colIndex: number) => {
    return String.fromCharCode(65 + colIndex);
  };

  return (
    <div className="space-y-4">
      
      {/* Spreadsheet Header Toolbar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1 border border-emerald-200">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                Spreadsheet Report Engine
              </span>
              <span className="text-xs text-slate-400 font-medium">• Pelaporan Spreed Sheet Terpadu</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Pelaporan Spreed Sheet &amp; Ekspor Buku Kerja Excel (.xlsx)
            </h1>
            <p className="text-xs text-slate-600 mt-0.5 max-w-3xl">
              Tampilan spreadsheet interaktif untuk memeriksa inventori, audit mutasi PIC, alur SOP PE, dan mutasi arus kas pabrik PT Teratai Widjaja secara transparan.
            </p>
          </div>

          {/* Export & Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopyClipboard}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              title="Salin Data Tabel ke Clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin!' : 'Salin Data'}</span>
            </button>

            <button
              onClick={() => openPrintModal('spreadsheet')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              title="Cetak PDF Dokumen Lembar Kerja Spreadsheet (Hitam Putih)"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak PDF</span>
            </button>

            <button
              onClick={() => setIsGoogleScriptModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              title="Koneksi Google Spreadsheet & Salin Kode Google Apps Script (Code.gs)"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Kode Google Script (Code.gs)</span>
            </button>

            <button
              onClick={handleExportFullExcel}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs transition-colors"
              title="Download File Excel Lengkap dengan Semua Sheet"
            >
              <FileDown className="w-4 h-4" />
              <span>Download Excel (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* Formula Bar Simulation */}
        <div className="mt-4 flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs">
          <div className="px-2.5 py-1 bg-white font-mono font-bold text-slate-700 rounded border border-slate-300 shadow-2xs">
            {selectedCell ? `${getColLetter(selectedCell.col)}${selectedCell.row + 1}` : 'A1'}
          </div>
          <div className="font-mono text-slate-400 font-bold px-1 select-none">
            fx
          </div>
          <input
            type="text"
            readOnly
            value={selectedCell ? selectedCell.val : ''}
            className="flex-1 bg-white px-3 py-1 rounded border border-slate-200 font-mono text-slate-800 text-xs focus:outline-none"
            placeholder="Pilih sel pada spreadsheet untuk melihat nilai..."
          />
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Filter teks lembar kerja..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-8 pr-3 py-1 bg-white rounded border border-slate-200 text-xs font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Spreadsheet Tabs Selector */}
      <div className="flex items-center gap-1 bg-slate-900 p-1.5 rounded-2xl overflow-x-auto shadow-xs text-xs">
        {[
          { id: 'STOCK', label: '📊 1. Stok_Bahan_Gudang_Style', count: stock.length },
          { id: 'MUTATION', label: '🚚 2. Mutasi_dan_PIC_TanggungJawab', count: transactions.length },
          { id: 'WORKFLOW', label: '📋 3. SOP_Workflow_PE_Teratai', count: currentStyle.steps.length },
          { id: 'PPIC_PLANNING', label: '🧩 4. Alokasi_Komponen_PPIC', count: componentAllocations.length },
          { id: 'SUBCON', label: '🧵 5. Monitoring_Subkon_Mitra', count: subconTasks.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveSheet(tab.id as SheetType);
              setSelectedCell(null);
            }}
            className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeSheet === tab.id
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            <span className="text-[10px] bg-black/30 px-1.5 py-0.2 rounded-full font-mono">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Spreadsheet Data Grid */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] scrollbar-thin">
          <table className="w-full text-left text-xs border-collapse font-sans">
            
            {/* Column coordinate row (A, B, C, D...) */}
            <thead className="sticky top-0 z-20 bg-slate-100 border-b border-slate-300">
              <tr className="bg-slate-200/90 text-slate-500 text-[10px] font-mono select-none">
                <th className="py-1 px-2 text-center w-12 bg-slate-300/80 border-r border-slate-300">
                  #
                </th>
                {currentSheetData.headers.map((_, colIdx) => (
                  <th key={colIdx} className="py-1 px-3 text-center border-r border-slate-300 font-bold">
                    {getColLetter(colIdx)}
                  </th>
                ))}
              </tr>
              <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                <th className="py-2 px-2 text-center bg-slate-200 border-r border-slate-300 text-[11px]">
                  &bull;
                </th>
                {currentSheetData.headers.map((header, colIdx) => (
                  <th 
                    key={colIdx} 
                    className="py-2 px-3 border-r border-slate-300 whitespace-nowrap text-slate-800 tracking-tight"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Rows */}
            <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
              {currentSheetData.rows.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-indigo-50/40 transition-colors">
                  
                  {/* Row Number Coordinate */}
                  <td className="py-2 px-2 text-center bg-slate-100 text-slate-500 font-mono font-bold select-none border-r border-slate-300 text-[10px]">
                    {rowIdx + 1}
                  </td>

                  {/* Cell values */}
                  {row.map((cellVal: any, colIdx: number) => {
                    const isSelected = selectedCell?.row === rowIdx && selectedCell?.col === colIdx;
                    const isNumeric = typeof cellVal === 'number';

                    return (
                      <td
                        key={colIdx}
                        onClick={() => setSelectedCell({ row: rowIdx, col: colIdx, val: String(cellVal) })}
                        className={`py-2 px-3 border-r border-slate-200 whitespace-nowrap cursor-cell transition-all ${
                          isNumeric ? 'text-right' : 'text-left'
                        } ${
                          isSelected 
                            ? 'bg-emerald-100/70 ring-2 ring-emerald-600 font-bold text-slate-900 z-10 relative' 
                            : 'text-slate-800'
                        }`}
                      >
                        {isNumeric && (currentSheetData.headers[colIdx].includes('Rp') || currentSheetData.headers[colIdx].includes('Aset') || currentSheetData.headers[colIdx].includes('Biaya'))
                          ? `Rp ${cellVal.toLocaleString('id-ID')}`
                          : (isNumeric ? cellVal.toLocaleString() : String(cellVal))}
                      </td>
                    );
                  })}

                </tr>
              ))}
            </tbody>

          </table>
        </div>

        {/* Footer status */}
        <div className="p-3 bg-slate-100 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-2">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-800 font-mono">
              SHEET: {currentSheetData.title}
            </span>
            <span>• {currentSheetData.rows.length} Baris Data</span>
          </div>

          <div className="text-[11px] text-slate-500">
            Format kompatibel dengan Microsoft Excel (.xlsx), Google Sheets, dan LibreOffice Calc.
          </div>
        </div>

      </div>

    </div>
  );
};
