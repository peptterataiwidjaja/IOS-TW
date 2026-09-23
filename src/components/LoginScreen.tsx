import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Lock, 
  User, 
  ShieldCheck, 
  Cpu, 
  Warehouse, 
  Layers, 
  Factory, 
  Truck, 
  ArrowRight, 
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  Building2
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login, users } = useApp();
  const [username, setUsername] = useState('pe_admin');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMessage('Silakan masukkan username akun.');
      return;
    }
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const res = login(username.trim());
      if (!res.success) {
        setErrorMessage(res.message);
      }
      setIsLoading(false);
    }, 200);
  };

  const handleQuickPick = (u: typeof users[0]) => {
    setUsername(u.username);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 font-sans antialiased text-slate-800">
      
      {/* Background Subtle Accent Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-blue-600 to-red-600" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-red-100 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="relative max-w-4xl mx-auto w-full">
        
        {/* Main Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-slate-200 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-700 text-white font-black flex items-center justify-center text-lg shadow-sm border-2 border-red-500">
              TW
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-blue-900">PT TERATAI WIDJAJA</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                  GARMENT INDUSTRY
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Integrated Garment ERP & Operations Management System</p>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Portal Masuk Sistem Operasional
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-xl mx-auto">
            Silakan masukkan <span className="font-semibold text-blue-700">Username</span> akun Anda untuk langsung masuk sesuai wewenang departemen (Login instan tanpa password).
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Login Form Box */}
          <div className="lg:col-span-6 bg-white rounded-2xl p-7 shadow-lg border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Autentikasi Pengguna</h2>
                <p className="text-xs text-slate-500">Akses langsung berbasis wewenang (RBAC)</p>
              </div>
              <span className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
                <User className="w-5 h-5" />
              </span>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Username Akun
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Contoh: pe_admin, gudang_tw, fm_teratai..."
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  * Password ditiadakan untuk kemudahan akses operasional. Cukup masukkan username atau klik salah satu akun di sebelah kanan.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer border-t border-blue-500 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Memverifikasi akun...</span>
                  ) : (
                    <>
                      <span>Masuk ke Dashboard PT Teratai Widjaja</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="pt-2 text-center space-y-1">
                <div className="text-[11px] text-slate-500">
                  Akun baru dapat ditambahkan oleh <strong className="text-red-600">Production Engineer (Admin PE)</strong>
                </div>
              </div>
            </form>
          </div>

          {/* Quick Account Selector & Info */}
          <div className="lg:col-span-6 space-y-3">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <ShieldCheck className="w-4 h-4 text-blue-700" />
                  <span>Daftar Akun Terdaftar (Klik untuk Pilih Cepat)</span>
                </div>
                <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  {users.length} Akun
                </span>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {users.map((u) => {
                  const isSelected = username === u.username;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleQuickPick(u)}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                        isSelected 
                          ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-500 shadow-xs' 
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          u.role === 'PE' 
                            ? 'bg-red-600 text-white' 
                            : u.role === 'WAREHOUSE' 
                            ? 'bg-blue-600 text-white' 
                            : u.role === 'FACTORY_MANAGER'
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {u.role.slice(0, 2)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{u.name}</span>
                            {u.role === 'PE' && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-100 text-red-700 font-bold border border-red-200">
                                Super Admin
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Username: <strong className="text-blue-700 font-mono">{u.username}</strong> • Role: <span className="font-semibold text-slate-700">{u.role}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right text-[10px] text-slate-400">
                        <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-medium text-slate-600">
                          {u.department.split('&')[0]}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Google Apps Script sync badge info */}
            <div className="bg-gradient-to-r from-blue-50 to-red-50 rounded-xl p-4 border border-blue-200 text-xs text-slate-700 flex items-start gap-3">
              <FileSpreadsheet className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
              <div>
                <strong className="text-blue-900 block font-bold">Terintegrasi dengan Google Script & Spreadsheet</strong>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Sistem mendukung sinkronisasi data real-time dua arah ke Google Sheets melalui Apps Script Web App.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
