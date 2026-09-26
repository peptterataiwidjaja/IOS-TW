import React, { useState, useRef, useEffect } from 'react';
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
  CheckCircle2,
  FileSpreadsheet,
  Printer,
  Upload,
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

  // Default directly to PE account & bar management tab
  const [mainSubTab, setMainSubTab] = useState<'pe-permissions' | 'profile' | 'spreadsheet' | 'logo'>('pe-permissions');

  // Sub-tab inside PE Permissions: 'manage' or 'create'
  const [peSubTab, setPeSubTab] = useState<'manage' | 'create'>('manage');

  // Selected user for management by PE
  const [selectedUserId, setSelectedUserId] = useState<string>(
    users.find(u => u.id !== currentUser.id)?.id || users[0]?.id
  );
  const targetUser = users.find(u => u.id === selectedUserId) || users[0];

  // State for Editing Name, Username, Department
  const [editingName, setEditingName] = useState<string>('');
  const [editingUsername, setEditingUsername] = useState<string>('');
  const [editingDepartment, setEditingDepartment] = useState<string>('');

  // State for Editing Permissions (Menu Tabs)
  const [selectedTabs, setSelectedTabs] = useState<string[]>([]);

  // State for Changing Password (PE Only - Masked by default, never exposing all passwords)
  const [newPassword, setNewPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Inline delete confirmation state (avoids window.confirm in iframe)
  const [confirmDeleteUserId, setConfirmDeleteUserId] = useState<string | null>(null);

  // Status and Error notifications
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // State for Creating New User
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newInitialPassword, setNewInitialPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newRole, setNewRole] = useState<UserRole>('PRODUCTION');
  const [newDepartment, setNewDepartment] = useState('Produksi Cutting & Sewing');
  const [newEmail, setNewEmail] = useState('');
  const [newAllowedTabs, setNewAllowedTabs] = useState<string[]>([
    'pe-workflow',
    'ppic-planning',
    'subcon',
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
  useEffect(() => {
    if (targetUser) {
      setEditingName(targetUser.name);
      setEditingUsername(targetUser.username);
      setEditingDepartment(targetUser.department);
      setSelectedTabs(targetUser.allowedTabs || []);
      setNewPassword('');
      setShowPassword(false);
      setConfirmDeleteUserId(null);
    }
  }, [selectedUserId, targetUser?.id]);

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
        setNewAllowedTabs(['warehouse-stock', 'transactions', 'spreadsheet']);
        break;
      case 'FACTORY_MANAGER':
        setNewDepartment('Executive Factory Management');
        setNewAllowedTabs(['new-style', 'pe-workflow', 'ppic-planning', 'warehouse-stock', 'subcon', 'transactions', 'spreadsheet', 'analytics']);
        break;
      case 'PPIC':
        setNewDepartment('PPIC & Inventory Control');
        setNewAllowedTabs(['new-style', 'ppic-planning', 'warehouse-stock', 'transactions', 'spreadsheet', 'analytics']);
        break;
      case 'PRODUCTION':
        setNewDepartment('Produksi Cutting & Sewing Line');
        setNewAllowedTabs(['pe-workflow', 'ppic-planning', 'subcon', 'transactions', 'spreadsheet']);
        break;
      case 'SUBCON':
        setNewDepartment('Mitra Subkon Eksternal');
        setNewAllowedTabs(['subcon', 'transactions']);
        break;
    }
  };

  // 1. Save User Name, Username & Department
  const handleSaveName = () => {
    const res = updateUserName(targetUser.id, editingName, editingUsername, editingDepartment);
    if (res.success) {
      setStatusMessage(res.message);
      setErrorMessage('');
      setTimeout(() => setStatusMessage(''), 3500);
    } else {
      setErrorMessage(res.message);
    }
  };

  // 2. Change / Reset Password (PE Only)
  const handleSavePassword = () => {
    if (!newPassword.trim()) {
      setErrorMessage('Masukkan password baru terlebih dahulu!');
      return;
    }

    const res = updateUserPassword(targetUser.id, newPassword);
    if (res.success) {
      setStatusMessage(res.message);
      setErrorMessage('');
      setNewPassword('');
      setShowPassword(false);
      setTimeout(() => setStatusMessage(''), 4000);
    } else {
      setErrorMessage(res.message);
    }
  };

  // 3. Save Tab Permissions
  const handleSavePermissions = () => {
    if (selectedTabs.length === 0) {
      setErrorMessage('Pengguna minimal harus memiliki akses ke 1 bar menu!');
      return;
    }
    const res = updateUserPermissions(targetUser.id, selectedTabs);
    if (res.success) {
      setStatusMessage(res.message);
      setErrorMessage('');
      setTimeout(() => setStatusMessage(''), 3500);
    } else {
      setErrorMessage(res.message);
    }
  };

  // Save All Changes for Selected User at once
  const handleSaveAllTargetChanges = () => {
    if (selectedTabs.length === 0) {
      setErrorMessage('Pengguna minimal harus memiliki akses ke 1 bar menu!');
      return;
    }
    const nameRes = updateUserName(targetUser.id, editingName, editingUsername, editingDepartment);
    if (!nameRes.success) {
      setErrorMessage(nameRes.message);
      return;
    }
    const permRes = updateUserPermissions(targetUser.id, selectedTabs);
    if (!permRes.success) {
      setErrorMessage(permRes.message);
      return;
    }
    if (newPassword.trim()) {
      const passRes = updateUserPassword(targetUser.id, newPassword);
      if (!passRes.success) {
        setErrorMessage(passRes.message);
        return;
      }
      setNewPassword('');
      setShowPassword(false);
    }

    setErrorMessage('');
    setStatusMessage(`Perubahan nama, user login, dan akses bar untuk "${editingName.trim()}" berhasil disimpan!`);
    setTimeout(() => setStatusMessage(''), 4000);
  };

  const handleToggleTab = (tabId: string) => {
    if (selectedTabs.includes(tabId)) {
      setSelectedTabs(prev => prev.filter(t => t !== tabId));
    } else {
      setSelectedTabs(prev => [...prev, tabId]);
    }
  };

  const handleToggleNewUserTab = (tabId: string) => {
    if (newAllowedTabs.includes(tabId)) {
      setNewAllowedTabs(prev => prev.filter(t => t !== tabId));
    } else {
      setNewAllowedTabs(prev => [...prev, tabId]);
    }
  };

  // 4. Delete User (Inline confirmation without window.confirm)
  const handleExecuteDeleteUser = (userId: string) => {
    const res = deleteUser(userId);
    if (res.success) {
      setStatusMessage(res.message);
      setErrorMessage('');
      setConfirmDeleteUserId(null);
      const remaining = users.filter(u => u.id !== userId);
      if (remaining.length > 0) {
        setSelectedUserId(remaining[0].id);
      }
      setTimeout(() => setStatusMessage(''), 3500);
    } else {
      setErrorMessage(res.message);
      setConfirmDeleteUserId(null);
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

    const cleanUsername = newUsername.trim().replace(/\s+/g, '_');
    if (!cleanUsername) {
      setErrorMessage('User login wajib diisi!');
      return;
    }

    if (!newInitialPassword.trim()) {
      setErrorMessage('Password login untuk akun baru wajib diisi!');
      return;
    }

    if (newAllowedTabs.length === 0) {
      setErrorMessage('Pilih minimal 1 akses bar untuk akun baru ini!');
      return;
    }

    const res = addNewUser({
      name: newName.trim(),
      username: cleanUsername,
      password: newInitialPassword.trim(),
      role: newRole,
      department: newDepartment.trim(),
      email: newEmail.trim() || `${cleanUsername.toLowerCase()}@terataiwidjaja.co.id`,
      allowedTabs: newAllowedTabs
    });

    if (res.success) {
      setStatusMessage(res.message);
      setNewName('');
      setNewUsername('');
      setNewInitialPassword('');
      setNewEmail('');
      setShowNewPassword(false);
      setPeSubTab('manage');
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
    <div className="space-y-5 font-sans">
      
      {/* Top Banner Header */}
      <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-red-600 text-white shrink-0 shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black tracking-tight">Manajemen Akses Akun &amp; Bar Menu (Khusus PE)</h1>
              <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40">
                Otoritas PE
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
              Tambah atau hapus akun pengguna, ganti nama &amp; user login, serta atur akses bar menu yang tersedia untuk setiap akun.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => openPrintModal('user-access')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-2 border border-slate-700 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-blue-400" />
            <span>Cetak Matriks Akses</span>
          </button>
        </div>
      </div>

      {/* SUB-NAVIGATION TABS */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto scrollbar-none bg-white p-1.5 rounded-xl border">
        <button
          onClick={() => setMainSubTab('pe-permissions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            mainSubTab === 'pe-permissions'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>1. Kelola Akun &amp; Akses Bar (PE)</span>
        </button>

        <button
          onClick={() => setMainSubTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            mainSubTab === 'profile'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>2. Profil Aktif &amp; Ganti Akun</span>
        </button>

        <button
          onClick={() => setMainSubTab('spreadsheet')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            mainSubTab === 'spreadsheet'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>3. Google Spreadsheet</span>
          {lastSyncedGas && (
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          )}
        </button>

        <button
          onClick={() => setMainSubTab('logo')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            mainSubTab === 'logo'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>4. Kustomisasi Logo</span>
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

      {/* ----------------- TAB 1: KELOLA AKUN & AKSES BAR (KHUSUS PE) ----------------- */}
      {mainSubTab === 'pe-permissions' && (
        <div className="space-y-5">
          {!isPE ? (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center max-w-xl mx-auto space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Akses Dibatasi: Hanya untuk Production Engineer (PE)
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Hanya akun <strong>PE</strong> yang dapat menambahkan/menghapus akun serta mengganti nama dan akses bar yang tersedia.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Left Sidebar (4 cols): User List + Add Button */}
              <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3 h-fit">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Daftar Akun ({users.length})
                    </h3>
                    <p className="text-[11px] text-slate-500">Klik akun untuk ubah nama / akses bar</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPeSubTab('create')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs ${
                      peSubTab === 'create'
                        ? 'bg-red-700 text-white'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Tambah Akun</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                  {users.map(u => {
                    const isSelected = peSubTab === 'manage' && u.id === targetUser?.id;
                    const canDelete = u.id !== 'usr-pe' && u.id !== currentUser.id;
                    const isConfirmingDelete = confirmDeleteUserId === u.id;

                    return (
                      <div
                        key={u.id}
                        onClick={() => {
                          setPeSubTab('manage');
                          setSelectedUserId(u.id);
                        }}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-50/80 border-blue-600 ring-1 ring-blue-500/30 shadow-2xs'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="font-black text-slate-900 truncate flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {u.role === 'PE' && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-600 text-white font-bold">
                                  PE
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                              User: <strong className="text-blue-700">{u.username}</strong> • {u.role}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {u.allowedTabs.length} Bar
                            </span>
                            {canDelete && (
                              isConfirmingDelete ? (
                                <button
                                  type="button"
                                  onClick={() => handleExecuteDeleteUser(u.id)}
                                  className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold cursor-pointer"
                                >
                                  Hapus!
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteUserId(u.id)}
                                  className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                  title="Hapus akun ini"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Panel (8 cols): Edit Selected Account OR Create New Account */}
              <div className="lg:col-span-8">
                {peSubTab === 'manage' && targetUser ? (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
                    
                    {/* Selected Account Header & Delete Action */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-black text-slate-900">
                            Pengaturan Akun: {targetUser.name}
                          </h2>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            {targetUser.role}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          User Login: <strong className="font-mono text-slate-800">{targetUser.username}</strong> • Departemen: {targetUser.department}
                        </p>
                      </div>

                      {targetUser.id !== 'usr-pe' && targetUser.id !== currentUser.id && (
                        <div>
                          {confirmDeleteUserId === targetUser.id ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleExecuteDeleteUser(targetUser.id)}
                                className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer"
                              >
                                Ya, Hapus Permanen
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteUserId(null)}
                                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteUserId(targetUser.id)}
                              className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Hapus Akun</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 1. Ganti Nama, User Login & Departemen */}
                    <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                          <Edit2 className="w-3.5 h-3.5 text-blue-700" />
                          <span>1. Ganti Nama Pengguna &amp; User Login</span>
                        </label>
                        <button
                          type="button"
                          onClick={handleSaveName}
                          className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg cursor-pointer shadow-2xs transition-colors"
                        >
                          Simpan Nama &amp; User
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Nama Lengkap Pengguna
                          </label>
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            placeholder="Nama lengkap..."
                            className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            User Login (Saat Masuk)
                          </label>
                          <input
                            type="text"
                            value={editingUsername}
                            onChange={(e) => setEditingUsername(e.target.value)}
                            placeholder="Username login..."
                            className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Departemen / Bagian
                          </label>
                          <input
                            type="text"
                            value={editingDepartment}
                            onChange={(e) => setEditingDepartment(e.target.value)}
                            placeholder="Departemen..."
                            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 2. Atur Akses Bar yang Tersedia */}
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span>2. Atur Akses Bar yang Tersedia untuk Akun Ini</span>
                          </label>
                          <p className="text-[11px] text-slate-500">
                            Centang bar menu yang diizinkan tampil saat <strong>{targetUser.name}</strong> login
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedTabs(ALL_NAV_TABS.map(t => t.id))}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold cursor-pointer"
                          >
                            Pilih Semua
                          </button>
                          <button
                            type="button"
                            onClick={handleSavePermissions}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer shadow-2xs transition-colors flex items-center gap-1.5"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Simpan Akses Bar</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {ALL_NAV_TABS.map((tab) => {
                          const isChecked = selectedTabs.includes(tab.id);
                          return (
                            <label
                              key={tab.id}
                              className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                                isChecked
                                  ? 'bg-blue-50/70 border-blue-400 text-blue-950'
                                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleTab(tab.id)}
                                className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                              />
                              <div className="min-w-0">
                                <div className="text-xs font-bold flex items-center gap-1.5">
                                  <span>{tab.label}</span>
                                  {tab.id === 'user-access' && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-100 text-red-700 font-bold">
                                      Khusus PE
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                                  {tab.description}
                                </p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* 3. Ganti Password (Masked, never showing all passwords) */}
                    <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <label className="block text-xs font-black text-slate-900">
                        3. Ganti Password Akun (Opsional)
                      </label>
                      <p className="text-[11px] text-slate-500">
                        Untuk keamanan, password saat ini disembunyikan (••••••). Ketik password baru di bawah jika ingin mengganti.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2 pt-1">
                        <div className="relative flex-1">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Ketik password baru untuk mengganti..."
                            className="w-full px-3 py-2 pr-9 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={handleSavePassword}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors shrink-0"
                        >
                          Update Password
                        </button>
                      </div>
                    </div>

                    {/* Bottom Master Save Button */}
                    <div className="pt-3 border-t border-slate-200 flex justify-end">
                      <button
                        type="button"
                        onClick={handleSaveAllTargetChanges}
                        className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-black flex items-center gap-2 shadow-sm cursor-pointer transition-all"
                      >
                        <Save className="w-4 h-4" />
                        <span>Simpan Semua Perubahan Akun</span>
                      </button>
                    </div>

                  </div>
                ) : (
                  /* Create New User Form */
                  <form onSubmit={handleCreateNewUser} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="text-base font-black text-slate-900">
                          Tambah Akun Pengguna Baru (Oleh PE)
                        </h3>
                        <p className="text-xs text-slate-500">
                          Akun yang dibuat langsung terintegrasi dengan layar masuk (User &amp; Password) serta data operasional
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPeSubTab('manage')}
                        className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                      >
                        &larr; Kembali ke Daftar
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Nama Lengkap Pengguna / PIC *
                        </label>
                        <input
                          type="text"
                          required
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          placeholder="Contoh: Hendra Wijaya / CV Sinar Bordir"
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          User Login (Saat Masuk) *
                        </label>
                        <input
                          type="text"
                          required
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value)}
                          placeholder="Contoh: hendra_ppic / subcon_sinar"
                          className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Password Login *
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            required
                            value={newInitialPassword}
                            onChange={(e) => setNewInitialPassword(e.target.value)}
                            placeholder="Masukkan password akun..."
                            className="w-full px-3 py-2 pr-9 text-xs font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Peran / Departemen *
                        </label>
                        <select
                          value={newRole}
                          onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                          className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
                        >
                          <option value="PRODUCTION">Produksi Sewing &amp; Cutting</option>
                          <option value="PPIC">PPIC &amp; Perencanaan BOM</option>
                          <option value="WAREHOUSE">Gudang Material &amp; Stok</option>
                          <option value="SUBCON">Mitra Subkon (Input Harian Target)</option>
                          <option value="FACTORY_MANAGER">Factory Manager</option>
                          <option value="PE">Production Engineer (PE)</option>
                        </select>
                      </div>
                    </div>

                    {/* Pilih Akses Bar yang Tersedia untuk Akun Baru */}
                    <div className="space-y-2.5 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black text-slate-900">
                          Pilih Akses Bar yang Tersedia untuk Akun Baru Ini:
                        </label>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => setNewAllowedTabs(ALL_NAV_TABS.map(t => t.id))}
                            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer"
                          >
                            Pilih Semua
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {ALL_NAV_TABS.map((tab) => {
                          const isChecked = newAllowedTabs.includes(tab.id);
                          return (
                            <label
                              key={tab.id}
                              className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                                isChecked
                                  ? 'bg-blue-50/70 border-blue-400 text-blue-950 font-bold'
                                  : 'bg-white border-slate-200 text-slate-600'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleNewUserTab(tab.id)}
                                className="w-4 h-4 text-blue-600 rounded border-slate-300 cursor-pointer"
                              />
                              <span className="text-xs">{tab.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setPeSubTab('manage')}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Simpan &amp; Aktifkan Akun</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>

            </div>
          )}
        </div>
      )}

      {/* ----------------- TAB 2: PROFIL & GANTI AKUN ----------------- */}
      {mainSubTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg text-white shadow-sm ${
                currentUser.role === 'PE' ? 'bg-red-600' : 'bg-blue-700'
              }`}>
                {currentUser.name.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()}
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base">{currentUser.name}</h3>
                <p className="text-xs text-slate-500 font-mono">User: {currentUser.username}</p>
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
                <span>Ganti Akun (User &amp; Password)</span>
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

          <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-700" />
                Bar Menu yang Diizinkan untuk Akun Ini
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Daftar akses bar yang dikonfigurasi oleh Production Engineer (PE).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {ALL_NAV_TABS.map((tab) => {
                const isAllowed = currentUser.role === 'PE' || currentUser.allowedTabs.includes(tab.id);
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

      {/* ----------------- TAB 3: GOOGLE SPREADSHEET INTEGRATION ----------------- */}
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
        </div>
      )}

      {/* ----------------- TAB 4: KUSTOMISASI LOGO PERUSAHAAN ----------------- */}
      {mainSubTab === 'logo' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-700" />
                Kustomisasi Logo Perusahaan
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Logo ini akan tampil di layar login, sudut kiri atas dashboard, dan dokumen cetak PDF
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
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                1. Tampilan Logo di Login &amp; Header Dashboard
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
          </div>
        </div>
      )}

    </div>
  );
};
