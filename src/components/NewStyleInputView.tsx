import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ProductionStyle } from '../types';
import { 
  PlusCircle, 
  CheckCircle2, 
  Shirt, 
  Calendar, 
  ArrowRight, 
  Layers, 
  Warehouse, 
  ClipboardCheck, 
  Trash2,
  Check,
  Edit3,
  Save,
  X
} from 'lucide-react';

export const NewStyleInputView: React.FC = () => {
  const { 
    styles, 
    selectedStyleId, 
    setSelectedStyleId, 
    currentStyle,
    addNewStyle, 
    updateStyle,
    deleteStyle,
    stock,
    setActiveTab 
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const nextMonthStr = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [buyer, setBuyer] = useState('');
  const [targetQuantityPcs, setTargetQuantityPcs] = useState<number>(2500);
  const [dailyTargetPcs, setDailyTargetPcs] = useState<number>(300);
  const [startDate, setStartDate] = useState(todayStr);
  const [deliveryDate, setDeliveryDate] = useState(nextMonthStr);
  const [primaryRoute, setPrimaryRoute] = useState<'LINE' | 'SUBCON' | 'HYBRID'>('HYBRID');
  const [autoSeedMaterials, setAutoSeedMaterials] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Inline Edit State for Daftar Model
  const [editingStyleId, setEditingStyleId] = useState<string | null>(null);
  const [editCode, setEditCode] = useState('');
  const [editName, setEditName] = useState('');
  const [editBuyer, setEditBuyer] = useState('');
  const [editTargetQty, setEditTargetQty] = useState<number>(1000);
  const [editStartDate, setEditStartDate] = useState('');
  const [editDeliveryDate, setEditDeliveryDate] = useState('');
  const [editRoute, setEditRoute] = useState<'LINE' | 'SUBCON' | 'HYBRID'>('HYBRID');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleStartEditStyle = (sty: ProductionStyle) => {
    setEditingStyleId(sty.id);
    setConfirmDeleteId(null);
    setEditCode(sty.code);
    setEditName(sty.name);
    setEditBuyer(sty.buyer);
    setEditTargetQty(sty.targetQuantityPcs);
    setEditStartDate(sty.startDate);
    setEditDeliveryDate(sty.deliveryDate);
    setEditRoute(sty.primaryRoute || 'HYBRID');
    setErrorMsg(null);
  };

  const handleSaveEditStyle = (styleId: string) => {
    const res = updateStyle(styleId, {
      code: editCode,
      name: editName,
      buyer: editBuyer,
      targetQuantityPcs: Number(editTargetQty) || 1000,
      startDate: editStartDate,
      deliveryDate: editDeliveryDate,
      primaryRoute: editRoute
    });
    if (!res.success) {
      setErrorMsg(res.message);
      return;
    }
    setEditingStyleId(null);
    setErrorMsg(null);
    setFeedback(res.message);
    setTimeout(() => setFeedback(null), 5000);
  };

  const handleConfirmDeleteStyle = (sty: ProductionStyle) => {
    deleteStyle(sty.id);
    setConfirmDeleteId(null);
    if (editingStyleId === sty.id) {
      setEditingStyleId(null);
    }
    setFeedback(`Model ${sty.code} (${sty.name}) berhasil dihapus dari daftar!`);
    setTimeout(() => setFeedback(null), 4000);
  };

  const applyPreset = (preset: 'jaket' | 'kemeja' | 'celana') => {
    const suffix = Math.floor(100 + Math.random() * 899);
    if (preset === 'jaket') {
      setCode(`TW-JKT-${suffix}`);
      setName('Outdoor Weatherproof Parka');
      setBuyer('Uniqlo Global');
      setTargetQuantityPcs(3000);
      setDailyTargetPcs(350);
      setPrimaryRoute('HYBRID');
    } else if (preset === 'kemeja') {
      setCode(`TW-SHR-${suffix}`);
      setName('Tactical Workshirt Long Sleeve');
      setBuyer('Marks & Spencer');
      setTargetQuantityPcs(4500);
      setDailyTargetPcs(450);
      setPrimaryRoute('LINE');
    } else {
      setCode(`TW-PNT-${suffix}`);
      setName('Stretch Chino Utility Pants');
      setBuyer('H&M Group');
      setTargetQuantityPcs(5000);
      setDailyTargetPcs(500);
      setPrimaryRoute('HYBRID');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim() || !buyer.trim()) return;

    const cleanCode = code.trim().toUpperCase();
    addNewStyle({
      code: cleanCode,
      name: name.trim(),
      buyer: buyer.trim(),
      targetQuantityPcs: Number(targetQuantityPcs) || 1000,
      startDate,
      deliveryDate,
      dailyTargetPcs: Number(dailyTargetPcs) || 250,
      primaryRoute,
      autoSeedMaterials
    });

    setFeedback(`Model ${cleanCode} (${name.trim()}) berhasil dibuat dan dijadikan Model Aktif!`);
    setCode('');
    setName('');
    setBuyer('');
    setTimeout(() => setFeedback(null), 5000);
  };

  return (
    <div className="space-y-4">
      {/* Header Ringkas */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 flex items-center justify-between gap-2 flex-wrap">
        <h1 className="text-base font-bold text-slate-900">
          Model / Style Produksi
        </h1>
        <div className="text-xs text-slate-600">
          Aktif: <strong className="font-mono text-blue-700">{currentStyle.code}</strong> — {currentStyle.name}
        </div>
      </div>

      {/* Notifikasi Sukses */}
      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedback}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('pe-workflow')}
              className="px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-800 font-bold hover:bg-emerald-100 cursor-pointer"
            >
              Alur SOP &rarr;
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('warehouse-stock')}
              className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white font-bold hover:bg-emerald-800 cursor-pointer"
            >
              Stok Gudang &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Grid Utama */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* KOLOM KIRI (5/12): FORM INPUT MODEL BARU */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-blue-400" />
              <h2 className="text-xs font-bold">Tambah Model Baru</h2>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => applyPreset('jaket')}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold cursor-pointer"
              >
                + Jaket
              </button>
              <button
                type="button"
                onClick={() => applyPreset('kemeja')}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold cursor-pointer"
              >
                + Kemeja
              </button>
              <button
                type="button"
                onClick={() => applyPreset('celana')}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold cursor-pointer"
              >
                + Celana
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kode Style *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="TW-JKT-105"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-blue-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Buyer *</label>
                <input
                  type="text"
                  required
                  value={buyer}
                  onChange={(e) => setBuyer(e.target.value)}
                  placeholder="Uniqlo / H&M"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Model *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jaket Parka Waterproof"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Order (Pcs) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={targetQuantityPcs}
                  onChange={(e) => setTargetQuantityPcs(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold text-slate-900 tabular-nums focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jalur Produksi</label>
                <select
                  value={primaryRoute}
                  onChange={(e) => setPrimaryRoute(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="HYBRID">Line &amp; Subkon</option>
                  <option value="LINE">Line Internal</option>
                  <option value="SUBCON">Subkon Penuh</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tgl Mulai Sewing (H-0)</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Delivery</label>
                <input
                  type="date"
                  required
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>

            {startDate && (
              <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200 text-[11px] text-blue-900 space-y-1 tabular-nums">
                <div className="font-bold">Jadwal Otomatis Pra-Sewing (Metode H-7 s/d H-1):</div>
                {(() => {
                  const sewMs = new Date(startDate + 'T00:00:00').getTime();
                  if (isNaN(sewMs)) return null;
                  const fmt = (days: number) => new Date(sewMs - days * 86400000).toISOString().split('T')[0];
                  return (
                    <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] text-blue-800">
                      <span>• <strong>H-7</strong> (Tahap 1–4): {fmt(7)}</span>
                      <span>• <strong>H-5</strong> (Tahap 5–8): {fmt(5)}</span>
                      <span>• <strong>H-3</strong> (Tahap 9–12): {fmt(3)}</span>
                      <span>• <strong>H-1</strong> (Tahap 13–14): {fmt(1)}</span>
                    </div>
                  );
                })()}
              </div>
            )}

            <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={autoSeedMaterials}
                onChange={(e) => setAutoSeedMaterials(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="font-semibold text-slate-700">Buat paket bahan baku otomatis di Gudang &amp; BOM</span>
            </label>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Simpan Model Baru</span>
            </button>
          </form>
        </div>

        {/* KOLOM KANAN (7/12): DAFTAR MODEL PRODUKSI */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <h2 className="text-xs font-bold text-slate-900">Daftar Model Terdaftar ({styles.length})</h2>
          </div>

          <div className="divide-y divide-slate-100 max-h-[580px] overflow-y-auto">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border-b border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between">
                <span>{errorMsg}</span>
                <button type="button" onClick={() => setErrorMsg(null)} className="text-rose-600 font-bold cursor-pointer">✕</button>
              </div>
            )}

            {styles.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-500">
                Belum ada model terdaftar. Silakan tambah model baru pada form di samping.
              </div>
            )}

            {styles.map((sty) => {
              const isSelected = sty.id === selectedStyleId;
              const isEditingThis = editingStyleId === sty.id;
              const isConfirmingDelete = confirmDeleteId === sty.id;
              const completedSteps = sty.steps.filter(s => s.status === 'Completed').length;
              const progressPct = Math.round((completedSteps / sty.steps.length) * 100);
              const styleStockCount = stock.filter(item => item.styleCode === sty.code).length;

              return (
                <div
                  key={sty.id}
                  className={`p-3.5 transition-colors ${
                    isSelected ? 'bg-blue-50/40' : 'hover:bg-slate-50'
                  }`}
                >
                  {isEditingThis ? (
                    <div className="space-y-3 bg-white p-3 rounded-xl border border-blue-300 shadow-xs text-xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="font-bold text-blue-900 flex items-center gap-1.5">
                          <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                          Edit Data Model ({sty.code})
                        </span>
                        <button
                          type="button"
                          onClick={() => { setEditingStyleId(null); setErrorMsg(null); }}
                          className="p-1 rounded hover:bg-slate-100 text-slate-500 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Kode Style *</label>
                          <input
                            type="text"
                            value={editCode}
                            onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono font-bold text-blue-800"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Nama Model *</label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-semibold text-slate-900"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Buyer *</label>
                          <input
                            type="text"
                            value={editBuyer}
                            onChange={(e) => setEditBuyer(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Target Order (Pcs)</label>
                          <input
                            type="number"
                            min="1"
                            value={editTargetQty}
                            onChange={(e) => setEditTargetQty(Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold text-slate-900 tabular-nums"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Jalur Produksi</label>
                          <select
                            value={editRoute}
                            onChange={(e) => setEditRoute(e.target.value as any)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-semibold text-slate-800 bg-white"
                          >
                            <option value="HYBRID">Line &amp; Subkon</option>
                            <option value="LINE">Line Internal</option>
                            <option value="SUBCON">Subkon Penuh</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                            Tgl Mulai Sewing (H-0)
                          </label>
                          <input
                            type="date"
                            value={editStartDate}
                            onChange={(e) => setEditStartDate(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                            Target Delivery
                          </label>
                          <input
                            type="date"
                            value={editDeliveryDate}
                            onChange={(e) => setEditDeliveryDate(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono text-slate-800"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => { setEditingStyleId(null); setErrorMsg(null); }}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEditStyle(sty.id)}
                          className="px-3.5 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Simpan Perubahan</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-xs text-blue-800">{sty.code}</span>
                          <span className="text-slate-300">·</span>
                          <span className="font-bold text-xs text-slate-900 truncate">{sty.name}</span>
                          {isSelected && (
                            <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-700">
                              <Check className="w-3 h-3" /> Aktif
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap tabular-nums">
                          <span>{sty.buyer}</span>
                          <span>·</span>
                          <strong className="text-slate-700">{sty.targetQuantityPcs.toLocaleString()} Pcs</strong>
                          <span>·</span>
                          <span>Mulai Sewing: <strong className="text-slate-700">{sty.startDate}</strong></span>
                          <span>·</span>
                          <span>Delivery: {sty.deliveryDate}</span>
                          <span>·</span>
                          <span className="text-blue-700 font-semibold">{completedSteps}/{sty.steps.length} SOP ({progressPct}%)</span>
                          <span>·</span>
                          <span>{styleStockCount} SKU</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                        {isConfirmingDelete ? (
                          <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-2 py-1 rounded-lg">
                            <span className="text-[11px] font-bold text-rose-800">Hapus?</span>
                            <button
                              type="button"
                              onClick={() => handleConfirmDeleteStyle(sty)}
                              className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold cursor-pointer"
                            >
                              Ya, Hapus
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-0.5 rounded bg-white border border-slate-300 text-slate-700 text-[11px] font-semibold cursor-pointer"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <>
                            {!isSelected ? (
                              <button
                                type="button"
                                onClick={() => setSelectedStyleId(sty.id)}
                                className="px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-colors cursor-pointer"
                              >
                                Pilih
                              </button>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setActiveTab('pe-workflow')}
                                  className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                                >
                                  SOP
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setActiveTab('warehouse-stock')}
                                  className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-blue-700 border border-blue-200 text-xs font-semibold transition-colors cursor-pointer"
                                >
                                  Gudang
                                </button>
                              </>
                            )}

                            <button
                              type="button"
                              onClick={() => handleStartEditStyle(sty)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                              title="Edit model style"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(sty.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                              title="Hapus model style"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Hapus</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
