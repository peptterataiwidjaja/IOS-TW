import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ALL_NAV_TABS } from '../data/initialData';
import { UserRole } from '../types';
import { 
  ShieldCheck, 
  X, 
  UserCheck, 
  UserPlus,
  Edit2, 
  Check, 
  AlertTriangle, 
  AlertCircle,
  Lock, 
  Save,
  KeyRound,
  Trash2,
  Settings2,
  Users,
  Building2,
  Briefcase,
  Eye,
  EyeOff,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export const UserAccessManagerModal: React.FC = () => {
  const { 
    isUserAccessModalOpen, 
    setIsUserAccessModalOpen, 
    users, 
    currentUser, 
    updateUserName, 
    updateUserPermissions,
    updateUserPassword,
    addNewUser,
    deleteUser
  } = useApp();

  const isPE = currentUser.role === 'PE';

  // Active view: 'manage' or 'create'
  const [activeSubTab, setActiveSubTab] = useState<'manage' | 'create'>('manage');

  // State for Managing existing users
  const [selectedUserId, setSelectedUserId] = useState<string>(users[1]?.id || users[0]?.id);
  const [editingName, setEditingName] = useState<string>('');
  const [selectedTabs, setSelectedTabs] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // State for Password Change (PE Only)
  const [newPassword, setNewPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);

  // State for Creating new user
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

  const targetUser = users.find(u => u.id === selectedUserId) || users[0];

  // Initialize selected tabs and name when target user changes
  React.useEffect(() => {
    if (targetUser) {
      setEditingName(targetUser.name);
      setSelectedTabs(targetUser.allowedTabs || []);
    }
  }, [selectedUserId, users]);

  // Update default department and tabs when new role changes
  const handleRoleChange = (role: UserRole) => {
    setNewRole(role);
    switch (role) {
      case 'PE':
        setNewDepartment('Production Engineering & RnD');
        setNewAllowedTabs(ALL_NAV_TABS.map(t => t.id));
        break;
      case 'WAREHOUSE':
        setNewDepartment('Gudang Bahan Baku & Aksesoris');
        setNewAllowedTabs(['warehouse-stock', 'transactions', 'spreadsheet', 'pe-workflow']);
        break;
      case 'FACTORY_MANAGER':
        setNewDepartment('Executive Factory Management');
        setNewAllowedTabs(['cash-flow', 'analytics', 'pe-workflow', 'warehouse-stock', 'ppic-planning', 'subcon', 'transactions', 'spreadsheet']);
        break;
      case 'PPIC':
        setNewDepartment('PPIC & Inventory Control');
        setNewAllowedTabs(['ppic-planning', 'warehouse-stock', 'transactions', 'pe-workflow', 'spreadsheet']);
        break;
      case 'PRODUCTION':
        setNewDepartment('Produksi Cutting & Sewing Line');
        setNewAllowedTabs(['pe-workflow', 'ppic-planning', 'transactions', 'subcon']);
        break;
      case 'SUBCON':
        setNewDepartment('Mitra Subkon Eksternal');
        setNewAllowedTabs(['subcon', 'transactions']);
        break;
    }
  };

  if (!isUserAccessModalOpen) return null;

  const handleSaveName = () => {
    if (!editingName.trim()) {
      setErrorMessage('Nama pengguna tidak boleh kosong!');
      return;
    }
    updateUserName(targetUser.id, editingName.trim());
    setStatusMessage(`Nama berhasil diperbarui menjadi "${editingName.trim()}"!`);
    setErrorMessage('');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handleToggleTab = (tabId: string) => {
    if (selectedTabs.includes(tabId)) {
      setSelectedTabs(selectedTabs.filter(id => id !== tabId));
    } else {
      setSelectedTabs([...selectedTabs, tabId]);
    }
  };

  const handleToggleNewUserTab = (tabId: string) => {
    if (newAllowedTabs.includes(tabId)) {
      setNewAllowedTabs(newAllowedTabs.filter(id => id !== tabId));
    } else {
      setNewAllowedTabs([...newAllowedTabs, tabId]);
    }
  };

  const handleSavePermissions = () => {
    updateUserPermissions(targetUser.id, selectedTabs);
    setStatusMessage(`Hak akses menu untuk ${targetUser.name} berhasil disimpan!`);
    setErrorMessage('');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  // PE Password Management Handlers
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

  const handleQuickResetPassword = () => {
    const defaultPass = `${targetUser.username}123`;
    handleSavePassword(defaultPass);
  };

  const handleGenerateRandomPassword = () => {
    const randomPass = 'tw' + Math.floor(1000 + Math.random() * 9000);
    setNewPassword(randomPass);
    setShowPassword(true);
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus akun "${userName}"?`);
    if (!confirmDelete) return;

    const res = deleteUser(userId);
    if (res.success) {
      setStatusMessage(res.message);
      // Select first remaining user
      const remaining = users.filter(u => u.id !== userId);
      if (remaining.length > 0) {
        setSelectedUserId(remaining[0].id);
      }
      setTimeout(() => setStatusMessage(''), 3000);
    } else {
      setErrorMessage(res.message);
      setTimeout(() => setErrorMessage(''), 3500);
    }
  };

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
      // Reset form
      setNewName('');
      setNewUsername('');
      setNewInitialPassword('');
      setNewEmail('');
      // Find created user and switch to manage tab
      setTimeout(() => {
        setActiveSubTab('manage');
        const justAdded = users.find(u => u.username.toLowerCase() === cleanUsername);
        if (justAdded) {
          setSelectedUserId(justAdded.id);
        }
      }, 700);
    } else {
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-red-700 to-blue-700 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">
                Manajemen Hak Akses &amp; Kontrol Akun (Otoritas Penuh PE)
              </h2>
              <p className="text-xs text-red-100">
                Tambah akun baru, ubah nama pengguna &amp; atur izin menu bar setiap departemen
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsUserAccessModalOpen(false)}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Sub-Navigation */}
        {isPE && (
          <div className="bg-slate-100 px-6 pt-3 border-b border-slate-200 flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveSubTab('manage')}
              className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeSubTab === 'manage'
                  ? 'border-blue-700 text-blue-900 bg-white rounded-t-lg shadow-xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4 text-blue-700" />
              <span>Kelola &amp; Izin Menu Akun ({users.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('create')}
              className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeSubTab === 'create'
                  ? 'border-red-600 text-red-900 bg-white rounded-t-lg shadow-xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-4 h-4 text-red-600" />
              <span>+ Tambah Akun Baru</span>
            </button>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {!isPE ? (
            <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center space-y-3">
              <Lock className="w-10 h-10 text-red-600 mx-auto" />
              <h3 className="text-base font-bold text-red-900">Akses Terbatas: Khusus Production Engineer (PE)</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Sesuai regulasi operasional PT Teratai Widjaja, hak akses menambahkan akun dan mengatur izin menu bar hanya dimiliki oleh Production Engineer (PE). Silakan beralih ke akun PE.
              </p>
              <button
                onClick={() => setIsUserAccessModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Kembali
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Feedback messages */}
              {statusMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-bold animate-pulse">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{statusMessage}</span>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-300 text-red-800 text-xs rounded-xl flex items-center gap-2 font-bold animate-shake">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* VIEW 1: MANAGE EXISTING USERS */}
              {activeSubTab === 'manage' && (
                <div className="space-y-4">
                  
                  {/* Account Selector Pill Grid */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Pilih Akun yang Ingin Dikelola:
                      </label>
                      <button
                        onClick={() => setActiveSubTab('create')}
                        className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>+ Tambah Akun Baru</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto pr-1">
                      {users.map(u => {
                        const isSelected = u.id === selectedUserId;
                        return (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => setSelectedUserId(u.id)}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                              isSelected 
                                ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20 shadow-xs' 
                                : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                u.role === 'PE' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
                              }`}>
                                {u.role.slice(0, 2)}
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-slate-900 truncate">{u.name}</div>
                                <div className="text-[10px] text-slate-500 font-mono truncate">{u.username}</div>
                              </div>
                            </div>
                            {u.role === 'PE' && (
                              <span className="text-[8px] bg-red-100 text-red-700 font-bold px-1 rounded shrink-0">
                                PE
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Target User Detail Box */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-4">
                    
                    {/* 1. Edit User Name & Info */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Edit2 className="w-4 h-4 text-blue-600" />
                          <span>Ubah Nama Pengguna Akun</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-mono">ID: {targetUser.id}</span>
                          {targetUser.id !== 'user-pe-01' && targetUser.id !== currentUser.id && (
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(targetUser.id, targetUser.name)}
                              className="text-[11px] text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded transition-colors flex items-center gap-1 cursor-pointer"
                              title="Hapus Akun"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Hapus Akun</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          placeholder="Masukkan nama baru..."
                          className="flex-1 text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600"
                        />
                        <button
                          type="button"
                          onClick={handleSaveName}
                          className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer border-t border-blue-500"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Simpan Nama</span>
                        </button>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-2 flex flex-wrap items-center gap-3">
                        <span>Username Login: <strong className="text-blue-700 font-mono font-bold">{targetUser.username}</strong></span>
                        <span>•</span>
                        <span>Role: <strong className="text-slate-800">{targetUser.role}</strong></span>
                        <span>•</span>
                        <span>Departemen: <strong>{targetUser.department}</strong></span>
                      </div>
                    </div>

                    {/* 2. KHUSUS PE: FITUR GANTI PASSWORD UNTUK AKUN LAIN */}
                    <div className="bg-gradient-to-r from-red-50 to-blue-50 p-4 rounded-xl border border-red-200 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-red-600 text-white rounded-lg">
                            <KeyRound className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
                              Ganti Password Akun (Otoritas Khusus PE)
                            </h4>
                            <p className="text-[11px] text-slate-600">
                              Hanya PE yang berhak mengganti kata sandi akun {targetUser.name}
                            </p>
                          </div>
                        </div>

                        {/* Password Saat Ini Display */}
                        <div className="flex items-center gap-1.5 text-xs bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                          <span className="text-slate-500 text-[10px]">Sandi Saat Ini:</span>
                          <span className="font-mono font-bold text-slate-800">
                            {showCurrentPassword 
                              ? (targetUser.password || `${targetUser.username}123`) 
                              : '••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="text-slate-400 hover:text-slate-700 cursor-pointer"
                          >
                            {showCurrentPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-1">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <Lock className="w-3.5 h-3.5" />
                          </div>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Ketik password baru (min 4 karakter)..."
                            className="w-full pl-8 pr-9 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSavePassword()}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer border-t border-red-400 shrink-0"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Simpan Password</span>
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        <button
                          type="button"
                          onClick={handleQuickResetPassword}
                          className="text-[10px] px-2 py-0.5 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className="w-2.5 h-2.5 text-blue-600" />
                          <span>Reset ke Default ({targetUser.username}123)</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleGenerateRandomPassword}
                          className="text-[10px] px-2 py-0.5 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                          <span>Acak Password</span>
                        </button>
                      </div>
                    </div>

                    {/* 3. Configure Allowed Navigation Bars/Tabs */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-100">
                        <div>
                          <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <KeyRound className="w-4 h-4 text-red-600" />
                            <span>Izin Bar / Menu Navigasi yang Bisa Diakses</span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Centang bar apa saja yang boleh dilihat dan digunakan oleh akun ini
                          </p>
                        </div>

                        <div className="flex gap-1.5 text-[10px]">
                          <button
                            type="button"
                            onClick={() => setSelectedTabs(ALL_NAV_TABS.map(t => t.id))}
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
                          >
                            Pilih Semua
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedTabs(['pe-workflow'])}
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
                          >
                            Reset
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                        {ALL_NAV_TABS.map(tab => {
                          const isChecked = selectedTabs.includes(tab.id);
                          return (
                            <label
                              key={tab.id}
                              className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                                isChecked 
                                  ? 'bg-blue-50/50 border-blue-300 text-slate-900' 
                                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleTab(tab.id)}
                                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                              <div className="text-xs">
                                <div className="font-bold flex items-center gap-1">
                                  <span>{tab.label}</span>
                                  {isChecked && (
                                    <span className="text-[9px] px-1.5 rounded-full bg-blue-100 text-blue-700 font-semibold">
                                      Aktif
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                                  {tab.description}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end">
                        <button
                          type="button"
                          onClick={handleSavePermissions}
                          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer border-t border-red-400"
                        >
                          <Save className="w-4 h-4" />
                          <span>Simpan Perizinan Menu untuk {targetUser.name}</span>
                        </button>
                      </div>

                    </div>

                  </div>

                </div>
              )}

              {/* VIEW 2: ADD NEW USER ACCOUNT FORM */}
              {activeSubTab === 'create' && (
                <form onSubmit={handleCreateNewUser} className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <div className="p-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200">
                        <UserPlus className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900">Formulir Penambahan Akun Pengguna Baru</h3>
                        <p className="text-[11px] text-slate-500">
                          Akun akan langsung terdaftar dan dapat login menggunakan Username tanpa password
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Nama Lengkap Pengguna <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={newName}
                          onChange={(e) => {
                            setNewName(e.target.value);
                            // Auto generate username draft if username is still empty or default
                            if (!newUsername) {
                              setNewUsername(e.target.value.toLowerCase().replace(/\s+/g, '_').slice(0, 15));
                            }
                          }}
                          placeholder="Contoh: Budi Santoso"
                          className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Username Login <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                          placeholder="Contoh: budi_santoso, qc_line2..."
                          className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600"
                        />
                        <span className="text-[10px] text-slate-400">Digunakan untuk login langsung ke aplikasi.</span>
                      </div>
                    </div>

                    {/* Initial Password for new account */}
                    <div className="p-3 bg-red-50/50 rounded-xl border border-red-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-red-950 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-red-600" />
                          <span>Password Awal Akun (Dikelola oleh PE)</span>
                        </label>
                        <span className="text-[10px] text-slate-500">
                          Default: <code className="text-blue-700 font-bold">{newUsername ? `${newUsername}123` : '[username]123'}</code>
                        </span>
                      </div>
                      <input
                        type="text"
                        value={newInitialPassword}
                        onChange={(e) => setNewInitialPassword(e.target.value)}
                        placeholder={newUsername ? `Kosongkan untuk pakai ${newUsername}123` : "Masukkan password awal..."}
                        className="w-full text-xs p-2 bg-white border border-red-300 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-red-600"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Peran / Wewenang (Role) <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={newRole}
                          onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                          className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 cursor-pointer"
                        >
                          <option value="PRODUCTION">Produksi (Cutting &amp; Sewing Line)</option>
                          <option value="WAREHOUSE">Gudang (Warehouse &amp; Stok Bahan)</option>
                          <option value="PPIC">PPIC (Perencanaan Produksi &amp; MRP)</option>
                          <option value="FACTORY_MANAGER">Factory Manager (Cek Dana &amp; Approval)</option>
                          <option value="SUBCON">Mitra Subkon (Bordir / Sablon / Wash)</option>
                          <option value="PE">Production Engineer (PE Super Admin)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Departemen / Bagian Kerja
                        </label>
                        <input
                          type="text"
                          value={newDepartment}
                          onChange={(e) => setNewDepartment(e.target.value)}
                          placeholder="Contoh: Cutting Line 2, Spreading, QC..."
                          className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email Perusahaan (Opsional)
                      </label>
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="Contoh: budi@terataiwidjaja.co.id"
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  {/* Allowed Navigation Tabs For New User */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
                      <div>
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                          <span>Pilih Menu Bar Navigasi yang Diizinkan untuk Akun Ini</span>
                        </label>
                        <p className="text-[10px] text-slate-500">
                          Sudah otomatis disesuaikan dengan Role terpilih, dapat Anda modifikasi:
                        </p>
                      </div>

                      <div className="flex gap-1.5 text-[10px]">
                        <button
                          type="button"
                          onClick={() => setNewAllowedTabs(ALL_NAV_TABS.map(t => t.id))}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
                        >
                          Pilih Semua
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewAllowedTabs(['pe-workflow'])}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
                        >
                          Reset
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                      {ALL_NAV_TABS.map(tab => {
                        const isChecked = newAllowedTabs.includes(tab.id);
                        return (
                          <label
                            key={tab.id}
                            className={`p-2 rounded-xl border flex items-start gap-2 cursor-pointer transition-all ${
                              isChecked 
                                ? 'bg-blue-50/50 border-blue-300 text-slate-900' 
                                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleNewUserTab(tab.id)}
                              className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <div className="text-xs">
                              <div className="font-bold flex items-center gap-1">
                                <span>{tab.label}</span>
                                {isChecked && (
                                  <span className="text-[9px] px-1 rounded-full bg-blue-100 text-blue-700 font-semibold">
                                    Aktif
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-500 line-clamp-1">
                                {tab.description}
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveSubTab('manage')}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer border-t border-red-400"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Daftarkan &amp; Simpan Akun Baru</span>
                    </button>
                  </div>
                </form>
              )}

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Otoritas Super Admin: Production Engineer (PE)</span>
          <button
            onClick={() => setIsUserAccessModalOpen(false)}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
