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
  Printer,
  ShoppingCart,
  ArrowRight,
  Trash2
} from 'lucide-react';
import { StockIssueModal } from './StockIssueModal';

export const WarehouseStockManager: React.FC = () => {
  const { 
    stock, 
    styles, 
    currentStyle,
    addStockItem, 
    currentUser, 
    setActiveTab, 
    lowStockItems, 
    openPrintModal,
    requisitionCart,
    addToRequisitionCart,
    clearRequisitionCart
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStyleFilter, setSelectedStyleFilter] = useState<string>('ALL');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [onlyLowStock, setOnlyLowStock] = useState<boolean>(false);
  const [quickToast, setQuickToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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

  const handleOpenIssueModal = (item: StockItem | null = null) => {
    setSelectedItemForIssue(item);
    setIsIssueModalOpen(true);
  };

  const handleQuickAddToCart = (item: StockItem) => {
    // If cart has items from different style, block with clear toast
    if (requisitionCart.length > 0 && requisitionCart[0].styleCode !== item.styleCode) {
      setQuickToast({
        message: `Ditolak: Keranjang saat ini untuk Style ${requisitionCart[0].styleCode}. Sesuai aturan, pengambilan bahan tidak boleh lintas style!`,
        type: 'error'
      });
      setTimeout(() => setQuickToast(null), 3500);
      return;
    }

    const defaultQty = Math.min(10, item.currentStock);
    if (defaultQty <= 0) {
      setQuickToast({ message: `Stok ${item.name} habis (0 ${item.unit})!`, type: 'error' });
      setTimeout(() => setQuickToast(null), 2500);
      return;
    }

    const res = addToRequisitionCart(item, defaultQty);
    if (res.success) {
      setQuickToast({ message: res.message, type: 'success' });
      setTimeout(() => setQuickToast(null), 2500);
    } else {
      setQuickToast({ message: res.message, type: 'error' });
      setTimeout(() => setQuickToast(null), 3000);
    }
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
    <div className="space-y-6 relative pb-16">
      
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
            <h1 className="text-base font-bold text-slate-900">
              Stok Gudang ({filteredStock.length})
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
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
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

            {canInputStock && (
              <button
                onClick={() => setIsAddStockModalOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Stok Masuk</span>
              </button>
            )}

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
              placeholder="Cari bahan / kode..."
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
                <th className="py-2.5 px-3">Rak</th>
                <th className="py-2.5 px-3 text-center">Ambil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStock.map((item) => {
                const isLow = item.currentStock <= item.minStockLevel;
                const inCart = requisitionCart.find(c => c.stockItemId === item.id);

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
                      {item.rackLocation}
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredStock.length === 0 && (
          <div className="py-10 text-center text-slate-400 text-xs">
            Tidak ada bahan baku.
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
