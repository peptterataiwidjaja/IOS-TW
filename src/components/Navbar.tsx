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
  ChevronDown, 
  AlertTriangle, 
  Layers2, 
  ShieldCheck,
  Printer,
  Upload,
  Camera,
  RotateCcw
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
    activeTab, 
    setActiveTab,
    isTabAllowed,
    setIsLoginModalOpen,
    companyLogo,
    setCompanyLogo,
    openPrintModal
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedStyle = styles.find(s => s.id === selectedStyleId) || styles[0];

  const allNavItems = [
    { id: 'pe-workflow', label: '1. Alur SOP & PE', icon: ClipboardCheck, badge: '14 Tahap' },
    { id: 'ppic-planning', label: '2. Perencanaan PPIC & BOM', icon: Layers, badge: 'BOM & Bahan' },
    { id: 'warehouse-stock', label: '3. Stok Gudang', icon: Warehouse, badge: lowStockItems.length > 0 ? `${lowStockItems.length} Menipis` : undefined, badgeColor: 'bg-red-600 text-white' },
    { id: 'subcon', label: '4. Mitra Subkon', icon: Truck },
    { id: 'transactions', label: '5. Transaksi & PIC', icon: FileText },
    { id: 'spreadsheet', label: '6. Google Spreadsheet', icon: Table2, badge: 'XLSX' },
    { id: 'analytics', label: '7. Analitik & KPI', icon: BarChart3 },
    { id: 'user-access', label: '8. Akses & Akun', icon: ShieldCheck, badge: 'Profil & Hak Akses', badgeColor: 'bg-blue-600 text-white' },
  ];

  // Filter navigation items strictly according to user permissions
  const visibleNavItems = allNavItems.filter(item => isTabAllowed(item.id));

  // Handle Logo Upload from Image File
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Mohon pilih file gambar yang valid (PNG, JPG, SVG, WebP).');
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
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs font-sans">
      {/* Top Bar: Clean, uncluttered header without "Input Model Baru", Spreadsheet or Akun buttons */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between gap-4">
          
          {/* Left: Logo (with instant image upload feature) & Company Title */}
          <div className="flex items-center gap-3 shrink-0">
            
            {/* Hidden file input for logo replacement */}
            <input 
              type="file" 
              ref={fileInputRef}
              accept="image/*"
              onChange={handleLogoFileChange}
              className="hidden"
            />

            {/* Logo Container with upload trigger on click/hover */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative group cursor-pointer"
              title="Klik untuk mengganti logo perusahaan (Upload gambar)"
            >
              {companyLogo ? (
                <div className="h-10 px-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden hover:border-blue-500 transition-colors">
                  <img 
                    src={companyLogo} 
                    alt="Logo Perusahaan" 
                    className="h-8 max-w-[120px] object-contain"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center font-black text-lg shadow-sm border-2 border-red-500 hover:border-blue-400 transition-colors">
                  TW
                </div>
              )}

              {/* Hover overlay hint for image upload */}
              <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-4 h-4 text-white" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-tight text-slate-900 leading-tight">
                  PT TERATAI WIDJAJA
                </span>
                <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                  GARMENT
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Sistem Terpadu Operasional Produksi &amp; PPIC
              </p>
            </div>
          </div>

          {/* Center: Style Selector dropdown */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
              <Layers2 className="w-4 h-4 text-blue-700 shrink-0" />
              <div className="text-xs text-slate-500 shrink-0 hidden md:block font-medium">Model / Style:</div>
              <select
                value={selectedStyleId}
                onChange={(e) => setSelectedStyleId(e.target.value)}
                className="bg-white text-xs font-bold text-slate-900 border border-slate-300 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer max-w-[180px] sm:max-w-xs truncate"
              >
                {styles.map(style => (
                  <option key={style.id} value={style.id}>
                    {style.code} — {style.name} ({style.targetQuantityPcs.toLocaleString()} pcs)
                  </option>
                ))}
              </select>
              <div className="hidden lg:flex items-center gap-1.5 ml-1 pl-2 border-l border-slate-200 text-[11px] text-slate-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Buyer: <strong className="text-slate-800">{selectedStyle?.buyer}</strong></span>
              </div>
            </div>
          </div>

          {/* Right: Quick Print PDF Button & Notifications Bell */}
          <div className="flex items-center gap-2 justify-end">
            
            {/* Direct Print to PDF Button for currently active bar */}
            <button
              onClick={() => openPrintModal(activeTab)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              title="Cetak dokumen PDF data penting hitam-putih untuk bar yang sedang aktif"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              <span className="hidden sm:inline">Cetak PDF</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                title="Pusat Notifikasi Stok & Perencanaan"
              >
                <Bell className="w-4 h-4 text-slate-600" />
                {(lowStockItems.length > 0 || pendingCashFlowCount > 0) && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                    {lowStockItems.length + pendingCashFlowCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-slate-800 rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                  <div className="p-3 bg-blue-700 text-white flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-yellow-300" />
                      Notifikasi Otomatis
                    </span>
                    <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full font-bold">
                      {lowStockItems.length} Perlu Perhatian
                    </span>
                  </div>

                  <div className="p-3 max-h-72 overflow-y-auto space-y-2 text-xs">
                    {lowStockItems.length > 0 ? (
                      <div className="space-y-1.5">
                        <div className="font-bold text-red-600 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Stok Menipis / Defisit ({lowStockItems.length} Item):
                        </div>
                        {lowStockItems.map(item => (
                          <div 
                            key={item.id} 
                            onClick={() => { setActiveTab('warehouse-stock'); setShowNotifications(false); }}
                            className="p-2 rounded-lg bg-red-50 border border-red-200 hover:bg-red-100 cursor-pointer transition-colors text-slate-700"
                          >
                            <div className="font-bold text-slate-900 flex justify-between">
                              <span>{item.name}</span>
                              <span className="text-red-600 font-bold">{item.currentStock} {item.unit}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 flex justify-between mt-0.5">
                              <span>Style: {item.styleCode}</span>
                              <span>Batas Min: {item.minStockLevel} {item.unit}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-6 text-center text-slate-400">
                        Semua stok gudang dan alokasi komponen produksi dalam kondisi optimal.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Bottom Bar: Clean Tab Navigation with Dedicated "Bar Akses" containing Akun & Spreadsheet */}
      <div className="bg-slate-50/90 border-t border-slate-200 px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-thin">
        <div className="max-w-7xl mx-auto flex items-center justify-between py-1.5 gap-2">
          
          <div className="flex space-x-1.5 overflow-x-auto scrollbar-none py-0.5">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-700 text-white shadow-sm border-t-2 border-red-500'
                      : 'text-slate-600 hover:text-blue-700 hover:bg-white border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                      item.badgeColor || (isActive ? 'bg-blue-800 text-blue-100' : 'bg-slate-200 text-slate-700')
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* Login / Switch Account Modal */}
      <LoginModal
        isOpen={useApp().isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </header>
  );
};
