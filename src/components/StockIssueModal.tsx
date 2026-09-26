import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { StockItem, StockTransaction, SubmittedRequisitionReceipt } from '../types';
import { 
  ShoppingCart, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Send, 
  Printer, 
  Layers2, 
  UserCheck, 
  Package, 
  MapPin, 
  RotateCcw,
  ArrowRight,
  ShieldAlert,
  FileText
} from 'lucide-react';

interface StockIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedItem?: StockItem | null;
}

export const StockIssueModal: React.FC<StockIssueModalProps> = ({ 
  isOpen, 
  onClose, 
  preselectedItem 
}) => {
  const { 
    stock, 
    styles, 
    currentStyle, 
    currentUser,
    companyLogo,
    requisitionCart,
    addToRequisitionCart,
    removeFromRequisitionCart,
    updateCartItemQuantity,
    clearRequisitionCart,
    submitRequisitionCart,
    lastSubmittedRequisition
  } = useApp();

  // Active style code: if cart already has items, locked to cart's style; else currentStyle or preselected
  const [selectedStyleCode, setSelectedStyleCode] = useState<string>(currentStyle.code);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [inputQty, setInputQty] = useState<number>(10);
  const [itemNotes, setItemNotes] = useState<string>('');

  // Requisition Form state
  const [destinationDept, setDestinationDept] = useState<StockTransaction['destinationDept']>('Cutting');
  const [picReceiver, setPicReceiver] = useState<string>('');
  const [customDocNo, setCustomDocNo] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [generalNotes, setGeneralNotes] = useState<string>('');

  // UI state
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [submittedReceipt, setSubmittedReceipt] = useState<SubmittedRequisitionReceipt | null>(null);

  // Sync initial style and preselected item
  useEffect(() => {
    if (!isOpen) {
      setFeedback(null);
      setSubmittedReceipt(null);
      return;
    }

    if (requisitionCart.length > 0) {
      setSelectedStyleCode(requisitionCart[0].styleCode);
    } else if (preselectedItem) {
      setSelectedStyleCode(preselectedItem.styleCode);
      setSelectedItemId(preselectedItem.id);
      setInputQty(Math.min(10, preselectedItem.currentStock));
    } else {
      setSelectedStyleCode(currentStyle.code);
    }

    // Auto generate clean document number
    const today = new Date();
    const dateStr = `${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`;
    const rand = Math.floor(100 + Math.random() * 900);
    setCustomDocNo(`BON-${selectedStyleCode || currentStyle.code}-${dateStr}-${rand}`);
  }, [isOpen, preselectedItem, currentStyle.code, requisitionCart.length]);

  // Filter materials STRICTLY by chosen style - no cross-style allowed!
  const styleMaterials = stock.filter(item => item.styleCode === selectedStyleCode);
  const activeStyle = styles.find(s => s.code === selectedStyleCode) || currentStyle;

  // Auto-select first item when style changes if none selected or invalid
  useEffect(() => {
    if (styleMaterials.length > 0 && (!selectedItemId || !styleMaterials.some(m => m.id === selectedItemId))) {
      setSelectedItemId(styleMaterials[0].id);
      setInputQty(Math.min(10, styleMaterials[0].currentStock));
    }
  }, [selectedStyleCode, styleMaterials, selectedItemId]);

  if (!isOpen) return null;

  const currentItem = styleMaterials.find(m => m.id === selectedItemId);

  // Quick preset PIC suggestions
  const picPresets = [
    { name: 'Dani (Cutting Leader)', dept: 'Cutting' as const },
    { name: 'Supardi (SPV Sewing)', dept: 'Sewing' as const },
    { name: 'Bambang (PIC Subkon Bordir)', dept: 'Subkon' as const },
    { name: 'Rina (RnD Technical Sample)', dept: 'Sample / PPS' as const },
    { name: 'Agus (QC & Finishing)', dept: 'Finishing' as const }
  ];

  // Handle adding current selected material to cart
  const handleAddToCart = () => {
    setFeedback(null);
    if (!currentItem) {
      setFeedback({ type: 'error', message: 'Pilih bahan baku terlebih dahulu.' });
      return;
    }

    if (inputQty <= 0) {
      setFeedback({ type: 'error', message: 'Jumlah pengambilan harus lebih dari 0.' });
      return;
    }

    if (inputQty > currentItem.currentStock) {
      setFeedback({ 
        type: 'error', 
        message: `Stok tidak mencukupi! Tersedia hanya ${currentItem.currentStock} ${currentItem.unit}.` 
      });
      return;
    }

    const res = addToRequisitionCart(currentItem, inputQty, itemNotes.trim());
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setItemNotes('');
      // Reset input qty to min of 10 or remaining available
      const remaining = currentItem.currentStock - inputQty;
      setInputQty(remaining > 0 ? Math.min(10, remaining) : 1);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  // Handle Final Submission of Cart
  const handleSubmitRequisition = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (requisitionCart.length === 0) {
      setFeedback({ type: 'error', message: 'Keranjang pengambilan masih kosong. Masukkan minimal 1 bahan.' });
      return;
    }

    if (!picReceiver.trim()) {
      setFeedback({ type: 'error', message: 'Wajib mengisi Nama PIC / Penanggung Jawab yang mengambil bahan!' });
      return;
    }

    const res = submitRequisitionCart({
      destinationDept,
      picReceiver: picReceiver.trim(),
      referenceDoc: customDocNo.trim(),
      reason: reason.trim() || `Pengeluaran material untuk proses ${destinationDept}`,
      notes: generalNotes.trim()
    });

    if (res.success && res.receipt) {
      setSubmittedReceipt(res.receipt);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  // Print Bon Pengeluaran (Surat Jalan Material)
  const handlePrintSlip = () => {
    const slip = submittedReceipt || lastSubmittedRequisition;
    if (!slip) return;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bon Pengeluaran Barang - ${slip.referenceDoc}</title>
          <style>
            @page { size: A4 portrait; margin: 15mm; }
            body { font-family: ui-sans-serif, system-ui, sans-serif; color: #1e293b; font-size: 11pt; margin: 0; padding: 0; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; }
            .title { font-size: 16pt; font-weight: bold; color: #0f172a; }
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px; font-size: 10pt; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
            th { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 8px; text-align: left; font-size: 9pt; }
            td { border: 1px solid #cbd5e1; padding: 8px; font-size: 9pt; }
            .text-right { text-align: right; }
            .signatures { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; text-align: center; margin-top: 40px; page-break-inside: avoid; }
            .sign-box { border-top: 1px solid #94a3b8; margin-top: 55px; padding-top: 6px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">PT TERATAI WIDJAJA</div>
              <div style="font-size: 9pt; color: #64748b;">Sistem Operasional Garment - Bon Pengeluaran Bahan Baku & Aksesoris</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 11pt; font-weight: bold; color: #1e3a8a;">BON PENGELUARAN STOK</div>
              <div style="font-family: monospace; font-size: 10pt;">${slip.referenceDoc}</div>
            </div>
          </div>

          <div class="meta-grid">
            <div>
              <div><strong>Alokasi Style:</strong> ${slip.styleCode} (${slip.styleName})</div>
              <div><strong>Departemen Tujuan:</strong> ${slip.destinationDept}</div>
              <div><strong>Tanggal / Jam:</strong> ${slip.timestamp} WIB</div>
            </div>
            <div>
              <div><strong>PIC Pengambil / Penerima:</strong> ${slip.picReceiver}</div>
              <div><strong>Petugas Gudang:</strong> ${slip.picGudang}</div>
              <div><strong>Alasan / Keperluan:</strong> ${slip.reason}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 35px;">No</th>
                <th style="width: 90px;">Kode SKU</th>
                <th>Nama Bahan Baku / Aksesoris</th>
                <th>Kategori</th>
                <th style="width: 80px;">Lokasi Rak</th>
                <th style="width: 90px;" class="text-right">Kuantitas</th>
                <th style="width: 60px;">Satuan</th>
              </tr>
            </thead>
            <tbody>
              ${slip.items.map((it, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td style="font-family: monospace; font-weight: bold;">${it.itemCode}</td>
                  <td><strong>${it.itemName}</strong></td>
                  <td>${it.category}</td>
                  <td>${it.rackLocation}</td>
                  <td class="text-right" style="font-weight: bold; font-size: 10pt;">${it.quantity.toLocaleString()}</td>
                  <td>${it.unit}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="signatures">
            <div>
              <div style="font-size: 9pt; color: #64748b;">Diserahkan Oleh:</div>
              <div class="sign-box">${slip.picGudang}<br><span style="font-size: 8pt; font-weight: normal;">(Petugas Gudang)</span></div>
            </div>
            <div>
              <div style="font-size: 9pt; color: #64748b;">Diterima Oleh (PIC):</div>
              <div class="sign-box">${slip.picReceiver}<br><span style="font-size: 8pt; font-weight: normal;">(Departemen ${slip.destinationDept})</span></div>
            </div>
            <div>
              <div style="font-size: 9pt; color: #64748b;">Mengetahui &amp; Otorisasi:</div>
              <div class="sign-box">${currentUser.role === 'PE' ? currentUser.name : 'Production Engineer / PPIC'}<br><span style="font-size: 8pt; font-weight: normal;">(PE / PPIC)</span></div>
            </div>
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shadow-sm">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black tracking-tight">Keranjang Pengeluaran Bahan Gudang</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-400/30">
                  Sesuai Style
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pilih bahan &rarr; masukkan ke keranjang &rarr; periksa sisa stok &rarr; ajukan pengeluaran
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {requisitionCart.length > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                <span>{requisitionCart.length} Item di Keranjang</span>
              </span>
            )}
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* FEEDBACK BANNER */}
        {feedback && (
          <div className={`px-5 py-2.5 text-xs font-semibold flex items-center justify-between gap-2 border-b ${
            feedback.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
              <span>{feedback.message}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* IF SUBMITTED: SHOW SUCCESS RECEIPT VIEW */}
        {submittedReceipt ? (
          <div className="p-6 space-y-6">
            <div className="text-center space-y-2 py-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center border-4 border-emerald-50">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Pengajuan Pengeluaran Berhasil!</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Sebanyak <strong>{submittedReceipt.items.length} item</strong> bahan baku telah berhasil dipotong dari stok gudang dan dicatat dalam riwayat mutasi untuk Style <strong>{submittedReceipt.styleCode}</strong>.
              </p>
            </div>

            {/* Document summary box */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div>
                  <span className="text-slate-400">Nomor Bon: </span>
                  <span className="font-mono font-bold text-slate-900">{submittedReceipt.referenceDoc}</span>
                </div>
                <div>
                  <span className="text-slate-400">Tujuan: </span>
                  <span className="font-bold text-blue-700">{submittedReceipt.destinationDept}</span>
                </div>
                <div>
                  <span className="text-slate-400">PIC Pengambil: </span>
                  <span className="font-bold text-slate-900">{submittedReceipt.picReceiver}</span>
                </div>
              </div>

              {/* Items list */}
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {submittedReceipt.items.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs">
                    <div>
                      <span className="font-bold text-slate-800">{it.itemName}</span>
                      <span className="text-[10px] text-slate-400 ml-2 font-mono">[{it.itemCode}]</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 text-[11px]">Rak: {it.rackLocation}</span>
                      <span className="font-black text-blue-700">{it.quantity} {it.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Receipt Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handlePrintSlip}
                className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Bon Pengeluaran / Surat Jalan</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSubmittedReceipt(null);
                  onClose();
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
              >
                Selesai &amp; Tutup
              </button>
            </div>
          </div>
        ) : (
          /* ACTIVE CART WORKFLOW VIEW */
          <div className="p-4 sm:p-6 space-y-5 max-h-[82vh] overflow-y-auto">
            
            {/* 1. STYLE CONTROLLER (Strict rule: only materials of this style allowed) */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-700 border border-blue-200">
                  <Layers2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Style Produksi Terpilih:</div>
                  <div className="font-black text-sm text-slate-900">
                    {activeStyle.code} — {activeStyle.name}
                  </div>
                </div>
              </div>

              {/* Style selector - locked if cart already has items to enforce strict single-style cart rule */}
              <div className="flex items-center gap-2">
                {requisitionCart.length > 0 ? (
                  <div className="text-[11px] px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 font-medium">
                    🔒 Style terkunci pada <strong>{selectedStyleCode}</strong> (ada {requisitionCart.length} item di keranjang)
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-500 font-medium">Ganti Style:</span>
                    <select
                      value={selectedStyleCode}
                      onChange={(e) => setSelectedStyleCode(e.target.value)}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    >
                      {styles.map(s => (
                        <option key={s.id} value={s.code}>
                          {s.code} ({s.name})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* 2. PICK MATERIAL ACCORDING TO STYLE ONLY */}
            <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">1</span>
                  <h3 className="font-bold text-xs text-slate-900">Pilih Bahan Baku Sesuai Style ({activeStyle.code})</h3>
                </div>
                <span className="text-[11px] text-blue-700 font-semibold">
                  Tersedia {styleMaterials.length} jenis bahan untuk style ini
                </span>
              </div>

              {styleMaterials.length === 0 ? (
                <div className="p-4 bg-white rounded-xl border border-slate-200 text-center text-xs text-slate-500">
                  Belum ada stok bahan yang dialokasikan khusus untuk style <strong>{activeStyle.code}</strong>.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                  
                  {/* Select material */}
                  <div className="md:col-span-6 space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Pilih Bahan / Aksesoris:</label>
                    <select
                      value={selectedItemId}
                      onChange={(e) => {
                        setSelectedItemId(e.target.value);
                        const match = styleMaterials.find(m => m.id === e.target.value);
                        if (match) setInputQty(Math.min(10, match.currentStock));
                      }}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    >
                      {styleMaterials.map(item => (
                        <option key={item.id} value={item.id}>
                          [{item.code}] {item.name} &bull; Sisa: {item.currentStock} {item.unit}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity input with stepper */}
                  <div className="md:col-span-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-700">
                        Jumlah Ambil ({currentItem?.unit || 'Unit'}):
                      </label>
                      <span className="text-[11px] text-slate-500">
                        Maks: <strong className="text-slate-900">{currentItem?.currentStock || 0}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setInputQty(prev => Math.max(1, prev - 10))}
                        className="px-2 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 text-xs"
                      >
                        -10
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={currentItem?.currentStock || 1000}
                        value={inputQty}
                        onChange={(e) => setInputQty(Math.max(1, Number(e.target.value)))}
                        className="w-full p-2 rounded-lg border border-slate-300 bg-white text-xs font-bold text-center text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setInputQty(prev => Math.min(currentItem?.currentStock || 1000, prev + 10))}
                        className="px-2 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 text-xs"
                      >
                        +10
                      </button>
                      <button
                        type="button"
                        onClick={() => setInputQty(currentItem?.currentStock || 1)}
                        className="px-2 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-[10px] font-bold"
                        title="Ambil Semua Sisa Stok"
                      >
                        Max
                      </button>
                    </div>
                  </div>

                  {/* Add to Cart button */}
                  <div className="md:col-span-2">
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={!currentItem || currentItem.currentStock <= 0}
                      className="w-full py-2.5 px-3 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 text-white font-bold text-xs shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Keranjang</span>
                    </button>
                  </div>

                </div>
              )}

              {/* Material Detail Pill */}
              {currentItem && (
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] bg-white p-2.5 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{currentItem.name}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]">{currentItem.category}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      Rak: <strong>{currentItem.rackLocation}</strong>
                    </span>
                    <span>
                      Stok Tersedia: <strong className="text-emerald-700 font-bold">{currentItem.currentStock} {currentItem.unit}</strong>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 3. REQUISITION BASKET / KERANJANG DATA */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">2</span>
                  <h3 className="font-bold text-xs text-slate-900">
                    Daftar Bahan dalam Keranjang ({requisitionCart.length} Item)
                  </h3>
                </div>

                {requisitionCart.length > 0 && (
                  <button
                    type="button"
                    onClick={clearRequisitionCart}
                    className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Kosongkan Keranjang</span>
                  </button>
                )}
              </div>

              {requisitionCart.length === 0 ? (
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center space-y-2">
                  <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-slate-700">Keranjang Pengambilan Masih Kosong</div>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                    Pilih bahan baku di atas, tentukan kuantitas yang dibutuhkan, lalu klik <strong>+ Keranjang</strong> untuk memasukkan ke antrian pengajuan.
                  </p>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                        <th className="py-2.5 px-3">Bahan Baku</th>
                        <th className="py-2.5 px-3">Lokasi Rak</th>
                        <th className="py-2.5 px-3 text-right">Stok Gudang</th>
                        <th className="py-2.5 px-3 text-center" style={{ width: '130px' }}>Jumlah Ambil</th>
                        <th className="py-2.5 px-3 text-right">Sisa Stok</th>
                        <th className="py-2.5 px-3 text-center" style={{ width: '45px' }}></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {requisitionCart.map((cartItem) => {
                        const originalItem = stock.find(s => s.id === cartItem.stockItemId);
                        const currentStock = originalItem ? originalItem.currentStock : cartItem.currentStock;
                        const remaining = currentStock - cartItem.quantityToIssue;

                        return (
                          <tr key={cartItem.stockItemId} className="hover:bg-slate-50 transition-colors">
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-slate-900">{cartItem.itemName}</div>
                              <div className="text-[10px] text-slate-400 font-mono">[{cartItem.itemCode}] &bull; {cartItem.category}</div>
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                              {cartItem.rackLocation}
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-700 font-medium">
                              {currentStock} {cartItem.unit}
                            </td>
                            <td className="py-2 px-2 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => updateCartItemQuantity(cartItem.stockItemId, cartItem.quantityToIssue - 1)}
                                  className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  max={currentStock}
                                  value={cartItem.quantityToIssue}
                                  onChange={(e) => updateCartItemQuantity(cartItem.stockItemId, Number(e.target.value))}
                                  className="w-14 py-1 rounded border border-slate-300 text-center font-bold text-slate-900 text-xs"
                                />
                                <button
                                  type="button"
                                  onClick={() => updateCartItemQuantity(cartItem.stockItemId, cartItem.quantityToIssue + 1)}
                                  className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <span className={`font-bold ${remaining <= 10 ? 'text-rose-600' : 'text-emerald-700'}`}>
                                {remaining} {cartItem.unit}
                              </span>
                            </td>
                            <td className="py-2.5 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => removeFromRequisitionCart(cartItem.stockItemId)}
                                className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
                                title="Hapus dari keranjang"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 4. FORM PENGAJUAN & PENANGGUNG JAWAB (PIC) */}
            <form onSubmit={handleSubmitRequisition} className="space-y-4 pt-2 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">3</span>
                <h3 className="font-bold text-xs text-slate-900">
                  Data Pengajuan, Departemen Tujuan &amp; Penanggung Jawab
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                
                {/* Destination Dept */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Departemen Tujuan Pengambilan <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={destinationDept}
                    onChange={(e) => setDestinationDept(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="Cutting">Cutting (Ruang Pemotongan Kain)</option>
                    <option value="Sewing">Sewing (Line Perakitan Jahit)</option>
                    <option value="Subkon">Subkon (Bordir / Sablon / Washing)</option>
                    <option value="Sample / PPS">Sample / PPS (RnD Technical Sample)</option>
                    <option value="Finishing">Finishing &amp; Packing</option>
                    <option value="Gudang Lain">Gudang Lain / Transit</option>
                  </select>
                </div>

                {/* Document No */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nomor Dokumen / Bon SPPB:
                  </label>
                  <input
                    type="text"
                    value={customDocNo}
                    onChange={(e) => setCustomDocNo(e.target.value)}
                    placeholder="Contoh: BON-TW-JKT-88-001"
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-slate-800 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none text-xs"
                  />
                </div>

              </div>

              {/* PIC Accountability */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-900 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-blue-700" />
                    <span>Nama PIC Pengambil / Penanggung Jawab <span className="text-rose-500">*</span></span>
                  </label>
                  <span className="text-[10px] text-slate-400">Wajib diisi untuk audit mutasi</span>
                </div>

                <input
                  type="text"
                  placeholder="Contoh: Dani (Leader Cutting) / Supardi (SPV Sewing)"
                  value={picReceiver}
                  onChange={(e) => setPicReceiver(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none text-xs"
                  required
                />

                {/* Quick chip suggestions */}
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  <span className="text-[10px] text-slate-400">Pilih Cepat:</span>
                  {picPresets.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setPicReceiver(p.name);
                        setDestinationDept(p.dept);
                      }}
                      className="px-2 py-0.5 rounded-md bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 text-[10px] font-semibold transition-colors"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reason / Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Alasan / Keperluan Pengambilan:
                  </label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Contoh: Pemotongan batch 1 sesuai SOP 11"
                    className="w-full p-2 rounded-xl border border-slate-300 font-medium bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Catatan Khusus (Lot / Roll):
                  </label>
                  <input
                    type="text"
                    value={generalNotes}
                    onChange={(e) => setGeneralNotes(e.target.value)}
                    placeholder="Contoh: Kain lot A, roll #12 s/d #15"
                    className="w-full p-2 rounded-xl border border-slate-300 font-medium bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none text-xs"
                  />
                </div>
              </div>

              {/* Bottom Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
                >
                  Batal
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={requisitionCart.length === 0}
                    className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                    <span>Ajukan Pengeluaran ({requisitionCart.length} Item Bahan)</span>
                  </button>
                </div>
              </div>

            </form>

          </div>
        )}

      </div>
    </div>
  );
};
