import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  BarChart3, 
  Warehouse, 
  Layers, 
  Scissors, 
  Truck, 
  Cpu, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Target,
  Split,
  Printer
} from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const { stock, styles, transactions, subconTasks, componentAllocations, productionMaterials, openPrintModal } = useApp();
  const [activeDeptTab, setActiveDeptTab] = useState<'ALL' | 'PE' | 'GUDANG' | 'PPIC' | 'PRODUKSI' | 'SUBCON' | 'ROUTING'>('ALL');

  // Computed metrics
  const totalStockItems = stock.length;
  const lowStockCount = stock.filter(s => s.currentStock <= s.minStockLevel).length;
  const stockAccuracyRate = 99.4; // % audit opname

  const totalTx = transactions.length;
  const crossStyleTxCount = transactions.filter(t => t.isCrossStyle).length;

  const lineAllocations = componentAllocations.filter(c => c.route === 'LINE').length;
  const subconAllocations = componentAllocations.filter(c => c.route === 'SUBCON').length;
  const readyComponents = componentAllocations.filter(c => c.status === 'Ready' || c.status === 'In Progress').length;
  const allocationReadiness = componentAllocations.length > 0 
    ? Math.round((readyComponents / componentAllocations.length) * 100) 
    : 100;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-xs font-bold flex items-center gap-1 border border-indigo-200">
                <BarChart3 className="w-3.5 h-3.5 text-indigo-700" />
                Operational Intelligence
              </span>
              <span className="text-xs text-slate-400 font-medium">• Analitik Performa Lintas Departemen</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Dashboard Analitik Efisiensi &amp; Performa Operasional
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl">
              Memantau metrik performa (KPI) kunci: akurasi stok gudang, ketepatan alokasi PPIC, efisiensi alur kerja PE, output lini produksi, keandalan subkon, dan serapan anggaran kas operasional.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => openPrintModal('analytics')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              title="Cetak PDF Rekap Analitik Eksekutif"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Cetak PDF Analitik</span>
            </button>

            <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
              <Target className="w-4 h-4 text-emerald-600" />
              <span>Overall Plant Efficiency: <strong className="text-emerald-700 font-bold">89.6% (Optimal)</strong></span>
            </div>
          </div>
        </div>

        {/* Filter per Department */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1">
          {[
            { id: 'ALL', label: 'Semua Departemen' },
            { id: 'PE', label: 'Production Engineering (PE)' },
            { id: 'GUDANG', label: 'Gudang (Warehouse)' },
            { id: 'PPIC', label: 'PPIC & Inventory' },
            { id: 'PRODUKSI', label: 'Produksi (Cut & Sew)' },
            { id: 'SUBCON', label: 'Mitra Subkon' },
            { id: 'ROUTING', label: 'Routing Line vs Subkon' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveDeptTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                activeDeptTab === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* PE PERFORMANCE */}
        {(activeDeptTab === 'ALL' || activeDeptTab === 'PE') && (
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Production Engineering</h3>
                  <p className="text-[11px] text-slate-400">SOP &amp; Kesiapan Teknis</p>
                </div>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                A Grade
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-600">Keberhasilan Pilot Sample 5 Pcs:</span>
                  <span className="text-slate-900 font-bold">100% Lolos</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-600">Kesiapan Mesin &amp; Special Attachment:</span>
                  <span className="text-slate-900 font-bold">96% Siap</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full w-[96%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-600">Ketepatan Jadwal 14 Tahap SOP:</span>
                  <span className="text-slate-900 font-bold">92.4% On Schedule</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full w-[92%]" />
                </div>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl">
              * Breakdown proses RnD dan penentuan SMV selesai tepat waktu untuk seluruh style aktif.
            </div>
          </div>
        )}

        {/* WAREHOUSE PERFORMANCE */}
        {(activeDeptTab === 'ALL' || activeDeptTab === 'GUDANG') && (
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                  <Warehouse className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Gudang (Warehouse)</h3>
                  <p className="text-[11px] text-slate-400">Presisi Stok &amp; Serah Terima</p>
                </div>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                {lowStockCount > 0 ? `${lowStockCount} Menipis` : 'Normal'}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-600">Akurasi Fisik vs Sistem Opname:</span>
                  <span className="text-slate-900 font-bold">99.4%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[99%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-600">Disiplin Pengambilan Sesuai Style:</span>
                  <span className="text-slate-900 font-bold">98.2%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full w-[98%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-600">Lead Time Kirim Material ke Cutting:</span>
                  <span className="text-slate-900 font-bold">32 Menit</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[94%]" />
                </div>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl">
              * Total {totalStockItems} SKU terdata. Notifikasi batas minimum aktif real-time.
            </div>
          </div>
        )}

        {/* PPIC PERFORMANCE */}
        {(activeDeptTab === 'ALL' || activeDeptTab === 'PPIC') && (
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">PPIC &amp; Inventory</h3>
                  <p className="text-[11px] text-slate-400">Akurasi MRP &amp; Rilis SPK</p>
                </div>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Tepat
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-600">Ketepatan Alokasi Bahan per Style:</span>
                  <span className="text-slate-900 font-bold">96.8%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[96%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-600">Sinkronisasi Jadwal PPM ke Cutting:</span>
                  <span className="text-slate-900 font-bold">100% On-Time</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-600">Tingkat Pencegahan Shortage Bahan:</span>
                  <span className="text-slate-900 font-bold">95.0%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full w-[95%]" />
                </div>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl">
              * Data stok gudang otomatis ditarik untuk simulasi kebutuhan bahan sebelum gelar kain.
            </div>
          </div>
        )}

        {/* PRODUKSI (CUT & SEW) */}
        {(activeDeptTab === 'ALL' || activeDeptTab === 'PRODUKSI') && (
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
                  <Scissors className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Produksi (Cut &amp; Sew)</h3>
                  <p className="text-[11px] text-slate-400">Efisiensi Line &amp; Output Pcs</p>
                </div>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                78.4% Eff
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-600">Efisiensi Garis Jahit (Sewing Line):</span>
                  <span className="text-slate-900 font-bold">78.4% (Target: 75%)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[78%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-600">Efisiensi Marker Gelaran Kain:</span>
                  <span className="text-slate-900 font-bold">86.4% Yardage</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full w-[86%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-600">Defect Rate QC End-Line:</span>
                  <span className="text-emerald-600 font-bold">1.12% (&lt; 2.0%)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[95%]" />
                </div>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl">
              * Loading komponen dari cutting ke sewing line berjalan teratur sesuai jadwal SOP.
            </div>
          </div>
        )}

        {/* SUBCONTRACTOR PERFORMANCE */}
        {(activeDeptTab === 'ALL' || activeDeptTab === 'SUBCON') && (
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-50 text-cyan-700 border border-cyan-200">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Mitra Subkon Rekanan</h3>
                  <p className="text-[11px] text-slate-400">Ketepatan Balik &amp; Kualitas</p>
                </div>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800">
                94.5% OTD
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-600">On-Time Return Delivery:</span>
                  <span className="text-slate-900 font-bold">94.5%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[94%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-600">Cacat Reject Bordir / Sablon Luar:</span>
                  <span className="text-emerald-600 font-bold">0.32% (Sangat Rendah)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[98%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-600">Kecepatan Verifikasi Nota &amp; Hasil:</span>
                  <span className="text-slate-900 font-bold">1 Hari Kerja</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full w-[90%]" />
                </div>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl">
              * Total {subconTasks.length} SPK luar tercatat dengan status mutasi panel termonitor.
            </div>
          </div>
        )}

        {/* ROUTING LINE VS SUBCON PERFORMANCE */}
        {(activeDeptTab === 'ALL' || activeDeptTab === 'ROUTING') && (
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                  <Split className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Alokasi Komponen &amp; Routing</h3>
                  <p className="text-[11px] text-slate-400">Distribusi Line vs Subkon</p>
                </div>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                {allocationReadiness}% Siap
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-600">Pengerjaan Line Internal:</span>
                  <span className="text-slate-900 font-bold">{lineAllocations} Komponen</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${(lineAllocations / (componentAllocations.length || 1)) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-600">Pengerjaan Mitra Subkon:</span>
                  <span className="text-slate-900 font-bold">{subconAllocations} Komponen</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(subconAllocations / (componentAllocations.length || 1)) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-600">Kesiapan Material Produksi:</span>
                  <span className="text-emerald-700 font-bold">{productionMaterials.filter(m => m.status === 'Ready' || m.status === 'Available').length} / {productionMaterials.length} Bahan Tersedia</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.round((productionMaterials.filter(m => m.status === 'Ready' || m.status === 'Available').length / (productionMaterials.length || 1)) * 100)}%` }} />
                </div>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl">
              * Perencanaan PPIC terdistribusi tanpa alokasi dana statis, fokus pada alokasi komponen &amp; kebutuhan material produksi.
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
