import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { StockItem, StockTransaction } from '../types';
import { 
  AlertTriangle, 
  X, 
  Send, 
  ShieldAlert, 
  UserCheck, 
  FileText, 
  CheckCircle2, 
  Layers 
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
  const { stock, styles, currentStyle, issueStock, currentUser } = useApp();

  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [targetStyleCode, setTargetStyleCode] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(10);
  const [destinationDept, setDestinationDept] = useState<StockTransaction['destinationDept']>('Cutting');
  const [picReceiver, setPicReceiver] = useState<string>('');
  const [referenceDoc, setReferenceDoc] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (preselectedItem) {
      setSelectedItemId(preselectedItem.id);
      setTargetStyleCode(preselectedItem.styleCode);
    } else if (stock.length > 0) {
      setSelectedItemId(stock[0].id);
      setTargetStyleCode(currentStyle.code);
    }
  }, [preselectedItem, stock, currentStyle, isOpen]);

  if (!isOpen) return null;

  const currentItem = stock.find(s => s.id === selectedItemId);
  const isCrossStyle = currentItem && targetStyleCode && currentItem.styleCode !== targetStyleCode;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!currentItem) {
      setFeedback({ type: 'error', message: 'Pilih item bahan yang akan dikeluarkan.' });
      return;
    }

    if (!picReceiver.trim()) {
      setFeedback({ type: 'error', message: 'Wajib mengisi Nama Penanggung Jawab / PIC yang mengambil barang!' });
      return;
    }

    if (quantity <= 0) {
      setFeedback({ type: 'error', message: 'Jumlah pengambilan harus lebih besar dari 0.' });
      return;
    }

    if (quantity > currentItem.currentStock) {
      setFeedback({ 
        type: 'error', 
        message: `Stok tidak mencukupi! Tersedia hanya ${currentItem.currentStock} ${currentItem.unit}.` 
      });
      return;
    }

    const result = issueStock({
      stockItemId: currentItem.id,
      styleTarget: targetStyleCode,
      quantity,
      destinationDept,
      picReceiver: picReceiver.trim(),
      referenceDoc: referenceDoc.trim() || `SPK-${targetStyleCode}-${Date.now().toString().slice(-4)}`,
      reason: reason.trim() || `Pengeluaran material untuk proses ${destinationDept}`,
      notes: notes.trim()
    });

    if (result.success) {
      setFeedback({ type: 'success', message: result.message });
      setTimeout(() => {
        setFeedback(null);
        onClose();
      }, 1500);
    } else {
      setFeedback({ type: 'error', message: result.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-400/30">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Form Pengeluaran Stok Bahan</h2>
              <p className="text-xs text-slate-400">Gudang Bahan Baku & Aksesoris PT Teratai Widjaja</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`p-3 text-xs font-semibold flex items-center gap-2 ${
            feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200' : 'bg-rose-50 text-rose-800 border-b border-rose-200'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          
          {/* Material Selection */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Pilih Bahan Baku / Aksesoris Gudang <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-medium bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {stock.map(item => (
                <option key={item.id} value={item.id}>
                  [{item.code}] {item.name} — Alokasi: {item.styleCode} (Stok: {item.currentStock} {item.unit})
                </option>
              ))}
            </select>
            {currentItem && (
              <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200">
                <span>Lokasi: <strong>{currentItem.rackLocation}</strong></span>
                <span>Tersedia: <strong className="text-slate-900">{currentItem.currentStock} {currentItem.unit}</strong></span>
                <span>Style Terdaftar: <strong className="text-indigo-600">{currentItem.styleCode}</strong></span>
              </div>
            )}
          </div>

          {/* Target Style Selection */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Digunakan Untuk Style Produksi Mana? <span className="text-rose-500">*</span>
            </label>
            <select
              value={targetStyleCode}
              onChange={(e) => setTargetStyleCode(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900"
            >
              {styles.map(sty => (
                <option key={sty.id} value={sty.code}>
                  {sty.code} — {sty.name} (Buyer: {sty.buyer})
                </option>
              ))}
            </select>
          </div>

          {/* CROSS-STYLE CRITICAL WARNING */}
          {isCrossStyle && (
            <div className="p-3.5 rounded-xl bg-amber-50 border-2 border-amber-400 text-amber-950 flex items-start gap-3 animate-in fade-in">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-xs text-amber-900">
                  PERINGATAN: Pengambilan di Luar Style Tidak Dianjurkan!
                </div>
                <p className="text-[11px] text-amber-800 mt-1 leading-relaxed">
                  Bahan ini terdaftar untuk alokasi <strong>{currentItem?.styleCode}</strong>, namun Anda mengeluarkannya untuk style <strong>{targetStyleCode}</strong>.
                  Pengambilan lintas style berisiko memicu kekurangan bahan baku (shortage) saat mass production style asal.
                </p>
                <p className="text-[10px] text-amber-900 font-semibold mt-1">
                  * Riwayat mutasi akan ditandai flag &quot;Cross-Style&quot; dan memerlukan otorisasi PE &amp; PPIC.
                </p>
              </div>
            </div>
          )}

          {/* Quantity & Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Jumlah Pengambilan ({currentItem?.unit || 'Unit'}) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max={currentItem?.currentStock || 10000}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Departemen Tujuan <span className="text-rose-500">*</span>
              </label>
              <select
                value={destinationDept}
                onChange={(e) => setDestinationDept(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-medium bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="Cutting">Cutting (Ruang Potong)</option>
                <option value="Sewing">Sewing (Line Jahit)</option>
                <option value="Subkon">Subkon (Bordir/Sablon/Washing)</option>
                <option value="Sample / PPS">Sample / PPS (RnD Technical)</option>
                <option value="Finishing">Finishing & Packing</option>
                <option value="Gudang Lain">Gudang Lain / Transit</option>
              </select>
            </div>
          </div>

          {/* ACCOUNTABILITY: SIAPA YANG MENGAMBIL TANGGUNG JAWAB */}
          <div className="bg-indigo-50/60 p-3.5 rounded-xl border border-indigo-100 space-y-3">
            <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
              <UserCheck className="w-4 h-4 text-indigo-600" />
              Akuntabilitas &amp; Penanggung Jawab Pengambilan <span className="text-rose-500">*</span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Nama PIC yang Mengambil / Bertanggung Jawab <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Dani (Cutting Leader) / Supardi (SPV Sewing)"
                value={picReceiver}
                onChange={(e) => setPicReceiver(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-300 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                required
              />
              <span className="text-[10px] text-slate-500 mt-0.5 inline-block">
                Nama ini akan dicatat permanen dalam riwayat transaksi barang untuk audit kepatuhan.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  PIC Gudang yang Menyerahkan:
                </label>
                <input
                  type="text"
                  disabled
                  value={`${currentUser.name} (${currentUser.department})`}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-slate-100 text-slate-600 text-[11px] font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Nomor Referensi Dokumen:
                </label>
                <input
                  type="text"
                  placeholder="No. SPK / SPPB / Surat Jalan"
                  value={referenceDoc}
                  onChange={(e) => setReferenceDoc(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-[11px]"
                />
              </div>
            </div>
          </div>

          {/* Reason & Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Alasan Pengambilan / Kebutuhan Proses:
            </label>
            <input
              type="text"
              placeholder="Contoh: Penggelaran kain batch 1 pemotongan sesuai SOP 11"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Catatan Khusus (Opsional):
            </label>
            <textarea
              rows={2}
              placeholder="Catatan kondisi kain, nomor lot, instruksi resting kain..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-xl font-bold text-white shadow-sm flex items-center gap-1.5 transition-all ${
                isCrossStyle 
                  ? 'bg-amber-600 hover:bg-amber-700' 
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isCrossStyle ? 'Konfirmasi Pengambilan Khusus' : 'Keluarkan Barang'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
