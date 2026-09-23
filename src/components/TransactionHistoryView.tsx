import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StockTransaction } from '../types';
import { 
  FileText, 
  Search, 
  Filter, 
  ArrowDownLeft, 
  ArrowUpRight, 
  AlertTriangle, 
  ShieldCheck, 
  UserCheck, 
  Layers2, 
  Calendar, 
  CheckCircle2, 
  Download,
  Building2,
  Printer
} from 'lucide-react';

export const TransactionHistoryView: React.FC = () => {
  const { transactions, styles, currentUser, openPrintModal } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [selectedStyleFilter, setSelectedStyleFilter] = useState<string>('ALL');
  const [onlyCrossStyle, setOnlyCrossStyle] = useState<boolean>(false);

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tx.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tx.picReceiver.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tx.picGudang.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tx.referenceDoc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedTypeFilter === 'ALL' || tx.type === selectedTypeFilter;
    const matchesStyle = selectedStyleFilter === 'ALL' || tx.styleTarget === selectedStyleFilter;
    const matchesCross = !onlyCrossStyle || tx.isCrossStyle;

    return matchesSearch && matchesType && matchesStyle && matchesCross;
  });

  const totalCrossStyleTx = transactions.filter(t => t.isCrossStyle).length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-800 text-xs font-bold flex items-center gap-1 border border-purple-200">
                <FileText className="w-3.5 h-3.5 text-purple-700" />
                Audit Trail &amp; Mutasi Gudang
              </span>
              <span className="text-xs text-slate-400 font-medium">• Pelacakan PIC &amp; Tanggung Jawab</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Riwayat Transaksi Barang &amp; Akuntabilitas PIC
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl">
              Melacak pergerakan mutasi bahan baku (Masuk/Keluar/Retur) secara presisi. Mencatat identitas penanggung jawab pengambil barang, PIC gudang penyerah, serta flag peringatan jika barang diambil di luar Style yang dialokasikan.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => openPrintModal('transactions')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              title="Cetak PDF Rekap Mutasi Transaksi"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Cetak PDF Transaksi</span>
            </button>

            <div className="text-right pl-3 border-l border-slate-200">
              <div className="text-xs text-slate-500 font-medium">Total Transaksi</div>
              <div className="text-xl font-black text-slate-900">{transactions.length} Mutasi</div>
            </div>
          </div>
        </div>

        {/* Warning Banner if any cross-style pengambilan exists */}
        {totalCrossStyleTx > 0 && (
          <div className="mt-4 p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Terdeteksi <strong>{totalCrossStyleTx} transaksi pengeluaran di luar style</strong>. Pastikan verifikasi PE &amp; PPIC sudah ditandatangani untuk mencegah defisit bahan di lini jahit.
              </span>
            </div>
            <button
              onClick={() => setOnlyCrossStyle(!onlyCrossStyle)}
              className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold shrink-0 transition-colors"
            >
              {onlyCrossStyle ? 'Tampilkan Semua' : 'Filter Cross-Style'}
            </button>
          </div>
        )}
      </div>

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari PIC pengambil, nama barang, kode, SPK..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50 focus:bg-white"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={selectedStyleFilter}
              onChange={(e) => setSelectedStyleFilter(e.target.value)}
              className="w-full py-2 px-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="ALL">Semua Style Tujuan</option>
              {styles.map(s => (
                <option key={s.id} value={s.code}>
                  Style: {s.code} ({s.name})
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="w-full py-2 px-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="ALL">Semua Jenis Mutasi</option>
              <option value="OUT">Keluar (OUT)</option>
              <option value="IN">Masuk (IN)</option>
              <option value="RETURN">Retur (RETURN)</option>
              <option value="ADJUSTMENT">Penyesuaian (ADJUST)</option>
            </select>
          </div>

        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Menemukan <strong>{filteredTransactions.length}</strong> catatan transaksi</span>
          {onlyCrossStyle && (
            <span className="text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded-md">
              Mode Filter: Hanya Pengambilan Cross-Style
            </span>
          )}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-3 px-3 min-w-[130px]">Waktu &amp; Dokumen</th>
                <th className="py-3 px-3">Jenis</th>
                <th className="py-3 px-4 min-w-[200px]">Bahan Baku</th>
                <th className="py-3 px-3 text-right">Jumlah</th>
                <th className="py-3 px-3 min-w-[140px]">Style &amp; Alokasi</th>
                <th className="py-3 px-3">Tujuan Dept</th>
                <th className="py-3 px-4 min-w-[160px] bg-indigo-50/50 text-indigo-950 font-black">
                  PIC Bertanggung Jawab
                </th>
                <th className="py-3 px-3">Petugas Gudang</th>
                <th className="py-3 px-4 min-w-[180px]">Alasan &amp; Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((tx) => {
                const isOut = tx.type === 'OUT';
                const isIn = tx.type === 'IN';

                return (
                  <tr 
                    key={tx.id} 
                    className={`hover:bg-slate-50/80 transition-colors ${
                      tx.isCrossStyle ? 'bg-amber-50/40' : ''
                    }`}
                  >
                    {/* Timestamp & Ref Doc */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{tx.timestamp}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{tx.referenceDoc}</div>
                    </td>

                    {/* Type */}
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                        isOut ? 'bg-rose-100 text-rose-700' : (isIn ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800')
                      }`}>
                        {isOut && <ArrowUpRight className="w-3 h-3" />}
                        {isIn && <ArrowDownLeft className="w-3 h-3" />}
                        {tx.type}
                      </span>
                    </td>

                    {/* Item */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{tx.itemName}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{tx.itemCode}</div>
                    </td>

                    {/* Quantity */}
                    <td className="py-3 px-3 text-right">
                      <div className="font-black text-slate-900">{tx.quantity.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-500">{tx.unit}</div>
                    </td>

                    {/* Style Allocation & Cross-Style warning */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 flex items-center gap-1">
                        <Layers2 className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{tx.styleTarget}</span>
                      </div>
                      {tx.isCrossStyle ? (
                        <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded">
                          <AlertTriangle className="w-3 h-3 text-amber-700" />
                          <span>Cross-Style (Asal: {tx.allocatedStyleOfItem})</span>
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-400 mt-0.5">Sesuai Alokasi</div>
                      )}
                    </td>

                    {/* Destination */}
                    <td className="py-3 px-3 font-medium text-slate-700">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                        {tx.destinationDept}
                      </span>
                    </td>

                    {/* ACCOUNTABILITY: SIAPA YANG MENGAMBIL TANGGUNG JAWAB */}
                    <td className="py-3 px-4 bg-indigo-50/30">
                      <div className="font-black text-slate-900 flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>{tx.picReceiver}</span>
                      </div>
                      <div className="text-[10px] text-indigo-700 font-medium mt-0.5">
                        Penanggung Jawab
                      </div>
                    </td>

                    {/* PIC Warehouse */}
                    <td className="py-3 px-3 text-slate-600 font-medium">
                      {tx.picGudang}
                    </td>

                    {/* Reason / Notes */}
                    <td className="py-3 px-4">
                      <div className="text-slate-800 font-medium">{tx.reason || '-'}</div>
                      {tx.notes && (
                        <div className="text-[10px] text-slate-500 italic mt-0.5">{tx.notes}</div>
                      )}
                      {tx.verifiedByPE && (
                        <div className="text-[10px] text-emerald-600 font-bold mt-0.5 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Verifikasi: {tx.verifiedByPE}
                        </div>
                      )}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-xs">
            Tidak ada transaksi yang cocok dengan filter.
          </div>
        )}
      </div>

    </div>
  );
};
