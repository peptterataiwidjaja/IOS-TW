import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { 
  Lock, 
  Mail,
  User, 
  ArrowRight, 
  AlertCircle,
  Eye,
  EyeOff,
  UserPlus,
  LogIn
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login, registerAccount, companyLogo, users } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regUserOrEmail, setRegUserOrEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('WAREHOUSE');
  const [regDepartment, setRegDepartment] = useState('Gudang & Operasional');

  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail.trim() || !password.trim()) {
      setErrorMessage('Silakan masukkan Email / User dan Password terlebih dahulu.');
      return;
    }
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const res = login(usernameOrEmail.trim(), password.trim());
      if (!res.success) {
        setErrorMessage(res.message);
      }
      setIsLoading(false);
    }, 120);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regUserOrEmail.trim() || !regPassword.trim()) {
      setErrorMessage('Mohon lengkapi Nama, Email/User, dan Password.');
      return;
    }
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const res = registerAccount({
        name: regName.trim(),
        usernameOrEmail: regUserOrEmail.trim(),
        password: regPassword.trim(),
        role: regRole,
        department: regDepartment.trim()
      });
      if (!res.success) {
        setErrorMessage(res.message);
      }
      setIsLoading(false);
    }, 120);
  };

  const handleQuickFill = (uEmailOrName: string, uPass: string) => {
    setMode('login');
    setUsernameOrEmail(uEmailOrName);
    setPassword(uPass);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-[#f3f5f9] flex flex-col justify-center items-center py-10 px-4 sm:px-6 font-sans antialiased text-slate-800">
      {/* Main Centered Login Card */}
      <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-[0_12px_40px_-10px_rgba(15,23,42,0.12)] border border-slate-200/80 overflow-hidden">
        
        {/* Top Header */}
        <div className="px-8 pt-9 pb-6 text-center">
          <div className="inline-flex items-center justify-center mb-4">
            {companyLogo ? (
              <div className="h-16 px-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                <img
                  src={companyLogo}
                  alt="Logo PT Teratai Widjaja"
                  className="max-h-12 max-w-[150px] object-contain"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-black flex items-center justify-center text-2xl shadow-lg shadow-blue-600/25">
                TW
              </div>
            )}
          </div>

          <h1 className="text-xl font-black tracking-tight text-slate-900">
            PT TERATAI WIDJAJA
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            {mode === 'login'
              ? 'Silakan masuk menggunakan akun Anda untuk mengakses & menginput data'
              : 'Buat akun baru untuk mengakses & menginput data operasional'}
          </p>
        </div>

        {/* Mode Switcher Tabs (Masuk / Buat Akun) */}
        <div className="px-8">
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMessage(''); }}
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk Akun</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setErrorMessage(''); }}
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Daftar Akun</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="px-8 pt-6 pb-7">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Email / User Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email / Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={usernameOrEmail}
                    onChange={(e) => {
                      setUsernameOrEmail(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="Masukkan email atau username..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Memproses...</span>
                  ) : (
                    <>
                      <span>Masuk</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap / PIC *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Contoh: Andi Pratama"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email / Username Login *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={regUserOrEmail}
                    onChange={(e) => setRegUserOrEmail(e.target.value)}
                    placeholder="Contoh: andi@terataiwidjaja.co.id atau andi_tw"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Divisi / Jabatan
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => {
                      const r = e.target.value as UserRole;
                      setRegRole(r);
                      if (r === 'WAREHOUSE') setRegDepartment('Gudang Bahan Baku');
                      else if (r === 'PPIC') setRegDepartment('PPIC & Planning');
                      else if (r === 'PRODUCTION') setRegDepartment('Produksi & Cutting');
                      else if (r === 'PE') setRegDepartment('Production Engineering');
                      else if (r === 'FACTORY_MANAGER') setRegDepartment('Factory Management');
                      else if (r === 'SUBCON') setRegDepartment('Mitra Subkon');
                    }}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                  >
                    <option value="WAREHOUSE">Gudang (Warehouse)</option>
                    <option value="PPIC">PPIC</option>
                    <option value="PRODUCTION">Produksi / Cutting</option>
                    <option value="PE">PE (Engineering)</option>
                    <option value="FACTORY_MANAGER">Factory Manager</option>
                    <option value="SUBCON">Mitra Subkon</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min. 3 karakter"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Buat Akun &amp; Masuk</span>
                </button>
              </div>
            </form>
          )}

          {/* Quick Account Selection Helper */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-400 text-center mb-2.5">
              Akun Terdaftar (Klik untuk Isi Cepat):
            </div>
            <div className="flex flex-wrap justify-center gap-1.5">
              {users.slice(0, 6).map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickFill(u.username, u.password || `${u.username.toLowerCase()}123`)}
                  className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-[11px] font-semibold text-slate-700 hover:text-blue-700 transition-colors cursor-pointer"
                  title={`User: ${u.username} | Pass: ${u.password || 'pe123'}`}
                >
                  {u.username} <span className="text-[10px] text-slate-400">({u.role})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
