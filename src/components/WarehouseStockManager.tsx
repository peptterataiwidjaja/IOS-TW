import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StockItem, MaterialCategory } from '../types';
import { 
  Warehouse, 
  Plus, 
  Send, 
  AlertTriangle, 
  Search, 
  Filter, 
  Layers, 
  Layers2, 
  Tag, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  Package, 
  TrendingDown, 
  MapPin, 
  FileSpreadsheet,
  Building2,
  DollarSign,
  Printer
} from 'lucide-react';
import { StockIssueModal } from './StockIssueModal';

export const WarehouseStockManager: React.FC = () => {
  const { stock, styles, addStockItem, currentUser, setActiveTab, lowStockItems, openPrintModal } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStyleFilter, setSelectedStyleFilter] = useState<string>('ALL');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [onlyLowStock, setOnlyLowStock] = useState<boolean>(false);

  // Modals state
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [selectedItemForIssue, setSelectedItemForIssue] = useState<StockItem | null>(null);
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);

  // New stock form state
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<MaterialCategory>('Kain Utama (Fabric)');
  const [newStyleCode, setNewStyleCode] = useState(styles[0]?.code || 'TW-JKT-88');
  const [newQty, setNewQty] = useState(100);
  const [newMinLevel, setNewMinLevel] = useState(50);
  const [newUnit, setNewUnit] = useState<StockItem['unit']>('Yard');
  const [newRack, setNewRack] = useState('Gudang-A / Rak 01');
  const [newUnitPrice, setNewUnitPrice] = useState(25000);
  const [newSupplier, setNewSupplier] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Authority check: Gudang & Factory Manager can input stock
  const canInputStock = currentUser.role === 'WAREHOUSE' || currentUser.role === 'FACTORY_MANAGER' || currentUser.role === 'PE';

  // Grouping items by style
  const filteredStock = stock.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStyle = selectedStyleFilter === 'ALL' || item.styleCode === selectedStyleFilter;
    const matchesCategory = selectedCategoryFilter === 'ALL' || item.category === selectedCategoryFilter;
    const matchesLowStock = !onlyLowStock || item.currentStock <= item.minStockLevel;

    return matchesSearch && matchesStyle && matchesCategory && matchesLowStock;
  });

  // Calculate stats
  const totalSku = stock.length;
  const totalValue = stock.reduce((sum, item) => sum + (item.currentStock * item.unitPrice), 0);
  const lowStockCount = lowStockItems.length;

  const handleOpenIssueModal = (item: StockItem) => {
    setSelectedItemForIssue(item);
    setIsIssueModalOpen(true);
  };

  const handleCreateNewStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim()) return;

    const matchedStyle = styles.find(s => s.code === newStyleCode);

    addStockItem({
      code: newCode.trim().toUpperCase(),
      name: newName.trim(),
      category: newCategory,
      styleCode: newStyleCode,
      styleName: matchedStyle ? matchedStyle.name : 'Custom Garment Style',
      currentStock: Number(newQty),
      minStockLevel: Number(newMinLevel),
      unit: newUnit,
      rackLocation: newRack.trim(),
      unitPrice: Number(newUnitPrice),
      supplier: newSupplier.trim() || 'Supplier PT Teratai Widjaja',
      notes: newNotes.trim()
    });

    setIsAddStockModalOpen(false);
    // Reset form
    setNewCode('');
    setNewName('');
    setNewQty(100);
    setNewNotes('');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Role Notice */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-xs font-bold flex items-center gap-1 border border-blue-200">
                <Warehouse className="w-3.5 h-3.5 text-blue-700" />
                Manajemen Gudang Bahan Baku &amp; Aksesoris
              </span>
              <span className="text-xs text-slate-400 font-medium">• Pengelompokan Berbasis Style</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Kontrol Stok Terintegrasi &amp; Notifikasi Batas Minimum
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl">
              Gudang berhak memasukkan stok bahan masuk. Stok dikelompokkan berdasarkan Style untuk menjaga alokasi produksi. Pengambilan di luar style diberi peringatan ketat.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => openPrintModal('warehouse-stock')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              title="Cetak PDF Dokumen Fisik Stok Gudang"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Cetak PDF Stok Gudang</span>
            </button>

            <button
              onClick={() => {
                setSelectedItemForIssue(null);
                setIsIssueModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              Keluar / Ambil Bahan
            </button>

            {canInputStock ? (
              <button
                onClick={() => setIsAddStockModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                Input Stok Masuk (Gudang)
              </button>
            ) : (
              <div className="text-[11px] bg-slate-100 text-slate-500 px-3 py-2 rounded-xl border border-slate-200">
                Akses Input: <strong>Gudang / FM</strong>
              </div>
            )}
          </div>
        </div>

        {/* Quick KPI Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs text-slate-500 font-medium flex items-center justify-between">
              <span>Total Item SKU</span>
              <Package className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-xl font-black text-slate-900 mt-1">{totalSku} SKU</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Bahan baku &amp; aksesoris terdata</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs text-slate-500 font-medium flex items-center justify-between">
              <span>Nilai Valuasi Stok</span>
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-xl font-black text-emerald-600 mt-1">
              Rp {totalValue.toLocaleString('id-ID')}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Total aset inventori gudang</div>
          </div>

          <div className={`p-3.5 rounded-xl border transition-colors ${
            lowStockCount > 0 ? 'bg-rose-50 border-rose-300' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="text-xs font-medium flex items-center justify-between">
              <span className={lowStockCount > 0 ? 'text-rose-700 font-bold' : 'text-slate-500'}>
                Stok Menipis (&le; Min)
              </span>
              <AlertTriangle className={`w-4 h-4 ${lowStockCount > 0 ? 'text-rose-600 animate-bounce' : 'text-slate-400'}`} />
            </div>
            <div className={`text-xl font-black mt-1 ${lowStockCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {lowStockCount} Item
            </div>
            <div className="text-[10px] text-rose-700 mt-0.5 font-medium">
              {lowStockCount > 0 ? 'Perlu tindakan restock PPIC' : 'Semua di atas safety stock'}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs text-slate-500 font-medium flex items-center justify-between">
              <span>Alokasi Style Terdaftar</span>
              <Layers2 className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-xl font-black text-indigo-600 mt-1">{styles.length} Style</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Semua batch PO garmen aktif</div>
          </div>
        </div>

        {/* Automatic Low Stock Notification Banner if present */}
        {lowStockItems.length > 0 && (
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-rose-50 via-rose-100/70 to-amber-50 border border-rose-300 text-rose-950 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-rose-500 text-white shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-rose-900">
                  Notifikasi Otomatis: {lowStockItems.length} Bahan Mencapai Batas Minimum!
                </div>
                <p className="text-[11px] text-rose-800 mt-0.5">
                  Sistem mendeteksi bahan penting seperti <strong>{lowStockItems.map(i => i.name).slice(0, 3).join(', ')}</strong> berada di bawah buffer stock. Segera koordinasi dengan PPIC &amp; Purchasing.
                </p>
              </div>
            </div>

            <button
              onClick={() => setOnlyLowStock(!onlyLowStock)}
              className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shrink-0 transition-colors shadow-xs"
            >
              {onlyLowStock ? 'Tampilkan Semua Stok' : 'Filter Khusus Stok Menipis'}
            </button>
          </div>
        )}

      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          
          {/* Search Box */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari kode bahan, nama kain, aksesoris, supplier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50 focus:bg-white"
            />
          </div>

          {/* Style Filter */}
          <div className="sm:col-span-4 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
            <select
              value={selectedStyleFilter}
              onChange={(e) => setSelectedStyleFilter(e.target.value)}
              className="w-full py-2 px-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="ALL">Semua Alokasi Style</option>
              {styles.map(s => (
                <option key={s.id} value={s.code}>
                  Style: {s.code} ({s.name})
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="w-full py-2 px-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="ALL">Semua Kategori</option>
              <option value="Kain Utama (Fabric)">Kain Utama</option>
              <option value="Kain Furing (Lining)">Kain Furing</option>
              <option value="Benang Jahit">Benang Jahit</option>
              <option value="Kancing (Buttons)">Kancing</option>
              <option value="Resleting (Zipper)">Resleting</option>
              <option value="Interlining / Viselin">Interlining</option>
              <option value="Aksesoris & Hangtag">Aksesoris</option>
              <option value="Polybag & Karton">Packaging</option>
            </select>
          </div>

        </div>

        {/* Quick pill toggle */}
        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Menampilkan: <strong>{filteredStock.length}</strong> item bahan</span>
            {onlyLowStock && (
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                Hanya Stok Menipis
              </span>
            )}
          </div>

          <button
            onClick={() => setOnlyLowStock(!onlyLowStock)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              onlyLowStock ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Filter Stok &le; Minimum</span>
          </button>
        </div>
      </div>

      {/* Stock Items Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-3 px-3">Kode &amp; Nama Bahan</th>
                <th className="py-3 px-3">Kategori</th>
                <th className="py-3 px-3">Alokasi Style (Group)</th>
                <th className="py-3 px-3 text-right">Stok Aktual</th>
                <th className="py-3 px-3 text-right">Batas Min</th>
                <th className="py-3 px-3 text-center">Status Level</th>
                <th className="py-3 px-3">Lokasi Rak</th>
                <th className="py-3 px-3">Supplier</th>
                <th className="py-3 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStock.map((item) => {
                const isLow = item.currentStock <= item.minStockLevel;
                const ratio = item.minStockLevel > 0 ? (item.currentStock / item.minStockLevel) : 2;

                return (
                  <tr 
                    key={item.id} 
                    className={`hover:bg-slate-50 transition-colors ${
                      isLow ? 'bg-rose-50/40' : ''
                    }`}
                  >
                    {/* Code & Name */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                        <Tag className="w-3 h-3 text-slate-400" />
                        {item.code}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {item.category}
                      </span>
                    </td>

                    {/* Style Allocation */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-indigo-700 flex items-center gap-1">
                        <Layers2 className="w-3.5 h-3.5 text-indigo-500" />
                        {item.styleCode}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[140px]">
                        {item.styleName}
                      </div>
                    </td>

                    {/* Current Stock */}
                    <td className="py-3 px-3 text-right">
                      <div className={`text-sm font-black ${isLow ? 'text-rose-600' : 'text-slate-900'}`}>
                        {item.currentStock.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">{item.unit}</div>
                    </td>

                    {/* Min Stock Level */}
                    <td className="py-3 px-3 text-right text-slate-600 font-medium">
                      <div>{item.minStockLevel.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-400">{item.unit}</div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3 text-center">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-300 animate-pulse">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          Menipis!
                        </span>
                      ) : ratio <= 1.3 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          Waspada
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Aman
                        </span>
                      )}
                    </td>

                    {/* Rack */}
                    <td className="py-3 px-3 text-slate-700">
                      <div className="flex items-center gap-1 text-[11px]">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{item.rackLocation}</span>
                      </div>
                    </td>

                    {/* Supplier */}
                    <td className="py-3 px-3 text-slate-600 text-[11px]">
                      <div className="truncate max-w-[130px]" title={item.supplier}>
                        {item.supplier}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleOpenIssueModal(item)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] border border-indigo-200 transition-colors flex items-center gap-1 mx-auto"
                        title="Ambil / Keluarkan Bahan"
                      >
                        <Send className="w-3 h-3" />
                        <span>Keluarkan</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {filteredStock.length === 0 && (
          <div className="py-12 text-center text-slate-500 text-xs">
            Tidak ada item bahan yang sesuai filter pencarian.
          </div>
        )}
      </div>

      {/* Modal: Keluar / Ambil Bahan (with cross-style check & PIC accountability) */}
      <StockIssueModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        preselectedItem={selectedItemForIssue}
      />

      {/* Modal: Input Stok Baru (Hak Akses Gudang) */}
      {isAddStockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-bold">Input Penerimaan Stok Gudang</h2>
              </div>
              <button 
                onClick={() => setIsAddStockModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateNewStock} className="p-6 space-y-3.5 text-xs max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kode Bahan Baku / SKU *</label>
                <input
                  type="text"
                  placeholder="Contoh: FAB-TW88-03 atau ACC-BTN-01"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none uppercase"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Deskripsi Bahan Baku *</label>
                <input
                  type="text"
                  placeholder="Contoh: Kain Cotton Combed 30s Reaktif Navy"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori Material *</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full p-2 rounded-xl border border-slate-300 font-medium"
                  >
                    <option value="Kain Utama (Fabric)">Kain Utama (Fabric)</option>
                    <option value="Kain Furing (Lining)">Kain Furing (Lining)</option>
                    <option value="Benang Jahit">Benang Jahit</option>
                    <option value="Kancing (Buttons)">Kancing (Buttons)</option>
                    <option value="Resleting (Zipper)">Resleting (Zipper)</option>
                    <option value="Interlining / Viselin">Interlining / Viselin</option>
                    <option value="Aksesoris & Hangtag">Aksesoris &amp; Hangtag</option>
                    <option value="Polybag & Karton">Polybag &amp; Karton</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Alokasi Style Target *</label>
                  <select
                    value={newStyleCode}
                    onChange={(e) => setNewStyleCode(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300 font-bold text-indigo-700"
                  >
                    {styles.map(s => (
                      <option key={s.id} value={s.code}>
                        {s.code} ({s.name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jumlah Masuk *</label>
                  <input
                    type="number"
                    min="1"
                    value={newQty}
                    onChange={(e) => setNewQty(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-slate-300 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Batas Minimum (Alert) *</label>
                  <input
                    type="number"
                    min="1"
                    value={newMinLevel}
                    onChange={(e) => setNewMinLevel(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-slate-300 font-bold text-rose-600"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Satuan Unit *</label>
                  <select
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value as any)}
                    className="w-full p-2 rounded-xl border border-slate-300 font-medium"
                  >
                    <option value="Yard">Yard</option>
                    <option value="Meter">Meter</option>
                    <option value="Roll">Roll</option>
                    <option value="Cones">Cones</option>
                    <option value="Gross">Gross</option>
                    <option value="Pcs">Pcs</option>
                    <option value="Kg">Kg</option>
                    <option value="Set">Set</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lokasi Rak Gudang *</label>
                  <input
                    type="text"
                    placeholder="Gudang-A / Rak 03-C"
                    value={newRack}
                    onChange={(e) => setNewRack(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Harga Satuan (Rp) *</label>
                  <input
                    type="number"
                    min="0"
                    value={newUnitPrice}
                    onChange={(e) => setNewUnitPrice(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-slate-300 font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Supplier / Pabrik Tekstil</label>
                <input
                  type="text"
                  placeholder="PT Grand Textile Mills / PT Coats Rejo"
                  value={newSupplier}
                  onChange={(e) => setNewSupplier(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan Kualitas / Shrinkage</label>
                <input
                  type="text"
                  placeholder="Lolos uji susut, lot kain A..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddStockModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Simpan Stok Gudang
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
