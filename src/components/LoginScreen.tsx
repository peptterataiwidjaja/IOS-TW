import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login, companyLogo } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Silakan masukkan User dan Password terlebih dahulu.');
      return;
    }
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const res = login(username.trim(), password.trim());
      if (!res.success) {
        setErrorMessage(res.message);
      }
      setIsLoading(false);
    }, 150);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center py-10 px-4 sm:px-6 font-sans antialiased text-slate-800">
      {/* Top Accent Strip */}
      <div className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-700 via-red-600 to-blue-700" />

      {/* Centered Single Login Box (Only User & Password Bars) */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden">
        
        {/* Card Header: Logo & Identity */}
        <div className="px-8 pt-8 pb-6 text-center border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white">
          <div className="inline-flex items-center justify-center mb-3">
            {companyLogo ? (
              <div className="h-14 px-3 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-2xs">
                <img
                  src={companyLogo}
                  alt="Logo PT Teratai Widjaja"
                  className="max-h-11 max-w-[140px] object-contain"
                />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-blue-700 text-white font-black flex items-center justify-center text-xl shadow-md border-2 border-red-500">
                TW
              </div>
            )}
          </div>

          <h1 className="text-lg font-black tracking-tight text-slate-900 uppercase">
            PT TERATAI WIDJAJA
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Sistem Operasional Produksi &amp; Gudang Garmen
          </p>
        </div>

        {/* Form Body: Only User Bar & Password Bar */}
        <div className="p-8">
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Bar 1: User */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                User
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Masukkan User..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Bar 2: Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
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
                  placeholder="Masukkan Password..."
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
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
                className="w-full py-3 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Memverifikasi...</span>
                ) : (
                  <>
                    <span>Masuk</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Subtle Footer */}
        <div className="px-8 py-3.5 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-500">
            Akses akun &amp; wewenang menu dikelola oleh <strong className="text-slate-700">PE</strong>
          </p>
        </div>
      </div>
    </div>
  );
};
