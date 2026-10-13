import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Key, 
  X, 
  Copy, 
  Check, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Send, 
  Database, 
  Server, 
  Globe, 
  Plus, 
  CheckCircle2, 
  AlertCircle,
  Code2,
  FileSpreadsheet,
  Terminal,
  Layers,
  ArrowRight
} from 'lucide-react';

export const ApiKeyModal: React.FC = () => {
  const { 
    isApiKeyModalOpen, 
    setIsApiKeyModalOpen,
    apiKey,
    setApiKey,
    serverStatus,
    lastServerSync,
    syncWithServer,
    sendApiInput,
    styles,
    stock,
    transactions,
    subconTasks,
    users
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'tester' | 'docs' | 'keys'>('overview');
  const [showKey, setShowKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCodeType, setCopiedCodeType] = useState<string | null>(null);

  // New Key Generator Form
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyRole, setNewKeyRole] = useState('ALL');
  const [createdKeyMessage, setCreatedKeyMessage] = useState<string | null>(null);

  // Tester state
  const [testerAction, setTesterAction] = useState<'ADD_STOCK' | 'ADD_STYLE' | 'UPDATE_SOP_STEP' | 'ADD_TRANSACTION' | 'ADD_SUBCON_LOG'>('ADD_STOCK');
  const [testerSender, setTesterSender] = useState('Tim Multi-User');
  const [testerLoading, setTesterLoading] = useState(false);
  const [testerResponse, setTesterResponse] = useState<any | null>(null);

  // Sample payloads for tester
  const samplePayloads: Record<string, any> = {
    ADD_STOCK: {
      name: 'Kain Katun Combed 30s Navy',
      category: 'Kain Utama (Fabric)',
      code: 'FAB-CT30-NVY',
      styleCode: styles[0]?.code || 'STY-001',
      styleName: styles[0]?.name || 'Kemeja Polos',
      currentStock: 150,
      minStockLevel: 25,
      unit: 'Roll',
      rackLocation: 'Rak A-03',
      unitPrice: 85000,
      supplier: 'PT Textil Mandiri',
      notes: 'Bahan baku masuk input via API Key'
    },
    ADD_STYLE: {
      code: `STY-${Math.floor(100 + Math.random() * 900)}`,
      name: 'Kemeja Formal Oxford Slim',
      buyer: 'Uniqlo Asia',
      targetQuantityPcs: 2500,
      startDate: new Date().toISOString().split('T')[0],
      deliveryDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
      currentWorkflowStep: 1
    },
    UPDATE_SOP_STEP: {
      styleCode: styles[0]?.code || 'STY-001',
      stepId: 5,
      actualDate: new Date().toISOString().split('T')[0],
      status: 'Completed',
      notes: 'Realisasi selesai & terverifikasi via API'
    },
    ADD_TRANSACTION: {
      type: 'IN',
      itemName: 'Kancing Resin 4 Lubang 18L',
      styleTarget: styles[0]?.code || 'STY-001',
      allocatedStyleOfItem: styles[0]?.code || 'STY-001',
      quantity: 50,
      unit: 'Gross',
      picName: 'Staff Gudang Pusat',
      notes: 'Penerimaan stok dari supplier via API'
    },
    ADD_SUBCON_LOG: {
      taskId: subconTasks[0]?.id || 'sub-001',
      completedPcs: 120,
      defectsPcs: 2,
      notes: 'Laporan jahit harian subkon via API'
    }
  };

  const [testerPayloadJson, setTesterPayloadJson] = useState<string>(
    JSON.stringify(samplePayloads.ADD_STOCK, null, 2)
  );

  const handleActionChange = (action: any) => {
    setTesterAction(action);
    setTesterPayloadJson(JSON.stringify(samplePayloads[action] || {}, null, 2));
    setTesterResponse(null);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCopyCode = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeType(type);
    setTimeout(() => setCopiedCodeType(null), 2000);
  };

  const handleRunTester = async () => {
    setTesterLoading(true);
    setTesterResponse(null);
    try {
      let parsedPayload: any;
      try {
        parsedPayload = JSON.parse(testerPayloadJson);
      } catch (err: any) {
        setTesterResponse({
          status: 400,
          error: 'JSON Syntax Error',
          message: 'Format JSON payload tidak valid: ' + err.message
        });
        setTesterLoading(false);
        return;
      }

      const res = await sendApiInput(testerAction, parsedPayload, testerSender);
      setTesterResponse({
        status: res.success ? 200 : 400,
        ...res
      });
    } catch (err: any) {
      setTesterResponse({
        status: 500,
        error: 'Network Error',
        message: err?.message || 'Gagal mengirim request ke server'
      });
    } finally {
      setTesterLoading(false);
    }
  };

  const handleCreateNewKey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newKeyName || 'Kunci Tim Baru',
          role: newKeyRole,
          description: `Kunci akses multi-user untuk ${newKeyName || 'Tim'}`
        })
      });
      const data = await res.json();
      if (data.success && data.apiKey) {
        setApiKey(data.apiKey.key);
        setCreatedKeyMessage(`Kunci '${data.apiKey.name}' berhasil dibuat!`);
        setIsGeneratingKey(false);
        setNewKeyName('');
        setTimeout(() => setCreatedKeyMessage(null), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isApiKeyModalOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://...';
  const apiEndpointUrl = `${currentOrigin}/api/v1`;

  // Code snippets
  const curlExample = `curl -X POST "${apiEndpointUrl}/input" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${apiKey}" \\
  -d '{
    "action": "ADD_STOCK",
    "sender": "Pengguna Lapangan",
    "payload": {
      "name": "Kain Katun Oxford Putih",
      "category": "Kain Utama (Fabric)",
      "currentStock": 200,
      "unit": "Yard",
      "styleCode": "STY-001",
      "unitPrice": 45000,
      "rackLocation": "Rak B-01"
    }
  }'`;

  const fetchExample = `// Kirim input data ke database terpusat
const response = await fetch("${apiEndpointUrl}/input", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "${apiKey}"
  },
  body: JSON.stringify({
    action: "ADD_STOCK",
    sender: "Aplikasi Eksternal / Tim",
    payload: {
      name: "Benang Jahit Hitam 40/2",
      category: "Benang Jahit",
      currentStock: 120,
      unit: "Cones",
      rackLocation: "Rak C-05"
    }
  })
});

const result = await response.json();
console.log(result.message);`;

  const gasExample = `// Google Apps Script (Sinkronisasi dari Google Sheets)
function kirimInputKeAplikasi() {
  var url = "${apiEndpointUrl}/input";
  var apiKey = "${apiKey}";
  
  var payload = {
    action: "ADD_STOCK",
    sender: "Google Sheet Gudang",
    payload: {
      name: "Resleting YKK 50cm Hitam",
      category: "Resleting (Zipper)",
      currentStock: 500,
      unit: "Pcs",
      unitPrice: 3500
    }
  };
  
  var options = {
    method: "post",
    contentType: "application/json",
    headers: {
      "x-api-key": apiKey
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  var response = UrlFetchApp.fetch(url, options);
  Logger.log(response.getContentText());
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400 shadow-inner">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">Kunci API &amp; Akses Multi-User Terpusat</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Multi-User Aktif
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Semua akun dapat mengakses, memasukkan data bersama, dan terhubung melalui API Key ini.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsApiKeyModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-200 bg-slate-50 flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-700 bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Kunci API &amp; Status Server</span>
          </button>

          <button
            onClick={() => setActiveTab('tester')}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'tester'
                ? 'border-blue-600 text-blue-700 bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Uji Input Langsung (Tester)</span>
          </button>

          <button
            onClick={() => setActiveTab('docs')}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'docs'
                ? 'border-blue-600 text-blue-700 bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Dokumentasi Endpoint &amp; Kode</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {createdKeyMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{createdKeyMessage}</span>
            </div>
          )}

          {/* TAB 1: OVERVIEW & SERVER STATUS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">

              {/* Master Key Card */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white shadow-lg border border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                      Master API Key Aktif
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                    Bebas Akses Input &amp; Baca Data
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="flex-1 bg-black/40 border border-slate-700 rounded-xl px-4 py-2.5 font-mono text-sm tracking-wider flex items-center justify-between">
                    <span className="select-all truncate text-amber-300 font-bold">
                      {showKey ? apiKey : '••••••••••••••••••••••••••••••••••••••••'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="ml-2 text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
                      title={showKey ? 'Sembunyikan Kunci' : 'Tampilkan Kunci'}
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <button
                    onClick={handleCopyKey}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
                  >
                    {copiedKey ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-300" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Salin Kunci</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center justify-between flex-wrap gap-2 pt-1">
                  <span>
                    Berikan API Key ini kepada anggota tim atau sistem eksternal untuk menginput data secara langsung.
                  </span>
                  <button
                    onClick={() => setIsGeneratingKey(!isGeneratingKey)}
                    className="text-blue-400 hover:text-blue-300 font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Buat Kunci Tambahan</span>
                  </button>
                </div>

                {isGeneratingKey && (
                  <form onSubmit={handleCreateNewKey} className="mt-3 p-4 bg-slate-950/70 rounded-xl border border-slate-700/80 space-y-3">
                    <div className="text-xs font-bold text-white">Buat Kunci API Baru untuk Tim</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Nama Pemilik / Divisi</label>
                        <input
                          type="text"
                          value={newKeyName}
                          onChange={(e) => setNewKeyName(e.target.value)}
                          placeholder="Contoh: Tim Gudang Shift 2 / Subkon"
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Peran Akses</label>
                        <select
                          value={newKeyRole}
                          onChange={(e) => setNewKeyRole(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="ALL">Semua Akses (Input &amp; Baca Data)</option>
                          <option value="WAREHOUSE">Stok Gudang &amp; Mutasi</option>
                          <option value="PE">Engineering &amp; SOP</option>
                          <option value="PPIC">PPIC &amp; Cutting</option>
                          <option value="SUBCON">Laporan Subkon Harian</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsGeneratingKey(false)}
                        className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                      >
                        Simpan &amp; Terbitkan Kunci
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Server Live Status & Multi-User Architecture */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span>Status Server Cloud</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  </div>
                  <div className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Terhubung (Online)</span>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Database terpusat aktif di backend Node/Express.
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span>Akses Multi-User</span>
                    <Globe className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <div className="text-sm font-black text-slate-900">
                    Tanpa Batasan Pengguna
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Setiap orang yang memiliki akun atau API Key dapat memasukkan &amp; melihat data bersama.
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span>Sinkronisasi Otomatis</span>
                    <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="text-xs font-black text-slate-800">
                    {lastServerSync ? `Sinkron: ${new Date(lastServerSync).toLocaleTimeString('id-ID')}` : 'Sinkron Otomatis Tiap 15 dtk'}
                  </div>
                  <button
                    onClick={syncWithServer}
                    className="w-full mt-1 py-1 px-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] border border-blue-200 transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Sinkronkan Sekarang</span>
                  </button>
                </div>
              </div>

              {/* Data Summary Currently Stored in Shared Cloud */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-blue-600" />
                  <span>Data Real-time yang Tersinkronisasi Antar Pengguna</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="text-[10px] font-bold text-slate-500">Model Style</div>
                    <div className="text-lg font-black text-slate-900">{styles.length}</div>
                    <div className="text-[10px] text-slate-400">Model terdaftar</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="text-[10px] font-bold text-slate-500">Item Stok Gudang</div>
                    <div className="text-lg font-black text-slate-900">{stock.length}</div>
                    <div className="text-[10px] text-slate-400">Material &amp; Aksesoris</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="text-[10px] font-bold text-slate-500">Riwayat Mutasi</div>
                    <div className="text-lg font-black text-slate-900">{transactions.length}</div>
                    <div className="text-[10px] text-slate-400">Catatan keluar-masuk</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="text-[10px] font-bold text-slate-500">Total Akun Terdaftar</div>
                    <div className="text-lg font-black text-slate-900">{users.length}</div>
                    <div className="text-[10px] text-slate-400">Semua memiliki hak input</div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: INTERACTIVE TESTER / PLAYGROUND */}
          {activeTab === 'tester' && (
            <div className="space-y-5">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 space-y-1">
                <div className="font-black flex items-center gap-1.5">
                  <Send className="w-4 h-4 text-blue-600" />
                  <span>Uji Kirim Input Langsung via API Key</span>
                </div>
                <p className="text-blue-800 leading-relaxed">
                  Pilih aksi yang ingin diuji, edit datanya jika diperlukan, lalu klik <strong>"Kirim Input via API Key"</strong>. 
                  Data yang dikirim akan langsung tersimpan ke server dan muncul di aplikasi untuk semua pengguna.
                </p>
              </div>

              {/* Action Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700">Pilih Aksi Input</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {[
                    { id: 'ADD_STOCK', label: 'Tambah Stok Gudang' },
                    { id: 'ADD_STYLE', label: 'Tambah Model Style' },
                    { id: 'UPDATE_SOP_STEP', label: 'Update SOP PE' },
                    { id: 'ADD_TRANSACTION', label: 'Mutasi Gudang' },
                    { id: 'ADD_SUBCON_LOG', label: 'Laporan Subkon' },
                  ].map((act) => (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => handleActionChange(act.id)}
                      className={`p-2.5 rounded-xl text-xs font-bold border text-left transition-all cursor-pointer ${
                        testerAction === act.id
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {act.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sender & Endpoint info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Nama Pengirim / Divisi</label>
                  <input
                    type="text"
                    value={testerSender}
                    onChange={(e) => setTesterSender(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium"
                    placeholder="Contoh: Operator Gudang 1"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Target Endpoint</label>
                  <div className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-600 font-mono truncate">
                    POST {apiEndpointUrl}/input
                  </div>
                </div>
              </div>

              {/* JSON Payload Editor */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                    Payload Data (JSON)
                  </label>
                  <button
                    type="button"
                    onClick={() => setTesterPayloadJson(JSON.stringify(samplePayloads[testerAction], null, 2))}
                    className="text-[11px] text-blue-600 hover:underline font-bold cursor-pointer"
                  >
                    Reset ke Template Bawaan
                  </button>
                </div>
                <textarea
                  value={testerPayloadJson}
                  onChange={(e) => setTesterPayloadJson(e.target.value)}
                  rows={8}
                  className="w-full p-3 font-mono text-xs bg-slate-900 text-amber-300 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-between">
                <div className="text-[11px] text-slate-500">
                  Menggunakan API Key: <strong className="font-mono text-slate-700">{apiKey.slice(0, 15)}...</strong>
                </div>
                <button
                  type="button"
                  onClick={handleRunTester}
                  disabled={testerLoading}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {testerLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Mengirim ke Server...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Kirim Input via API Key</span>
                    </>
                  )}
                </button>
              </div>

              {/* Response Viewer */}
              {testerResponse && (
                <div className="mt-4 p-4 rounded-xl border bg-slate-900 text-white space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${testerResponse.status === 200 ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                      <strong>Status: {testerResponse.status || 200} OK</strong>
                    </span>
                    <span className="text-slate-400">{new Date().toLocaleTimeString('id-ID')}</span>
                  </div>
                  <pre className="p-3 bg-black/50 rounded-lg text-emerald-300 font-mono text-xs overflow-x-auto max-h-48">
                    {JSON.stringify(testerResponse, null, 2)}
                  </pre>
                  {testerResponse.success && (
                    <div className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 pt-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Data berhasil disimpan ke cloud database dan dapat dilihat seluruh tim!</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DOCUMENTATION & CODE EXAMPLES */}
          {activeTab === 'docs' && (
            <div className="space-y-6">

              {/* Endpoint Reference */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Daftar Endpoint API</h3>
                
                <div className="space-y-2">
                  {/* Endpoint 1 */}
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px]">POST</span>
                      <span className="font-bold text-slate-800">{apiEndpointUrl}/input</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Endpoint utama untuk memberikan input data baru (Stok Gudang, Style Baru, SOP Step, Mutasi, Subkon) dari manapun.
                    </p>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Header wajib: <code>x-api-key: {apiKey}</code>
                    </div>
                  </div>

                  {/* Endpoint 2 */}
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold text-[10px]">GET</span>
                      <span className="font-bold text-slate-800">{apiEndpointUrl}/data</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Mengambil seluruh data realtime aplikasi (daftar style, stok gudang lengkap, transaksi mutasi, dll).
                    </p>
                  </div>

                  {/* Endpoint 3 */}
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="px-2 py-0.5 rounded bg-purple-600 text-white font-bold text-[10px]">POST</span>
                      <span className="font-bold text-slate-800">{apiEndpointUrl}/sync</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Sinkronisasi dua arah multi-user. Mengirim data lokal dan menerima data gabungan dari seluruh pengguna.
                    </p>
                  </div>
                </div>
              </div>

              {/* Code Snippet: cURL */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
                    <Terminal className="w-4 h-4 text-slate-700" />
                    <span>Contoh Perintah cURL (Terminal / Bash)</span>
                  </div>
                  <button
                    onClick={() => handleCopyCode(curlExample, 'curl')}
                    className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCodeType === 'curl' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCodeType === 'curl' ? 'Tersalin' : 'Salin Kode'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 text-amber-300 rounded-xl font-mono text-xs overflow-x-auto">
                  {curlExample}
                </pre>
              </div>

              {/* Code Snippet: JavaScript / Fetch */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
                    <Code2 className="w-4 h-4 text-blue-600" />
                    <span>Contoh JavaScript / Fetch (Web / Node.js)</span>
                  </div>
                  <button
                    onClick={() => handleCopyCode(fetchExample, 'fetch')}
                    className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCodeType === 'fetch' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCodeType === 'fetch' ? 'Tersalin' : 'Salin Kode'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 text-cyan-300 rounded-xl font-mono text-xs overflow-x-auto">
                  {fetchExample}
                </pre>
              </div>

              {/* Code Snippet: Google Apps Script */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Contoh Google Apps Script (Sinkronisasi dari Google Sheet)</span>
                  </div>
                  <button
                    onClick={() => handleCopyCode(gasExample, 'gas')}
                    className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCodeType === 'gas' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCodeType === 'gas' ? 'Tersalin' : 'Salin Kode'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 text-emerald-300 rounded-xl font-mono text-xs overflow-x-auto">
                  {gasExample}
                </pre>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>API Server: <strong>Online</strong> • Multi-user Sinkron Otomatis</span>
          </div>
          <button
            onClick={() => setIsApiKeyModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs cursor-pointer transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
