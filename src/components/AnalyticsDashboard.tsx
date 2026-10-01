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
  const { stock, styles, transactions, subconTasks, subconWarnings, setActiveTab, componentAllocations, productionMaterials, openPrintModal } = useApp();
  const [activeDeptTab, setActiveDeptTab] = useState<'ALL' | 'PE' | 'GUDANG' | 'PPIC' | 'PRODUKSI' | 'SUBCON' | 'ROUTING'>('ALL');

  // Computed metrics
  const totalStockItems = stock.length;
  const lowStockCount = stock.filter(s => s.currentStock <= s.minStockLevel).length;
  const stockAccuracyRate = 99.4; // % audit opname

  const totalTx = transactions.length;
  const crossStyleTxCount = transactions.filter(t => t.isCrossStyle).length;

  const lineAllocations = componentAllocations.filter(c => c.route === 'LINE').length;
  const subconAllocations = componentAllocations.filter(c => c.route === 'SUBCON').length;
  const readyComponents = componentAllocations.filter(c => c.status === 'Allocated' || c.status === 'In Progress' || c.status === 'Completed').length;
  const allocationReadiness = componentAllocations.length > 0 
    ? Math.round((readyComponents / componentAllocations.length) * 100) 
    : 100;

  return (
    <div className="space-y-4">
      
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold text-slate-900">
              Ringkasan Performa
            </h1>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
              Efisiensi Pabrik: 89.6%
            </span>
          </div>

          <button
            onClick={() => openPrintModal('analytics')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer w-fit"
            title="Cetak PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak PDF</span>
          </button>
        </div>

        {/* Filter per Department */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg overflow-x-auto w-fit max-w-full">
          {[
            { id: 'ALL', label: 'Semua' },
            { id: 'PE', label: 'PE' },
            { id: 'GUDANG', label: 'Gudang' },
            { id: 'PPIC', label: 'PPIC' },
            { id: 'PRODUKSI', label: 'Produksi' },
            { id: 'SUBCON', label: 'Subkon' },
            { id: 'ROUTING', label: 'Line vs Subkon' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveDeptTab(tab.id as any)}
              className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeDeptTab === tab.id
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* PE PERFORMANCE */}
        {(activeDeptTab === 'ALL' || activeDeptTab === 'PE') && (
          <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold text-slate-900">Production Engineering (PE)</h3>
              </div>
              <span className="text-xs font-bold text-emerald-700">96% Siap</span>
            </div>

            <div className="space-y-2.5 text-xs tabular-nums">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-600">Pilot Sample 5 Pcs</span>
                  <span className="text-slate-900 font-bold">100%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-600">Kesiapan Mesin</span>
                  <span className="text-slate-900 font-bold">96%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full w-[96%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-600">Ketepatan 14 SOP</span>
                  <span className="text-slate-900 font-bold">92.4%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full w-[92%]" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* WAREHOUSE PERFORMANCE */}
        {(activeDeptTab === 'ALL' || activeDeptTab === 'GUDANG') && (
          <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Warehouse className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900">Gudang ({totalStockItems} SKU)</h3>
              </div>
              <span className={`text-xs font-bold ${lowStockCount > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                {lowStockCount > 0 ? `${lowStockCount} Menipis` : 'Aman'}
              </span>
            </div>

            <div className="space-y-2.5 text-xs tabular-nums">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-600">Akurasi Stok</span>
                  <span className="text-slate-900 font-bold">{stockAccuracyRate}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[99%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-600">Sesuai Alokasi Style</span>
                  <span className="text-slate-900 font-bold">98.2%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full w-[98%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-600">Total Transaksi</span>
                  <span className="text-slate-900 font-bold">{totalTx} Mutasi ({crossStyleTxCount} Lintas)</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[94%]" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PPIC PERFORMANCE */}
        {(activeDeptTab === 'ALL' || activeDeptTab === 'PPIC') && (
          <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-900">PPIC &amp; BOM</h3>
              </div>
              <span className="text-xs font-bold text-emerald-700">96.8% Tepat</span>
            </div>

            <div className="space-y-2.5 text-xs tabular-nums">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-600">Ketepatan Alokasi</span>
                  <span className="text-slate-900 font-bold">96.8%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[96%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-600">Jadwal PPM ke Cutting</span>
                  <span className="text-slate-900 font-bold">100%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-600">Ketersediaan BOM</span>
                  <span className="text-slate-900 font-bold">95.0%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full w-[95%]" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PRODUKSI (CUT & SEW) */}
        {(activeDeptTab === 'ALL' || activeDeptTab === 'PRODUKSI') && (
          <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Scissors className="w-4 h-4 text-rose-600" />
                <h3 className="text-xs font-bold text-slate-900">Produksi (Cut &amp; Sew)</h3>
              </div>
              <span className="text-xs font-bold text-emerald-700">78.4% Eff</span>
            </div>

            <div className="space-y-2.5 text-xs tabular-nums">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-600">Efisiensi Sewing Line</span>
                  <span className="text-slate-900 font-bold">78.4%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[78%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-600">Efisiensi Marker</span>
                  <span className="text-slate-900 font-bold">86.4%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full w-[86%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-600">Defect Rate QC</span>
                  <span className="text-emerald-600 font-bold">1.12%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[95%]" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBCONTRACTOR PERFORMANCE */}
        {(activeDeptTab === 'ALL' || activeDeptTab === 'SUBCON') && (
          <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-cyan-600" />
                <h3 className="text-xs font-bold text-slate-900">Mitra Subkon ({subconTasks.length} SPK)</h3>
              </div>
              <span className={`text-xs font-bold ${subconWarnings.length > 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                {subconWarnings.length > 0 ? `${subconWarnings.length} Warning H-3` : 'On-Track'}
              </span>
            </div>

            <div className="space-y-2.5 text-xs tabular-nums">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-600">Target Harian Subkon</span>
                  <span className="text-slate-900 font-bold">84.5%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-600 rounded-full w-[85%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-600">Risiko Deadline (H-3)</span>
                  <span className={subconWarnings.length > 0 ? 'text-red-600 font-bold' : 'text-emerald-600 font-bold'}>
                    {subconWarnings.length} SPK
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${subconWarnings.length > 0 ? 'bg-red-500 w-[65%]' : 'bg-emerald-500 w-full'}`} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-600">Input Harian Aktif</span>
                  <span className="text-slate-900 font-bold">100%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-full" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ROUTING LINE VS SUBCON PERFORMANCE */}
        {(activeDeptTab === 'ALL' || activeDeptTab === 'ROUTING') && (
          <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Split className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900">Rute Line vs Subkon</h3>
              </div>
              <span className="text-xs font-bold text-blue-700">{allocationReadiness}% Siap</span>
            </div>

            <div className="space-y-2.5 text-xs tabular-nums">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-600">Line Internal</span>
                  <span className="text-slate-900 font-bold">{lineAllocations} Komponen</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${(lineAllocations / (componentAllocations.length || 1)) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-600">Mitra Subkon</span>
                  <span className="text-slate-900 font-bold">{subconAllocations} Komponen</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(subconAllocations / (componentAllocations.length || 1)) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-600">Material BOM Siap</span>
                  <span className="text-emerald-700 font-bold">{productionMaterials.filter(m => m.status === 'Ready' || m.status === 'Available').length}/{productionMaterials.length}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.round((productionMaterials.filter(m => m.status === 'Ready' || m.status === 'Available').length / (productionMaterials.length || 1)) * 100)}%` }} />
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
