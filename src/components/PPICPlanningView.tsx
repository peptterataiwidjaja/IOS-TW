import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Layers, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Warehouse, 
  Truck, 
  Scissors, 
  Search, 
  Printer, 
  Edit3, 
  Trash2, 
  ArrowUp,
  ArrowDown,
  Check,
  X
} from 'lucide-react';
import { 
  MaterialCategory,
  ProductionComponentAllocation, 
  ProductionMaterialRequirement, 
  ProductionRoute 
} from '../types';

export const PPICPlanningView: React.FC = () => {
  const { 
    currentStyle, 
    styles, 
    setSelectedStyleId,
    stock, 
    componentAllocations, 
    addComponentAllocation, 
    updateComponentAllocation, 
    deleteComponentAllocation,
    productionMaterials,
    addProductionMaterial,
    updateProductionMaterial,
    deleteProductionMaterial,
    cuttingOrders,
    updateCuttingOrder,
    moveCuttingQueue,
    sopAttentionStyles,
    updateWorkflowStep,
    setActiveTab, 
    currentUser,
    openPrintModal
  } = useApp();

  const [activeSubView, setActiveSubView] = useState<'sop-attention' | 'cutting-queue' | 'components' | 'materials'>('sop-attention');
  const [searchQuery, setSearchQuery] = useState('');
  const [routeFilter, setRouteFilter] = useState<'ALL' | 'LINE' | 'SUBCON'>('ALL');
  const [filterByCurrentStyleOnly, setFilterByCurrentStyleOnly] = useState(false);

  // Modal: Add Component Allocation
  const [isAddComponentModalOpen, setIsAddComponentModalOpen] = useState(false);
  const [compName, setCompName] = useState('');
  const [compCategory, setCompCategory] = useState<ProductionComponentAllocation['panelCategory']>('Panel Utama (Main Body)');
  const [compRoute, setCompRoute] = useState<ProductionRoute>('LINE');
  const [compLocation, setCompLocation] = useState('Line Sewing 01');
  const [compQtyPerPcs, setCompQtyPerPcs] = useState<number>(1);
  const [compProcess, setCompProcess] = useState('');
  const [compPic, setCompPic] = useState(currentUser.name);
  const [compTargetDate, setCompTargetDate] = useState('');

  // Modal: Add Production Material Requirement
  const [isAddMaterialModalOpen, setIsAddMaterialModalOpen] = useState(false);
  const [matName, setMatName] = useState('');
  const [matCategory, setMatCategory] = useState<MaterialCategory>('Kain Utama (Fabric)');
  const [matConsPerPcs, setMatConsPerPcs] = useState<number>(1.5);
  const [matUnit, setMatUnit] = useState<ProductionMaterialRequirement['unit']>('Yard');
  const [matWastePercent, setMatWastePercent] = useState<number>(3);
  const [matUnitPrice, setMatUnitPrice] = useState<number>(25000);
  const [matForComponent, setMatForComponent] = useState('');

  // Edit states
  const [editingComponent, setEditingComponent] = useState<ProductionComponentAllocation | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<ProductionMaterialRequirement | null>(null);

  const filteredComponents = useMemo(() => {
    return componentAllocations.filter(item => {
      if (filterByCurrentStyleOnly && item.styleCode !== currentStyle.code) return false;
      if (routeFilter !== 'ALL' && item.route !== routeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.componentName.toLowerCase().includes(q) ||
          item.targetLocation.toLowerCase().includes(q) ||
          item.styleCode.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [componentAllocations, filterByCurrentStyleOnly, currentStyle.code, routeFilter, searchQuery]);

  const filteredMaterials = useMemo(() => {
    return productionMaterials.filter(item => {
      if (filterByCurrentStyleOnly && item.styleCode !== currentStyle.code) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.materialName.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.styleCode.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [productionMaterials, filterByCurrentStyleOnly, currentStyle.code, searchQuery]);

  const lineCount = componentAllocations.filter(c => c.route === 'LINE').length;
  const subconCount = componentAllocations.filter(c => c.route === 'SUBCON').length;
  const materialsWithShortage = productionMaterials.filter(m => m.status === 'Shortage').length;

  const handleSaveNewComponent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compName.trim()) return;
    const totalRequired = Math.ceil(currentStyle.targetQuantityPcs * compQtyPerPcs);

    addComponentAllocation({
      styleCode: currentStyle.code,
      componentName: compName.trim(),
      panelCategory: compCategory,
      route: compRoute,
      targetLocation: compLocation.trim(),
      qtyPerPcs: compQtyPerPcs,
      totalRequiredQty: totalRequired,
      processDescription: compProcess.trim() || `${compCategory} (${currentStyle.code})`,
      status: 'Allocated',
      picName: compPic.trim() || currentUser.name,
      targetDate: compTargetDate || currentStyle.deliveryDate
    });

    setIsAddComponentModalOpen(false);
    setCompName('');
    setCompProcess('');
  };

  const handleSaveNewMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matName.trim()) return;

    const baseRequired = currentStyle.targetQuantityPcs * matConsPerPcs;
    const wasteFactor = 1 + ((matWastePercent || 0) / 100);
    const totalReq = Math.ceil(baseRequired * wasteFactor);

    const matchedWarehouse = stock.find(s => 
      s.styleCode === currentStyle.code && 
      (s.name.toLowerCase().includes(matName.toLowerCase()) || matName.toLowerCase().includes(s.name.toLowerCase()))
    );

    const available = matchedWarehouse ? matchedWarehouse.currentStock : 0;
    const balance = available - totalReq;

    addProductionMaterial({
      styleCode: currentStyle.code,
      materialName: matName.trim(),
      category: matCategory,
      consumptionPerPcs: matConsPerPcs,
      wasteAllowancePercent: matWastePercent,
      totalRequired: totalReq,
      unit: matUnit,
      availableStock: available,
      allocatedFromWarehouseQty: Math.min(available, totalReq),
      balanceQty: balance,
      status: available >= totalReq ? 'Ready' : (available > 0 ? 'Partial' : 'Shortage'),
      allocatedTo: 'LINE',
      targetWorkCenter: 'Ruang Cutting & Line Sewing',
      usedForComponent: matForComponent.trim() || undefined,
      unitPrice: matUnitPrice
    });

    setIsAddMaterialModalOpen(false);
    setMatName('');
  };

  return (
    <div className="space-y-4">
      {/* Clean Header & KPI Summary */}
      <div className="bg-white rounded-xl p-4 border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-700" />
            PPIC &amp; Kontrol SOP
          </h1>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('cutting')}
              className="px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Scissors className="w-3.5 h-3.5" />
              Cutting
            </button>
            <button
              onClick={() => setActiveTab('subcon')}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Truck className="w-3.5 h-3.5 text-amber-600" />
              Subkon
            </button>
            <button
              onClick={() => setActiveTab('warehouse-stock')}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Warehouse className="w-3.5 h-3.5 text-blue-600" />
              Gudang
            </button>
            <button
              onClick={() => openPrintModal('ppic-planning')}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
              title="Cetak PDF"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Clean Summary Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-3.5 border-t border-slate-100">
          <div>
            <div className="text-[11px] text-slate-500">Perhatian SOP</div>
            <div className={`text-xl font-bold tabular-nums mt-0.5 ${sopAttentionStyles.length > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {sopAttentionStyles.length} <span className="text-xs font-normal text-slate-400">/ {styles.length} style</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500">SPK Potong</div>
            <div className="text-xl font-bold text-slate-900 tabular-nums mt-0.5">
              {cuttingOrders.length} <span className="text-xs font-normal text-slate-400">Aktif</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500">Rute Panel</div>
            <div className="text-xl font-bold text-slate-900 tabular-nums mt-0.5">
              {lineCount} <span className="text-xs font-normal text-emerald-600">Line</span>
              <span className="mx-1 text-slate-300">·</span>
              {subconCount} <span className="text-xs font-normal text-amber-600">Subkon</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500">Material BOM</div>
            <div className={`text-xl font-bold tabular-nums mt-0.5 ${materialsWithShortage > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {materialsWithShortage > 0 ? `${materialsWithShortage} Kurang` : 'Aman'}
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg w-fit flex-wrap">
          <button
            onClick={() => setActiveSubView('sop-attention')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubView === 'sop-attention'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Kendala SOP</span>
            {sopAttentionStyles.length > 0 && (
              <span className="text-red-600 font-bold tabular-nums">({sopAttentionStyles.length})</span>
            )}
          </button>

          <button
            onClick={() => setActiveSubView('cutting-queue')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeSubView === 'cutting-queue'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Antrian Potong ({cuttingOrders.length})
          </button>

          <button
            onClick={() => setActiveSubView('components')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeSubView === 'components'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Line / Subkon ({filteredComponents.length})
          </button>

          <button
            onClick={() => setActiveSubView('materials')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeSubView === 'materials'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bahan BOM ({filteredMaterials.length})
          </button>
        </div>

        {(activeSubView === 'components' || activeSubView === 'materials') && (
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={filterByCurrentStyleOnly}
                onChange={(e) => setFilterByCurrentStyleOnly(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span>{currentStyle.code} saja</span>
            </label>

            {activeSubView === 'components' && (
              <button
                onClick={() => setIsAddComponentModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Komponen
              </button>
            )}

            {activeSubView === 'materials' && (
              <button
                onClick={() => setIsAddMaterialModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Bahan BOM
              </button>
            )}
          </div>
        )}
      </div>

      {/* TAB 1: BAR STYLE PERHATIAN BELUM SESUAI SOP */}
      {activeSubView === 'sop-attention' && (
        <div className="space-y-3">
          {sopAttentionStyles.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
              <CheckCircle2 className="w-7 h-7 text-emerald-600 mx-auto mb-1.5" />
              <div className="text-sm font-bold text-slate-900">Semua Style Sesuai SOP</div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {sopAttentionStyles.map(att => (
                <div
                  key={att.styleId}
                  className="bg-white rounded-xl border border-slate-200 p-3.5 space-y-2.5"
                >
                  {/* Card Top Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`w-4 h-4 shrink-0 ${att.severity === 'CRITICAL' ? 'text-red-600' : 'text-amber-600'}`} />
                        <span className="text-sm font-bold text-slate-900">
                          {att.styleCode} — {att.styleName}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className={`text-xs font-semibold ${att.severity === 'CRITICAL' ? 'text-red-600' : 'text-amber-600'}`}>
                          {att.totalDeviations} Kendala
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {att.buyer} · {(att.targetQuantityPcs ?? 0).toLocaleString()} pcs · SOP <strong className="text-slate-800">{att.sopCompletionPercent ?? 0}%</strong> ({att.completedStepsCount ?? 0}/{att.totalStepsCount ?? 14})
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          setSelectedStyleId(att.styleId);
                          setActiveTab('pe-workflow');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                      >
                        Alur SOP
                      </button>
                      <button
                        onClick={() => setActiveTab('cutting')}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold cursor-pointer"
                      >
                        Cutting
                      </button>
                    </div>
                  </div>

                  {/* Deviations List (Compact Rows) */}
                  <div className="divide-y divide-slate-100">
                    {att.deviations.map((dev, i) => (
                      <div key={i} className="py-2 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="text-xs">
                          <span className={`font-semibold ${dev.issueType === 'NEEDS_REVIEW' || dev.issueType === 'BYPASSED_PREREQUISITE' ? 'text-red-600' : 'text-amber-600'}`}>
                            #{dev.stepId} {dev.process}
                          </span>
                          <span className="text-slate-400 mx-1.5">·</span>
                          <span className="text-slate-600">{dev.description}</span>
                        </div>

                        <button
                          onClick={() => {
                            updateWorkflowStep(att.styleId, dev.stepId, {
                              status: 'Completed',
                              actualDate: new Date().toISOString().split('T')[0]
                            });
                          }}
                          className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold flex items-center gap-1 shrink-0 cursor-pointer w-fit"
                        >
                          <Check className="w-3 h-3" /> Selesai
                        </button>
                      </div>
                    ))}
                    {att.materialShortageNames.length > 0 && (
                      <div className="py-2 first:pt-0 last:pb-0 flex items-center justify-between gap-2 text-xs">
                        <span className="font-semibold text-red-700">
                          Bahan Kurang: {att.materialShortageNames.join(', ')}
                        </span>
                        <button
                          onClick={() => setActiveTab('warehouse-stock')}
                          className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold shrink-0 cursor-pointer"
                        >
                          Gudang
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Clean All-Style SOP Status Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                    <th className="py-2.5 px-4">Style</th>
                    <th className="py-2.5 px-4">Buyer</th>
                    <th className="py-2.5 px-4 text-right">Target</th>
                    <th className="py-2.5 px-4">Progres SOP</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {styles.map(sty => {
                    const att = sopAttentionStyles.find(a => a.styleId === sty.id);
                    const doneCount = sty.steps.filter(s => s.status === 'Completed').length;
                    const pct = Math.round((doneCount / sty.steps.length) * 100);

                    return (
                      <tr key={sty.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-4 font-bold text-slate-900">{sty.code} — {sty.name}</td>
                        <td className="py-2.5 px-4 text-slate-600">{sty.buyer}</td>
                        <td className="py-2.5 px-4 text-right font-semibold tabular-nums">{(sty.targetQuantityPcs ?? 0).toLocaleString()} pcs</td>
                        <td className="py-2.5 px-4 tabular-nums">
                          <span className="font-bold text-slate-900">{pct}%</span>
                          <span className="text-slate-400 ml-1">({doneCount}/{sty.steps.length})</span>
                        </td>
                        <td className="py-2.5 px-4">
                          {att ? (
                            <span className="font-semibold text-red-600">
                              {att.totalDeviations} Kendala
                            </span>
                          ) : (
                            <span className="font-semibold text-emerald-600">Sesuai SOP</span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <button
                            onClick={() => {
                              setSelectedStyleId(sty.id);
                              setActiveTab('pe-workflow');
                            }}
                            className="text-blue-700 hover:underline font-semibold cursor-pointer"
                          >
                            Buka
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ANTRIAN POTONG & LOADING */}
      {activeSubView === 'cutting-queue' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">Daftar Antrian Potong &amp; Distribusi Loading</span>
            <button
              onClick={() => setActiveTab('cutting')}
              className="text-xs font-semibold text-blue-700 hover:underline cursor-pointer"
            >
              Kelola Penuh di Bar Cutting &rarr;
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                  <th className="py-2.5 px-4">Antrian</th>
                  <th className="py-2.5 px-4">Model / Style</th>
                  <th className="py-2.5 px-4">Bahan Dipotong</th>
                  <th className="py-2.5 px-4">Status SOP</th>
                  <th className="py-2.5 px-4 text-right">Target Potong</th>
                  <th className="py-2.5 px-4">Loading Line &amp; Subkon</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {[...cuttingOrders]
                  .sort((a, b) => a.queueNumber - b.queueNumber)
                  .map((order, idx) => (
                    <tr key={order.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-bold text-slate-900 tabular-nums">
                        <div className="flex items-center gap-1">
                          <span>#{order.queueNumber}</span>
                          <button
                            onClick={() => moveCuttingQueue(order.id, 'UP')}
                            disabled={idx === 0}
                            className="p-0.5 text-slate-400 hover:text-slate-800 disabled:opacity-25 cursor-pointer"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => moveCuttingQueue(order.id, 'DOWN')}
                            disabled={idx === cuttingOrders.length - 1}
                            className="p-0.5 text-slate-400 hover:text-slate-800 disabled:opacity-25 cursor-pointer"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{order.styleCode} — {order.styleName}</div>
                        <div className="text-[11px] text-slate-400">{order.orderNumber}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{order.materialName}</div>
                        <div className="text-[11px] text-slate-400 tabular-nums">{(order.fabricQtyToCut ?? 0).toLocaleString()} {order.fabricUnit}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-semibold ${order.sopComplianceStatus === 'SESUAI_SOP' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {order.sopComplianceStatus === 'SESUAI_SOP' ? 'Sesuai SOP' : 'Perhatian SOP'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900 tabular-nums">
                        {(order.actualCutPcs ?? 0).toLocaleString()} / {(order.dailyTargetCutPcs ?? 0).toLocaleString()} pcs
                      </td>
                      <td className="py-3 px-4">
                        {order.loadingAllocations.map(a => (
                          <div key={a.id} className="text-[11px] text-slate-600">
                            <span className="font-semibold text-slate-800">{a.destinationName}:</span> {a.loadedActualPcs}/{a.allocatedLoadingPcs} pcs
                          </div>
                        ))}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <select
                          value={order.queueStatus}
                          onChange={(e) => updateCuttingOrder(order.id, { queueStatus: e.target.value as any })}
                          className="bg-white border border-slate-200 rounded px-2 py-1 text-[11px] font-semibold text-slate-700"
                        >
                          <option value="ACTIVE_CUTTING">Dipotong</option>
                          <option value="WAITING_LIST">Antrian</option>
                          <option value="HOLD_SOP">Tahan SOP</option>
                          <option value="READY_FOR_LOADING">Siap Loading</option>
                        </select>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ALOKASI KOMPONEN LINE VS SUBKON */}
      {activeSubView === 'components' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-3 border-b border-slate-100 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              {(['ALL', 'LINE', 'SUBCON'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setRouteFilter(r)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                    routeFilter === r ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {r === 'ALL' ? 'Semua' : r === 'LINE' ? 'Line Sewing' : 'Mitra Subkon'}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari komponen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1 text-xs border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                  <th className="py-2.5 px-4">Style</th>
                  <th className="py-2.5 px-4">Komponen / Panel</th>
                  <th className="py-2.5 px-4">Rute</th>
                  <th className="py-2.5 px-4">Tujuan Line / Subkon</th>
                  <th className="py-2.5 px-4 text-right">Kebutuhan Total</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredComponents.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-4 font-bold text-slate-900">{item.styleCode}</td>
                    <td className="py-2.5 px-4">
                      <div className="font-semibold text-slate-900">{item.componentName}</div>
                      <div className="text-[11px] text-slate-400">{item.panelCategory}</div>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={`font-semibold ${item.route === 'LINE' ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {item.route === 'LINE' ? 'Line In-House' : 'Subkon Luar'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-medium text-slate-800">{item.targetLocation}</td>
                    <td className="py-2.5 px-4 text-right font-bold tabular-nums">{(item.totalRequiredQty ?? 0).toLocaleString()} pcs</td>
                    <td className="py-2.5 px-4">
                      <select
                        value={item.status}
                        onChange={(e) => updateComponentAllocation(item.id, { status: e.target.value as any })}
                        className="bg-white border border-slate-200 rounded px-2 py-1 text-[11px] font-semibold"
                      >
                        <option value="Draft">Draft</option>
                        <option value="Allocated">Siap Potong</option>
                        <option value="In Progress">Proses Jalan</option>
                        <option value="Completed">Selesai</option>
                      </select>
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setEditingComponent(item)}
                          className="p-1 text-slate-400 hover:text-blue-600 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteComponentAllocation(item.id)}
                          className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: BAHAN BAKU BOM */}
      {activeSubView === 'materials' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                  <th className="py-2.5 px-4">Style</th>
                  <th className="py-2.5 px-4">Nama Bahan Baku</th>
                  <th className="py-2.5 px-4 text-right">Konsumsi/Pcs</th>
                  <th className="py-2.5 px-4 text-right">Total Kebutuhan</th>
                  <th className="py-2.5 px-4 text-right">Stok Gudang</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredMaterials.map(mat => (
                  <tr key={mat.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-4 font-bold text-slate-900">{mat.styleCode}</td>
                    <td className="py-2.5 px-4">
                      <div className="font-semibold text-slate-900">{mat.materialName}</div>
                      <div className="text-[11px] text-slate-400">{mat.category}</div>
                    </td>
                    <td className="py-2.5 px-4 text-right tabular-nums">
                      {mat.consumptionPerPcs} {mat.unit}
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold text-slate-900 tabular-nums">
                      {(mat.totalRequired ?? 0).toLocaleString()} {mat.unit}
                    </td>
                    <td className="py-2.5 px-4 text-right font-semibold text-slate-700 tabular-nums">
                      {(mat.availableStock ?? 0).toLocaleString()} {mat.unit}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={`font-semibold ${
                        mat.status === 'Ready' ? 'text-emerald-600' : mat.status === 'Partial' ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {mat.status === 'Ready' ? 'Cukup' : mat.status === 'Partial' ? 'Sebagian' : 'Kurang'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setEditingMaterial(mat)}
                          className="p-1 text-slate-400 hover:text-blue-600 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteProductionMaterial(mat.id)}
                          className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH KOMPONEN */}
      {isAddComponentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Tambah Komponen ({currentStyle.code})</h3>
              <button onClick={() => setIsAddComponentModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveNewComponent} className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Komponen / Panel</label>
                <input
                  type="text"
                  required
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  placeholder="Contoh: Body Depan & Belakang"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Rute</label>
                  <select
                    value={compRoute}
                    onChange={(e) => {
                      const r = e.target.value as ProductionRoute;
                      setCompRoute(r);
                      setCompLocation(r === 'LINE' ? 'Line Sewing 01' : 'CV Prima Bordir');
                    }}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  >
                    <option value="LINE">Line In-House</option>
                    <option value="SUBCON">Mitra Subkon</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tujuan Line / Subkon</label>
                  <input
                    type="text"
                    required
                    value={compLocation}
                    onChange={(e) => setCompLocation(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddComponentModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold cursor-pointer"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH MATERIAL BOM */}
      {isAddMaterialModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Tambah Bahan BOM ({currentStyle.code})</h3>
              <button onClick={() => setIsAddMaterialModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveNewMaterial} className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Bahan Baku</label>
                <input
                  type="text"
                  required
                  value={matName}
                  onChange={(e) => setMatName(e.target.value)}
                  placeholder="Contoh: Kain Cotton Twill"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Konsumsi / Pcs</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={matConsPerPcs}
                    onChange={(e) => setMatConsPerPcs(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Satuan</label>
                  <input
                    type="text"
                    required
                    value={matUnit}
                    onChange={(e) => setMatUnit(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddMaterialModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold cursor-pointer"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT KOMPONEN */}
      {editingComponent && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Edit Komponen</h3>
              <button onClick={() => setEditingComponent(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateComponentAllocation(editingComponent.id, editingComponent);
                setEditingComponent(null);
              }}
              className="p-5 space-y-3"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Komponen</label>
                <input
                  type="text"
                  value={editingComponent.componentName}
                  onChange={(e) => setEditingComponent({ ...editingComponent, componentName: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tujuan Line / Subkon</label>
                <input
                  type="text"
                  value={editingComponent.targetLocation}
                  onChange={(e) => setEditingComponent({ ...editingComponent, targetLocation: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingComponent(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold cursor-pointer"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT MATERIAL */}
      {editingMaterial && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Edit Bahan BOM</h3>
              <button onClick={() => setEditingMaterial(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateProductionMaterial(editingMaterial.id, editingMaterial);
                setEditingMaterial(null);
              }}
              className="p-5 space-y-3"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Bahan</label>
                <input
                  type="text"
                  value={editingMaterial.materialName}
                  onChange={(e) => setEditingMaterial({ ...editingMaterial, materialName: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Total Kebutuhan ({editingMaterial.unit})</label>
                <input
                  type="number"
                  value={editingMaterial.totalRequired}
                  onChange={(e) => setEditingMaterial({ ...editingMaterial, totalRequired: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg tabular-nums"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingMaterial(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold cursor-pointer"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
