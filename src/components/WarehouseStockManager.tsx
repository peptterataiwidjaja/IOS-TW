import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { StockItem, MaterialCategory } from '../types';
import { 
  Warehouse, 
  Plus, 
  AlertTriangle, 
  Search, 
  CheckCircle2, 
  Printer,
  ShoppingCart,
  ArrowRight,
  Trash2,
  Edit3,
  Save,
  X,
  PackagePlus
} from 'lucide-react';
import { StockIssueModal } from './StockIssueModal';

export const WarehouseStockManager: React.FC = () => {
  const { 
    stock, 
    styles, 
    addStockItem, 
    updateStockItem,
    updateStockQuantity,
    deleteStockItem,
    currentUser, 
    lowStockItems, 
    openPrintModal,
    requisitionCart,
    addToRequisitionCart
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStyleFilter, setSelectedStyleFilter] = useState<string>('ALL');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [onlyLowStock, setOnlyLowStock] = useState<boolean>(false);
  const [quickToast, setQuickToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modals & Form visibility state
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [selectedItemForIssue, setSelectedItemForIssue] = useState<StockItem | null>(null);
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const [showInlineInputForm, setShowInlineInputForm] = useState<boolean>(stock.length === 0);

  // New stock form state
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<MaterialCategory>('Kain Utama (Fabric)');
  const [newStyleCode, setNewStyleCode] = useState(styles[0]?.code || 'UMUM');
  const [newQty, setNewQty] = useState<number>(100);
  const [newMinLevel, setNewMinLevel] = useState<number>(20);
  const [newUnit, setNewUnit] = useState<StockItem['unit']>('Yard');
  const [newRack, setNewRack] = useState('Gudang-A / Rak 01');
  const [newUnitPrice, setNewUnitPrice] = useState<number>(0);
  const [newSupplier, setNewSupplier] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Inline Edit & Delete state for existing stock items
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editCode, setEditCode] = useState('');
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState<MaterialCategory>('Kain Utama (Fabric)');
  const [editStyleCode, setEditStyleCode] = useState('');
  const [editStockQty, setEditStockQty] = useState<number>(0);
  const [editMinLevel, setEditMinLevel] = useState<number>(0);
  const [editUnit, setEditUnit] = useState<StockItem['unit']>('Yard');
  const [editRack, setEditRack] = useState('');
  const [editUnitPrice, setEditUnitPrice] = useState<number>(0);
  const [editSupplier, setEditSupplier] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (styles.length > 0 && (!newStyleCode || newStyleCode === 'UMUM')) {
      setNewStyleCode(styles[0].code);
    }
  }, [styles, newStyleCode]);

  // Siapa saja yang memiliki akun dan login dapat mengakses & menginput stok gudang
  const canInputStock = Boolean(currentUser);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setQuickToast({ message, type });
    setTimeout(() => setQuickToast(null), 3200);
  };

  // Grouping items by style & filters
  const filteredStock = stock.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.supplier || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.styleCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStyle = selectedStyleFilter === 'ALL' || item.styleCode === selectedStyleFilter;
    const matchesCategory = selectedCategoryFilter === 'ALL' || item.category === selectedCategoryFilter;
    const matchesLowStock = !onlyLowStock || item.currentStock <= item.minStockLevel;

    return matchesSearch && matchesStyle && matchesCategory && matchesLowStock;
  });

  // Calculate stats
  const totalValue = stock.reduce((sum, item) => sum + (item.currentStock * item.unitPrice), 0);
  const lowStockCount = lowStockItems.length;

  const handleOpenIssueModal = (item: StockItem | null = null) => {
    setSelectedItemForIssue(item);
    setIsIssueModalOpen(true);
  };

  const handleQuickAddToCart = (item: StockItem) => {
    if (requisitionCart.length > 0 && requisitionCart[0].styleCode !== item.styleCode) {
      showToast(
        `Ditolak: Keranjang saat ini untuk Style ${requisitionCart[0].styleCode}. Sesuai aturan, pengambilan bahan tidak boleh lintas style!`,
        'error'
      );
      return;
    }

    const defaultQty = Math.min(10, item.currentStock);
    if (defaultQty <= 0) {
      showToast(`Stok ${item.name} habis (0 ${item.unit})!`, 'error');
      return;
    }

    const res = addToRequisitionCart(item, defaultQty);
    showToast(res.message, res.success ? 'success' : 'error');
  };

  const handleCreateNewStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      showToast('Nama bahan baku wajib diisi!', 'error');
      return;
    }

    const generatedCode = newCode.trim()
      ? newCode.trim().toUpperCase()
      : `SKU-${(newStyleCode || 'TW').replace(/[^A-Z0-9]/gi, '').slice(0, 6).toUpperCase()}-${String(stock.length + 1).padStart(3, '0')}`;
    const targetStyleCode = newStyleCode.trim().toUpperCase() || styles[0]?.code || 'UMUM';
    const matchedStyle = styles.find(s => s.code.toUpperCase() === targetStyleCode);

    addStockItem({
      code: generatedCode,
      name: newName.trim(),
      category: newCategory,
      styleCode: targetStyleCode,
      styleName: matchedStyle ? matchedStyle.name : targetStyleCode,
      currentStock: Math.max(0, Number(newQty) || 0),
      minStockLevel: Math.max(0, Number(newMinLevel) || 0),
      unit: newUnit,
      rackLocation: newRack.trim() || 'Gudang Utama',
      unitPrice: Math.max(0, Number(newUnitPrice) || 0),
      supplier: newSupplier.trim() || '-',
      notes: newNotes.trim()
    });

    setIsAddStockModalOpen(false);
    setNewCode('');
    setNewName('');
    setNewQty(100);
    setNewNotes('');
    showToast(`Tersimpan! Stok "${newName.trim()}" (${newQty} ${newUnit}) berhasil diinput & disimpan oleh ${currentUser.name}.`, 'success');
  };

  const handleStartEdit = (item: StockItem) => {
    setEditingItemId(item.id);
    setConfirmDeleteId(null);
    setEditCode(item.code);
    setEditName(item.name);
    setEditCategory(item.category);
    setEditStyleCode(item.styleCode);
    setEditStockQty(item.currentStock);
    setEditMinLevel(item.minStockLevel);
    setEditUnit(item.unit);
    setEditRack(item.rackLocation);
    setEditUnitPrice(item.unitPrice);
    setEditSupplier(item.supplier || '');
  };

  const handleSaveEdit = (id: string) => {
    if (!editName.trim() || !editCode.trim()) {
      showToast('Kode SKU dan Nama Bahan wajib diisi!', 'error');
      return;
    }
    const matchedStyle = styles.find(s => s.code.toUpperCase() === editStyleCode.trim().toUpperCase());
    updateStockItem(id, {
      code: editCode.trim().toUpperCase(),
      name: editName.trim(),
      category: editCategory,
      styleCode: editStyleCode.trim().toUpperCase() || 'UMUM',
      styleName: matchedStyle ? matchedStyle.name : editStyleCode.trim().toUpperCase(),
      currentStock: Math.max(0, Number(editStockQty) || 0),
      minStockLevel: Math.max(0, Number(editMinLevel) || 0),
      unit: editUnit,
      rackLocation: editRack.trim() || 'Gudang Utama',
      unitPrice: Math.max(0, Number(editUnitPrice) || 0),
      supplier: editSupplier.trim() || '-'
    });
    setEditingItemId(null);
    showToast(`Perubahan stok "${editName.trim()}" berhasil disimpan!`, 'success');
  };

  const handleDeleteStock = (item: StockItem) => {
    deleteStockItem(item.id);
    setConfirmDeleteId(null);
    showToast(`Item stok "${item.name}" telah dihapus dari Gudang.`, 'success');
  };

  return (
    <div className="space-y-4 relative pb-16">
      
      {/* Toast Notification */}
      {quickToast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-4 duration-200 ${
          quickToast.type === 'success' 
            ? 'bg-emerald-50 text-emerald-900 border-emerald-300' 
            : 'bg-rose-50 text-rose-900 border-rose-300'
        }`}>
          {quickToast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
          <span>{quickToast.message}</span>
        </div>
      )}

      {/* Compact Header, KPI Summary & Filter Bar Unified */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Warehouse className="w-4 h-4 text-blue-700" />
              <span>Stok Gudang ({filteredStock.length})</span>
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-500 tabular-nums">
              <span>Valuasi: <strong className="text-emerald-700">Rp {totalValue.toLocaleString('id-ID')}</strong></span>
              <span>·</span>
              <button
                type="button"
                onClick={() => setOnlyLowStock(!onlyLowStock)}
                className={`font-bold cursor-pointer ${lowStockCount > 0 ? 'text-rose-600 underline' : 'text-slate-600'}`}
              >
                {lowStockCount} Menipis
              </button>
              <span>·</span>
              <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-semibold">
                Auto-Save Aktif ({currentUser.name})
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {canInputStock && (
              <button
                onClick={() => setShowInlineInputForm(!showInlineInputForm)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showInlineInputForm ? 'Tutup Form Input' : 'Input Stok Gudang'}</span>
              </button>
            )}

            <button
              onClick={() => handleOpenIssueModal(null)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                requisitionCart.length > 0 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Keranjang ({requisitionCart.length})</span>
            </button>

            <button
              onClick={() => openPrintModal('warehouse-stock')}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              title="Cetak PDF"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Compact Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-2 border-t border-slate-100">
          <div className="sm:col-span-5 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari bahan / kode SKU / style..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={selectedStyleFilter}
              onChange={(e) => setSelectedStyleFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 bg-white"
            >
              <option value="ALL">Semua Style</option>
              {styles.map(s => (
                <option key={s.id} value={s.code}>
                  {s.code} — {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 bg-white"
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
      </div>

      {/* Direct Input Stock Panel (Accessible by any logged-in account & auto-saved) */}
      {showInlineInputForm && (
        <div className="bg-white rounded-xl p-5 border-2 border-blue-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center">
                <PackagePlus className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900">Form Input Stok Gudang</h2>
                <p className="text-[11px] text-slate-500">
                  Diinput oleh <strong>{currentUser.name} ({currentUser.role})</strong> — data yang diinput langsung tersimpan otomatis.
                </p>
              </div>
            </div>
            {stock.length > 0 && (
              <button
                type="button"
                onClick={() => setShowInlineInputForm(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <form onSubmit={handleCreateNewStock} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Kode Bahan / SKU (Opsional)</label>
              <input
                type="text"
                placeholder="Otomatis jika dikosongkan"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold uppercase focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Nama Bahan Baku / Material *</label>
              <input
                type="text"
                required
                placeholder="Contoh: Kain Cotton Twill Navy / Benang Jahit 40/2 / Zipper YKK"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Kategori Material *</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as MaterialCategory)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium bg-white"
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
              <label className="block font-bold text-slate-700 mb-1">Alokasi Model / Style *</label>
              {styles.length > 0 ? (
                <select
                  value={newStyleCode}
                  onChange={(e) => setNewStyleCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold text-blue-700 bg-white"
                >
                  {styles.map(s => (
                    <option key={s.id} value={s.code}>
                      {s.code} — {s.name}
                    </option>
                  ))}
                  <option value="UMUM">UMUM (Stok Reguler Gudang)</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={newStyleCode}
                  onChange={(e) => setNewStyleCode(e.target.value.toUpperCase())}
                  placeholder="Kode Style (misal: TW-01)"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-blue-700 uppercase"
                />
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Jumlah Stok Masuk *</label>
              <div className="flex gap-1.5">
                <input
                  type="number"
                  min="0"
                  required
                  value={newQty}
                  onChange={(e) => setNewQty(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold text-slate-900"
                />
                <select
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value as StockItem['unit'])}
                  className="px-2.5 py-2 rounded-lg border border-slate-300 font-bold bg-slate-50"
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

            <div>
              <label className="block font-bold text-slate-700 mb-1">Batas Min. Alert &amp; Harga (Rp)</label>
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="number"
                  min="0"
                  placeholder="Min Stok"
                  value={newMinLevel}
                  onChange={(e) => setNewMinLevel(Number(e.target.value))}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-300 font-semibold text-rose-600"
                  title="Batas Minimum Stok"
                />
                <input
                  type="number"
                  min="0"
                  placeholder="Harga Rp"
                  value={newUnitPrice || ''}
                  onChange={(e) => setNewUnitPrice(Number(e.target.value))}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-300 font-semibold text-slate-700"
                  title="Harga Satuan (Rp)"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Lokasi Rak &amp; Supplier</label>
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="text"
                  placeholder="Rak Gudang"
                  value={newRack}
                  onChange={(e) => setNewRack(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-300 font-medium"
                />
                <input
                  type="text"
                  placeholder="Supplier"
                  value={newSupplier}
                  onChange={(e) => setNewSupplier(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-300 font-medium"
                />
              </div>
            </div>

            <div className="sm:col-span-2 lg:col-span-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <input
                type="text"
                placeholder="Catatan tambahan (opsional: nomor surat jalan, lot warna, keterangan)..."
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-blue-600"
              />
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shrink-0"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Stok Gudang</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stock Items Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold text-[11px] border-b border-slate-200">
                <th className="py-2.5 px-3">Bahan Baku</th>
                <th className="py-2.5 px-3">Style</th>
                <th className="py-2.5 px-3 text-right">Stok</th>
                <th className="py-2.5 px-3 text-right">Min</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3">Rak / Supplier</th>
                <th className="py-2.5 px-3 text-center">Ambil</th>
                <th className="py-2.5 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStock.map((item) => {
                const isLow = item.currentStock <= item.minStockLevel;
                const inCart = requisitionCart.find(c => c.stockItemId === item.id);
                const isEditing = editingItemId === item.id;

                if (isEditing) {
                  return (
                    <tr key={item.id} className="bg-blue-50/40">
                      <td className="py-2.5 px-3 space-y-1">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Nama Bahan Baku"
                          className="w-full px-2 py-1 rounded border border-blue-300 bg-white font-bold text-slate-900 text-xs"
                        />
                        <div className="flex gap-1">
                          <input
                            type="text"
                            value={editCode}
                            onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                            placeholder="Kode SKU"
                            className="w-28 px-2 py-1 rounded border border-slate-300 bg-white font-mono text-[11px] uppercase"
                          />
                          <select
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value as MaterialCategory)}
                            className="flex-1 px-2 py-1 rounded border border-slate-300 bg-white text-[11px]"
                          >
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
                      </td>
                      <td className="py-2.5 px-3">
                        <select
                          value={editStyleCode}
                          onChange={(e) => setEditStyleCode(e.target.value)}
                          className="w-full px-2 py-1 rounded border border-slate-300 bg-white font-mono font-bold text-blue-700 text-xs"
                        >
                          {styles.map(s => (
                            <option key={s.id} value={s.code}>{s.code}</option>
                          ))}
                          <option value="UMUM">UMUM</option>
                        </select>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <input
                            type="number"
                            min="0"
                            value={editStockQty}
                            onChange={(e) => setEditStockQty(Number(e.target.value))}
                            className="w-20 px-2 py-1 rounded border border-blue-400 bg-white font-bold text-right text-xs"
                          />
                          <select
                            value={editUnit}
                            onChange={(e) => setEditUnit(e.target.value as StockItem['unit'])}
                            className="px-1.5 py-1 rounded border border-slate-300 bg-white text-[11px]"
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
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <input
                          type="number"
                          min="0"
                          value={editMinLevel}
                          onChange={(e) => setEditMinLevel(Number(e.target.value))}
                          className="w-16 px-2 py-1 rounded border border-slate-300 bg-white text-right text-xs"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="number"
                          min="0"
                          value={editUnitPrice}
                          onChange={(e) => setEditUnitPrice(Number(e.target.value))}
                          placeholder="Harga Rp"
                          className="w-24 px-2 py-1 rounded border border-slate-300 bg-white text-right text-xs"
                          title="Harga Satuan (Rp)"
                        />
                      </td>
                      <td className="py-2.5 px-3 space-y-1">
                        <input
                          type="text"
                          value={editRack}
                          onChange={(e) => setEditRack(e.target.value)}
                          placeholder="Lokasi Rak"
                          className="w-full px-2 py-1 rounded border border-slate-300 bg-white text-[11px]"
                        />
                        <input
                          type="text"
                          value={editSupplier}
                          onChange={(e) => setEditSupplier(e.target.value)}
                          placeholder="Supplier"
                          className="w-full px-2 py-1 rounded border border-slate-300 bg-white text-[11px]"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-center text-[11px] text-slate-400">
                        Mode Edit
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(item.id)}
                            className="px-2.5 py-1 rounded bg-blue-700 hover:bg-blue-800 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                          >
                            <Save className="w-3 h-3" />
                            <span>Save</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingItemId(null)}
                            className="p-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr 
                    key={item.id} 
                    className={`hover:bg-slate-50 transition-colors ${
                      isLow ? 'bg-rose-50/30' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="text-[11px] text-slate-400">
                        <span className="font-mono">{item.code}</span> · {item.category}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700">
                      {item.styleCode}
                    </td>

                    <td className="py-2.5 px-3 text-right tabular-nums whitespace-nowrap">
                      <span className={`font-bold ${isLow ? 'text-rose-600' : 'text-slate-900'}`}>
                        {item.currentStock.toLocaleString()}
                      </span>{' '}
                      <span className="text-slate-400 text-[11px]">{item.unit}</span>
                    </td>

                    <td className="py-2.5 px-3 text-right text-slate-500 tabular-nums whitespace-nowrap">
                      {item.minStockLevel.toLocaleString()}
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      {isLow ? (
                        <span className="font-bold text-rose-600">Menipis</span>
                      ) : (
                        <span className="font-semibold text-emerald-600">Aman</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                      <div>{item.rackLocation}</div>
                      {item.supplier && item.supplier !== '-' && (
                        <div className="text-[10px] text-slate-400">{item.supplier}</div>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {inCart && (
                          <span className="text-[11px] font-bold text-blue-700 tabular-nums">
                            ✓ {inCart.quantityToIssue}
                          </span>
                        )}
                        <button
                          onClick={() => handleQuickAddToCart(item)}
                          disabled={item.currentStock <= 0}
                          className="px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 disabled:bg-slate-100 text-blue-700 disabled:text-slate-400 font-semibold text-xs cursor-pointer"
                        >
                          + Keranjang
                        </button>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      {confirmDeleteId === item.id ? (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleDeleteStock(item)}
                            className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold cursor-pointer"
                          >
                            Hapus
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold cursor-pointer"
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(item)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 transition-colors cursor-pointer"
                            title="Edit Stok"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(item.id)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Hapus Item Stok"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredStock.length === 0 && (
          <div className="py-12 px-4 text-center space-y-3">
            <div className="text-slate-500 font-bold text-xs">
              Stok gudang masih kosong — silakan input stok bahan baku di atas.
            </div>
            {!showInlineInputForm && (
              <button
                type="button"
                onClick={() => setShowInlineInputForm(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Input Stok Gudang Sekarang</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* FLOATING REQUISITION CART BAR */}
      {requisitionCart.length > 0 && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center justify-between gap-4 max-w-xl w-[92%] animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>{requisitionCart.length} Bahan di Keranjang</span>
                <span className="px-1.5 py-0.2 rounded bg-blue-500/30 text-blue-300 text-[10px] font-mono font-bold">
                  {requisitionCart[0].styleCode}
                </span>
              </div>
              <div className="text-[11px] text-slate-300 truncate">
                {requisitionCart.map(c => c.itemName).join(', ')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleOpenIssueModal(null)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-transform active:scale-95"
            >
              <span>Ajukan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Modal: Keluar / Ambil Bahan (with cross-style check & PIC accountability) */}
      <StockIssueModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        preselectedItem={selectedItemForIssue}
      />

    </div>
  );
};
