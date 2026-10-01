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
          headers: ['No Tahap', 'Proses Kerja SOP', 'Jabatan PIC', 'Status', 'Tgl Jadwal', 'Tgl Aktual', 'Output / Kebutuhan Mesin', 'Catatan Teknis PE'],
          rows: currentStyle.steps
            .filter(s => s.process.toLowerCase().includes(searchFilter.toLowerCase()) || s.picDept.toLowerCase().includes(searchFilter.toLowerCase()))
            .map((step) => [
              step.id,
              step.process,
              step.picDept,
              step.status,
              step.dateScheduled,
              step.actualDate || step.dateCompleted || '-',
              step.outputDescription,
              step.machineBreakdownNotes || step.notes || '-'
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
      ['No', 'Tahap / Proses', 'Jabatan PIC', 'Status', 'Tgl Jadwal', 'Tgl Aktual', 'Output / Mesin', 'Catatan Teknis PE'],
      ...currentStyle.steps.map(step => [
        step.id, step.process, step.picDept, step.status, step.dateScheduled, step.actualDate || step.dateCompleted || '-', step.outputDescription, step.machineBreakdownNotes || step.notes || '-'
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
      <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h1 className="text-base font-bold text-slate-900">
            Tabel Data &amp; Ekspor Excel
          </h1>

          {/* Export & Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari data..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-white rounded-lg border border-slate-200 text-xs w-44 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <button
              onClick={handleCopyClipboard}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin' : 'Salin'}</span>
            </button>

            <button
              onClick={() => openPrintModal('spreadsheet')}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              title="Cetak PDF"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsGoogleScriptModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Google Sheet</span>
            </button>

            <button
              onClick={handleExportFullExcel}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Excel (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* Spreadsheet Tabs Selector */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg overflow-x-auto text-xs w-fit max-w-full">
          {[
            { id: 'STOCK', label: 'Stok Gudang', count: stock.length },
            { id: 'MUTATION', label: 'Mutasi', count: transactions.length },
            { id: 'WORKFLOW', label: 'SOP PE', count: currentStyle.steps.length },
            { id: 'PPIC_PLANNING', label: 'Komponen PPIC', count: componentAllocations.length },
            { id: 'SUBCON', label: 'Subkon', count: subconTasks.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSheet(tab.id as SheetType);
                setSelectedCell(null);
              }}
              className={`px-3 py-1.5 rounded-md font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSheet === tab.id
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] text-slate-400 tabular-nums">({tab.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Spreadsheet Data Grid */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] scrollbar-thin">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200">
              <tr className="text-slate-600 font-semibold text-[11px]">
                {currentSheetData.headers.map((header, colIdx) => (
                  <th 
                    key={colIdx} 
                    className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {currentSheetData.rows.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-slate-50 transition-colors">
                  {row.map((cellVal: any, colIdx: number) => {
                    const isSelected = selectedCell?.row === rowIdx && selectedCell?.col === colIdx;
                    const isNumeric = typeof cellVal === 'number';

                    return (
                      <td
                        key={colIdx}
                        onClick={() => setSelectedCell({ row: rowIdx, col: colIdx, val: String(cellVal) })}
                        className={`py-2 px-3 border-r border-slate-100 whitespace-nowrap cursor-cell tabular-nums ${
                          isNumeric ? 'text-right' : 'text-left'
                        } ${
                          isSelected 
                            ? 'bg-emerald-50 ring-1 ring-emerald-600 font-bold text-slate-900' 
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
      </div>

    </div>
  );
};
