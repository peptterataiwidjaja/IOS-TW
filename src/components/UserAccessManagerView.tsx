import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ALL_NAV_TABS } from '../data/initialData';
import { UserRole } from '../types';
import { 
  ShieldCheck, 
  KeyRound, 
  Lock, 
  Eye, 
  EyeOff, 
  Save, 
  RefreshCw, 
  UserCheck, 
  UserPlus, 
  Edit2, 
  Trash2, 
  Check, 
  AlertCircle, 
  Users, 
  Building2,
  Briefcase,
  CheckCircle2,
  Sparkles,
  FileSpreadsheet,
  Printer,
  Upload,
  Camera,
  RotateCcw,
  ExternalLink,
  CheckCircle,
  Clock,
  LogOut,
  Image as ImageIcon
} from 'lucide-react';

export const UserAccessManagerView: React.FC = () => {
  const { 
    users, 
    currentUser, 
    updateUserName, 
    updateUserPermissions,
    updateUserPassword,
    addNewUser,
    deleteUser,
    setActiveTab,
    setIsLoginModalOpen,
    logout,
    companyLogo,
    setCompanyLogo,
    gasUrl,
    setGasUrl,
    lastSyncedGas,
    syncToGoogleScript,
    openPrintModal
  } = useApp();

  const isPE = currentUser.role === 'PE';

  // Navigation sub-tabs inside Akses & Akun
  const [mainSubTab, setMainSubTab] = useState<'profile' | 'spreadsheet' | 'logo' | 'pe-permissions'>('profile');

  // Sub-tab inside PE Permissions: 'manage' or 'create'
  const [peSubTab, setPeSubTab] = useState<'manage' | 'create'>('manage');

  // Selected user for management by PE
  const [selectedUserId, setSelectedUserId] = useState<string>(
    users.find(u => u.id !== currentUser.id)?.id || users[0]?.id
  );
  const targetUser = users.find(u => u.id === selectedUserId) || users[0];

  // State for Editing Name
  const [editingName, setEditingName] = useState<string>('');

  // State for Editing Permissions (Menu Tabs)
  const [selectedTabs, setSelectedTabs] = useState<string[]>([]);

  // State for Changing Password (Strictly PE Only)
  const [newPassword, setNewPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Status and Error notifications
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // State for Creating New User
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newInitialPassword, setNewInitialPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('PRODUCTION');
  const [newDepartment, setNewDepartment] = useState('Produksi Cutting & Sewing');
  const [newEmail, setNewEmail] = useState('');
  const [newAllowedTabs, setNewAllowedTabs] = useState<string[]>([
    'pe-workflow',
    'ppic-planning',
    'transactions'
  ]);

  // State for Spreadsheet Webhook Sync
  const [inputGasUrl, setInputGasUrl] = useState(gasUrl);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: ''
  });

  // Ref for logo file upload
  const logoUploadRef = useRef<HTMLInputElement>(null);

  // Sync state when targetUser changes
  React.useEffect(() => {
    if (targetUser) {
      setEditingName(targetUser.name);
      setSelectedTabs(targetUser.allowedTabs || []);
      setNewPassword('');
    }
  }, [selectedUserId, targetUser]);

  // Handle role change in new user creation
  const handleRoleChange = (role: UserRole) => {
    setNewRole(role);
    switch (role) {
      case 'PE':
        setNewDepartment('Production Engineering & RnD');
        setNewAllowedTabs(ALL_NAV_TABS.map(t => t.id));
        break;
      case 'WAREHOUSE':
        setNewDepartment('Gudang Bahan Baku & Aksesoris');
        setNewAllowedTabs(['warehouse-stock', 'transactions', 'spreadsheet', 'pe-workflow', 'user-access']);
        break;
      case 'FACTORY_MANAGER':
        setNewDepartment('Executive Factory Management');
        setNewAllowedTabs(['analytics', 'pe-workflow', 'warehouse-stock', 'ppic-planning', 'subcon', 'transactions', 'spreadsheet', 'user-access']);
        break;
      case 'PPIC':
        setNewDepartment('PPIC & Inventory Control');
        setNewAllowedTabs(['ppic-planning', 'warehouse-stock', 'transactions', 'pe-workflow', 'spreadsheet', 'user-access']);
        break;
      case 'PRODUCTION':
        setNewDepartment('Produksi Cutting & Sewing Line');
        setNewAllowedTabs(['pe-workflow', 'ppic-planning', 'transactions', 'subcon', 'user-access']);
        break;
      case 'SUBCON':
        setNewDepartment('Mitra Subkon Eksternal');
        setNewAllowedTabs(['subcon', 'transactions', 'user-access']);
        break;
    }
  };

  // 1. Save User Name
  const handleSaveName = () => {
    if (!editingName.trim()) {
      setErrorMessage('Nama pengguna tidak boleh kosong!');
      return;
    }
    updateUserName(targetUser.id, editingName.trim());
    setStatusMessage(`Nama akun berhasil diperbarui menjadi "${editingName.trim()}"!`);
    setErrorMessage('');
    setTimeout(() => setStatusMessage(''), 3500);
  };

  // 2. Change / Reset Password (PE Only)
  const handleSavePassword = (customPass?: string) => {
    const passwordToSave = customPass !== undefined ? customPass : newPassword;
    
    if (!passwordToSave.trim()) {
      setErrorMessage('Password baru tidak boleh kosong!');
      return;
    }

    const res = updateUserPassword(targetUser.id, passwordToSave);
    if (res.success) {
      setStatusMessage(res.message);
      setErrorMessage('');
      setNewPassword('');
      setTimeout(() => setStatusMessage(''), 4000);
    } else {
      setErrorMessage(res.message);
    }
  };

  // Quick reset password to default (<username>123)
  const handleQuickResetPassword = () => {
    const defaultPass = `${targetUser.username}123`;
    handleSavePassword(defaultPass);
  };

  // 3. Save Tab Permissions
  const handleSavePermissions = () => {
    if (selectedTabs.length === 0) {
      setErrorMessage('Pengguna minimal harus memiliki akses ke 1 bar menu!');
      return;
    }
    updateUserPermissions(targetUser.id, selectedTabs);
    setStatusMessage(`Hak akses menu untuk "${targetUser.name}" berhasil disimpan!`);
    setErrorMessage('');
    setTimeout(() => setStatusMessage(''), 3500);
  };

  const handleToggleTab = (tabId: string) => {
    if (selectedTabs.includes(tabId)) {
      setSelectedTabs(prev => prev.filter(t => t !== tabId));
    } else {
      setSelectedTabs(prev => [...prev, tabId]);
    }
  };

  // 4. Delete User
  const handleDeleteUser = (userId: string, userName: string) => {
    const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus akun "${userName}"?`);
    if (!confirmDelete) return;

    const res = deleteUser(userId);
    if (res.success) {
      setStatusMessage(res.message);
      const remaining = users.filter(u => u.id !== userId);
      if (remaining.length > 0) {
        setSelectedUserId(remaining[0].id);
      }
      setTimeout(() => setStatusMessage(''), 3500);
    } else {
      setErrorMessage(res.message);
      setTimeout(() => setErrorMessage(''), 3500);
    }
  };

  // 5. Create New User
  const handleCreateNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage('');
    setErrorMessage('');

    if (!newName.trim()) {
      setErrorMessage('Nama lengkap akun wajib diisi!');
      return;
    }

    const cleanUsername = newUsername.trim().toLowerCase().replace(/\s+/g, '_');
    if (!cleanUsername) {
      setErrorMessage('Username login wajib diisi!');
      return;
    }

    const res = addNewUser({
      name: newName.trim(),
      username: cleanUsername,
      password: newInitialPassword.trim() || `${cleanUsername}123`,
      role: newRole,
      department: newDepartment.trim(),
      email: newEmail.trim() || `${cleanUsername}@terataiwidjaja.co.id`,
      allowedTabs: newAllowedTabs
    });

    if (res.success) {
      setStatusMessage(res.message);
      setNewName('');
      setNewUsername('');
      setNewInitialPassword('');
      setNewEmail('');

      setTimeout(() => {
        setPeSubTab('manage');
        const justAdded = users.find(u => u.username.toLowerCase() === cleanUsername);
        if (justAdded) {
          setSelectedUserId(justAdded.id);
        }
      }, 700);
    } else {
      setErrorMessage(res.message);
    }
  };

  // Handle Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorMessage('File harus berupa gambar (PNG, JPG, SVG, WebP)!');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setCompanyLogo(result);
          setStatusMessage('Logo perusahaan berhasil diubah dan disimpan!');
          setTimeout(() => setStatusMessage(''), 3500);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle GAS Sync
  const handleSaveGasUrl = () => {
    setGasUrl(inputGasUrl.trim());
    setStatusMessage('URL Google Apps Script berhasil disimpan!');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setSyncStatus({ type: 'idle', message: '' });
    try {
      const result = await syncToGoogleScript();
      if (result.success) {
        setSyncStatus({ type: 'success', message: result.message });
      } else {
        setSyncStatus({ type: 'error', message: result.message });
      }
    } catch (err) {
      setSyncStatus({ type: 'error', message: 'Gagal menghubungi server Google Apps Script.' });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Banner Header */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 shrink-0 text-blue-400">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-black tracking-tight">Pusat Akses, Akun &amp; Integrasi</h1>
              <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-blue-900/60 text-blue-300 border border-blue-700">
                Sistem Terpusat
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Kelola akun aktif, sinkronisasi Google Spreadsheet, kustomisasi logo dashboard, dan pengaturan hak akses karyawan pabrik.
            </p>
          </div>
        </div>

        {/* Quick Actions: Print Matrix */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => openPrintModal('user-access')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-2 border border-slate-700 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-blue-400" />
            <span>Cetak PDF Matriks Akses</span>
          </button>
        </div>
      </div>

      {/* SUB-NAVIGATION TABS */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto scrollbar-none bg-white p-1.5 rounded-xl border">
        <button
          onClick={() => setMainSubTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            mainSubTab === 'profile'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>1. Profil &amp; Ganti Akun</span>
        </button>

        <button
          onClick={() => setMainSubTab('spreadsheet')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            mainSubTab === 'spreadsheet'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>2. Google Spreadsheet</span>
          {lastSyncedGas && (
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          )}
        </button>

        <button
          onClick={() => setMainSubTab('logo')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            mainSubTab === 'logo'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>3. Kustomisasi Logo</span>
        </button>

        <button
          onClick={() => setMainSubTab('pe-permissions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            mainSubTab === 'pe-permissions'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>4. Hak Akses Karyawan</span>
          {isPE && (
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/20 font-mono">PE Admin</span>
          )}
        </button>
      </div>

      {/* Notifications Alert Banner */}
      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{statusMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-300 text-red-900 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      {/* ----------------- TAB 1: PROFIL & GANTI AKUN ----------------- */}
      {mainSubTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* User Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg text-white shadow-sm ${
                currentUser.role === 'PE' ? 'bg-red-600' : 'bg-blue-700'
              }`}>
                {currentUser.name.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()}
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base">{currentUser.name}</h3>
                <p className="text-xs text-slate-500 font-mono">@{currentUser.username}</p>
                <div className="mt-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                    currentUser.role === 'PE' 
                      ? 'bg-red-50 text-red-700 border-red-200' 
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    {currentUser.role}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Departemen:</span>
                <span className="font-bold text-slate-900">{currentUser.department}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Email:</span>
                <span className="font-mono text-slate-800">{currentUser.email || '-'}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Status Akun:</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Aktif
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
              >
                <UserCheck className="w-4 h-4" />
                <span>Ganti Akun / Switch User</span>
              </button>

              <button
                onClick={logout}
                className="w-full py-2 px-4 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout / Keluar</span>
              </button>
            </div>
          </div>

          {/* User Authorized Bars */}
          <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-700" />
                Bar Menu yang Diizinkan untuk Akun Ini
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentUser.role === 'PE' 
                  ? 'Sebagai Production Engineer (PE), Anda memiliki wewenang administrator ke seluruh modul.' 
                  : 'Daftar menu yang diberikan izin operasional oleh Lead Production Engineer (PE).'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {ALL_NAV_TABS.map((tab) => {
                const isAllowed = currentUser.role === 'PE' || currentUser.allowedTabs.includes(tab.id) || tab.id === 'user-access';
                return (
                  <div
                    key={tab.id}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                      isAllowed
                        ? 'bg-blue-50/60 border-blue-200 text-blue-950 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {isAllowed ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3 text-blue-600" /> Aktif
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-500">
                        Terkunci
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* ----------------- TAB 2: GOOGLE SPREADSHEET INTEGRATION ----------------- */}
      {mainSubTab === 'spreadsheet' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                Integrasi Google Spreadsheet Real-Time
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Hubungkan sistem garmen dengan Google Sheets via Google Apps Script (GAS) Web App
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('spreadsheet')}
                className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Buka Bar Spreadsheet</span>
              </button>
            </div>
          </div>

          {/* Webhook Configuration Field */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-800">
              URL Google Apps Script Web App (Webhook Endpoint):
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={inputGasUrl}
                onChange={(e) => setInputGasUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                className="flex-1 px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button
                onClick={handleSaveGasUrl}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-colors shrink-0"
              >
                Simpan URL
              </button>
              <button
                onClick={handleSyncNow}
                disabled={isSyncing}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-colors shrink-0 flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}</span>
              </button>
            </div>

            {/* Sync Feedback Message */}
            {syncStatus.message && (
              <div className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
                syncStatus.type === 'success' 
                  ? 'bg-emerald-100/70 text-emerald-900 border border-emerald-300' 
                  : 'bg-red-100/70 text-red-900 border border-red-300'
              }`}>
                {syncStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
                <span>{syncStatus.message}</span>
              </div>
            )}

            {lastSyncedGas && (
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Terakhir Berhasil Disinkronkan: <strong className="text-slate-800 font-mono">{lastSyncedGas}</strong></span>
              </div>
            )}
          </div>

          {/* Sync Information Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Lembar 1: Alur SOP</span>
              <div className="text-xs font-bold text-slate-800">14 Tahap SOP PE &amp; Status</div>
              <p className="text-[11px] text-slate-500">Target tanggal, tanggal aktual, rute, dan catatan teknis.</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Lembar 2: PPIC &amp; BOM</span>
              <div className="text-xs font-bold text-slate-800">BOM Bahan &amp; Alokasi Panel</div>
              <p className="text-[11px] text-slate-500">Kebutuhan yard/pcs, kancing, zipper, status kesiapan.</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Lembar 3: Stok Gudang</span>
              <div className="text-xs font-bold text-slate-800">Katalog Material &amp; Mutasi</div>
              <p className="text-[11px] text-slate-500">Stok fisik aktual, lokasi rak, batas minimum order.</p>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- TAB 3: KUSTOMISASI LOGO PERUSAHAAN ----------------- */}
      {mainSubTab === 'logo' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-700" />
                Kustomisasi Logo Perusahaan
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Logo ini akan tampil di sudut kiri atas dashboard dan disematkan pada seluruh dokumen cetak PDF
              </p>
            </div>

            <input 
              type="file" 
              ref={logoUploadRef}
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Logo Preview: Normal Color (Dashboard Header) */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                1. Tampilan Logo di Header Dashboard (Berwarna)
              </span>
              <div className="h-28 bg-white rounded-xl border border-slate-200 flex items-center justify-center p-4">
                {companyLogo ? (
                  <img 
                    src={companyLogo} 
                    alt="Pratinjau Logo" 
                    className="max-h-20 max-w-[200px] object-contain"
                  />
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-blue-700 text-white flex items-center justify-center font-black text-2xl shadow-sm border-2 border-red-500">
                      TW
                    </div>
                    <div>
                      <div className="font-black text-slate-900 text-sm">PT TERATAI WIDJAJA</div>
                      <div className="text-xs text-slate-500">Logo Standar Sistem</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Logo Preview: Monochrome (Black & White for PDF Print) */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-3">
              <span className="text-xs font-bold text-black uppercase tracking-wider block">
                2. Tampilan Logo di Dokumen Cetak PDF (Hitam &amp; Putih)
              </span>
              <div className="h-28 bg-white rounded-xl border-2 border-dashed border-black flex items-center justify-center p-4">
                {companyLogo ? (
                  <img 
                    src={companyLogo} 
                    alt="Pratinjau Hitam Putih" 
                    className="max-h-20 max-w-[200px] object-contain filter grayscale contrast-125"
                  />
                ) : (
                  <div className="w-14 h-14 border-2 border-black flex items-center justify-center font-black text-2xl text-black">
                    TW
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Action Buttons: Upload & Reset */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => logoUploadRef.current?.click()}
              className="px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Unggah Gambar Logo Baru</span>
            </button>

            {companyLogo && (
              <button
                onClick={() => {
                  setCompanyLogo(null);
                  setStatusMessage('Logo berhasil direset ke emblem standar TW!');
                  setTimeout(() => setStatusMessage(''), 3000);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors border border-slate-200"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset ke Logo Standar (TW)</span>
              </button>
            )}

            <span className="text-[11px] text-slate-400">
              Format didukung: PNG (disarankan transparan), JPG, SVG. Maks 2MB.
            </span>
          </div>
        </div>
      )}

      {/* ----------------- TAB 4: HAK AKSES KARYAWAN (KHUSUS PE) ----------------- */}
      {mainSubTab === 'pe-permissions' && (
        <div className="space-y-6">
          
          {/* If user is not PE, display informative restricted notice */}
          {!isPE ? (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center max-w-xl mx-auto space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Otoritas Hak Akses Karyawan Dikelola Oleh Production Engineer (PE)
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Akun Anda saat ini (<strong>{currentUser.name}</strong> - <em>{currentUser.role}</em>) dapat mengakses profil dan spreadsheet. Pengubahan hak akses menu bar atau perubahan password akun lain hanya dapat dilakukan oleh otoritas <strong>Production Engineer (PE)</strong>.
                </p>
              </div>
              <div className="pt-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border">
                Kontak Otoritas PE: <strong>Hendra Gunawan, S.T.</strong> (Ext. 104 / pe.terataiwidjaja@gmail.com)
              </div>
            </div>
          ) : (
            
            /* PE FULL MANAGEMENT INTERFACE */
            <div className="space-y-6">
              
              {/* PE Sub-Tab Switcher */}
              <div className="flex border-b border-slate-200 gap-2">
                <button
                  onClick={() => setPeSubTab('manage')}
                  className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                    peSubTab === 'manage'
                      ? 'border-red-600 text-red-700'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Kelola Akun Karyawan Terdaftar ({users.length})</span>
                </button>
                <button
                  onClick={() => setPeSubTab('create')}
                  className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                    peSubTab === 'create'
                      ? 'border-red-600 text-red-700'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>+ Tambah Akun PIC Baru</span>
                </button>
              </div>

              {peSubTab === 'manage' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* User List Sidebar */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Pilih Akun yang Dikelola
                    </h3>
                    <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
                      {users.map(u => {
                        const isSelected = u.id === targetUser?.id;
                        return (
                          <div
                            key={u.id}
                            onClick={() => setSelectedUserId(u.id)}
                            className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                              isSelected
                                ? 'bg-red-50 border-red-300 text-red-950 font-bold shadow-xs'
                                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div className="space-y-0.5">
                              <div className="font-bold">{u.name}</div>
                              <div className="text-[11px] text-slate-500 font-mono">@{u.username} • {u.role}</div>
                            </div>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                              u.role === 'PE' ? 'bg-red-200 text-red-800' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {u.allowedTabs.length} Bar
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Settings for Selected User */}
                  <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                    
                    {/* Header info */}
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div>
                        <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                          Pengaturan Akun: {targetUser.name}
                        </h2>
                        <p className="text-xs text-slate-500">Peran: {targetUser.role} • Dept: {targetUser.department}</p>
                      </div>

                      {targetUser.id !== currentUser.id && (
                        <button
                          onClick={() => handleDeleteUser(targetUser.id, targetUser.name)}
                          className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus Akun</span>
                        </button>
                      )}
                    </div>

                    {/* 1. Edit Name */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-800">Nama Lengkap PIC:</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                        <button
                          onClick={handleSaveName}
                          className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-colors shrink-0"
                        >
                          Simpan Nama
                        </button>
                      </div>
                    </div>

                    {/* 2. Change Password */}
                    <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <label className="block text-xs font-bold text-slate-800">Ganti / Reset Password Akun:</label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-1">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Ketik password baru..."
                            className="w-full px-3 py-2 pr-9 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <button
                          onClick={() => handleSavePassword()}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-colors shrink-0"
                        >
                          Update Password
                        </button>
                        <button
                          onClick={handleQuickResetPassword}
                          className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-colors shrink-0"
                          title="Reset ke username123"
                        >
                          Reset Default
                        </button>
                      </div>
                    </div>

                    {/* 3. Tab Permissions */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-slate-800">
                          Otoritas Bar Menu yang Diizinkan:
                        </label>
                        <button
                          onClick={handleSavePermissions}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-colors flex items-center gap-1.5"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Simpan Hak Akses</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {ALL_NAV_TABS.map((tab) => {
                          const isChecked = selectedTabs.includes(tab.id);
                          return (
                            <label
                              key={tab.id}
                              className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                                isChecked
                                  ? 'bg-blue-50/70 border-blue-300 text-blue-950 font-bold'
                                  : 'bg-white border-slate-200 text-slate-600'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleTab(tab.id)}
                                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                              />
                              <span className="text-xs">{tab.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                  </div>

                </div>
              ) : (
                
                /* Create New User Form */
                <form onSubmit={handleCreateNewUser} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-2xl mx-auto space-y-4">
                  <h3 className="text-base font-black text-slate-900 border-b pb-3">
                    Tambah Akun Pengguna / PIC Baru
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Nama Lengkap PIC:</label>
                      <input
                        type="text"
                        required
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Contoh: Budi Santoso"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Username Login:</label>
                      <input
                        type="text"
                        required
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="Contoh: budi_ppic"
                        className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Peran / Role:</label>
                      <select
                        value={newRole}
                        onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="PE">Production Engineer (PE)</option>
                        <option value="PPIC">PPIC</option>
                        <option value="WAREHOUSE">Warehouse / Gudang</option>
                        <option value="PRODUCTION">Produksi Sewing &amp; Cutting</option>
                        <option value="SUBCON">Mitra Subkon</option>
                        <option value="FACTORY_MANAGER">Factory Manager</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Password Awal:</label>
                      <input
                        type="text"
                        value={newInitialPassword}
                        onChange={(e) => setNewInitialPassword(e.target.value)}
                        placeholder="Kosongkan untuk default username123"
                        className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setPeSubTab('manage')}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs"
                    >
                      Buat Akun PIC
                    </button>
                  </div>
                </form>
              )}

            </div>
          )}

        </div>
      )}

    </div>
  );
};
