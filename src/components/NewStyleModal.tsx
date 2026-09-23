import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  PlusCircle, 
  X, 
  Calendar, 
  Layers, 
  Target, 
  DollarSign, 
  Tag, 
  CheckCircle2, 
  Sparkles,
  Shirt
} from 'lucide-react';

export const NewStyleModal: React.FC = () => {
  const { isNewStyleModalOpen, setIsNewStyleModalOpen, addNewStyle, currentUser } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const nextMonth = new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [buyer, setBuyer] = useState('');
  const [startDate, setStartDate] = useState(todayStr);
  const [deliveryDate, setDeliveryDate] = useState(nextMonth);
  const [targetQuantityPcs, setTargetQuantityPcs] = useState<number>(3000);
  const [dailyTargetPcs, setDailyTargetPcs] = useState<number>(350);
  const [primaryRoute, setPrimaryRoute] = useState<'LINE' | 'SUBCON' | 'HYBRID'>('HYBRID');
  const [successNotice, setSuccessNotice] = useState(false);

  if (!isNewStyleModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim() || !buyer.trim()) {
      alert('Mohon lengkapi kode style, nama model, dan buyer!');
      return;
    }

    addNewStyle({
      code: code.trim(),
      name: name.trim(),
      buyer: buyer.trim(),
      targetQuantityPcs: Number(targetQuantityPcs),
      startDate,
      deliveryDate,
      dailyTargetPcs: Number(dailyTargetPcs)
    });

    setSuccessNotice(true);
    setTimeout(() => {
      setSuccessNotice(false);
      setIsNewStyleModalOpen(false);
      // Reset
      setCode('');
      setName('');
      setBuyer('');
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-red-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20">
              <Shirt className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">Input Model / Style Produksi Baru</h2>
              <p className="text-xs text-blue-100">Berdasarkan Tanggal, Spesifikasi Style &amp; Target Output</p>
            </div>
          </div>
          <button 
            onClick={() => setIsNewStyleModalOpen(false)}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {successNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-bold animate-pulse">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Model berhasil ditambahkan dan 14 alur SOP telah diinisialisasi otomatis!</span>
            </div>
          )}

          {/* Section 1: Tanggal Pelaksanaan */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 uppercase tracking-wider mb-2.5">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>1. Jadwal Tanggal Produksi &amp; Delivery</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Tanggal Mulai Produksi (Start Date) *
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Tanggal Target Delivery (Buyer Deadline) *
                </label>
                <input
                  type="date"
                  required
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 font-medium text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Spesifikasi Style */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-red-900 uppercase tracking-wider mb-2.5">
              <Tag className="w-4 h-4 text-red-600" />
              <span>2. Identitas Model &amp; Buyer</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Kode Style / Artikel *
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Contoh: TW-JKT-102"
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-blue-700 focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Buyer / Customer Brand *
                </label>
                <input
                  type="text"
                  required
                  value={buyer}
                  onChange={(e) => setBuyer(e.target.value)}
                  placeholder="Contoh: Uniqlo, H&M, Marks&Spencer"
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Nama Model Pakaian / Garment *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Windproof Outdoor Technical Parka"
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Target Output & Jalur Produksi */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 uppercase tracking-wider mb-2.5">
              <Target className="w-4 h-4 text-blue-600" />
              <span>3. Target Volume &amp; Rencana Jalur Produksi</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Target Order (Pcs) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={targetQuantityPcs}
                  onChange={(e) => setTargetQuantityPcs(Number(e.target.value))}
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-900 focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Target Harian (Pcs/Line)
                </label>
                <input
                  type="number"
                  min="1"
                  value={dailyTargetPcs}
                  onChange={(e) => setDailyTargetPcs(Number(e.target.value))}
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg font-bold text-emerald-700 focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Rencana Jalur Produksi
                </label>
                <select
                  value={primaryRoute}
                  onChange={(e) => setPrimaryRoute(e.target.value as any)}
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg font-bold text-blue-700 focus:ring-2 focus:ring-blue-600"
                >
                  <option value="HYBRID">Kombinasi (Line Sewing &amp; Subkon)</option>
                  <option value="LINE">Line Internal In-House Penuh</option>
                  <option value="SUBCON">Subkontraktor Luar Penuh</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsNewStyleModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer border-t border-blue-500"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Simpan Model &amp; Generate SOP</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
