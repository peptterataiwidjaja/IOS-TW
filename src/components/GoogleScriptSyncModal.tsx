import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileSpreadsheet, 
  X, 
  Check, 
  Copy, 
  RefreshCw, 
  ExternalLink, 
  Link, 
  AlertCircle, 
  CheckCircle2,
  Code2,
  Database
} from 'lucide-react';

export const GoogleScriptSyncModal: React.FC = () => {
  const { 
    isGoogleScriptModalOpen, 
    setIsGoogleScriptModalOpen, 
    gasUrl, 
    setGasUrl, 
    syncToGoogleScript,
    lastSyncedGas,
    currentStyle,
    stock,
    transactions,
    cashFlow,
    componentAllocations,
    subconTasks
  } = useApp();

  const [inputUrl, setInputUrl] = useState(gasUrl);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'sync' | 'script'>('sync');

  if (!isGoogleScriptModalOpen) return null;

  const handleSaveAndSync = async () => {
    setGasUrl(inputUrl.trim());
    setIsSyncing(true);
    setSyncResult(null);

    const res = await syncToGoogleScript();
    setIsSyncing(false);
    setSyncResult(res);
  };

  const googleScriptTemplate = `/**
 * =====================================================================
 * GOOGLE APPS SCRIPT - SISTEM INTEGRASI PT TERATAI WIDJAJA
 * =====================================================================
 * Skrip ini menerima sinkronisasi data operasional otomatis dari
 * Web App PT Teratai Widjaja (Stok Gudang, SOP PE, Mutasi, PPIC, Subkon, Kas)
 * ke Google Spreadsheet.
 *
 * CARA MEMASANG:
 * 1. Buka Google Spreadsheet baru / yang sudah ada
 * 2. Klik menu: Ekstensi > Apps Script
 * 3. Hapus kode bawaan (myFunction), lalu Paste (Tempel) SELURUH kode ini
 * 4. Klik ikon Simpan (Ctrl+S atau Cmd+S)
 * 5. Klik tombol biru: "Terapkan" (Deploy) > "Penerapan baru" (New deployment)
 * 6. Pilih jenis: "Aplikasi Web" (Web App)
 * 7. Isi Deskripsi: misal "API Sinkronisasi Teratai Widjaja"
 * 8. Jalankan sebagai: "Saya" (Me)
 * 9. Siapa yang memiliki akses: "Siapa saja" (Anyone) -> PENTING!
 * 10. Klik "Terapkan" (Deploy) & Berikan Izin Akses Akun Google Anda
 * 11. Salin URL Aplikasi Web (berakhiran /exec) dan masukkan ke aplikasi
 * =====================================================================
 */

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "ONLINE",
    message: "Google Apps Script PT Teratai Widjaja aktif dan siap menerima data!",
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. SHEET: STOK GUDANG
    var sheetStok = getOrCreateSheet(ss, "Stok_Gudang");
    sheetStok.clearContents();
    sheetStok.appendRow([
      "No", "Kode Item (SKU)", "Nama Bahan Baku", "Kategori", "Style Alokasi", 
      "Stok Aktual", "Batas Min", "Satuan", "Lokasi Rak", "Harga Satuan (Rp)", 
      "Total Nilai Aset (Rp)", "Supplier", "Update Terakhir"
    ]);
    if (data.stockItems && data.stockItems.length > 0) {
      data.stockItems.forEach(function(item, idx) {
        var totalNilai = (item.currentStock || 0) * (item.unitPrice || 0);
        sheetStok.appendRow([
          idx + 1,
          item.code || "-",
          item.name || "-",
          item.category || "-",
          item.styleCode || "-",
          item.currentStock || 0,
          item.minStockLevel || 0,
          item.unit || "Pcs",
          item.rackLocation || "-",
          item.unitPrice || 0,
          totalNilai,
          item.supplier || "-",
          item.lastUpdated || "-"
        ]);
      });
      formatSheet(sheetStok, 13, [10, 11]);
    }

    // 2. SHEET: SOP WORKFLOW & TANGGAL AKTUAL PE
    var sheetSOP = getOrCreateSheet(ss, "SOP_Workflow_PE");
    sheetSOP.clearContents();
    sheetSOP.appendRow([
      "No", "Tahapan SOP Produksi", "Departemen PIC", "PIC Pelaksana", 
      "Tgl Jadwal", "Tgl Realisasi / Aktual", "Status", "Output / Catatan Teknis"
    ]);
    if (data.sopSteps && data.sopSteps.length > 0) {
      data.sopSteps.forEach(function(st) {
        sheetSOP.appendRow([
          st.id || "-",
          st.process || "-",
          st.dept || "-",
          st.picName || "-",
          st.scheduled || "-",
          st.actualDate || "-",
          st.status || "-",
          (st.outputDescription || "") + (st.notes ? " | " + st.notes : "")
        ]);
      });
      formatSheet(sheetSOP, 8);
    }

    // 3. SHEET: MUTASI TRANSAKSI GUDANG
    var sheetMutasi = getOrCreateSheet(ss, "Mutasi_Barang");
    sheetMutasi.clearContents();
    sheetMutasi.appendRow([
      "No", "ID Transaksi", "Waktu", "Tipe", "Kode Bahan", "Nama Bahan", 
      "Style Target", "Style Asal Item", "Cross-Style?", "Jumlah", "Satuan", 
      "Dept Tujuan", "PIC Penerima", "Petugas Gudang", "No. Dokumen Ref", "Alasan / Catatan"
    ]);
    if (data.transactions && data.transactions.length > 0) {
      data.transactions.forEach(function(tx, idx) {
        sheetMutasi.appendRow([
          idx + 1,
          tx.id || "-",
          tx.timestamp || "-",
          tx.type || "-",
          tx.itemCode || "-",
          tx.itemName || "-",
          tx.styleTarget || "-",
          tx.allocatedStyleOfItem || "-",
          tx.isCrossStyle ? "YA (CROSS-STYLE)" : "TIDAK",
          tx.quantity || 0,
          tx.unit || "-",
          tx.destinationDept || "-",
          tx.picReceiver || "-",
          tx.picGudang || "-",
          tx.referenceDoc || "-",
          tx.reason || tx.notes || "-"
        ]);
      });
      formatSheet(sheetMutasi, 16);
    }

    // 4. SHEET: PPIC ALOKASI KOMPONEN
    if (data.componentAllocations && data.componentAllocations.length > 0) {
      var sheetComp = getOrCreateSheet(ss, "PPIC_Alokasi_Komponen");
      sheetComp.clearContents();
      sheetComp.appendRow([
        "No", "Kode Style", "Nama Komponen / Panel", "Kategori Panel", "Jalur Pengerjaan", 
        "Lokasi Line / Subkon", "Kebutuhan/Pcs", "Total Panel Order", "Proses Kerja", "Status", "PIC", "Target Selesai", "Catatan"
      ]);
      data.componentAllocations.forEach(function(comp, idx) {
        sheetComp.appendRow([
          idx + 1,
          comp.styleCode || "-",
          comp.componentName || "-",
          comp.panelCategory || "-",
          comp.route === "LINE" ? "LINE INTERNAL" : "MITRA SUBKON",
          comp.targetLocation || "-",
          comp.qtyPerPcs || 0,
          comp.totalRequiredQty || 0,
          comp.processDescription || "-",
          comp.status || "-",
          comp.picName || "-",
          comp.targetDate || "-",
          comp.notes || "-"
        ]);
      });
      formatSheet(sheetComp, 13);
    }

    // 5. SHEET: PPIC KEBUTUHAN BAHAN (BOM)
    if (data.productionMaterials && data.productionMaterials.length > 0) {
      var sheetMat = getOrCreateSheet(ss, "PPIC_Kebutuhan_Bahan");
      sheetMat.clearContents();
      sheetMat.appendRow([
        "No", "Kode Style", "Kode Bahan", "Nama Bahan", "Kategori", 
        "Kebutuhan/Pcs", "Total Kebutuhan", "Satuan", "Stok Tersedia", "Status Kesiapan"
      ]);
      data.productionMaterials.forEach(function(mat, idx) {
        sheetMat.appendRow([
          idx + 1,
          mat.styleCode || "-",
          mat.materialCode || "-",
          mat.materialName || "-",
          mat.category || "-",
          mat.qtyPerPcs || 0,
          mat.totalRequired || 0,
          mat.unit || "-",
          mat.stockAvailable || 0,
          mat.status || "-"
        ]);
      });
      formatSheet(sheetMat, 10);
    }

    // 6. SHEET: MONITORING SUBKON
    if (data.subconTasks && data.subconTasks.length > 0) {
      var sheetSub = getOrCreateSheet(ss, "Monitoring_Subkon");
      sheetSub.clearContents();
      sheetSub.appendRow([
        "No", "Nama Mitra Subkon", "Jenis Pekerjaan", "Style Target", "Qty Kirim", 
        "Qty Kembali", "Sisa WIP", "Satuan", "Tgl Kirim", "Estimasi Kembali", "Tgl Aktual", 
        "Status", "PIC Subkon", "PIC Internal", "Tarif/Pcs (Rp)", "Total Biaya (Rp)", "Defect (Pcs)"
      ]);
      data.subconTasks.forEach(function(sub, idx) {
        var sisaWIP = (sub.quantitySend || 0) - (sub.quantityReceived || 0);
        sheetSub.appendRow([
          idx + 1,
          sub.subconName || "-",
          sub.type || "-",
          sub.styleCode || "-",
          sub.quantitySend || 0,
          sub.quantityReceived || 0,
          sisaWIP,
          sub.unit || "Pcs",
          sub.sendDate || "-",
          sub.estReturnDate || "-",
          sub.actualReturnDate || "-",
          sub.status || "-",
          sub.picSubcon || "-",
          sub.picInternal || "-",
          sub.ratePerPcs || 0,
          sub.totalCost || 0,
          sub.defectPcs || 0
        ]);
      });
      formatSheet(sheetSub, 17, [15, 16]);
    }

    // 7. SHEET: ARUS KAS OPERASIONAL
    if (data.cashFlowSummary && data.cashFlowSummary.length > 0) {
      var sheetKas = getOrCreateSheet(ss, "Arus_Kas_Operasional");
      sheetKas.clearContents();
      sheetKas.appendRow([
        "No", "ID Transaksi", "Tanggal", "Tipe", "Kategori Biaya", "Style Terkait", 
        "Jumlah (Rp)", "Status Cek", "Diajukan Oleh", "Verifikasi PE", "Persetujuan FM", "Keterangan"
      ]);
      data.cashFlowSummary.forEach(function(cf, idx) {
        sheetKas.appendRow([
          idx + 1,
          cf.id || "-",
          cf.date || "-",
          cf.type || "-",
          cf.category || "-",
          cf.styleCode || "-",
          cf.amount || 0,
          cf.status || "-",
          cf.requestedBy || "-",
          cf.verifiedByPE || "-",
          cf.approvedByFM || "-",
          cf.description || "-"
        ]);
      });
      formatSheet(sheetKas, 12, [7]);
    }

    // 8. SHEET: RINGKASAN STYLE PRODUKSI
    if (data.stylesSummary && data.stylesSummary.length > 0) {
      var sheetStyle = getOrCreateSheet(ss, "Ringkasan_Style");
      sheetStyle.clearContents();
      sheetStyle.appendRow([
        "No", "Kode Style", "Nama Model", "Buyer", "Target (Pcs)", 
        "Tgl Delivery", "Status Produksi", "Total Budget (Rp)", "Budget Terpakai (Rp)", "Sisa Budget (Rp)"
      ]);
      data.stylesSummary.forEach(function(st, idx) {
        var sisaBudget = (st.totalBudget || 0) - (st.usedBudget || 0);
        sheetStyle.appendRow([
          idx + 1,
          st.code || "-",
          st.name || "-",
          st.buyer || "-",
          st.targetPcs || 0,
          st.delivery || "-",
          st.status || "-",
          st.totalBudget || 0,
          st.usedBudget || 0,
          sisaBudget
        ]);
      });
      formatSheet(sheetStyle, 10, [8, 9, 10]);
    }

    return ContentService.createTextOutput(JSON.stringify({ 
      status: "SUCCESS", 
      message: "Data PT Teratai Widjaja berhasil disinkronkan ke seluruh sheet Google Spreadsheet!",
      syncedAt: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "ERROR", 
      message: err.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Bantuan mendapatkan sheet atau membuatnya jika belum ada
function getOrCreateSheet(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

// Format Header Tabel: Biru Tua (#1E3A8A), Teks Putih Tebal, Freeze Baris 1, dan Format Rupiah
function formatSheet(sheet, numCols, currencyCols) {
  var headerRange = sheet.getRange(1, 1, 1, numCols);
  headerRange.setBackground("#1E3A8A");
  headerRange.setFontColor("#FFFFFF");
  headerRange.setFontWeight("bold");
  headerRange.setHorizontalAlignment("center");
  sheet.setRowHeight(1, 30);
  sheet.setFrozenRows(1);

  // Format kolom mata uang Rupiah
  if (currencyCols && currencyCols.length > 0 && sheet.getLastRow() > 1) {
    currencyCols.forEach(function(colIdx) {
      sheet.getRange(2, colIdx, sheet.getLastRow() - 1, 1).setNumberFormat('"Rp"#,##0');
    });
  }

  // Auto-resize kolom agar rapi
  for (var c = 1; c <= numCols; c++) {
    sheet.autoResizeColumn(c);
  }
}

// Menu khusus PT Teratai Widjaja di antarmuka Google Sheets
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("PT Teratai Widjaja")
    .addItem("ℹ️ Cek Status Integrasi", "menuCheckStatus")
    .addToUi();
}

function menuCheckStatus() {
  SpreadsheetApp.getUi().alert(
    "Status Integrasi PT Teratai Widjaja",
    "Google Spreadsheet ini telah terkonfigurasi untuk menerima sinkronisasi otomatis dari Sistem Informasi PT Teratai Widjaja.",
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(googleScriptTemplate);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-red-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">
                Integrasi &amp; Sinkronisasi Google Apps Script
              </h2>
              <p className="text-xs text-blue-100">
                Hubungkan Data Operasional PT Teratai Widjaja ke Google Spreadsheet secara Real-time
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsGoogleScriptModalOpen(false)}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher inside modal */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-3 text-xs font-bold">
          <button
            onClick={() => setActiveTab('sync')}
            className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'sync'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Link className="w-4 h-4" />
            <span>Koneksi &amp; Sinkronisasi Web App</span>
          </button>

          <button
            onClick={() => setActiveTab('script')}
            className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'script'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Salin Kode Google Script (Code.gs)</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
          
          {activeTab === 'sync' && (
            <div className="space-y-4">
              
              {/* Sync Status Banner */}
              {syncResult && (
                <div className={`p-4 rounded-xl text-xs flex items-start gap-2.5 ${
                  syncResult.success 
                    ? 'bg-emerald-50 border border-emerald-300 text-emerald-900' 
                    : 'bg-red-50 border border-red-300 text-red-900'
                }`}>
                  {syncResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold">{syncResult.success ? 'Sinkronisasi Berhasil!' : 'Sinkronisasi Gagal'}</div>
                    <div className="text-[11px] mt-0.5">{syncResult.message}</div>
                  </div>
                </div>
              )}

              {/* Web App URL Input */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  URL Web App Google Apps Script:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="flex-1 text-xs p-2.5 bg-white border border-slate-300 rounded-xl font-mono text-slate-800 focus:ring-2 focus:ring-blue-600"
                  />
                  <button
                    type="button"
                    onClick={handleSaveAndSync}
                    disabled={isSyncing}
                    className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow flex items-center gap-1.5 transition-all cursor-pointer border-t border-blue-500 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Menyelaraskan...' : 'Sinkronkan Sekarang'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Terakhir disinkronkan: <strong className="text-slate-800">{lastSyncedGas || 'Belum pernah'}</strong>
                </p>
              </div>

              {/* Data Summary to be Transferred */}
              <div className="border border-slate-200 rounded-xl p-4 bg-white">
                <div className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-blue-600" />
                  <span>Ringkasan Data yang Diselaraskan ke Spreadsheet:</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="text-base font-black text-blue-700">{stock.length}</div>
                    <div className="text-[11px] text-slate-500">Item Stok Gudang</div>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="text-base font-black text-red-600">{currentStyle.steps.length}</div>
                    <div className="text-[11px] text-slate-500">Tahap SOP &amp; Tgl Aktual</div>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="text-base font-black text-slate-800">{transactions.length}</div>
                    <div className="text-[11px] text-slate-500">Riwayat Mutasi</div>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="text-base font-black text-indigo-700">{componentAllocations.length}</div>
                    <div className="text-[11px] text-slate-500">Alokasi Komponen PPIC</div>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="text-base font-black text-amber-700">{subconTasks.length}</div>
                    <div className="text-[11px] text-slate-500">Tugas Monitoring Subkon</div>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="text-base font-black text-emerald-700">{cashFlow.length}</div>
                    <div className="text-[11px] text-slate-500">Arus Kas &amp; Cek Dana</div>
                  </div>
                </div>
              </div>

              {/* Step by Step Setup Guide */}
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-slate-700 space-y-2">
                <div className="font-bold text-blue-900 flex items-center gap-1.5">
                  <ExternalLink className="w-4 h-4 text-blue-700" />
                  <span>Panduan 3 Menit Menghubungkan Google Sheet:</span>
                </div>
                <ol className="list-decimal pl-5 space-y-1 text-[11px] text-slate-600">
                  <li>Buka Google Spreadsheet baru di browser Anda.</li>
                  <li>Klik menu <strong>Ekstensi &rarr; Apps Script</strong>.</li>
                  <li>Buka tab <strong>"Salin Kode Google Script"</strong> di atas, klik Salin, dan tempelkan ke editor script.</li>
                  <li>Klik <strong>Deploy (Terapkan) &rarr; New deployment (Penerapan baru)</strong>.</li>
                  <li>Pilih jenis <strong>Web App (Aplikasi Web)</strong>, isi Deskripsi, lalu ubah <em>Who has access</em> ke <strong>Anyone (Siapa saja)</strong>.</li>
                  <li>Salin Web App URL yang dihasilkan (berakhiran <code className="text-blue-700 font-mono">/exec</code>) dan masukkan ke kolom di atas.</li>
                </ol>
              </div>

            </div>
          )}

          {activeTab === 'script' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Kode Google Apps Script (Code.gs)</h3>
                  <p className="text-[11px] text-slate-500">Tempelkan skrip ini ke Google Sheet Anda untuk menerima sinkronisasi otomatis</p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Tersalin ke Clipboard!' : 'Salin Semua Kode'}</span>
                </button>
              </div>

              <div className="relative">
                <pre className="p-4 bg-slate-900 text-blue-200 rounded-xl text-[11px] font-mono overflow-x-auto max-h-72 border border-slate-800 leading-relaxed">
                  {googleScriptTemplate}
                </pre>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>PT Teratai Widjaja — Real-time Google Apps Script Data Bridge</span>
          <button
            onClick={() => setIsGoogleScriptModalOpen(false)}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg text-xs cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
