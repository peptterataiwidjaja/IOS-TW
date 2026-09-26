import React from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { 
  ShieldCheck, 
  User, 
  Warehouse, 
  Layers, 
  Cpu, 
  Factory, 
  Truck, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Settings2,
  KeyRound,
  UserPlus
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, setCurrentUser, users, setIsUserAccessModalOpen, setActiveTab } = useApp();

  if (!isOpen) return null;

  const handleSelectRole = (userId: string) => {
    const selected = users.find(u => u.id === userId);
    if (selected) {
      setCurrentUser(selected);
      if (selected.role === 'SUBCON') {
        setActiveTab('subcon');
      }
      onClose();
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'PE':
        return 'bg-red-600 text-white';
      case 'WAREHOUSE':
        return 'bg-blue-600 text-white';
      case 'FACTORY_MANAGER':
        return 'bg-purple-600 text-white';
      case 'PPIC':
        return 'bg-emerald-600 text-white';
      case 'PRODUCTION':
        return 'bg-amber-600 text-white';
      case 'SUBCON':
        return 'bg-cyan-600 text-white';
      default:
        return 'bg-slate-600 text-white';
    }
  };

  const getRolePermissionSummary = (role: UserRole) => {
    switch (role) {
      case 'PE':
        return {
          title: 'Production Engineer (PE)',
          desc: 'Hak akses administratif penuh: Mengatur nama pengguna, alokasi akses menu bar, SOP 14 tahap, breakdown mesin RnD, dan verifikasi pilot.',
          badge: 'Super Admin & Engineering Lead'
        };
      case 'WAREHOUSE':
        return {
          title: 'Gudang (Warehouse)',
          desc: 'Berhak memasukkan stok bahan baku baru, memantau batas stok minimum, mencatat serah terima barang ke cutting/sewing, & cek alokasi style.',
          badge: 'Input & Mutasi Stok Bahan'
        };
      case 'FACTORY_MANAGER':
        return {
          title: 'Factory Manager (FM)',
          desc: 'Otoritas tertinggi pabrik. Berwenang mengecek & menyetujui pencairan dana kas operasional, audit transaksi, dan memantau performa KPI.',
          badge: 'Cek Dana & Approval Tertinggi'
        };
      case 'PPIC':
        return {
          title: 'PPIC & Inventory Control',
          desc: 'Berwenang mengambil data stok untuk perencanaan produksi akurat (MRP), penjadwalan PPM, dan pengawasan pemakaian bahan per style.',
          badge: 'Perencanaan & Tarik Data Stok'
        };
      case 'PRODUCTION':
        return {
          title: 'Produksi (Cutting & Sewing)',
          desc: 'Menerima material dari gudang, update progress gelar & potong, loading komponen, sewing line output, dan QC hasil produksi.',
          badge: 'Pelaksana Produksi Floor'
        };
      case 'SUBCON':
        return {
          title: 'Mitra Subkon (Bordir/Sablon/Wash)',
          desc: 'Menerima panel komponen, update status pengerjaan bordir/sablon/wash, laporan lead time & defect sebelum kembali ke pabrik.',
          badge: 'Pekerjaan Luar Pabrik'
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header: White bg with Blue & Red Accents */}
        <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-red-600 p-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 text-white/80 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white text-blue-800 border-2 border-red-500 flex items-center justify-center font-black text-lg shadow-sm">
              TW
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">Portal Akses Wewenang Operasional</h2>
              <p className="text-xs text-blue-100">PT Teratai Widjaja — Garment Operations Management System</p>
            </div>
          </div>
          <p className="text-xs text-blue-50 mt-2 bg-blue-900/40 p-2.5 rounded-lg border border-blue-400/30 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-300 shrink-0 mt-0.5" />
            <span>
              Hak akses penuh dipegang oleh <strong>Production Engineer (PE)</strong> untuk mengonfigurasi nama pengguna dan izin menu bar setiap departemen.
            </span>
          </p>
        </div>

        {/* Roles Grid (NO PHOTOS: initials monogram) */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-3 bg-white">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pilih Akun / Peran Kerja
            </div>

            {currentUser.role === 'PE' && (
              <button
                onClick={() => {
                  onClose();
                  setIsUserAccessModalOpen(true);
                }}
                className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1.5 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 cursor-pointer shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Tambah &amp; Atur Akun (PE)</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {users.map((user) => {
              const info = getRolePermissionSummary(user.role);
              const isCurrent = currentUser.id === user.id;

              // Initials monogram (No photos)
              const initials = user.name
                .split(' ')
                .map(n => n[0])
                .filter(Boolean)
                .slice(0, 2)
                .join('')
                .toUpperCase();

              return (
                <button
                  key={user.id}
                  onClick={() => handleSelectRole(user.id)}
                  className={`text-left p-3.5 rounded-xl border transition-all relative flex flex-col justify-between cursor-pointer ${
                    isCurrent 
                      ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-2 ring-blue-500/20' 
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {isCurrent && (
                    <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-blue-600" />
                      Aktif
                    </span>
                  )}

                  <div>
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shadow-xs ${getRoleBadge(user.role)}`}>
                        {initials}
                      </div>
                      <div className="min-w-0 pr-12">
                        <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-1">
                          <span>{user.name}</span>
                          {user.role === 'PE' && (
                            <span className="text-[8px] px-1 py-0.2 rounded bg-red-100 text-red-700 font-extrabold border border-red-200">
                              ADMIN
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-blue-700 font-semibold">{info.title}</div>
                      </div>
                    </div>
                    
                    <p className="text-[11px] text-slate-600 leading-relaxed mb-3 line-clamp-2">
                      {info.desc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                      {info.badge}
                    </span>
                    <span className="font-bold text-blue-700 group-hover:underline">
                      Pilih &rarr;
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Otorisasi Hak Akses Berbasis Role (RBAC) PT Teratai Widjaja</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
