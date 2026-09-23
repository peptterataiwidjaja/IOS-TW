import React, { useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Printer, 
  X, 
  FileText, 
  Layers, 
  Warehouse, 
  Truck, 
  ClipboardCheck, 
  BarChart3, 
  ShieldCheck, 
  Table2,
  CheckCircle2
} from 'lucide-react';

interface PrintPDFModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrintPDFModal: React.FC<PrintPDFModalProps> = ({ isOpen, onClose }) => {
  const { 
    companyLogo, 
    activePrintBar, 
    openPrintModal,
    currentStyle, 
    currentUser, 
    styles,
    selectedStyleId,
    setSelectedStyleId,
    componentAllocations, 
    productionMaterials,
    stock, 
    transactions, 
    subconTasks,
    users
  } = useApp();

  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    const printContent = document.getElementById('printable-pdf-document');
    if (!printContent) {
      window.print();
      return;
    }

    // Create an isolated hidden iframe for 100% uninterrupted multi-page printing without viewport clipping
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    // Collect all loaded CSS/styles so Tailwind and icons look identical
    const styleSheets = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map(node => node.outerHTML)
      .join('\n');

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="id">
        <head>
          <meta charset="UTF-8">
          <title>${getBarTitle(activePrintBar)} - PT Teratai Widjaja</title>
          ${styleSheets}
          <style>
            @page {
              size: A4 portrait;
              margin: 12mm 10mm 12mm 10mm;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background-color: #ffffff !important;
              color: #000000 !important;
              font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              height: auto !important;
              min-height: 0 !important;
              overflow: visible !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            #printable-pdf-document {
              width: 100% !important;
              max-width: 100% !important;
              min-height: 0 !important;
              height: auto !important;
              margin: 0 !important;
              padding: 0 !important;
              box-shadow: none !important;
              border: none !important;
              display: block !important;
              overflow: visible !important;
            }
            table {
              width: 100% !important;
              border-collapse: collapse !important;
              page-break-inside: auto !important;
              break-inside: auto !important;
            }
            thead {
              display: table-header-group !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              page-break-after: avoid !important;
              break-after: avoid !important;
            }
            tbody {
              page-break-inside: auto !important;
              break-inside: auto !important;
            }
            tr {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              page-break-after: auto !important;
              break-after: auto !important;
            }
            th, td {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            .avoid-break, [data-avoid-break] {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
          </style>
        </head>
        <body>
          ${printContent.outerHTML}
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.error('Iframe print error, falling back to window.print():', err);
        window.print();
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1500);
      }
    }, 300);
  };

  const currentDateFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const currentTimeFormatted = new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Filter materials for current style
  const currentMaterials = productionMaterials.filter(m => m.styleCode === currentStyle.code);
  const currentComponents = componentAllocations.filter(c => c.styleCode === currentStyle.code);

  const getBarTitle = (barId: string) => {
    switch (barId) {
      case 'pe-workflow':
        return 'LEMBAR KONTROL ALUR STANDAR OPERASIONAL (SOP) PE & PRODUKSI';
      case 'ppic-planning':
        return 'LEMBAR PERENCANAAN PPIC: ALOKASI KOMPONEN & BILL OF MATERIALS (BOM)';
      case 'warehouse-stock':
        return 'LAPORAN STATUS STOK GUDANG BAHAN BAKU & AKSESORIS';
      case 'subcon':
        return 'LEMBAR PENGAWASAN & SPK KERJA SAMA MITRA SUBKON';
      case 'transactions':
        return 'BUKU MUTASI PENGELUARAN GUDANG & CATATAN TRANSAKSI PIC';
      case 'analytics':
        return 'RINGKASAN EKSEKUTIF ANALITIK & EFISIENSI PRODUKSI';
      case 'user-access':
        return 'MATRIKS HAK AKSES SISTEM & DAFTAR PENGGUNA TERDAFTAR';
      case 'spreadsheet':
        return 'LEMBAR REKAPITULASI PELAPORAN DATA SPREADSHEET';
      default:
        return 'LEMBAR DOKUMEN OPERASIONAL PRODUKSI';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static print:overflow-visible print:block print:w-full print:h-auto">
      
      {/* Modal Dialog Card */}
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-300 overflow-hidden print:shadow-none print:border-none print:max-h-none print:h-auto print:w-full print:rounded-none print:overflow-visible print:block">
        
        {/* Modal Toolbar (Hidden during browser printing) */}
        <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 print:hidden no-print">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-slate-800 text-blue-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                Pratinjau Dokumen PDF (Format Hitam Putih Sederhana)
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-mono">
                  A4 Monokrom
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Format resmi ringkas, siap cetak atau simpan ke PDF langsung dari peramban
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Style Selector for style-dependent bars */}
            {(activePrintBar === 'pe-workflow' || activePrintBar === 'ppic-planning') && (
              <select
                value={selectedStyleId || (styles[0] ? styles[0].id : '')}
                onChange={(e) => setSelectedStyleId(e.target.value)}
                className="bg-slate-800 text-blue-200 text-xs font-bold border border-slate-700 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer max-w-[200px] truncate"
                title="Pilih model style garmen yang akan dicetak"
              >
                {styles.map(s => (
                  <option key={s.id} value={s.id}>
                    Style: {s.code} ({s.name})
                  </option>
                ))}
              </select>
            )}

            {/* Bar Selector to quickly switch print preview */}
            <select
              value={activePrintBar}
              onChange={(e) => openPrintModal(e.target.value)}
              className="bg-slate-800 text-white text-xs font-bold border border-slate-700 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
            >
              <option value="pe-workflow">1. Alur SOP & PE</option>
              <option value="ppic-planning">2. Perencanaan PPIC & BOM</option>
              <option value="warehouse-stock">3. Stok Gudang</option>
              <option value="subcon">4. Mitra Subkon</option>
              <option value="transactions">5. Transaksi & PIC</option>
              <option value="spreadsheet">6. Spreadsheet</option>
              <option value="analytics">7. Analitik</option>
              <option value="user-access">8. Akses & Akun</option>
            </select>

            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan ke PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE A4 PAPER CONTAINER (Strict Black and White, High-Contrast) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 flex justify-center print:p-0 print:bg-white print:overflow-visible print:block print:w-full print:h-auto">
          
          <div 
            ref={printAreaRef}
            id="printable-pdf-document"
            className="bg-white w-full max-w-[210mm] min-h-[297mm] p-6 sm:p-10 shadow-md border border-slate-300 text-black font-sans leading-normal print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none print:min-h-0 print:w-full print:overflow-visible print:block"
            style={{ color: '#000000' }}
          >
            
            {/* COMPANY HEADER WITH DASHBOARD LOGO */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-black gap-4">
              
              {/* Logo display: custom uploaded image or default black & white badge */}
              <div className="flex items-center gap-3 shrink-0">
                {companyLogo ? (
                  <img 
                    src={companyLogo} 
                    alt="Logo Perusahaan" 
                    className="h-12 w-auto max-w-[140px] object-contain filter grayscale contrast-125"
                  />
                ) : (
                  <div className="w-12 h-12 border-2 border-black flex items-center justify-center font-black text-xl tracking-tighter text-black">
                    TW
                  </div>
                )}
                <div>
                  <h1 className="text-base font-black tracking-tight text-black uppercase leading-tight">
                    PT TERATAI WIDJAJA
                  </h1>
                  <p className="text-[11px] font-bold text-black tracking-wider uppercase">
                    GARMENT INDUSTRY &amp; APPAREL MANUFACTURING
                  </p>
                  <p className="text-[10px] text-black">
                    Sistem Terpadu: Production Engineering (PE), PPIC &amp; Gudang
                  </p>
                </div>
              </div>

              {/* Company contact / Document ref info */}
              <div className="text-right text-[10px] text-black font-mono leading-tight shrink-0">
                <div>DOKUMEN KONTROL OPERASIONAL</div>
                <div>No: TW/{currentStyle.code}/{activePrintBar.toUpperCase()}</div>
                <div>Tgl Cetak: {currentDateFormatted}</div>
                <div>Pukul: {currentTimeFormatted} WIB</div>
              </div>
            </div>

            {/* DOCUMENT TITLE */}
            <div className="my-4 text-center">
              <h2 className="text-sm sm:text-base font-black tracking-wide uppercase underline decoration-2 underline-offset-4 text-black">
                {getBarTitle(activePrintBar)}
              </h2>
              <p className="text-[11px] text-black font-medium mt-1">
                Lampiran Data Penting Operasional Produksi Garmen
              </p>
            </div>

            {/* METADATA BOX (Style, Target Qty, Delivery, Buyer, PIC) */}
            <div className="border border-black p-2.5 mb-4 text-[11px] grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white">
              <div>
                <span className="block font-bold text-black">Style / Model:</span>
                <span className="font-mono text-black font-bold">{currentStyle.code} — {currentStyle.name}</span>
              </div>
              <div>
                <span className="block font-bold text-black">Target Order:</span>
                <span className="font-mono text-black font-bold">{currentStyle.targetQuantityPcs.toLocaleString()} Pcs</span>
              </div>
              <div>
                <span className="block font-bold text-black">Buyer / Pemesan:</span>
                <span className="text-black font-medium">{currentStyle.buyer}</span>
              </div>
              <div>
                <span className="block font-bold text-black">Operator PIC:</span>
                <span className="text-black font-medium">{currentUser.name} ({currentUser.role})</span>
              </div>
            </div>

            {/* DYNAMIC IMPORTANT DATA CONTENT BASED ON ACTIVE BAR */}

            {/* 1. SOP & PE WORKFLOW */}
            {activePrintBar === 'pe-workflow' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-black uppercase pb-1 border-b border-black">
                  <span>Tabel Alur Standar Operasional 14 Tahap SOP PE</span>
                  <span>Progress Kesiapan: {Math.round((currentStyle.steps.filter(s => s.status === 'Completed').length / currentStyle.steps.length) * 100)}% ({currentStyle.steps.filter(s => s.status === 'Completed').length} / {currentStyle.steps.length} Selesai)</span>
                </div>
                <table className="w-full text-left text-[10px] border-collapse border border-black">
                  <thead>
                    <tr className="border-b border-black bg-gray-100 text-black font-bold">
                      <th className="border-r border-black p-1.5 text-center w-8">No</th>
                      <th className="border-r border-black p-1.5 w-44">Tahapan Proses</th>
                      <th className="border-r border-black p-1.5 text-center w-28">Status</th>
                      <th className="border-r border-black p-1.5 text-center w-24">Tanggal Jadwal</th>
                      <th className="border-r border-black p-1.5 text-center w-24">Tanggal Aktual</th>
                      <th className="p-1.5">Output Teknis</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentStyle.steps.map((step, idx) => {
                      const schedDate = step.dateScheduled;
                      const actDate = step.actualDate;
                      let varianceText = '';
                      if (actDate) {
                        const schedMs = new Date(schedDate).getTime();
                        const actMs = new Date(actDate).getTime();
                        const diffDays = Math.round((actMs - schedMs) / (1000 * 60 * 60 * 24));
                        if (diffDays <= 0) {
                          varianceText = diffDays === 0 ? ' (Tepat Waktu)' : ` (${Math.abs(diffDays)}hr Lebih Awal)`;
                        } else {
                          varianceText = ` (+${diffDays}hr Deviasi)`;
                        }
                      }

                      return (
                        <tr key={step.id || idx} className="border-b border-black">
                          <td className="border-r border-black p-1.5 text-center font-bold">{idx + 1}</td>
                          <td className="border-r border-black p-1.5">
                            <div className="font-bold text-black">{step.process}</div>
                            <div className="text-[9px] text-gray-700 mt-0.5">
                              PIC: {step.picDept} {step.picName ? `• ${step.picName}` : ''}
                            </div>
                          </td>
                          <td className="border-r border-black p-1.5 text-center font-bold">
                            {step.status === 'Completed' ? '[V] SELESAI' : 
                             step.status === 'In Progress' ? '[~] SEDANG JALAN' : 
                             step.status === 'Needs Review' ? '[!] PERLU REVIEW' : 
                             '[ ] PENDING'}
                          </td>
                          <td className="border-r border-black p-1.5 text-center font-mono text-[9.5px]">
                            {step.dateScheduled || '-'}
                          </td>
                          <td className="border-r border-black p-1.5 text-center font-mono text-[9.5px]">
                            <div className="font-bold">{step.actualDate || '-'}</div>
                            {varianceText && (
                              <div className="text-[8px] text-gray-700">{varianceText}</div>
                            )}
                          </td>
                          <td className="p-1.5 text-[9.5px]">
                            <div className="font-medium text-black">{step.outputDescription}</div>
                            {step.notes && (
                              <div className="text-[8.5px] text-gray-800 mt-0.5">
                                <strong>Catatan:</strong> {step.notes}
                              </div>
                            )}
                            {step.machineBreakdownNotes && (
                              <div className="text-[8.5px] text-gray-800 mt-0.5">
                                <strong>Mesin/Attachment:</strong> {step.machineBreakdownNotes}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* 2. PPIC PLANNING & BILL OF MATERIALS (BOM) */}
            {activePrintBar === 'ppic-planning' && (
              <div className="space-y-4">
                {/* Table 1: Komponen Produksi (Line vs Subkon) */}
                <div>
                  <div className="text-xs font-bold text-black uppercase mb-1">
                    1. Alokasi Komponen Produksi (Line Internal vs Mitra Subkon)
                  </div>
                  <table className="w-full text-left text-[10px] border-collapse border border-black">
                    <thead>
                      <tr className="border-b border-black bg-gray-100 text-black font-bold">
                        <th className="border-r border-black p-1.5 text-center w-8">No</th>
                        <th className="border-r border-black p-1.5">Nama Komponen / Panel</th>
                        <th className="border-r border-black p-1.5">Kategori Bagian</th>
                        <th className="border-r border-black p-1.5 text-center">Rute</th>
                        <th className="border-r border-black p-1.5">Lokasi Pengerjaan</th>
                        <th className="border-r border-black p-1.5 text-right">Rasio/Pcs</th>
                        <th className="border-r border-black p-1.5 text-right">Total Qty (Pcs)</th>
                        <th className="border-r border-black p-1.5">PIC</th>
                        <th className="p-1.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentComponents.length === 0 ? (
                        <tr><td colSpan={9} className="p-3 text-center text-black italic">Belum ada alokasi komponen.</td></tr>
                      ) : (
                        currentComponents.map((comp, idx) => (
                          <tr key={comp.id} className="border-b border-black">
                            <td className="border-r border-black p-1.5 text-center font-bold">{idx + 1}</td>
                            <td className="border-r border-black p-1.5 font-bold">{comp.componentName}</td>
                            <td className="border-r border-black p-1.5">{comp.panelCategory}</td>
                            <td className="border-r border-black p-1.5 text-center font-bold font-mono">
                              {comp.route === 'LINE' ? 'LINE IN-HOUSE' : 'SUBKON'}
                            </td>
                            <td className="border-r border-black p-1.5">{comp.targetLocation}</td>
                            <td className="border-r border-black p-1.5 text-right font-mono">{comp.qtyPerPcs}</td>
                            <td className="border-r border-black p-1.5 text-right font-mono font-bold">
                              {comp.totalRequiredQty.toLocaleString()}
                            </td>
                            <td className="border-r border-black p-1.5">{comp.picName}</td>
                            <td className="p-1.5 text-center font-bold">{comp.status}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table 2: BOM & KEBUTUHAN BAHAN BAKU */}
                <div>
                  <div className="text-xs font-bold text-black uppercase mb-1">
                    2. Rincian Kebutuhan Bahan Baku Produksi (Bill of Materials - BOM)
                  </div>
                  <table className="w-full text-left text-[10px] border-collapse border border-black">
                    <thead>
                      <tr className="border-b border-black bg-gray-100 text-black font-bold">
                        <th className="border-r border-black p-1.5 text-center w-8">No</th>
                        <th className="border-r border-black p-1.5">Nama Bahan Baku / Material</th>
                        <th className="border-r border-black p-1.5">Kategori</th>
                        <th className="border-r border-black p-1.5">Komponen</th>
                        <th className="border-r border-black p-1.5 text-right">Kons./Pcs</th>
                        <th className="border-r border-black p-1.5 text-center">Waste</th>
                        <th className="border-r border-black p-1.5 text-right">Total Kebutuhan</th>
                        <th className="border-r border-black p-1.5 text-right">Stok Gudang</th>
                        <th className="border-r border-black p-1.5 text-right">Selisih (+/-)</th>
                        <th className="p-1.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentMaterials.length === 0 ? (
                        <tr><td colSpan={10} className="p-3 text-center text-black italic">Belum ada data kebutuhan bahan BOM.</td></tr>
                      ) : (
                        currentMaterials.map((mat, idx) => {
                          const avail = mat.availableStock ?? 0;
                          const balance = avail - mat.totalRequired;
                          return (
                            <tr key={mat.id} className="border-b border-black">
                              <td className="border-r border-black p-1.5 text-center font-bold">{idx + 1}</td>
                              <td className="border-r border-black p-1.5 font-bold">{mat.materialName}</td>
                              <td className="border-r border-black p-1.5">{mat.category}</td>
                              <td className="border-r border-black p-1.5">{mat.usedForComponent || 'Seluruh Bagian'}</td>
                              <td className="border-r border-black p-1.5 text-right font-mono">
                                {mat.consumptionPerPcs} {mat.unit}
                              </td>
                              <td className="border-r border-black p-1.5 text-center font-mono">
                                {mat.wasteAllowancePercent ? `${mat.wasteAllowancePercent}%` : '0%'}
                              </td>
                              <td className="border-r border-black p-1.5 text-right font-mono font-bold">
                                {mat.totalRequired.toLocaleString()} {mat.unit}
                              </td>
                              <td className="border-r border-black p-1.5 text-right font-mono">
                                {avail.toLocaleString()} {mat.unit}
                              </td>
                              <td className={`border-r border-black p-1.5 text-right font-mono font-bold ${balance < 0 ? 'text-black underline' : ''}`}>
                                {balance > 0 ? `+${balance.toLocaleString()}` : balance.toLocaleString()} {mat.unit}
                              </td>
                              <td className="p-1.5 text-center font-bold">
                                {avail >= mat.totalRequired ? 'READY' : (avail > 0 ? 'PARTIAL' : 'DEFISIT')}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. WAREHOUSE STOCK */}
            {activePrintBar === 'warehouse-stock' && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-black uppercase">
                  Laporan Posisi Stok Fisik Gudang Bahan Baku &amp; Aksesoris
                </div>
                <table className="w-full text-left text-[10px] border-collapse border border-black">
                  <thead>
                    <tr className="border-b border-black bg-gray-100 text-black font-bold">
                      <th className="border-r border-black p-1.5 text-center w-8">No</th>
                      <th className="border-r border-black p-1.5">Kode Barang</th>
                      <th className="border-r border-black p-1.5">Nama Material</th>
                      <th className="border-r border-black p-1.5">Kategori</th>
                      <th className="border-r border-black p-1.5">Style Relevan</th>
                      <th className="border-r border-black p-1.5 text-right">Stok Fisik</th>
                      <th className="border-r border-black p-1.5 text-center">Satuan</th>
                      <th className="border-r border-black p-1.5">Lokasi Rak</th>
                      <th className="p-1.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stock.map((item, idx) => (
                      <tr key={item.id} className="border-b border-black">
                        <td className="border-r border-black p-1.5 text-center font-bold">{idx + 1}</td>
                        <td className="border-r border-black p-1.5 font-mono font-bold">{item.code}</td>
                        <td className="border-r border-black p-1.5 font-bold">{item.name}</td>
                        <td className="border-r border-black p-1.5">{item.category}</td>
                        <td className="border-r border-black p-1.5">{item.styleCode}</td>
                        <td className="border-r border-black p-1.5 text-right font-mono font-bold">
                          {item.currentStock.toLocaleString()}
                        </td>
                        <td className="border-r border-black p-1.5 text-center">{item.unit}</td>
                        <td className="border-r border-black p-1.5 font-mono">{item.rackLocation}</td>
                        <td className="p-1.5 text-center font-bold">
                          {item.currentStock <= item.minStockLevel ? 'MENIPIS' : 'OPTIMAL'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 4. SUBCON CONTRACTS */}
            {activePrintBar === 'subcon' && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-black uppercase">
                  Daftar Kontrak Kerja &amp; Alokasi Mitra Subkon Eksternal
                </div>
                <table className="w-full text-left text-[10px] border-collapse border border-black">
                  <thead>
                    <tr className="border-b border-black bg-gray-100 text-black font-bold">
                      <th className="border-r border-black p-1.5 text-center w-8">No</th>
                      <th className="border-r border-black p-1.5">Mitra Subkon</th>
                      <th className="border-r border-black p-1.5">Pekerjaan / Komponen</th>
                      <th className="border-r border-black p-1.5">Style</th>
                      <th className="border-r border-black p-1.5 text-right">Qty Kirim</th>
                      <th className="border-r border-black p-1.5 text-right">Qty Kembali</th>
                      <th className="border-r border-black p-1.5 text-right">Sisa / Selisih</th>
                      <th className="border-r border-black p-1.5 text-center">Tgl Target</th>
                      <th className="p-1.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subconTasks.map((t, idx) => {
                      const diff = t.quantitySend - t.quantityReceived;
                      return (
                        <tr key={t.id} className="border-b border-black">
                          <td className="border-r border-black p-1.5 text-center font-bold">{idx + 1}</td>
                          <td className="border-r border-black p-1.5 font-bold">{t.subconName}</td>
                          <td className="border-r border-black p-1.5">{t.taskName}</td>
                          <td className="border-r border-black p-1.5 font-mono">{t.styleCode}</td>
                          <td className="border-r border-black p-1.5 text-right font-mono">{t.quantitySend.toLocaleString()}</td>
                          <td className="border-r border-black p-1.5 text-right font-mono">{t.quantityReceived.toLocaleString()}</td>
                          <td className="border-r border-black p-1.5 text-right font-mono font-bold">{diff.toLocaleString()}</td>
                          <td className="border-r border-black p-1.5 text-center font-mono">{t.targetReturnDate}</td>
                          <td className="p-1.5 text-center font-bold">{t.status.toUpperCase()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* 5. TRANSACTIONS */}
            {activePrintBar === 'transactions' && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-black uppercase">
                  Buku Catatan Transaksi Pengeluaran Stok &amp; Riwayat PIC
                </div>
                <table className="w-full text-left text-[10px] border-collapse border border-black">
                  <thead>
                    <tr className="border-b border-black bg-gray-100 text-black font-bold">
                      <th className="border-r border-black p-1.5 text-center w-8">No</th>
                      <th className="border-r border-black p-1.5">Tanggal &amp; Jam</th>
                      <th className="border-r border-black p-1.5">No. Referensi / SPK</th>
                      <th className="border-r border-black p-1.5">Style Target</th>
                      <th className="border-r border-black p-1.5">Nama Material</th>
                      <th className="border-r border-black p-1.5 text-right">Jumlah</th>
                      <th className="border-r border-black p-1.5">Tujuan Dept</th>
                      <th className="border-r border-black p-1.5">PIC Penerima</th>
                      <th className="p-1.5 text-center">Tipe</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 25).map((tx, idx) => (
                      <tr key={tx.id} className="border-b border-black">
                        <td className="border-r border-black p-1.5 text-center font-bold">{idx + 1}</td>
                        <td className="border-r border-black p-1.5 font-mono">{tx.timestamp}</td>
                        <td className="border-r border-black p-1.5 font-mono font-bold">{tx.referenceDoc}</td>
                        <td className="border-r border-black p-1.5">{tx.styleTarget}</td>
                        <td className="border-r border-black p-1.5 font-bold">{tx.materialName}</td>
                        <td className="border-r border-black p-1.5 text-right font-mono font-bold">
                          {tx.quantity} {tx.unit}
                        </td>
                        <td className="border-r border-black p-1.5">{tx.destinationDept}</td>
                        <td className="border-r border-black p-1.5">{tx.picReceiver}</td>
                        <td className="p-1.5 text-center font-bold">
                          {tx.isCrossStyle ? 'CROSS-STYLE' : 'STANDARD'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 6. ANALYTICS */}
            {activePrintBar === 'analytics' && (
              <div className="space-y-4">
                <div className="text-xs font-bold text-black uppercase">
                  Ringkasan Key Performance Indicators (KPI) Produksi
                </div>
                <div className="grid grid-cols-3 gap-3 border border-black p-3 bg-white">
                  <div>
                    <span className="block text-[10px] font-bold">Target Produksi Style:</span>
                    <span className="text-sm font-mono font-bold">{currentStyle.targetQuantityPcs.toLocaleString()} Pcs</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold">Progress Cutting:</span>
                    <span className="text-sm font-mono font-bold">{currentStyle.cuttingProgressPcs.toLocaleString()} Pcs</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold">Progress Sewing:</span>
                    <span className="text-sm font-mono font-bold">{currentStyle.sewingProgressPcs.toLocaleString()} Pcs</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold">Lolos QC Pass:</span>
                    <span className="text-sm font-mono font-bold">{currentStyle.qcPassedPcs.toLocaleString()} Pcs</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold">Komponen Line vs Subkon:</span>
                    <span className="text-sm font-mono font-bold">
                      {currentComponents.filter(c => c.route === 'LINE').length} Line / {currentComponents.filter(c => c.route === 'SUBCON').length} Subkon
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold">Kesiapan Bahan BOM:</span>
                    <span className="text-sm font-mono font-bold">
                      {currentMaterials.filter(m => m.status === 'Ready' || m.status === 'Available').length}/{currentMaterials.length} Siap
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 7. USER ACCESS & AKUN */}
            {activePrintBar === 'user-access' && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-black uppercase">
                  Daftar Pengguna Sistem &amp; Otoritas Hak Akses Menu
                </div>
                <table className="w-full text-left text-[10px] border-collapse border border-black">
                  <thead>
                    <tr className="border-b border-black bg-gray-100 text-black font-bold">
                      <th className="border-r border-black p-1.5 text-center w-8">No</th>
                      <th className="border-r border-black p-1.5">Username</th>
                      <th className="border-r border-black p-1.5">Nama Lengkap PIC</th>
                      <th className="border-r border-black p-1.5">Peran / Jabatan</th>
                      <th className="border-r border-black p-1.5">Departemen</th>
                      <th className="p-1.5">Jumlah Menu Diizinkan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, idx) => (
                      <tr key={u.id} className="border-b border-black">
                        <td className="border-r border-black p-1.5 text-center font-bold">{idx + 1}</td>
                        <td className="border-r border-black p-1.5 font-mono font-bold">{u.username}</td>
                        <td className="border-r border-black p-1.5 font-bold">{u.name}</td>
                        <td className="border-r border-black p-1.5 font-bold">{u.role}</td>
                        <td className="border-r border-black p-1.5">{u.department}</td>
                        <td className="p-1.5 font-mono">{u.allowedTabs.length} Menu Bar</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 8. SPREADSHEET */}
            {activePrintBar === 'spreadsheet' && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-black uppercase">
                  Ringkasan Pelaporan Data Operasional Pabrik Terpadu
                </div>
                <table className="w-full text-left text-[10px] border-collapse border border-black">
                  <thead>
                    <tr className="border-b border-black bg-gray-100 text-black font-bold">
                      <th className="border-r border-black p-1.5">Parameter Data</th>
                      <th className="border-r border-black p-1.5 text-right">Nilai / Kuantitas</th>
                      <th className="p-1.5">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-black">
                      <td className="border-r border-black p-1.5 font-bold">Model Produksi Aktif</td>
                      <td className="border-r border-black p-1.5 text-right font-mono font-bold">{currentStyle.code}</td>
                      <td className="p-1.5">{currentStyle.name}</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="border-r border-black p-1.5 font-bold">Target Order</td>
                      <td className="border-r border-black p-1.5 text-right font-mono font-bold">{currentStyle.targetQuantityPcs.toLocaleString()} Pcs</td>
                      <td className="p-1.5">Tenggat: {currentStyle.deliveryDate}</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="border-r border-black p-1.5 font-bold">Komponen In-House (Line)</td>
                      <td className="border-r border-black p-1.5 text-right font-mono font-bold">{currentComponents.filter(c => c.route === 'LINE').length} Komponen</td>
                      <td className="p-1.5">Pengerjaan Sewing Floor</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="border-r border-black p-1.5 font-bold">Komponen Mitra Subkon</td>
                      <td className="border-r border-black p-1.5 text-right font-mono font-bold">{currentComponents.filter(c => c.route === 'SUBCON').length} Komponen</td>
                      <td className="p-1.5">Bordir, Sablon &amp; Cuci Khusus</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="border-r border-black p-1.5 font-bold">Material Kebutuhan BOM</td>
                      <td className="border-r border-black p-1.5 text-right font-mono font-bold">{currentMaterials.length} Macam Bahan</td>
                      <td className="p-1.5">Kain, Benang, Resleting, Kancing &amp; Aksesoris</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* SIGNATURE / APPROVAL BLOCK (STANDAR PABRIK GARMENT) */}
            <div className="mt-8 pt-4 border-t border-black avoid-break" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
              <div className="grid grid-cols-3 gap-4 text-center text-[10px]">
                
                {/* 1. Pembuat Dokumen */}
                <div className="space-y-12">
                  <div className="font-bold uppercase text-black">
                    Disiapkan Oleh (PIC Pelaksana):
                  </div>
                  <div>
                    <div className="font-bold underline text-black">{currentUser.name}</div>
                    <div className="text-[9px] text-black">Jabatan: {currentUser.role} - {currentUser.department.split('&')[0]}</div>
                  </div>
                </div>

                {/* 2. Diperiksa PE */}
                <div className="space-y-12">
                  <div className="font-bold uppercase text-black">
                    Diperiksa Oleh (Production Engineer):
                  </div>
                  <div>
                    <div className="font-bold underline text-black">Hendra Gunawan, S.T.</div>
                    <div className="text-[9px] text-black">Lead Production Engineer (PE)</div>
                  </div>
                </div>

                {/* 3. Disetujui Pimpinan / FM */}
                <div className="space-y-12">
                  <div className="font-bold uppercase text-black">
                    Disetujui Oleh (Factory Manager / PPIC):
                  </div>
                  <div>
                    <div className="font-bold underline text-black">Ir. Bambang Sugiarto</div>
                    <div className="text-[9px] text-black">Factory General Manager</div>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
