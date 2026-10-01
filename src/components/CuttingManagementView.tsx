import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  CuttingOrderItem,
  CuttingQueueStatus,
  CuttingLoadingAllocation
} from '../types';
import {
  Scissors,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Plus,
  Play,
  Pause,
  Truck,
  Building2,
  Search,
  Printer,
  Trash2,
  Send,
  X,
  Check
} from 'lucide-react';

export const CuttingManagementView: React.FC = () => {
  const {
    styles,
    productionMaterials,
    componentAllocations,
    cuttingOrders,
    addCuttingOrder,
    updateCuttingOrder,
    deleteCuttingOrder,
    moveCuttingQueue,
    updateCuttingLoadingAllocation,
    sopAttentionStyles,
    currentUser,
    setActiveTab,
    openPrintModal
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  const [activeSubTab, setActiveSubTab] = useState<'daily-cutting' | 'waiting-list' | 'loading-board'>('daily-cutting');
  const [selectedStyleFilter, setSelectedStyleFilter] = useState<string>('ALL');
  const [selectedQueueFilter, setSelectedQueueFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal: Add Cutting Order
  const [isAddOrderModalOpen, setIsAddOrderModalOpen] = useState(false);
  const [newStyleId, setNewStyleId] = useState<string>(styles[0]?.id || 'sty-01');
  const [newCuttingDate, setNewCuttingDate] = useState<string>(todayStr);
  const [newCuttingTable, setNewCuttingTable] = useState<string>('Meja Potong 01');
  const [newPriority, setNewPriority] = useState<'URGENT' | 'HIGH' | 'NORMAL'>('HIGH');
  const [newQueueStatus, setNewQueueStatus] = useState<CuttingQueueStatus>('WAITING_LIST');
  const [newSopStepId, setNewSopStepId] = useState<number>(12);
  const [newMaterialName, setNewMaterialName] = useState<string>('');
  const [newMaterialCode, setNewMaterialCode] = useState<string>('');
  const [newMaterialCategory, setNewMaterialCategory] = useState<string>('Kain Utama');
  const [newFabricQty, setNewFabricQty] = useState<number>(500);
  const [newFabricUnit, setNewFabricUnit] = useState<string>('Yard');
  const [newMarkerRatio, setNewMarkerRatio] = useState<string>('S:1, M:2, L:2, XL:1 (40 Ply)');
  const [newComponentPanelCut, setNewComponentPanelCut] = useState<string>('Body Utama, Lengan & Kerah');
  const [newDailyTargetCutPcs, setNewDailyTargetCutPcs] = useState<number>(600);
  const [newBundleCount, setNewBundleCount] = useState<number>(20);
  const [newPicCutting, setNewPicCutting] = useState<string>('Dani (Cutting)');
  const [newNotes, setNewNotes] = useState<string>('');

  const [newAllocations, setNewAllocations] = useState<Omit<CuttingLoadingAllocation, 'id'>[]>([
    {
      destinationType: 'LINE',
      destinationName: 'Line 1 Sewing',
      componentPanel: 'Body Utama & Lengan',
      dailyTargetRequirementPcs: 400,
      allocatedLoadingPcs: 400,
      loadedActualPcs: 0,
      loadingStatus: 'Waiting Cut',
      picReceiver: 'Supardi'
    },
    {
      destinationType: 'SUBCON',
      destinationName: 'CV Prima Bordir',
      componentPanel: 'Panel Dada (Bordir)',
      dailyTargetRequirementPcs: 300,
      allocatedLoadingPcs: 200,
      loadedActualPcs: 0,
      loadingStatus: 'Waiting Cut',
      picReceiver: 'H. Rahmat'
    }
  ]);

  // Modal: Add Loading Destination to Order
  const [addingAllocationOrderId, setAddingAllocationOrderId] = useState<string | null>(null);
  const [allocType, setAllocType] = useState<'LINE' | 'SUBCON'>('LINE');
  const [allocDestName, setAllocDestName] = useState<string>('Line 1 Sewing');
  const [allocPanel, setAllocPanel] = useState<string>('Body Utama & Lengan');
  const [allocDailyTarget, setAllocDailyTarget] = useState<number>(400);
  const [allocQty, setAllocQty] = useState<number>(400);
  const [allocPic, setAllocPic] = useState<string>('Supardi');

  const sortedOrders = useMemo(() => {
    return [...cuttingOrders].sort((a, b) => a.queueNumber - b.queueNumber);
  }, [cuttingOrders]);

  const filteredOrders = useMemo(() => {
    return sortedOrders.filter(order => {
      if (selectedStyleFilter !== 'ALL' && order.styleCode !== selectedStyleFilter) return false;
      if (selectedQueueFilter !== 'ALL' && order.queueStatus !== selectedQueueFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          order.orderNumber.toLowerCase().includes(q) ||
          order.styleCode.toLowerCase().includes(q) ||
          order.styleName.toLowerCase().includes(q) ||
          order.materialName.toLowerCase().includes(q) ||
          order.loadingAllocations.some(a => a.destinationName.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [sortedOrders, selectedStyleFilter, selectedQueueFilter, searchQuery]);

  // Metrics
  const activeCuttingOrders = sortedOrders.filter(o => o.queueStatus === 'ACTIVE_CUTTING');
  const waitingListOrders = sortedOrders.filter(o => o.queueStatus === 'WAITING_LIST' || o.queueStatus === 'HOLD_SOP');
  const totalTargetCutToday = sortedOrders
    .filter(o => o.queueStatus === 'ACTIVE_CUTTING' || o.queueStatus === 'READY_FOR_LOADING' || o.queueStatus === 'LOADED')
    .reduce((sum, o) => sum + o.dailyTargetCutPcs, 0);
  const totalActualCutToday = sortedOrders.reduce((sum, o) => sum + o.actualCutPcs, 0);

  const allLoadingAllocations = useMemo(() => {
    const list: Array<CuttingLoadingAllocation & { orderNumber: string; styleCode: string; styleName: string; cuttingOrderId: string; queueStatus: CuttingQueueStatus }> = [];
    sortedOrders.forEach(o => {
      o.loadingAllocations.forEach(alloc => {
        list.push({
          ...alloc,
          orderNumber: o.orderNumber,
          styleCode: o.styleCode,
          styleName: o.styleName,
          cuttingOrderId: o.id,
          queueStatus: o.queueStatus
        });
      });
    });
    return list;
  }, [sortedOrders]);

  const totalLineTargetDaily = allLoadingAllocations
    .filter(a => a.destinationType === 'LINE')
    .reduce((sum, a) => sum + a.allocatedLoadingPcs, 0);
  const totalLineLoadedActual = allLoadingAllocations
    .filter(a => a.destinationType === 'LINE')
    .reduce((sum, a) => sum + a.loadedActualPcs, 0);

  const totalSubconTargetDaily = allLoadingAllocations
    .filter(a => a.destinationType === 'SUBCON')
    .reduce((sum, a) => sum + a.allocatedLoadingPcs, 0);
  const totalSubconLoadedActual = allLoadingAllocations
    .filter(a => a.destinationType === 'SUBCON')
    .reduce((sum, a) => sum + a.loadedActualPcs, 0);

  const handleSelectStyleInModal = (styId: string) => {
    setNewStyleId(styId);
    const sty = styles.find(s => s.id === styId);
    if (!sty) return;

    const styMats = productionMaterials.filter(m => m.styleCode === sty.code);
    const primaryFabric = styMats.find(m => m.category.includes('Kain')) || styMats[0];
    if (primaryFabric) {
      setNewMaterialName(primaryFabric.materialName);
      setNewMaterialCode(primaryFabric.stockItemId || `MAT-${sty.code}`);
      setNewMaterialCategory(primaryFabric.category);
      setNewFabricUnit(primaryFabric.unit);
      setNewFabricQty(Math.ceil(600 * primaryFabric.consumptionPerPcs));
      setNewComponentPanelCut(primaryFabric.usedForComponent || 'Body Utama & Lengan');
    } else {
      setNewMaterialName(`Kain ${sty.name}`);
      setNewMaterialCode(`FAB-${sty.code}`);
    }

    const styComps = componentAllocations.filter(c => c.styleCode === sty.code);
    if (styComps.length > 0) {
      const mapped: Omit<CuttingLoadingAllocation, 'id'>[] = styComps.slice(0, 3).map(c => ({
        destinationType: c.route,
        destinationName: c.targetLocation,
        componentPanel: c.componentName,
        dailyTargetRequirementPcs: c.route === 'LINE' ? 400 : 350,
        allocatedLoadingPcs: c.route === 'LINE' ? 400 : 350,
        loadedActualPcs: 0,
        loadingStatus: 'Waiting Cut',
        picReceiver: c.picName
      }));
      setNewAllocations(mapped);
    }
  };

  const handleCreateCuttingOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const sty = styles.find(s => s.id === newStyleId) || styles[0];
    if (!sty) return;

    const sopAttention = sopAttentionStyles.find(a => a.styleCode === sty.code);
    const hasUnfinishedCutPrereq = sty.steps.some(st => st.id <= 11 && st.status !== 'Completed');
    const isCompliant = !sopAttention && !hasUnfinishedCutPrereq;
    const sopStepObj = sty.steps.find(s => s.id === newSopStepId) || sty.steps[11];
    const orderNum = `SPK-CUT/TW/09/${String(cuttingOrders.length + 1).padStart(3, '0')}`;

    addCuttingOrder({
      orderNumber: orderNum,
      cuttingDate: newCuttingDate,
      queueStatus: newQueueStatus,
      priority: newPriority,
      cuttingTable: newCuttingTable,
      styleId: sty.id,
      styleCode: sty.code,
      styleName: sty.name,
      buyer: sty.buyer,
      sopReferenceStepId: newSopStepId,
      sopReferenceProcess: `Tahap ${newSopStepId}: ${sopStepObj?.process || 'Gelar & Potong'}`,
      sopComplianceStatus: isCompliant ? 'SESUAI_SOP' : 'PERHATIAN_SOP',
      sopComplianceNotes: isCompliant
        ? 'Prasyarat SOP selesai.'
        : sopAttention
        ? sopAttention.deviations[0]?.description || 'Perlu verifikasi SOP.'
        : 'Tahap pra-cutting belum selesai.',
      materialCode: newMaterialCode || `FAB-${sty.code}`,
      materialName: newMaterialName || `Kain ${sty.name}`,
      materialCategory: newMaterialCategory,
      fabricQtyToCut: newFabricQty,
      fabricUnit: newFabricUnit,
      markerRatio: newMarkerRatio,
      componentPanelCut: newComponentPanelCut,
      dailyTargetCutPcs: newDailyTargetCutPcs,
      actualCutPcs: 0,
      bundleCount: newBundleCount,
      loadingAllocations: newAllocations.map((a, idx) => ({
        ...a,
        id: `LOAD-${Date.now().toString().slice(-4)}-${idx}`
      })),
      picCutting: newPicCutting,
      issuedByPPIC: currentUser.name,
      notes: newNotes
    });

    setIsAddOrderModalOpen(false);
    setNewNotes('');
  };

  const handleAddAllocationToOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addingAllocationOrderId) return;
    const targetOrder = cuttingOrders.find(o => o.id === addingAllocationOrderId);
    if (!targetOrder) return;

    const newAlloc: CuttingLoadingAllocation = {
      id: `LOAD-${Date.now().toString().slice(-5)}`,
      destinationType: allocType,
      destinationName: allocDestName.trim(),
      componentPanel: allocPanel.trim(),
      dailyTargetRequirementPcs: allocDailyTarget,
      allocatedLoadingPcs: allocQty,
      loadedActualPcs: 0,
      loadingStatus: targetOrder.actualCutPcs > 0 ? 'Ready to Load' : 'Waiting Cut',
      picReceiver: allocPic.trim()
    };

    updateCuttingOrder(targetOrder.id, {
      loadingAllocations: [...targetOrder.loadingAllocations, newAlloc]
    });

    setAddingAllocationOrderId(null);
  };

  const renderStatusText = (status: CuttingQueueStatus) => {
    switch (status) {
      case 'ACTIVE_CUTTING':
        return <span className="text-xs font-bold text-blue-700 flex items-center gap-1"><Play className="w-3 h-3 fill-blue-600" /> Dipotong</span>;
      case 'WAITING_LIST':
        return <span className="text-xs font-bold text-amber-700 flex items-center gap-1"><Clock className="w-3 h-3" /> Antrian</span>;
      case 'HOLD_SOP':
        return <span className="text-xs font-bold text-red-700 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Tahan SOP</span>;
      case 'READY_FOR_LOADING':
        return <span className="text-xs font-bold text-emerald-700 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Siap Loading</span>;
      case 'LOADED':
        return <span className="text-xs font-bold text-slate-600 flex items-center gap-1"><Truck className="w-3 h-3" /> Selesai</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Clean Header & Quick Stats */}
      <div className="bg-white rounded-xl p-4 border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Scissors className="w-4 h-4 text-blue-700" />
            Cutting &amp; Loading
          </h1>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                handleSelectStyleInModal(styles[0]?.id || 'sty-01');
                setIsAddOrderModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              SPK Potong
            </button>
            <button
              onClick={() => setActiveTab('ppic-planning')}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
            >
              SOP PPIC ({sopAttentionStyles.length})
            </button>
            <button
              onClick={() => openPrintModal('ppic-planning')}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
              title="Cetak SPK"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Clean Key Numbers */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-3.5 border-t border-slate-100">
          <div>
            <div className="text-[11px] text-slate-500">Hasil Potong</div>
            <div className="text-xl font-bold text-slate-900 tabular-nums mt-0.5">
              {totalActualCutToday.toLocaleString()} <span className="text-xs font-normal text-slate-400">/ {totalTargetCutToday.toLocaleString()} pcs</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500">Antrian</div>
            <div className="text-xl font-bold text-slate-900 tabular-nums mt-0.5">
              {activeCuttingOrders.length} <span className="text-xs font-normal text-blue-600">Aktif</span>
              <span className="mx-1 text-slate-300">·</span>
              {waitingListOrders.length} <span className="text-xs font-normal text-amber-600">Antri</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500">Loading Line</div>
            <div className="text-xl font-bold text-emerald-700 tabular-nums mt-0.5">
              {totalLineLoadedActual.toLocaleString()} <span className="text-xs font-normal text-slate-400">/ {totalLineTargetDaily.toLocaleString()} pcs</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500">Loading Subkon</div>
            <div className="text-xl font-bold text-amber-700 tabular-nums mt-0.5">
              {totalSubconLoadedActual.toLocaleString()} <span className="text-xs font-normal text-slate-400">/ {totalSubconTargetDaily.toLocaleString()} pcs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs & Compact Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg w-fit">
          <button
            onClick={() => setActiveSubTab('daily-cutting')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'daily-cutting'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            SPK Potong ({sortedOrders.length})
          </button>
          <button
            onClick={() => setActiveSubTab('waiting-list')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'waiting-list'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Antrian ({waitingListOrders.length})
          </button>
          <button
            onClick={() => setActiveSubTab('loading-board')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'loading-board'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Loading ({allLoadingAllocations.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedStyleFilter}
            onChange={(e) => setSelectedStyleFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700"
          >
            <option value="ALL">Semua Style</option>
            {styles.map(s => (
              <option key={s.id} value={s.code}>{s.code}</option>
            ))}
          </select>

          <select
            value={selectedQueueFilter}
            onChange={(e) => setSelectedQueueFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700"
          >
            <option value="ALL">Semua Status</option>
            <option value="ACTIVE_CUTTING">Dipotong</option>
            <option value="WAITING_LIST">Antrian</option>
            <option value="HOLD_SOP">Tahan SOP</option>
            <option value="READY_FOR_LOADING">Siap Loading</option>
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 w-36 sm:w-48 focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>
      </div>

      {/* TAB 1: PERINTAH POTONG HARIAN (CLEAN CARDS) */}
      {activeSubTab === 'daily-cutting' && (
        <div className="space-y-3">
          {filteredOrders.map((order, idx) => {
            const cutPercent = order.dailyTargetCutPcs > 0
              ? Math.min(100, Math.round((order.actualCutPcs / order.dailyTargetCutPcs) * 100))
              : 0;
            const isHoldSop = order.sopComplianceStatus !== 'SESUAI_SOP' || order.queueStatus === 'HOLD_SOP';

            return (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-colors"
              >
                {/* Top Row: Queue #, Model, Material & Status */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-start sm:items-center gap-3">
                    {/* Queue Number & Up/Down */}
                    <div className="flex items-center gap-1 bg-slate-100 rounded-lg px-2 py-1">
                      <span className="text-xs font-bold text-slate-800 tabular-nums">#{order.queueNumber}</span>
                      <div className="flex flex-col">
                        <button
                          onClick={() => moveCuttingQueue(order.id, 'UP')}
                          disabled={idx === 0}
                          className="text-slate-400 hover:text-slate-800 disabled:opacity-25 cursor-pointer"
                          title="Naikkan antrian"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => moveCuttingQueue(order.id, 'DOWN')}
                          disabled={idx === filteredOrders.length - 1}
                          className="text-slate-400 hover:text-slate-800 disabled:opacity-25 cursor-pointer"
                          title="Turunkan antrian"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-900">
                          {order.styleCode} — {order.styleName}
                        </span>
                        <span className="text-slate-300">·</span>
                        {renderStatusText(order.queueStatus)}
                        <span className="text-slate-300">·</span>
                        <span className={`text-xs font-semibold ${isHoldSop ? 'text-red-600' : 'text-emerald-600'}`}>
                          {isHoldSop ? 'Perhatian SOP' : 'Sesuai SOP'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                        <span>{order.orderNumber}</span>
                        <span>·</span>
                        <span>{order.cuttingTable}</span>
                        <span>·</span>
                        <span className="text-slate-700 font-medium">
                          Bahan: {order.materialName} ({(order.fabricQtyToCut ?? 0).toLocaleString()} {order.fabricUnit})
                        </span>
                        <span>·</span>
                        <span>Panel: {order.componentPanelCut}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Queue Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {order.queueStatus !== 'ACTIVE_CUTTING' && (
                      <button
                        onClick={() => updateCuttingOrder(order.id, { queueStatus: 'ACTIVE_CUTTING' })}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Play className="w-3 h-3" /> Mulai Potong
                      </button>
                    )}
                    {order.queueStatus === 'ACTIVE_CUTTING' && (
                      <button
                        onClick={() => updateCuttingOrder(order.id, { queueStatus: 'WAITING_LIST' })}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Pause className="w-3 h-3" /> Antrikan
                      </button>
                    )}
                    {order.actualCutPcs >= order.dailyTargetCutPcs && order.queueStatus !== 'READY_FOR_LOADING' && order.queueStatus !== 'LOADED' && (
                      <button
                        onClick={() => updateCuttingOrder(order.id, { queueStatus: 'READY_FOR_LOADING' })}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3 h-3" /> Siap Loading
                      </button>
                    )}
                    <button
                      onClick={() => deleteCuttingOrder(order.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* SOP Alert Strip if any */}
                {isHoldSop && (
                  <div className="my-2.5 px-3 py-2 rounded-lg bg-red-50/70 border border-red-200/80 flex items-center justify-between gap-2 text-xs text-red-800">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <span>{order.sopComplianceNotes}</span>
                    </div>
                    <button
                      onClick={() => setActiveTab('ppic-planning')}
                      className="text-red-700 font-semibold underline shrink-0 cursor-pointer"
                    >
                      Cek di PPIC
                    </button>
                  </div>
                )}

                {/* Bottom Grid: Left = Cut Input, Right = Loading Line & Subkon */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-3 items-center">
                  {/* Cut Progress & Input (4 cols) */}
                  <div className="lg:col-span-4 flex items-center justify-between gap-4 lg:border-r lg:border-slate-100 lg:pr-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-500">Realisasi Potong</span>
                        <span className="font-bold text-slate-900 tabular-nums">
                          {(order.actualCutPcs ?? 0).toLocaleString()} / {(order.dailyTargetCutPcs ?? 0).toLocaleString()} pcs ({cutPercent}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${cutPercent >= 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                          style={{ width: `${cutPercent}%` }}
                        />
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Marker: {order.markerRatio} · {order.bundleCount} Ikat
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <input
                        type="number"
                        min={0}
                        value={order.actualCutPcs}
                        onChange={(e) => {
                          const val = Math.max(0, Number(e.target.value));
                          updateCuttingOrder(order.id, {
                            actualCutPcs: val,
                            queueStatus: val >= order.dailyTargetCutPcs ? 'READY_FOR_LOADING' : order.queueStatus
                          });
                        }}
                        className="w-20 px-2 py-1 text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg text-right tabular-nums"
                      />
                      <button
                        onClick={() =>
                          updateCuttingOrder(order.id, {
                            actualCutPcs: order.dailyTargetCutPcs,
                            queueStatus: 'READY_FOR_LOADING'
                          })
                        }
                        className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 text-[11px] font-semibold cursor-pointer transition-colors"
                        title="Set 100% Selesai"
                      >
                        100%
                      </button>
                    </div>
                  </div>

                  {/* Loading Destinations: Line & Subkon (8 cols) */}
                  <div className="lg:col-span-8 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">
                        Tujuan Loading (Line &amp; Subkon):
                      </span>
                      <button
                        onClick={() => {
                          setAddingAllocationOrderId(order.id);
                          setAllocPanel(order.componentPanelCut);
                        }}
                        className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> Tambah Tujuan
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {order.loadingAllocations.map(alloc => (
                        <div
                          key={alloc.id}
                          className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200/70"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              {alloc.destinationType === 'LINE' ? (
                                <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              ) : (
                                <Truck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              )}
                              <span className="text-xs font-bold text-slate-800 truncate">
                                {alloc.destinationName}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 truncate mt-0.5">
                              {alloc.componentPanel} · Target {alloc.allocatedLoadingPcs} pcs
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <input
                              type="number"
                              min={0}
                              max={alloc.allocatedLoadingPcs * 2}
                              value={alloc.loadedActualPcs}
                              onChange={(e) => {
                                const val = Math.max(0, Number(e.target.value));
                                const newStatus =
                                  val >= alloc.allocatedLoadingPcs
                                    ? 'Loaded'
                                    : val > 0
                                    ? 'Partial Loaded'
                                    : 'Ready to Load';
                                updateCuttingLoadingAllocation(order.id, alloc.id, {
                                  loadedActualPcs: val,
                                  loadingStatus: newStatus
                                });
                              }}
                              className="w-16 px-2 py-1 text-xs font-bold bg-white border border-slate-200 rounded text-right tabular-nums"
                            />
                            <button
                              onClick={() =>
                                updateCuttingLoadingAllocation(order.id, alloc.id, {
                                  loadedActualPcs: alloc.allocatedLoadingPcs,
                                  loadingStatus: 'Loaded'
                                })
                              }
                              className={`p-1.5 rounded text-xs font-semibold cursor-pointer transition-colors ${
                                alloc.loadingStatus === 'Loaded'
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-200/80 hover:bg-blue-600 hover:text-white text-slate-700'
                              }`}
                              title="Kirim Penuh"
                            >
                              <Send className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: WAITING LIST TABLE (CLEAN & COMPACT) */}
      {activeSubTab === 'waiting-list' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                  <th className="py-3 px-4">Antrian</th>
                  <th className="py-3 px-4">Model / Style</th>
                  <th className="py-3 px-4">Bahan Dipotong</th>
                  <th className="py-3 px-4">Status SOP</th>
                  <th className="py-3 px-4 text-right">Target Potong</th>
                  <th className="py-3 px-4">Tujuan Loading</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {sortedOrders.map((order, idx) => (
                  <tr key={order.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-bold text-slate-900 tabular-nums">
                      <div className="flex items-center gap-1.5">
                        <span>#{order.queueNumber}</span>
                        <button
                          onClick={() => moveCuttingQueue(order.id, 'UP')}
                          disabled={idx === 0}
                          className="p-0.5 text-slate-400 hover:text-slate-800 disabled:opacity-25 cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveCuttingQueue(order.id, 'DOWN')}
                          disabled={idx === sortedOrders.length - 1}
                          className="p-0.5 text-slate-400 hover:text-slate-800 disabled:opacity-25 cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{order.styleCode} — {order.styleName}</div>
                      <div className="text-[11px] text-slate-400">{order.orderNumber} · {order.cuttingTable}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{order.materialName}</div>
                      <div className="text-[11px] text-slate-400 tabular-nums">
                        {(order.fabricQtyToCut ?? 0).toLocaleString()} {order.fabricUnit} · {order.componentPanelCut}
                      </div>
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
                      <div className="space-y-0.5">
                        {order.loadingAllocations.map(a => (
                          <div key={a.id} className="text-[11px] text-slate-600">
                            <span className="font-semibold text-slate-800">{a.destinationName}:</span> {a.loadedActualPcs}/{a.allocatedLoadingPcs} pcs
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {order.queueStatus !== 'ACTIVE_CUTTING' ? (
                        <button
                          onClick={() => updateCuttingOrder(order.id, { queueStatus: 'ACTIVE_CUTTING' })}
                          className="px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold cursor-pointer"
                        >
                          Potong
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-blue-700">Sedang Jalan</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DISTRIBUSI LOADING LINE VS SUBKON */}
      {activeSubTab === 'loading-board' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Line Sewing Column */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900">Loading Line Sewing (In-House)</h2>
              </div>
              <span className="text-xs font-bold text-emerald-700 tabular-nums">
                {totalLineLoadedActual.toLocaleString()} / {totalLineTargetDaily.toLocaleString()} pcs
              </span>
            </div>

            <div className="space-y-2">
              {allLoadingAllocations
                .filter(a => a.destinationType === 'LINE')
                .map(alloc => (
                  <div key={alloc.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {alloc.destinationName} <span className="text-slate-400 font-normal">· {alloc.styleCode}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {alloc.componentPanel} · Target Harian: {alloc.dailyTargetRequirementPcs} pcs
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={0}
                        value={alloc.loadedActualPcs}
                        onChange={(e) => {
                          const val = Math.max(0, Number(e.target.value));
                          updateCuttingLoadingAllocation(alloc.cuttingOrderId, alloc.id, {
                            loadedActualPcs: val,
                            loadingStatus: val >= alloc.allocatedLoadingPcs ? 'Loaded' : 'Partial Loaded'
                          });
                        }}
                        className="w-16 px-2 py-1 text-xs font-bold bg-white border border-slate-200 rounded text-right tabular-nums"
                      />
                      <span className="text-[11px] text-slate-500 tabular-nums">/ {alloc.allocatedLoadingPcs}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Subkon Column */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-600" />
                <h2 className="text-sm font-bold text-slate-900">Loading Mitra Subkon</h2>
              </div>
              <span className="text-xs font-bold text-amber-700 tabular-nums">
                {totalSubconLoadedActual.toLocaleString()} / {totalSubconTargetDaily.toLocaleString()} pcs
              </span>
            </div>

            <div className="space-y-2">
              {allLoadingAllocations
                .filter(a => a.destinationType === 'SUBCON')
                .map(alloc => (
                  <div key={alloc.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {alloc.destinationName} <span className="text-slate-400 font-normal">· {alloc.styleCode}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {alloc.componentPanel} · Target Harian: {alloc.dailyTargetRequirementPcs} pcs
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={0}
                        value={alloc.loadedActualPcs}
                        onChange={(e) => {
                          const val = Math.max(0, Number(e.target.value));
                          updateCuttingLoadingAllocation(alloc.cuttingOrderId, alloc.id, {
                            loadedActualPcs: val,
                            loadingStatus: val >= alloc.allocatedLoadingPcs ? 'Loaded' : 'Partial Loaded'
                          });
                        }}
                        className="w-16 px-2 py-1 text-xs font-bold bg-white border border-slate-200 rounded text-right tabular-nums"
                      />
                      <span className="text-[11px] text-slate-500 tabular-nums">/ {alloc.allocatedLoadingPcs}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH PERINTAH POTONG */}
      {isAddOrderModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-xl w-full overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Buat Perintah Potong Baru</h3>
              <button onClick={() => setIsAddOrderModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCuttingOrder} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Model / Style</label>
                  <select
                    value={newStyleId}
                    onChange={(e) => handleSelectStyleInModal(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  >
                    {styles.map(s => (
                      <option key={s.id} value={s.id}>{s.code} — {s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Meja Potong</label>
                  <input
                    type="text"
                    value={newCuttingTable}
                    onChange={(e) => setNewCuttingTable(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bahan / Kain Dipotong</label>
                  <input
                    type="text"
                    required
                    value={newMaterialName}
                    onChange={(e) => setNewMaterialName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Qty Kain ({newFabricUnit})</label>
                    <input
                      type="number"
                      required
                      value={newFabricQty}
                      onChange={(e) => setNewFabricQty(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Target (Pcs)</label>
                    <input
                      type="number"
                      required
                      value={newDailyTargetCutPcs}
                      onChange={(e) => setNewDailyTargetCutPcs(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg tabular-nums"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Komponen Panel</label>
                  <input
                    type="text"
                    required
                    value={newComponentPanelCut}
                    onChange={(e) => setNewComponentPanelCut(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status Antrian</label>
                  <select
                    value={newQueueStatus}
                    onChange={(e) => setNewQueueStatus(e.target.value as CuttingQueueStatus)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  >
                    <option value="ACTIVE_CUTTING">Langsung Potong</option>
                    <option value="WAITING_LIST">Masuk Waiting List</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddOrderModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold cursor-pointer"
                >
                  Simpan SPK Potong
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH TUJUAN LOADING */}
      {addingAllocationOrderId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Tambah Tujuan Loading</h3>
              <button onClick={() => setAddingAllocationOrderId(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddAllocationToOrder} className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Rute Tujuan</label>
                <select
                  value={allocType}
                  onChange={(e) => {
                    const r = e.target.value as 'LINE' | 'SUBCON';
                    setAllocType(r);
                    setAllocDestName(r === 'LINE' ? 'Line 1 Sewing' : 'CV Prima Bordir');
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                >
                  <option value="LINE">Line Sewing (In-House)</option>
                  <option value="SUBCON">Mitra Subkon</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Line / Subkon</label>
                <input
                  type="text"
                  required
                  value={allocDestName}
                  onChange={(e) => setAllocDestName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Harian (Pcs)</label>
                  <input
                    type="number"
                    required
                    value={allocDailyTarget}
                    onChange={(e) => setAllocDailyTarget(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jatah Loading (Pcs)</label>
                  <input
                    type="number"
                    required
                    value={allocQty}
                    onChange={(e) => setAllocQty(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg tabular-nums"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddingAllocationOrderId(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-700 text-white text-xs font-semibold cursor-pointer"
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
