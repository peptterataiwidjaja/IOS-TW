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
    <div className="space-y-4">
      
      {/* Header & Filter Bar Unified */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold text-slate-900">
              Mutasi Barang ({filteredTransactions.length})
            </h1>
            {totalCrossStyleTx > 0 && (
              <button
                onClick={() => setOnlyCrossStyle(!onlyCrossStyle)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                  onlyCrossStyle ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{totalCrossStyleTx} Lintas Style</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari barang / PIC..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs w-44 focus:outline-none focus:border-blue-600"
              />
            </div>

            <select
              value={selectedStyleFilter}
              onChange={(e) => setSelectedStyleFilter(e.target.value)}
              className="py-1.5 px-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
            >
              <option value="ALL">Semua Style</option>
              {styles.map(s => (
                <option key={s.id} value={s.code}>{s.code}</option>
              ))}
            </select>

            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="py-1.5 px-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
            >
              <option value="ALL">Semua Tipe</option>
              <option value="OUT">Keluar (OUT)</option>
              <option value="IN">Masuk (IN)</option>
              <option value="RETURN">Retur</option>
            </select>

            <button
              onClick={() => openPrintModal('transactions')}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              title="Cetak PDF"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold text-[11px] border-b border-slate-200">
                <th className="py-2.5 px-3">Waktu</th>
                <th className="py-2.5 px-3">Tipe</th>
                <th className="py-2.5 px-3">Bahan Baku</th>
                <th className="py-2.5 px-3 text-right">Jumlah</th>
                <th className="py-2.5 px-3">Style</th>
                <th className="py-2.5 px-3">Tujuan</th>
                <th className="py-2.5 px-3">PIC Pengambil</th>
                <th className="py-2.5 px-3">Catatan</th>
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
                      tx.isCrossStyle ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{tx.timestamp}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{tx.referenceDoc}</div>
                    </td>

                    <td className="py-2.5 px-3">
                      <span className={`font-bold ${
                        isOut ? 'text-rose-600' : (isIn ? 'text-emerald-600' : 'text-blue-600')
                      }`}>
                        {tx.type}
                      </span>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{tx.itemName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{tx.itemCode}</div>
                    </td>

                    <td className="py-2.5 px-3 text-right tabular-nums font-bold text-slate-900 whitespace-nowrap">
                      {tx.quantity.toLocaleString()} <span className="font-normal text-slate-400">{tx.unit}</span>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-mono font-bold text-slate-900">{tx.styleTarget}</div>
                      {tx.isCrossStyle && (
                        <div className="text-[10px] font-semibold text-amber-700">
                          Asal: {tx.allocatedStyleOfItem}
                        </div>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-slate-700">
                      {tx.destinationDept}
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{tx.picReceiver}</div>
                      <div className="text-[10px] text-slate-400">Gudang: {tx.picGudang}</div>
                    </td>

                    <td className="py-2.5 px-3 text-slate-600">
                      <div>{tx.reason || '-'}</div>
                      {tx.verifiedByPE && (
                        <div className="text-[10px] text-emerald-600 font-semibold">
                          ✓ {tx.verifiedByPE}
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
          <div className="py-10 text-center text-slate-400 text-xs">
            Tidak ada transaksi.
          </div>
        )}
      </div>

    </div>
  );
};
