import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ClipboardCheck, 
  Warehouse, 
  Layers, 
  Truck, 
  FileText, 
  Table2, 
  BarChart3, 
  Bell, 
  AlertTriangle, 
  Layers2, 
  ShieldCheck,
  Printer,
  Camera,
  PlusCircle,
  UserCheck,
  LogOut
} from 'lucide-react';
import { LoginModal } from './LoginModal';

export const Navbar: React.FC = () => {
  const { 
    currentUser, 
    styles, 
    selectedStyleId, 
    setSelectedStyleId, 
    lowStockItems, 
    pendingCashFlowCount, 
    subconWarnings,
    activeTab, 
    setActiveTab,
    isTabAllowed,
    setIsLoginModalOpen,
    logout,
    companyLogo,
    setCompanyLogo,
    openPrintModal,
    requisitionCart
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedStyle = styles.find(s => s.id === selectedStyleId) || styles[0];

  const allNavItems = [
    { id: 'new-style', label: 'Input Model Baru', icon: PlusCircle },
    { id: 'pe-workflow', label: 'Alur SOP', icon: ClipboardCheck },
    { id: 'ppic-planning', label: 'PPIC & BOM', icon: Layers },
    { 
      id: 'warehouse-stock', 
      label: 'Stok Gudang', 
      icon: Warehouse, 
      badge: requisitionCart.length > 0 
        ? `${requisitionCart.length} Keranjang` 
        : lowStockItems.length > 0 
        ? `${lowStockItems.length}` 
        : undefined,
      badgeColor: requisitionCart.length > 0 ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'
    },
    { 
      id: 'subcon', 
      label: currentUser.role === 'SUBCON' ? 'Portal Input Harian Subkon' : 'Mitra Subkon', 
      icon: Truck,
      badge: currentUser.role !== 'SUBCON' && subconWarnings.length > 0 ? `${subconWarnings.length} Warning H-3` : undefined,
      badgeColor: 'bg-red-600 text-white'
    },
    { id: 'transactions', label: 'Riwayat Mutasi', icon: FileText },
    { id: 'spreadsheet', label: 'Spreadsheet', icon: Table2 },
    { id: 'analytics', label: 'Analitik', icon: BarChart3 },
    { id: 'user-access', label: 'Akses Akun', icon: ShieldCheck },
  ];

  // Filter navigation items strictly according to user permissions
  const visibleNavItems = allNavItems.filter(item => isTabAllowed(item.id));

  // Handle Logo Upload from Image File
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setCompanyLogo(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-2xs font-sans">
      {/* Compact Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          
          {/* Left: Logo & Company Title */}
          <div className="flex items-center gap-2.5 shrink-0">
            <input 
              type="file" 
              ref={fileInputRef}
              accept="image/*"
              onChange={handleLogoFileChange}
              className="hidden"
            />

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative group cursor-pointer"
              title="Klik untuk mengganti logo perusahaan"
            >
              {companyLogo ? (
                <div className="h-9 px-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden hover:border-blue-500 transition-colors">
                  <img 
                    src={companyLogo} 
                    alt="Logo Perusahaan" 
                    className="h-7 max-w-[100px] object-contain"
                  />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-lg bg-blue-700 text-white flex items-center justify-center font-black text-sm shadow-2xs border-2 border-red-500">
                  TW
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            <div>
              <div className="text-sm font-black tracking-tight text-slate-900 leading-tight">
                PT TERATAI WIDJAJA
              </div>
              <p className="text-[11px] text-slate-500">
                Sistem Operasional Produksi &amp; Gudang
              </p>
            </div>
          </div>

          {/* Center: Compact Active Style Selector + Quick Add Style Button (Hidden for SUBCON) */}
          {currentUser.role !== 'SUBCON' && (
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
              <Layers2 className="w-3.5 h-3.5 text-blue-700 shrink-0" />
              <span className="text-[11px] text-slate-500 hidden md:inline font-medium">Style Aktif:</span>
              <select
                value={selectedStyleId}
                onChange={(e) => setSelectedStyleId(e.target.value)}
                className="bg-white text-xs font-bold text-slate-900 border border-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer max-w-[170px] sm:max-w-[240px] truncate"
              >
                {styles.map(style => (
                  <option key={style.id} value={style.id}>
                    {style.code} — {style.name} ({style.targetQuantityPcs.toLocaleString()} pcs)
                  </option>
                ))}
              </select>
              {isTabAllowed('new-style') && (
                <button
                  type="button"
                  onClick={() => setActiveTab('new-style')}
                  className="px-2 py-1 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                  title="Tambah Model / Style Produksi Baru"
                >
                  <PlusCircle className="w-3 h-3" />
                  <span className="hidden sm:inline">+ Model</span>
                </button>
              )}
            </div>
          )}

          {/* Right: User Account Switcher, Print PDF & Notifications */}
          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={() => setIsLoginModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-700 transition-colors cursor-pointer"
              title="Ganti Akun Pengguna (User & Password)"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-700" />
              <span className="font-bold text-slate-900 max-w-[110px] truncate hidden sm:inline">{currentUser.name}</span>
              <span className="text-[11px] text-blue-700 font-semibold">({currentUser.role})</span>
            </button>

            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-bold text-red-700 transition-colors cursor-pointer"
              title="Keluar ke Layar Login"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Keluar</span>
            </button>

            {currentUser.role !== 'SUBCON' && (
              <>
                <button
                  onClick={() => openPrintModal(activeTab)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all cursor-pointer"
                  title="Cetak dokumen PDF"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-300" />
                  <span className="hidden sm:inline">Cetak PDF</span>
                </button>

                {/* Notification Bell (Only for Internal Accounts, NOT for SUBCON) */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                    title="Notifikasi Warning Subkon H-3 & Stok Gudang"
                  >
                    <Bell className="w-4 h-4 text-slate-600" />
                    {(subconWarnings.length > 0 || lowStockItems.length > 0 || pendingCashFlowCount > 0) && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                        {subconWarnings.length + lowStockItems.length}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                      <div className="p-2.5 bg-slate-900 text-white flex items-center justify-between text-xs font-bold">
                        <span>Peringatan Sistem &amp; Warning H-3</span>
                        <span className="text-[11px] text-amber-300">
                          {subconWarnings.length} Subkon • {lowStockItems.length} Stok
                        </span>
                      </div>

                      <div className="p-2.5 max-h-80 overflow-y-auto space-y-2 text-xs">
                        {subconWarnings.length > 0 && (
                          <div className="space-y-1.5">
                            <div className="text-[10px] font-extrabold uppercase tracking-wider text-red-700 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Warning Subkon (H-3 Sebelum Target)</span>
                            </div>
                            {subconWarnings.map(w => (
                              <div
                                key={w.taskId}
                                onClick={() => { setActiveTab('subcon'); setShowNotifications(false); }}
                                className="p-2.5 rounded-lg bg-amber-50 border border-amber-300 hover:bg-amber-100 cursor-pointer transition-colors"
                              >
                                <div className="font-black text-slate-900 flex items-center justify-between gap-2">
                                  <span className="truncate">{w.subconName} ({w.styleCode})</span>
                                  <span className="px-1.5 py-0.5 rounded bg-red-600 text-white text-[10px] font-black shrink-0">
                                    {w.daysUntilDeadline < 0 ? `Telat ${Math.abs(w.daysUntilDeadline)} Hr` : `H-${w.daysUntilDeadline}`}
                                  </span>
                                </div>
                                <div className="text-[11px] text-amber-900 mt-1 leading-snug">
                                  {w.reasons[0]}
                                </div>
                                <div className="text-[10px] text-slate-600 flex justify-between mt-1 font-semibold">
                                  <span>Aktual: {w.avgActualDailyPcs}/{w.dailyTargetPcs} pcs/hr</span>
                                  <span className="text-red-700">Sisa: {w.remainingQty} pcs</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {lowStockItems.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                              Stok Gudang Menipis
                            </div>
                            {lowStockItems.map(item => (
                              <div 
                                key={item.id} 
                                onClick={() => { setActiveTab('warehouse-stock'); setShowNotifications(false); }}
                                className="p-2 rounded-lg bg-rose-50/70 border border-rose-200 hover:bg-rose-100 cursor-pointer transition-colors"
                              >
                                <div className="font-bold text-slate-900 flex justify-between">
                                  <span className="truncate">{item.name}</span>
                                  <span className="text-rose-600 font-bold shrink-0">{item.currentStock} {item.unit}</span>
                                </div>
                                <div className="text-[11px] text-slate-500 flex justify-between mt-0.5">
                                  <span>Style: {item.styleCode}</span>
                                  <span>Min: {item.minStockLevel} {item.unit}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {subconWarnings.length === 0 && lowStockItems.length === 0 && (
                          <div className="py-5 text-center text-slate-400">
                            Semua jadwal subkon &amp; stok gudang dalam kondisi aman.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

        </div>
      </div>

      {/* Bottom Bar: Clean, Compact Tab Navigation */}
      <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center space-x-1 py-1">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-blue-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
                    isActive ? 'bg-white/20 text-white' : item.badgeColor
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <LoginModal
        isOpen={useApp().isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </header>
  );
};
