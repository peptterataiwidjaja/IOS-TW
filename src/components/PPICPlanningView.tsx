import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Layers, 
  Layers2, 
  PlusCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Warehouse, 
  Truck, 
  Scissors, 
  Filter, 
  Search, 
  FileSpreadsheet, 
  Printer, 
  Edit3, 
  Trash2, 
  Tag, 
  Split, 
  ArrowRight,
  Info,
  Calendar,
  Check,
  X
} from 'lucide-react';
import { 
  ProductionComponentAllocation, 
  ProductionMaterialRequirement, 
  ProductionRoute 
} from '../types';

export const PPICPlanningView: React.FC = () => {
  const { 
    currentStyle, 
    styles, 
    selectedStyleId, 
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
    setActiveTab, 
    currentUser,
    openPrintModal
  } = useApp();

  // Active sub-view tab: 'components' (Alokasi Komponen) vs 'materials' (Kebutuhan Bahan Baku)
  const [activeSubView, setActiveSubView] = useState<'components' | 'materials'>('components');

  // Filter and Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [routeFilter, setRouteFilter] = useState<'ALL' | 'LINE' | 'SUBCON'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [filterByCurrentStyleOnly, setFilterByCurrentStyleOnly] = useState(true);

  // Modal: Add Component Allocation
  const [isAddComponentModalOpen, setIsAddComponentModalOpen] = useState(false);
  const [compName, setCompName] = useState('');
  const [compCategory, setCompCategory] = useState<ProductionComponentAllocation['panelCategory']>('Body Utama');
  const [compRoute, setCompRoute] = useState<ProductionRoute>('LINE');
  const [compLocation, setCompLocation] = useState('Line Sewing 01');
  const [compQtyPerPcs, setCompQtyPerPcs] = useState<number>(1);
  const [compProcess, setCompProcess] = useState('');
  const [compPic, setCompPic] = useState(currentUser.name);
  const [compTargetDate, setCompTargetDate] = useState('');
  const [compNotes, setCompNotes] = useState('');

  // Modal: Add Production Material Requirement
  const [isAddMaterialModalOpen, setIsAddMaterialModalOpen] = useState(false);
  const [matName, setMatName] = useState('');
  const [matCategory, setMatCategory] = useState('Kain Utama (Fabric)');
  const [matConsPerPcs, setMatConsPerPcs] = useState<number>(1.5);
  const [matUnit, setMatUnit] = useState('Yard');
  const [matWastePercent, setMatWastePercent] = useState<number>(3);
  const [matUnitPrice, setMatUnitPrice] = useState<number>(25000);
  const [matForComponent, setMatForComponent] = useState('');
  const [matNotes, setMatNotes] = useState('');

  // Edit states
  const [editingComponent, setEditingComponent] = useState<ProductionComponentAllocation | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<ProductionMaterialRequirement | null>(null);

  // Filtered Component Allocations
  const filteredComponents = useMemo(() => {
    return componentAllocations.filter(item => {
      if (filterByCurrentStyleOnly && item.styleCode !== currentStyle.code) {
        return false;
      }
      if (routeFilter !== 'ALL' && item.route !== routeFilter) {
        return false;
      }
      if (statusFilter !== 'ALL' && item.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.componentName.toLowerCase().includes(q) ||
          item.targetLocation.toLowerCase().includes(q) ||
          item.styleCode.toLowerCase().includes(q) ||
          item.processDescription.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [componentAllocations, filterByCurrentStyleOnly, currentStyle.code, routeFilter, statusFilter, searchQuery]);

  // Filtered Materials
  const filteredMaterials = useMemo(() => {
    return productionMaterials.filter(item => {
      if (filterByCurrentStyleOnly && item.styleCode !== currentStyle.code) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.materialName.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.styleCode.toLowerCase().includes(q) ||
          (item.usedForComponent && item.usedForComponent.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [productionMaterials, filterByCurrentStyleOnly, currentStyle.code, searchQuery]);

  // Metrics for Current Style
  const currentStyleComponents = componentAllocations.filter(c => c.styleCode === currentStyle.code);
  const lineCount = currentStyleComponents.filter(c => c.route === 'LINE').length;
  const subconCount = currentStyleComponents.filter(c => c.route === 'SUBCON').length;
  const currentStyleMaterials = productionMaterials.filter(m => m.styleCode === currentStyle.code);
  const materialsWithShortage = currentStyleMaterials.filter(m => m.status === 'Shortage').length;

  // Handler: Add Component
  const handleSaveNewComponent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compName.trim()) {
      alert('Mohon isi nama komponen atau panel produksi!');
      return;
    }

    const totalRequired = Math.ceil(currentStyle.targetQuantityPcs * compQtyPerPcs);

    addComponentAllocation({
      styleCode: currentStyle.code,
      componentName: compName.trim(),
      panelCategory: compCategory,
      route: compRoute,
      targetLocation: compLocation.trim(),
      qtyPerPcs: compQtyPerPcs,
      totalRequiredQty: totalRequired,
      processDescription: compProcess.trim() || `${compCategory} untuk ${currentStyle.name}`,
      status: 'Pending',
      picName: compPic.trim() || currentUser.name,
      targetDate: compTargetDate || currentStyle.deliveryDate,
      notes: compNotes.trim()
    });

    setIsAddComponentModalOpen(false);
    setCompName('');
    setCompProcess('');
    setCompNotes('');
  };

  // Handler: Add Material
  const handleSaveNewMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matName.trim()) {
      alert('Mohon isi nama bahan baku produksi!');
      return;
    }

    const baseRequired = currentStyle.targetQuantityPcs * matConsPerPcs;
    const wasteFactor = 1 + ((matWastePercent || 0) / 100);
    const totalReq = Math.ceil(baseRequired * wasteFactor);

    // Check warehouse stock matching name or category
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
      balanceQty: balance,
      status: available >= totalReq ? 'Ready' : (available > 0 ? 'Partial' : 'Shortage'),
      usedForComponent: matForComponent.trim() || undefined,
      unitPrice: matUnitPrice,
      notes: matNotes.trim()
    });

    setIsAddMaterialModalOpen(false);
    setMatName('');
    setMatNotes('');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Title */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1 border border-emerald-200">
                <Layers className="w-3.5 h-3.5 text-emerald-700" />
                Perencanaan PPIC Terdistribusi
              </span>
              <span className="text-xs text-slate-400 font-medium">• Alokasi Komponen &amp; Kebutuhan Bahan</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Alokasi Komponen &amp; Kebutuhan Bahan (BOM)
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl">
              Distribusi pengerjaan panel pakaian (Line Internal vs Mitra Subkon) serta kalkulasi kesiapan material gudang untuk style yang diproduksi.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('subcon')}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Truck className="w-3.5 h-3.5 text-amber-600" />
              Monitoring Subkon &rarr;
            </button>
            <button
              onClick={() => setActiveTab('warehouse-stock')}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Warehouse className="w-3.5 h-3.5 text-blue-600" />
              Stok Gudang Aktual &rarr;
            </button>
            <button
              onClick={() => openPrintModal('ppic-planning')}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Cetak PDF Dokumen PPIC & BOM"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak Rencana PPIC (PDF)
            </button>
          </div>
        </div>

        {/* Style Selector & Status Header */}
        <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
              PPIC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900">
                  {currentStyle.code} — {currentStyle.name}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  Rute: {currentStyle.primaryRoute || 'HYBRID (Line & Subkon)'}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Buyer: <strong>{currentStyle.buyer}</strong> | Target Produksi: <strong className="text-emerald-700 font-bold">{currentStyle.targetQuantityPcs.toLocaleString()} Pcs</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="text-right sm:text-left">
              <div className="text-slate-400 font-medium">Batas Kirim (Delivery):</div>
              <div className="font-bold text-slate-900">{currentStyle.deliveryDate}</div>
            </div>
            <div className="h-8 w-px bg-slate-200 hidden sm:block" />
            <div>
              <div className="text-slate-400 font-medium">Distribusi Komponen:</div>
              <div className="font-bold text-slate-900">
                <span className="text-blue-700">{lineCount} Line</span> / <span className="text-amber-700">{subconCount} Subkon</span>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-200 hidden sm:block" />
            <div>
              <div className="text-slate-400 font-medium">Kebutuhan Bahan:</div>
              <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                materialsWithShortage === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {materialsWithShortage === 0 ? 'Material Cukup' : `${materialsWithShortage} Bahan Kurang`}
              </span>
            </div>
          </div>
        </div>

        {/* Quick KPI Cards for Allocation */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="text-[11px] text-slate-500 font-medium">Total Komponen Style</div>
            <div className="text-lg font-black text-slate-900 mt-0.5">{currentStyleComponents.length} Bagian</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Komponen panel / aksesoris</div>
          </div>

          <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-200">
            <div className="text-[11px] text-blue-700 font-medium flex items-center gap-1">
              <Scissors className="w-3.5 h-3.5 text-blue-600" />
              Pengerjaan Line Internal
            </div>
            <div className="text-lg font-black text-blue-900 mt-0.5">{lineCount} Komponen</div>
            <div className="text-[10px] text-blue-600/80 mt-0.5">Dikerjakan in-house pabrik</div>
          </div>

          <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200">
            <div className="text-[11px] text-amber-800 font-medium flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-amber-600" />
              Pengerjaan Mitra Subkon
            </div>
            <div className="text-lg font-black text-amber-900 mt-0.5">{subconCount} Komponen</div>
            <div className="text-[10px] text-amber-700/80 mt-0.5">Bordir / sablon / jahit luar</div>
          </div>

          <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200">
            <div className="text-[11px] text-emerald-800 font-medium flex items-center gap-1">
              <Layers2 className="w-3.5 h-3.5 text-emerald-600" />
              Kebutuhan Bahan Baku
            </div>
            <div className="text-lg font-black text-emerald-900 mt-0.5">{currentStyleMaterials.length} Jenis</div>
            <div className="text-[10px] text-emerald-700/80 mt-0.5">BOM kebutuhan order</div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation & Actions Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubView('components')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubView === 'components'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            <Split className="w-4 h-4" />
            <span>1. Alokasi Komponen Produksi (Line vs. Subkon)</span>
            <span className="text-[10px] bg-black/20 px-1.5 py-0.2 rounded-full">
              {filteredComponents.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubView('materials')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubView === 'materials'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            <Layers2 className="w-4 h-4" />
            <span>2. Kebutuhan Bahan Baku &amp; Produksi (BOM)</span>
            <span className="text-[10px] bg-black/20 px-1.5 py-0.2 rounded-full">
              {filteredMaterials.length}
            </span>
          </button>
        </div>

        {/* Action Button for Active Tab */}
        <div>
          {activeSubView === 'components' ? (
            <button
              onClick={() => setIsAddComponentModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Tambah Alokasi Komponen (Line / Subkon)
            </button>
          ) : (
            <button
              onClick={() => setIsAddMaterialModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Tambah Kebutuhan Bahan Produksi
            </button>
          )}
        </div>
      </div>

      {/* Filters & Search Row */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Style Filter toggle */}
          <button
            onClick={() => setFilterByCurrentStyleOnly(!filterByCurrentStyleOnly)}
            className={`px-3 py-1.5 rounded-lg border font-semibold transition-colors cursor-pointer ${
              filterByCurrentStyleOnly
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            {filterByCurrentStyleOnly ? `Style Aktif: ${currentStyle.code}` : 'Semua Style Terdaftar'}
          </button>

          {/* Route filter (Line vs Subkon) if in components view */}
          {activeSubView === 'components' && (
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setRouteFilter('ALL')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                  routeFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                }`}
              >
                Semua Jalur
              </button>
              <button
                onClick={() => setRouteFilter('LINE')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                  routeFilter === 'LINE' ? 'bg-blue-600 text-white' : 'text-slate-500'
                }`}
              >
                Line Internal ({lineCount})
              </button>
              <button
                onClick={() => setRouteFilter('SUBCON')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                  routeFilter === 'SUBCON' ? 'bg-amber-600 text-white' : 'text-slate-500'
                }`}
              >
                Mitra Subkon ({subconCount})
              </button>
            </div>
          )}

          {/* Status filter if in components view */}
          {activeSubView === 'components' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-medium"
            >
              <option value="ALL">Semua Status</option>
              <option value="Ready">Ready (Siap Jahit)</option>
              <option value="In Progress">In Progress</option>
              <option value="Cutting">Cutting</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
            </select>
          )}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={activeSubView === 'components' ? "Cari komponen / lokasi..." : "Cari bahan baku..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:ring-1 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* VIEW 1: ALOKASI KOMPONEN PRODUKSI (LINE VS SUBCON) */}
      {activeSubView === 'components' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Split className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Daftar Alokasi Komponen &amp; Penentuan Jalur Produksi
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Menampilkan <strong>{filteredComponents.length}</strong> komponen
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 text-[11px]">
                  <th className="py-3 px-3">Style</th>
                  <th className="py-3 px-3">Komponen / Bagian Panel</th>
                  <th className="py-3 px-3">Kategori Panel</th>
                  <th className="py-3 px-3">Jalur Produksi</th>
                  <th className="py-3 px-3">Lokasi / Mitra Tujuan</th>
                  <th className="py-3 px-3 text-right">Rasio/Pcs</th>
                  <th className="py-3 px-3 text-right">Total Kebutuhan</th>
                  <th className="py-3 px-3">Proses Kerja</th>
                  <th className="py-3 px-3">PIC</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredComponents.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-slate-400">
                      Belum ada komponen alokasi produksi yang terdaftar untuk filter ini.
                      <div className="mt-2">
                        <button
                          onClick={() => setIsAddComponentModalOpen(true)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 font-bold text-xs rounded-lg hover:bg-blue-100 cursor-pointer"
                        >
                          + Tambah Alokasi Komponen Pertama
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredComponents.map((comp) => {
                    const isLine = comp.route === 'LINE';
                    return (
                      <tr key={comp.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-bold text-slate-900 whitespace-nowrap">
                          {comp.styleCode}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900">
                          {comp.componentName}
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[10px]">
                            {comp.panelCategory}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 w-fit ${
                            isLine 
                              ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                              : 'bg-amber-100 text-amber-900 border border-amber-200'
                          }`}>
                            {isLine ? <Scissors className="w-3 h-3 text-blue-600" /> : <Truck className="w-3 h-3 text-amber-600" />}
                            {isLine ? 'Line In-House' : 'Mitra Subkon'}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-800">
                          {comp.targetLocation}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-600">
                          {comp.qtyPerPcs} pcs
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                          {comp.totalRequiredQty.toLocaleString()} pcs
                        </td>
                        <td className="py-3 px-3 text-slate-600 max-w-xs truncate" title={comp.processDescription}>
                          {comp.processDescription}
                        </td>
                        <td className="py-3 px-3 text-slate-700 font-medium">
                          {comp.picName}
                        </td>
                        <td className="py-3 px-3">
                          <select
                            value={comp.status}
                            onChange={(e) => updateComponentAllocation(comp.id, { status: e.target.value as any })}
                            className={`text-[11px] font-bold px-2 py-1 rounded-md border cursor-pointer ${
                              comp.status === 'Ready' 
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                                : comp.status === 'In Progress' 
                                ? 'bg-blue-50 text-blue-800 border-blue-200' 
                                : comp.status === 'Cutting'
                                ? 'bg-purple-50 text-purple-800 border-purple-200'
                                : 'bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Cutting">Cutting</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Ready">Ready</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => deleteComponentAllocation(comp.id)}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            title="Hapus alokasi komponen"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: KEBUTUHAN BAHAN BAKU & PRODUKSI (BOM) */}
      {activeSubView === 'materials' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers2 className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Rincian Kebutuhan Bahan Baku Produksi (BOM) &amp; Ketersediaan Gudang
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Menampilkan <strong>{filteredMaterials.length}</strong> bahan baku
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 text-[11px]">
                  <th className="py-3 px-3">Style</th>
                  <th className="py-3 px-3">Nama Bahan Baku / Material</th>
                  <th className="py-3 px-3">Kategori</th>
                  <th className="py-3 px-3">Digunakan Pada Komponen</th>
                  <th className="py-3 px-3 text-right">Konsumsi/Pcs</th>
                  <th className="py-3 px-3 text-right">Total Kebutuhan Order</th>
                  <th className="py-3 px-3 text-right">Stok Gudang Fisik</th>
                  <th className="py-3 px-3 text-right">Selisih (Balance)</th>
                  <th className="py-3 px-3">Status Kesiapan</th>
                  <th className="py-3 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredMaterials.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400">
                      Belum ada rincian bahan produksi yang terdaftar.
                      <div className="mt-2">
                        <button
                          onClick={() => setIsAddMaterialModalOpen(true)}
                          className="px-3 py-1.5 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-lg hover:bg-emerald-100 cursor-pointer"
                        >
                          + Tambah Kebutuhan Bahan Baku
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredMaterials.map((mat) => {
                    const balance = mat.availableStock - mat.totalRequired;
                    const isShort = balance < 0;

                    return (
                      <tr key={mat.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-bold text-slate-900 whitespace-nowrap">
                          {mat.styleCode}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900">
                          {mat.materialName}
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[10px]">
                            {mat.category}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-700 font-medium">
                          {mat.usedForComponent || 'Seluruh Bagian'}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-600">
                          {mat.consumptionPerPcs} {mat.unit}/pcs
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                          {mat.totalRequired.toLocaleString()} {mat.unit}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-blue-700">
                          {mat.availableStock.toLocaleString()} {mat.unit}
                        </td>
                        <td className={`py-3 px-3 text-right font-mono font-bold ${
                          isShort ? 'text-red-600' : 'text-emerald-700'
                        }`}>
                          {balance > 0 ? `+${balance.toLocaleString()}` : balance.toLocaleString()} {mat.unit}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                            mat.status === 'Ready' || mat.status === 'Available'
                              ? 'bg-emerald-100 text-emerald-800'
                              : mat.status === 'Partial'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {mat.status === 'Ready' || mat.status === 'Available' ? 'Ready (Lengkap)' : mat.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => deleteProductionMaterial(mat.id)}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            title="Hapus kebutuhan bahan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH ALOKASI KOMPONEN (LINE VS SUBCON) */}
      {isAddComponentModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
                  <Split className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Tambah Alokasi Komponen Produksi</h3>
                  <p className="text-[11px] text-slate-500">Tentukan rute pengerjaan di Line Internal atau Mitra Subkon</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddComponentModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewComponent} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Style Produksi Target</label>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 font-bold text-slate-900">
                  {currentStyle.code} — {currentStyle.name} (Target: {currentStyle.targetQuantityPcs.toLocaleString()} Pcs)
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Komponen / Panel *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Lengan Kanan, Saku Dada, Bordir Logo"
                    value={compName}
                    onChange={(e) => setCompName(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori Bagian</label>
                  <select
                    value={compCategory}
                    onChange={(e) => setCompCategory(e.target.value as any)}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="Body Utama">Body Utama (Depan/Belakang)</option>
                    <option value="Lengan">Lengan (Sleeves)</option>
                    <option value="Kerah">Kerah &amp; Manset (Collar/Cuff)</option>
                    <option value="Saku">Saku / Pocket</option>
                    <option value="Aplikasi Bordir">Aplikasi Bordir</option>
                    <option value="Sablon / Printing">Sablon / Printing</option>
                    <option value="Furing & Interlining">Furing &amp; Interlining</option>
                  </select>
                </div>
              </div>

              {/* ROUTE SELECTION: LINE VS SUBCON */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <label className="block font-bold text-slate-900">Pilihan Jalur Produksi *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCompRoute('LINE');
                      setCompLocation('Line Sewing 01');
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      compRoute === 'LINE'
                        ? 'bg-blue-50 border-blue-600 text-blue-900 ring-2 ring-blue-600/20'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Scissors className="w-3.5 h-3.5 text-blue-600" />
                      Line Internal (In-House)
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Dikerjakan di sewing floor pabrik</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCompRoute('SUBCON');
                      setCompLocation('CV Bordir Presisi');
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      compRoute === 'SUBCON'
                        ? 'bg-amber-50 border-amber-600 text-amber-900 ring-2 ring-amber-600/20'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Truck className="w-3.5 h-3.5 text-amber-600" />
                      Mitra Subkon Luar
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Bordir, sablon, atau jahit luar</div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {compRoute === 'LINE' ? 'Nama Line Jahit' : 'Nama Mitra Subkon'} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={compRoute === 'LINE' ? 'Contoh: Line Sewing 01' : 'Contoh: CV Bordir Presisi'}
                    value={compLocation}
                    onChange={(e) => setCompLocation(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jumlah per Pcs Garmen</label>
                  <input
                    type="number"
                    min="1"
                    value={compQtyPerPcs}
                    onChange={(e) => setCompQtyPerPcs(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Deskripsi Proses Kerja</label>
                <input
                  type="text"
                  placeholder="Contoh: Jahit keliman, pasang ritsleting, bordir 7000 tusukan"
                  value={compProcess}
                  onChange={(e) => setCompProcess(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">PIC Penanggung Jawab</label>
                  <input
                    type="text"
                    value={compPic}
                    onChange={(e) => setCompPic(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Tanggal Selesai</label>
                  <input
                    type="date"
                    value={compTargetDate}
                    onChange={(e) => setCompTargetDate(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddComponentModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-white bg-blue-600 hover:bg-blue-700 font-bold shadow-xs cursor-pointer"
                >
                  Simpan Alokasi Komponen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH KEBUTUHAN BAHAN PRODUKSI */}
      {isAddMaterialModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                  <Layers2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Tambah Kebutuhan Bahan Produksi</h3>
                  <p className="text-[11px] text-slate-500">Definisikan BOM kebutuhan bahan untuk Style {currentStyle.code}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddMaterialModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewMaterial} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Bahan Baku / Aksesoris *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kain Taslan Milky Waterproof, Benang Astra 40/2"
                  value={matName}
                  onChange={(e) => setMatName(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori Bahan</label>
                  <select
                    value={matCategory}
                    onChange={(e) => setMatCategory(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="Kain Utama (Fabric)">Kain Utama (Fabric)</option>
                    <option value="Kain Furing (Lining)">Kain Furing (Lining)</option>
                    <option value="Resleting (Zipper)">Resleting (Zipper)</option>
                    <option value="Kancing (Buttons)">Kancing (Buttons)</option>
                    <option value="Benang Jahit">Benang Jahit</option>
                    <option value="Interlining / Viselin">Interlining / Viselin</option>
                    <option value="Rib / Kerah Rajut">Rib / Kerah Rajut</option>
                    <option value="Label / Hangtag">Label / Hangtag</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Satuan Kebutuhan</label>
                  <select
                    value={matUnit}
                    onChange={(e) => setMatUnit(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="Yard">Yard</option>
                    <option value="Meter">Meter</option>
                    <option value="Pcs">Pcs</option>
                    <option value="Gross">Gross</option>
                    <option value="Cones">Cones</option>
                    <option value="Roll">Roll</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Konsumsi per Pcs</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    value={matConsPerPcs}
                    onChange={(e) => setMatConsPerPcs(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Toleransi Susut / Waste (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="50"
                    value={matWastePercent}
                    onChange={(e) => setMatWastePercent(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    placeholder="Contoh: 3%"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Digunakan untuk Komponen</label>
                  <input
                    type="text"
                    placeholder="Contoh: Body Luar, Saku, Manset"
                    value={matForComponent}
                    onChange={(e) => setMatForComponent(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estimasi Harga Satuan (Rp/{matUnit})</label>
                  <input
                    type="number"
                    step="500"
                    min="0"
                    value={matUnitPrice}
                    onChange={(e) => setMatUnitPrice(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Automatic BOM Calculation Preview */}
              {(() => {
                const baseReq = currentStyle.targetQuantityPcs * matConsPerPcs;
                const calcTotal = Math.ceil(baseReq * (1 + (matWastePercent || 0) / 100));
                const totalCost = calcTotal * (matUnitPrice || 0);
                const matchedWarehouse = stock.find(s => 
                  s.styleCode === currentStyle.code && 
                  (s.name.toLowerCase().includes(matName.toLowerCase()) || (matName && matName.toLowerCase().includes(s.name.toLowerCase())))
                );
                const currentAvail = matchedWarehouse ? matchedWarehouse.currentStock : 0;
                const projBalance = currentAvail - calcTotal;

                return (
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">Total Kebutuhan Bersih + Waste:</span>
                      <span className="font-mono text-base font-black text-emerald-700">
                        {calcTotal.toLocaleString()} {matUnit}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-200 text-slate-600">
                      <div>
                        <span>Netto Order:</span> <strong className="font-mono">{Math.ceil(baseReq).toLocaleString()} {matUnit}</strong>
                      </div>
                      <div>
                        <span>Waste ({matWastePercent}%):</span> <strong className="font-mono text-amber-700">+{Math.ceil(baseReq * (matWastePercent / 100)).toLocaleString()} {matUnit}</strong>
                      </div>
                      <div>
                        <span>Est. Total Biaya:</span> <strong className="font-mono text-slate-900">Rp {totalCost.toLocaleString('id-ID')}</strong>
                      </div>
                      <div>
                        <span>Stok Gudang Fisik:</span> <strong className="font-mono text-blue-700">{currentAvail.toLocaleString()} {matUnit}</strong>
                      </div>
                    </div>

                    <div className={`p-2 rounded-lg text-xs font-bold flex items-center justify-between ${
                      projBalance >= 0 ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-900'
                    }`}>
                      <span>Proyeksi Status Kesiapan:</span>
                      <span>
                        {projBalance >= 0 
                          ? `Ready (Surplus +${projBalance.toLocaleString()} ${matUnit})` 
                          : `Kurang / Defisit ${Math.abs(projBalance).toLocaleString()} ${matUnit}`}
                      </span>
                    </div>
                  </div>
                );
              })()}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddMaterialModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 font-bold shadow-xs cursor-pointer"
                >
                  Simpan Kebutuhan Bahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
