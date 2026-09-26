import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
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
  Check
} from 'lucide-react';

export const NewStyleInputView: React.FC = () => {
  const { 
    styles, 
    selectedStyleId, 
    setSelectedStyleId, 
    currentStyle,
    addNewStyle, 
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
    <div className="space-y-5">
      {/* Panduan Singkat 4 Langkah untuk Pengguna Baru */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h1 className="text-base font-bold text-slate-900">
              Pusat Input Model Baru &amp; Panduan Cepat Sistem
            </h1>
            <p className="text-xs text-slate-500">
              Alur kerja ringkas dari pendaftaran model pakaian hingga pengambilan bahan di gudang:
            </p>
          </div>
          <div className="text-xs text-slate-600">
            Model Aktif Saat Ini: <strong className="font-mono text-blue-700">{currentStyle.code}</strong> ({currentStyle.name})
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200 flex items-start justify-between">
            <div>
              <div className="font-bold text-blue-950">1. Input / Pilih Model</div>
              <div className="text-[11px] text-slate-600 mt-0.5">Buat style baru atau pilih model yang sedang dikerjakan.</div>
            </div>
            <Shirt className="w-4 h-4 text-blue-600 shrink-0" />
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('pe-workflow')}
            className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-start justify-between text-left transition-colors cursor-pointer group"
          >
            <div>
              <div className="font-bold text-slate-900 group-hover:text-blue-700 flex items-center gap-1">
                <span>2. Cek Alur SOP</span>
                <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Pantau 14 tahapan persiapan teknis &amp; tanggal aktual.</div>
            </div>
            <ClipboardCheck className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ppic-planning')}
            className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-start justify-between text-left transition-colors cursor-pointer group"
          >
            <div>
              <div className="font-bold text-slate-900 group-hover:text-blue-700 flex items-center gap-1">
                <span>3. Rencana PPIC &amp; BOM</span>
                <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Atur pembagian Line/Subkon &amp; rincian kebutuhan bahan.</div>
            </div>
            <Layers className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('warehouse-stock')}
            className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-start justify-between text-left transition-colors cursor-pointer group"
          >
            <div>
              <div className="font-bold text-slate-900 group-hover:text-blue-700 flex items-center gap-1">
                <span>4. Keranjang Gudang</span>
                <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Ambil stok bahan khusus sesuai style lewat keranjang.</div>
            </div>
            <Warehouse className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0" />
          </button>
        </div>
      </div>

      {/* Notifikasi Sukses */}
      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedback}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('pe-workflow')}
              className="px-3 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-800 font-bold hover:bg-emerald-100 cursor-pointer"
            >
              Lihat Alur SOP &rarr;
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('warehouse-stock')}
              className="px-3 py-1 rounded-lg bg-emerald-700 text-white font-bold hover:bg-emerald-800 cursor-pointer"
            >
              Cek Stok Gudang &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Grid Utama: Kiri Form Input Model Baru, Kanan Daftar Model Aktif */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* KOLOM KIRI (5/12): FORM INPUT MODEL BARU */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-bold">Form Tambah Model / Style Baru</h2>
            </div>
            <span className="text-[11px] text-slate-400">Otomatis 14 SOP</span>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
            {/* Tombol Isi Cepat Contoh untuk Pengguna Baru */}
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 flex-wrap">
              <span className="text-[11px] text-slate-500 font-medium">Isi Cepat Contoh:</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => applyPreset('jaket')}
                  className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-semibold text-[11px] transition-colors cursor-pointer"
                >
                  + Jaket
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('kemeja')}
                  className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-semibold text-[11px] transition-colors cursor-pointer"
                >
                  + Kemeja
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('celana')}
                  className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-semibold text-[11px] transition-colors cursor-pointer"
                >
                  + Celana
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Kode Style <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Misal: TW-JKT-105"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-blue-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Buyer / Pelanggan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={buyer}
                  onChange={(e) => setBuyer(e.target.value)}
                  placeholder="Misal: Uniqlo / H&M"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Nama Model Pakaian <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Misal: Jaket Parka Waterproof"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Target Order (Pcs) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={targetQuantityPcs}
                  onChange={(e) => setTargetQuantityPcs(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Jalur Produksi Utama
                </label>
                <select
                  value={primaryRoute}
                  onChange={(e) => setPrimaryRoute(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="HYBRID">Kombinasi (Line &amp; Subkon)</option>
                  <option value="LINE">Line Internal Penuh</option>
                  <option value="SUBCON">Mitra Subkon Penuh</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Tanggal Mulai</span>
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-rose-500" />
                  <span>Target Delivery</span>
                </label>
                <input
                  type="date"
                  required
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Opsi Buat Paket Bahan Otomatis */}
            <label className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={autoSeedMaterials}
                onChange={(e) => setAutoSeedMaterials(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <div className="font-bold text-slate-800">Siapkan paket bahan baku awal otomatis di Gudang &amp; BOM</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Otomatis menambahkan Kain Utama, Benang, dan Aksesoris untuk style ini agar langsung siap diambil lewat Keranjang Gudang.
                </div>
              </div>
            </label>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Simpan &amp; Jadikan Model Aktif</span>
            </button>
          </form>
        </div>

        {/* KOLOM KANAN (7/12): DAFTAR MODEL PRODUKSI TERDAFTAR */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Daftar Model / Style Terdaftar ({styles.length})</h2>
              <p className="text-[11px] text-slate-500">Klik &quot;Aktifkan&quot; untuk mengganti model kerja di seluruh menu</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 max-h-[540px] overflow-y-auto">
            {styles.map((sty) => {
              const isSelected = sty.id === selectedStyleId;
              const completedSteps = sty.steps.filter(s => s.status === 'Completed').length;
              const progressPct = Math.round((completedSteps / sty.steps.length) * 100);
              const styleStockCount = stock.filter(item => item.styleCode === sty.code).length;

              return (
                <div
                  key={sty.id}
                  className={`p-4 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-black text-sm text-blue-900">{sty.code}</span>
                      <span className="text-slate-300">·</span>
                      <span className="font-bold text-sm text-slate-900 truncate">{sty.name}</span>
                      {isSelected && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                          <Check className="w-3.5 h-3.5" />
                          Aktif
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                      <span>Buyer: <strong className="text-slate-700">{sty.buyer}</strong></span>
                      <span>·</span>
                      <span>Target: <strong className="text-slate-700">{sty.targetQuantityPcs.toLocaleString()} Pcs</strong></span>
                      <span>·</span>
                      <span>Delivery: <strong className="text-slate-700">{sty.deliveryDate}</strong></span>
                    </div>

                    <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full" style={{ width: `${progressPct}%` }} />
                        </div>
                        <span className="font-semibold">{completedSteps}/{sty.steps.length} SOP</span>
                      </div>
                      <span>·</span>
                      <span>Stok Gudang: <strong>{styleStockCount} SKU Bahan</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {!isSelected ? (
                      <button
                        type="button"
                        onClick={() => setSelectedStyleId(sty.id)}
                        className="px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        Pilih Aktif
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setActiveTab('pe-workflow')}
                          className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Buka SOP
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab('warehouse-stock')}
                          className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-blue-700 border border-blue-200 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Stok Gudang
                        </button>
                      </>
                    )}

                    {styles.length > 1 && (
                      <button
                        type="button"
                        onClick={() => deleteStyle(sty.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Hapus style ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
