import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { SubcontractorTask, SubconDiscrepancyType, SubconDiscrepancyAction } from '../types';
import { 
  Truck, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  DollarSign, 
  UserCheck, 
  Layers2, 
  Calendar, 
  ArrowRight,
  Send,
  X,
  Edit3,
  Check,
  RotateCcw,
  ShieldAlert,
  FileText,
  BadgeAlert,
  Filter,
  CheckSquare,
  Printer
} from 'lucide-react';

export const SubcontractorManager: React.FC = () => {
  const { subconTasks, styles, updateSubconTask, addSubconTask, currentUser, openPrintModal } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filterTab, setFilterTab] = useState<'ALL' | 'WIP' | 'DISCREPANCY' | 'DELAYED' | 'COMPLETED'>('ALL');

  // Edit / Receive modal state
  const [editingTask, setEditingTask] = useState<SubcontractorTask | null>(null);
  const [editQtyReceived, setEditQtyReceived] = useState<number>(0);
  const [editActualDate, setEditActualDate] = useState<string>('');
  const [editDefectPcs, setEditDefectPcs] = useState<number>(0);
  const [editStatus, setEditStatus] = useState<SubcontractorTask['status']>('In Progress');
  const [editDelayNotes, setEditDelayNotes] = useState<string>('');
  const [editHasDiscrepancy, setEditHasDiscrepancy] = useState<boolean>(false);
  const [editDiscrepancyType, setEditDiscrepancyType] = useState<SubconDiscrepancyType>('Cacat Fisik / Reject (Bordir/Sablon/Jahit Rusak)');
  const [editDiscrepancyAction, setEditDiscrepancyAction] = useState<SubconDiscrepancyAction>('RETUR_REWORK');
  const [editDiscrepancyQty, setEditDiscrepancyQty] = useState<number>(0);
  const [editDiscrepancyNotes, setEditDiscrepancyNotes] = useState<string>('');
  const [editPicQC, setEditPicQC] = useState<string>('');

  // Add SPK form state
  const [newVendor, setNewVendor] = useState('');
  const [newType, setNewType] = useState<SubcontractorTask['type']>('Bordir Komputer');
  const [newStyleCode, setNewStyleCode] = useState(styles[0]?.code || 'TW-JKT-88');
  const [newQtySend, setNewQtySend] = useState(1000);
  const [newUnit, setNewUnit] = useState('Pcs Panel');
  const [newEstDate, setNewEstDate] = useState(() => new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
  const [newPicSubcon, setNewPicSubcon] = useState('');
  const [newRate, setNewRate] = useState(7500);

  const totalCostAllSubcon = subconTasks.reduce((sum, s) => sum + s.totalCost, 0);
  const activeWIPCount = subconTasks.filter(s => s.status !== 'Completed').length;
  const discrepancyCount = subconTasks.filter(s => s.hasDiscrepancy).length;
  const delayedCount = subconTasks.filter(s => {
    const today = new Date().toISOString().split('T')[0];
    const isLate = !s.actualReturnDate && s.estReturnDate < today;
    return s.status === 'Delayed' || !!s.delayNotes || isLate;
  }).length;
  const completedCount = subconTasks.filter(s => s.status === 'Completed').length;

  // Open edit modal for any task
  const handleOpenEdit = (task: SubcontractorTask) => {
    setEditingTask(task);
    setEditQtyReceived(task.quantityReceived);
    setEditActualDate(task.actualReturnDate || new Date().toISOString().split('T')[0]);
    setEditDefectPcs(task.defectPcs || 0);
    setEditStatus(task.status);
    setEditDelayNotes(task.delayNotes || '');
    setEditHasDiscrepancy(task.hasDiscrepancy || false);
    setEditDiscrepancyType(task.discrepancyType || 'Cacat Fisik / Reject (Bordir/Sablon/Jahit Rusak)');
    setEditDiscrepancyAction(task.discrepancyAction || 'RETUR_REWORK');
    setEditDiscrepancyQty(task.discrepancyQty !== undefined ? task.discrepancyQty : (task.defectPcs || 0));
    setEditDiscrepancyNotes(task.discrepancyNotes || '');
    setEditPicQC(task.picQC || currentUser.name);
  };

  // Save edit / receive
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;

    const qtyRec = Number(editQtyReceived);
    const defect = Number(editDefectPcs);
    const discQty = Number(editDiscrepancyQty);

    // Determine default status if user didn't explicitly pick something custom
    let finalStatus = editStatus;
    if (qtyRec >= editingTask.quantitySend) {
      finalStatus = 'Completed';
    } else if (qtyRec > 0) {
      finalStatus = 'Partial Received';
    }

    updateSubconTask(editingTask.id, {
      quantityReceived: qtyRec,
      actualReturnDate: editActualDate,
      defectPcs: defect,
      status: finalStatus,
      delayNotes: editDelayNotes.trim() || undefined,
      hasDiscrepancy: editHasDiscrepancy,
      discrepancyType: editHasDiscrepancy ? editDiscrepancyType : undefined,
      discrepancyAction: editHasDiscrepancy ? editDiscrepancyAction : undefined,
      discrepancyQty: editHasDiscrepancy ? discQty : undefined,
      discrepancyNotes: editHasDiscrepancy ? editDiscrepancyNotes.trim() : undefined,
      picQC: editPicQC.trim() || currentUser.name
    });

    setEditingTask(null);
  };

  const handleCreateSubcon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendor.trim() || newQtySend <= 0) return;

    const totalCost = newQtySend * newRate;

    addSubconTask({
      subconName: newVendor.trim(),
      type: newType,
      styleCode: newStyleCode,
      quantitySend: Number(newQtySend),
      quantityReceived: 0,
      unit: newUnit,
      sendDate: new Date().toISOString().split('T')[0],
      estReturnDate: newEstDate,
      status: 'In Progress',
      picSubcon: newPicSubcon.trim() || 'PIC Mitra Vendor',
      picInternal: `${currentUser.name} (${currentUser.department})`,
      ratePerPcs: Number(newRate),
      totalCost,
      defectPcs: 0
    });

    setIsAddModalOpen(false);
    setNewVendor('');
    setNewPicSubcon('');
  };

  // Filtered tasks based on active filter tab
  const filteredTasks = useMemo(() => {
    return subconTasks.filter(task => {
      if (filterTab === 'ALL') return true;
      if (filterTab === 'WIP') return task.status !== 'Completed';
      if (filterTab === 'DISCREPANCY') return task.hasDiscrepancy;
      if (filterTab === 'DELAYED') {
        const today = new Date().toISOString().split('T')[0];
        const isLate = !task.actualReturnDate && task.estReturnDate < today;
        return task.status === 'Delayed' || !!task.delayNotes || isLate;
      }
      if (filterTab === 'COMPLETED') return task.status === 'Completed';
      return true;
    });
  }, [subconTasks, filterTab]);

  // Helper for discrepancy action label & color
  const getActionBadge = (action?: SubconDiscrepancyAction) => {
    switch (action) {
      case 'RETUR_REWORK':
        return {
          label: 'Retur Rework (Bongkar Ulang)',
          color: 'bg-amber-100 text-amber-900 border-amber-300',
          icon: <RotateCcw className="w-3 h-3 text-amber-700" />
        };
      case 'KLAIM_POTONG_BIAYA':
        return {
          label: 'Klaim Potong Biaya / Invoice',
          color: 'bg-red-100 text-red-900 border-red-300',
          icon: <DollarSign className="w-3 h-3 text-red-700" />
        };
      case 'TERIMA_TOLERANSI':
        return {
          label: 'Terima Bersyarat (Toleransi / Grade B)',
          color: 'bg-blue-100 text-blue-900 border-blue-300',
          icon: <CheckCircle2 className="w-3 h-3 text-blue-700" />
        };
      case 'AFKIR_REPLACE':
        return {
          label: 'Afkir Total (Subkon Ganti Bahan)',
          color: 'bg-rose-100 text-rose-900 border-rose-300',
          icon: <ShieldAlert className="w-3 h-3 text-rose-700" />
        };
      case 'SESUAI_QC':
        return {
          label: 'Sesuai Standar QC',
          color: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          icon: <Check className="w-3 h-3 text-emerald-700" />
        };
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md bg-cyan-100 text-cyan-800 text-xs font-bold flex items-center gap-1 border border-cyan-200">
                <Truck className="w-3.5 h-3.5 text-cyan-700" />
                Mitra Subkontraktor &amp; Pekerjaan Luar
              </span>
              <span className="text-xs text-slate-400 font-medium">• Bordir, Sablon, Washing &amp; CMT Sub</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Manajemen Terintegrasi Subkon &amp; Kontrol Penerimaan Barang
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl">
              Memantau alur pengiriman panel ke rekanan subkon luar, input jumlah barang diterima, pencatatan alasan keterlambatan, dan penanganan ketidaksesuaian barang (retur rework, klaim potong biaya, afkir, atau toleransi QC).
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              onClick={() => openPrintModal('subcon')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              title="Cetak PDF Dokumen Rekap Subkon"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Cetak PDF Subkon</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Kirim Pekerjaan Subkon Baru (SPK)</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-6">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs text-slate-500 font-medium">Pekerjaan Subkon Aktif (WIP)</div>
            <div className="text-xl font-black text-cyan-700 mt-1">{activeWIPCount} Pesanan Luar</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Sedang diproses di rekanan vendor</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs text-slate-500 font-medium">Ketidaksesuaian / Discrepancy</div>
            <div className={`text-xl font-black mt-1 ${discrepancyCount > 0 ? 'text-amber-600' : 'text-slate-700'}`}>
              {discrepancyCount} Catatan Kasus
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Retur rework / klaim potongan biaya</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs text-slate-500 font-medium">Keterlambatan Pengiriman</div>
            <div className={`text-xl font-black mt-1 ${delayedCount > 0 ? 'text-red-600' : 'text-slate-700'}`}>
              {delayedCount} SPK Terlambat
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Dilengkapi catatan alasan vendor</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs text-slate-500 font-medium">Total Anggaran Subkon</div>
            <div className="text-xl font-black text-slate-900 mt-1">Rp {totalCostAllSubcon.toLocaleString('id-ID')}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Otomatis sinkron ke Arus Kas</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1 shrink-0 mr-1">
            <Filter className="w-3.5 h-3.5 text-cyan-700" />
            Filter Status:
          </span>
          <button
            onClick={() => setFilterTab('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              filterTab === 'ALL' ? 'bg-cyan-800 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua Rekanan ({subconTasks.length})
          </button>
          <button
            onClick={() => setFilterTab('WIP')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              filterTab === 'WIP' ? 'bg-cyan-800 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            WIP Luar ({activeWIPCount})
          </button>
          <button
            onClick={() => setFilterTab('DISCREPANCY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1 ${
              filterTab === 'DISCREPANCY' ? 'bg-amber-600 text-white shadow-xs' : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>Ada Ketidaksesuaian ({discrepancyCount})</span>
          </button>
          <button
            onClick={() => setFilterTab('DELAYED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1 ${
              filterTab === 'DELAYED' ? 'bg-red-600 text-white shadow-xs' : 'bg-red-50 text-red-800 hover:bg-red-100 border border-red-200'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>Terlambat ({delayedCount})</span>
          </button>
          <button
            onClick={() => setFilterTab('COMPLETED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              filterTab === 'COMPLETED' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Selesai ({completedCount})
          </button>
        </div>

        <div className="text-xs text-slate-500 shrink-0">
          Menampilkan <strong>{filteredTasks.length}</strong> pesanan subkon
        </div>
      </div>

      {/* Subcon Tasks Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-cyan-700" />
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Daftar SPK Subkon &amp; Kontrol Penerimaan Barang
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            * Klik tombol <strong className="text-cyan-700 font-bold">Edit / Terima Barang</strong> untuk mengedit penerimaan, tanggal, catatan telat, atau memilih tindakan ketidaksesuaian
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                <th className="py-3 px-3 w-48">Nama Rekanan Subkon</th>
                <th className="py-3 px-3">Jenis Jasa</th>
                <th className="py-3 px-3">Style Target</th>
                <th className="py-3 px-3 text-right">Kirim (Pcs)</th>
                <th className="py-3 px-3 text-right bg-emerald-50/50 text-emerald-900 font-extrabold">Diterima (Pcs)</th>
                <th className="py-3 px-3 text-right">Sisa WIP</th>
                <th className="py-3 px-3">Tgl Kirim / Balik</th>
                <th className="py-3 px-4">Status &amp; Ketidaksesuaian</th>
                <th className="py-3 px-3">PIC Subkon &amp; Internal</th>
                <th className="py-3 px-3 text-right">Biaya (Rp)</th>
                <th className="py-3 px-3 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.map((task) => {
                const wipRemaining = task.quantitySend - task.quantityReceived;
                const isCompleted = task.status === 'Completed' || task.quantityReceived >= task.quantitySend;
                const actionBadge = getActionBadge(task.discrepancyAction);

                return (
                  <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Subcon Name & SPK ID */}
                    <td className="py-3 px-3 font-bold text-slate-900">
                      <div className="font-extrabold text-slate-900">{task.subconName}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{task.id}</div>
                    </td>

                    {/* Service Type */}
                    <td className="py-3 px-3 font-medium text-slate-700">
                      <span className="px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-800 border border-cyan-200 font-semibold text-[11px] inline-block">
                        {task.type}
                      </span>
                    </td>

                    {/* Style Target */}
                    <td className="py-3 px-3 font-bold text-indigo-700 font-mono">
                      {task.styleCode}
                    </td>

                    {/* Quantity Send */}
                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                      {task.quantitySend.toLocaleString()}
                    </td>

                    {/* Quantity Received */}
                    <td className="py-3 px-3 text-right bg-emerald-50/30 font-extrabold text-emerald-700">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
                        {task.quantityReceived.toLocaleString()}
                      </span>
                      {task.defectPcs > 0 && (
                        <div className="text-[10px] text-rose-600 font-semibold mt-0.5">
                          Defect: {task.defectPcs} pcs
                        </div>
                      )}
                    </td>

                    {/* Remaining WIP */}
                    <td className="py-3 px-3 text-right font-black text-amber-600">
                      {wipRemaining > 0 ? wipRemaining.toLocaleString() : '0'}
                    </td>

                    {/* Send & Return Date */}
                    <td className="py-3 px-3 text-[11px] text-slate-600">
                      <div>Kirim: {task.sendDate}</div>
                      <div className="text-slate-500">Est: {task.estReturnDate}</div>
                      {task.actualReturnDate && (
                        <div className="text-emerald-700 font-bold text-[10px]">
                          Aktual: {task.actualReturnDate}
                        </div>
                      )}
                    </td>

                    {/* Status, Discrepancy & Delay Notes */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isCompleted ? 'bg-emerald-100 text-emerald-800' :
                          task.status === 'Partial Received' ? 'bg-cyan-100 text-cyan-800' :
                          task.status === 'Delayed' ? 'bg-red-100 text-red-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {task.status}
                        </span>

                        {/* Discrepancy Action Badge */}
                        {task.hasDiscrepancy && actionBadge && (
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border flex items-center gap-1 ${actionBadge.color}`}>
                            {actionBadge.icon}
                            <span>{actionBadge.label}</span>
                          </span>
                        )}
                      </div>

                      {/* Discrepancy Details */}
                      {task.hasDiscrepancy && (
                        <div className="mt-1.5 p-1.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] space-y-0.5">
                          <div className="font-bold text-amber-900 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                            <span>{task.discrepancyType} ({task.discrepancyQty || 0} Pcs)</span>
                          </div>
                          {task.discrepancyNotes && (
                            <p className="text-amber-800 text-[10px] italic">
                              "{task.discrepancyNotes}"
                            </p>
                          )}
                          {task.picQC && (
                            <div className="text-[9px] text-amber-700 font-medium">
                              QC Pemeriksa: {task.picQC}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Delay Notes */}
                      {task.delayNotes && (
                        <div className="mt-1 text-[10px] text-red-700 font-medium bg-red-50 p-1 rounded border border-red-200">
                          <strong>Catatan Telat:</strong> {task.delayNotes}
                        </div>
                      )}
                    </td>

                    {/* PIC */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 text-[11px]">{task.picInternal}</div>
                      <div className="text-[10px] text-slate-500">Sub: {task.picSubcon}</div>
                    </td>

                    {/* Cost */}
                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                      Rp {task.totalCost.toLocaleString('id-ID')}
                    </td>

                    {/* Action Button: Edit / Terima */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleOpenEdit(task)}
                        className="px-3 py-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-[11px] transition-colors shadow-xs flex items-center gap-1 mx-auto cursor-pointer"
                        title="Edit penerimaan barang, tanggal, catatan telat & ketidaksesuaian"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit / Terima</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: EDIT PENERIMAAN, CATATAN KETERLAMBATAN & KETIDAKSESUAIAN SUBKON    */}
      {/* ========================================================================= */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-cyan-600 text-white">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-black tracking-wide">
                    Edit Penerimaan &amp; Evaluasi Barang Subkon ({editingTask.id})
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    {editingTask.subconName} • {editingTask.type} • Style: {editingTask.styleCode}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setEditingTask(null)} 
                className="text-slate-400 hover:text-white text-lg p-1 cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Modal Body (Scrollable Form) */}
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 overflow-y-auto text-xs flex-1">
              
              {/* Summary of Order / Dispatch */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px]">Total Panel Dikirim:</span>
                  <strong className="text-slate-900 text-sm font-black">{editingTask.quantitySend.toLocaleString()} Pcs</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Target Estimasi Balik:</span>
                  <strong className="text-blue-900 font-bold">{editingTask.estReturnDate}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Sisa WIP Saat Ini:</span>
                  <strong className="text-amber-700 font-bold">
                    {(editingTask.quantitySend - editQtyReceived) > 0 ? (editingTask.quantitySend - editQtyReceived).toLocaleString() : '0'} Pcs
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">PIC Internal:</span>
                  <span className="text-slate-700 font-medium truncate block">{editingTask.picInternal}</span>
                </div>
              </div>

              {/* SEKSI 1: PENERIMAAN BARANG & TANGGAL AKTUAL */}
              <div className="p-4 bg-blue-50/40 rounded-xl border border-blue-100 space-y-3">
                <div className="font-extrabold text-blue-950 flex items-center gap-1.5 text-xs">
                  <CheckSquare className="w-4 h-4 text-blue-700" />
                  <span>1. Kuantitas Penerimaan Barang &amp; Tanggal Masuk Pabrik</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Jumlah Pcs Diterima (Total) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={editingTask.quantitySend * 1.05} // Allow small overrun if any
                      value={editQtyReceived}
                      onChange={(e) => setEditQtyReceived(Number(e.target.value))}
                      className="w-full p-2 rounded-lg border border-blue-300 font-black text-slate-900 focus:ring-1 focus:ring-blue-600 bg-white"
                      required
                    />
                    <div className="text-[10px] text-slate-500 mt-1">
                      Kirim: {editingTask.quantitySend} Pcs
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Tanggal Aktual Diterima *
                    </label>
                    <input
                      type="date"
                      value={editActualDate}
                      onChange={(e) => setEditActualDate(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 font-bold text-slate-900 bg-white focus:ring-1 focus:ring-blue-600"
                      required
                    />
                    <div className="text-[10px] text-slate-500 mt-1">
                      Est Target: {editingTask.estReturnDate}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Status Pekerjaan Subkon
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as any)}
                      className="w-full p-2 rounded-lg border border-slate-300 font-bold text-slate-800 bg-white focus:ring-1 focus:ring-blue-600"
                    >
                      <option value="In Progress">In Progress (Sedang Berjalan)</option>
                      <option value="Partial Received">Partial Received (Diterima Sebagian)</option>
                      <option value="Completed">Completed (Tuntas Penuh)</option>
                      <option value="Delayed">Delayed (Terlambat)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Jumlah Defect / Cacat Ditemukan (Pcs)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editDefectPcs}
                      onChange={(e) => setEditDefectPcs(Number(e.target.value))}
                      className="w-full p-2 rounded-lg border border-slate-300 font-bold text-rose-600 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      PIC QC / PE Pemeriksa
                    </label>
                    <input
                      type="text"
                      value={editPicQC}
                      onChange={(e) => setEditPicQC(e.target.value)}
                      placeholder="Contoh: Lina (QC Garment) / Budi Santoso (PE)"
                      className="w-full p-2 rounded-lg border border-slate-300 font-medium text-slate-800 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* SEKSI 2: CATATAN KETERLAMBATAN */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-extrabold text-slate-900 flex items-center gap-1.5 text-xs">
                    <Clock className="w-4 h-4 text-red-600" />
                    <span>2. Catatan Keterlambatan Pengiriman (Jika Terlambat)</span>
                  </div>
                  {editActualDate && editingTask.estReturnDate && editActualDate > editingTask.estReturnDate && (
                    <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold text-[10px]">
                      ⚠️ Terlambat dari Jadwal Estimasi
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-medium text-[11px]">
                    Alasan / Catatan Keterlambatan dari Rekanan Vendor:
                  </label>
                  <textarea
                    rows={2}
                    value={editDelayNotes}
                    onChange={(e) => setEditDelayNotes(e.target.value)}
                    placeholder="Contoh: Terlambat 1 hari karena mesin bordir nomor 3 overhaul dinamo atau proses washing tertahan cuaca..."
                    className="w-full p-2 rounded-lg border border-slate-300 font-medium text-slate-800 focus:ring-1 focus:ring-blue-600 bg-white"
                  />
                </div>
              </div>

              {/* SEKSI 3: PILIHAN KETIDAKSESUAIAN BARANG DARI SUBKON */}
              <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-extrabold text-amber-950 flex items-center gap-1.5 text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>3. Pilihan &amp; Penanganan Ketidaksesuaian Barang Subkon</span>
                  </div>

                  {/* Toggle Discrepancy */}
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-amber-900">
                    <input
                      type="checkbox"
                      checked={editHasDiscrepancy}
                      onChange={(e) => setEditHasDiscrepancy(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                    <span>Ada Ketidaksesuaian Barang?</span>
                  </label>
                </div>

                {editHasDiscrepancy ? (
                  <div className="space-y-3 pt-2 border-t border-amber-200 animate-in fade-in duration-150">
                    
                    {/* Discrepancy Category & Quantity */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block font-bold text-slate-800 mb-1">
                          Kategori Masalah / Ketidaksesuaian:
                        </label>
                        <select
                          value={editDiscrepancyType}
                          onChange={(e) => setEditDiscrepancyType(e.target.value as SubconDiscrepancyType)}
                          className="w-full p-2 rounded-lg border border-amber-300 font-bold text-slate-900 bg-white"
                        >
                          <option value="Kuantitas Kurang (Shortage)">Kuantitas Kurang (Shortage / Hilang)</option>
                          <option value="Cacat Fisik / Reject (Bordir/Sablon/Jahit Rusak)">Cacat Fisik / Reject (Bordir Rusak / Sablon Pecah / Jahit Miring)</option>
                          <option value="Kain Rusak / Noda Minyak Subkon">Kain Rusak / Noda Minyak / Kotor Mesin Subkon</option>
                          <option value="Salah Posisi / Pola Terbalik">Salah Posisi / Pola Sablon / Terbalik</option>
                          <option value="Keterlambatan Fatal (Melebihi Target Delivery)">Keterlambatan Fatal (Melebihi Target Delivery)</option>
                          <option value="Lainnya / Catatan Khusus">Lainnya / Catatan Khusus</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-800 mb-1">
                          Jumlah Bermasalah (Pcs):
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={editDiscrepancyQty}
                          onChange={(e) => setEditDiscrepancyQty(Number(e.target.value))}
                          className="w-full p-2 rounded-lg border border-amber-300 font-black text-rose-600 bg-white"
                          required={editHasDiscrepancy}
                        />
                      </div>
                    </div>

                    {/* DISCREPANCY ACTION CARDS (PILIHAN TINDAKAN) */}
                    <div>
                      <label className="block font-bold text-slate-800 mb-1.5">
                        Pilihan Tindakan Penanganan dari PT Teratai Widjaja *:
                      </label>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        
                        {/* Option 1: RETUR REWORK */}
                        <div
                          onClick={() => setEditDiscrepancyAction('RETUR_REWORK')}
                          className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                            editDiscrepancyAction === 'RETUR_REWORK'
                              ? 'bg-amber-100/90 border-amber-500 ring-2 ring-amber-400/50'
                              : 'bg-white border-slate-200 hover:border-amber-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 font-black text-amber-950 text-xs">
                            <RotateCcw className="w-4 h-4 text-amber-700" />
                            <span>RETUR REWORK (Bongkar Ulang)</span>
                          </div>
                          <p className="text-[10px] text-slate-600 mt-1 leading-snug">
                            Kirim balik panel cacat ke rekanan subkon untuk dibongkar dan dikerjakan ulang secara gratis tanpa biaya tambahan.
                          </p>
                        </div>

                        {/* Option 2: KLAIM POTONG BIAYA */}
                        <div
                          onClick={() => setEditDiscrepancyAction('KLAIM_POTONG_BIAYA')}
                          className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                            editDiscrepancyAction === 'KLAIM_POTONG_BIAYA'
                              ? 'bg-red-100/90 border-red-500 ring-2 ring-red-400/50'
                              : 'bg-white border-slate-200 hover:border-red-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 font-black text-red-950 text-xs">
                            <DollarSign className="w-4 h-4 text-red-700" />
                            <span>KLAIM POTONG BIAYA / INVOICE</span>
                          </div>
                          <p className="text-[10px] text-slate-600 mt-1 leading-snug">
                            Potong langsung dari nilai invoice jasa subkon atau klaim kerugian bahan baku yang rusak ke finance.
                          </p>
                        </div>

                        {/* Option 3: TERIMA TOLERANSI GRADE B */}
                        <div
                          onClick={() => setEditDiscrepancyAction('TERIMA_TOLERANSI')}
                          className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                            editDiscrepancyAction === 'TERIMA_TOLERANSI'
                              ? 'bg-blue-100/90 border-blue-500 ring-2 ring-blue-400/50'
                              : 'bg-white border-slate-200 hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 font-black text-blue-950 text-xs">
                            <CheckCircle2 className="w-4 h-4 text-blue-700" />
                            <span>TERIMA BERSYARAT (TOLERANSI GRADE B)</span>
                          </div>
                          <p className="text-[10px] text-slate-600 mt-1 leading-snug">
                            Barang tetap diterima untuk dialihkan ke pasar lokal atau second-grade dengan kesepakatan kompensasi harga.
                          </p>
                        </div>

                        {/* Option 4: AFKIR REPLACE */}
                        <div
                          onClick={() => setEditDiscrepancyAction('AFKIR_REPLACE')}
                          className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                            editDiscrepancyAction === 'AFKIR_REPLACE'
                              ? 'bg-rose-100/90 border-rose-500 ring-2 ring-rose-400/50'
                              : 'bg-white border-slate-200 hover:border-rose-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 font-black text-rose-950 text-xs">
                            <ShieldAlert className="w-4 h-4 text-rose-700" />
                            <span>AFKIR TOTAL (SUBKON GANTI BARU)</span>
                          </div>
                          <p className="text-[10px] text-slate-600 mt-1 leading-snug">
                            Reject parah tidak dapat diperbaiki. Vendor subkon diwajibkan mengganti bahan kain panel baru yang rusak.
                          </p>
                        </div>

                      </div>
                    </div>

                    {/* Discrepancy Notes Textarea */}
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">
                        Catatan &amp; Instruksi Penanganan Ketidaksesuaian:
                      </label>
                      <textarea
                        rows={2}
                        value={editDiscrepancyNotes}
                        onChange={(e) => setEditDiscrepancyNotes(e.target.value)}
                        placeholder="Tuliskan nomor berita acara, instruksi tindak lanjut PE/QC, atau hasil kesepakatan dengan vendor..."
                        className="w-full p-2 rounded-lg border border-amber-300 font-medium text-slate-900 bg-white"
                      />
                    </div>

                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 italic">
                    Centang pilihan di atas jika ditemukan selisih kuantitas kurang, cacat bordir/sablon/wash, atau kerusakan kain dari vendor luar.
                  </p>
                )}
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl font-black shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Perubahan &amp; Penerimaan</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DISPATCH SPK SUBKON BARU                                           */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-bold">Kirim Pekerjaan ke Rekanan Subkon (SPK)</h2>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)} 
                className="text-slate-400 hover:text-white text-lg p-1 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateSubcon} className="p-6 space-y-3 text-xs max-h-[78vh] overflow-y-auto">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Rekanan Subkon *</label>
                <input
                  type="text"
                  placeholder="Contoh: CV Prima Bordir / PT Multi Screen"
                  value={newVendor}
                  onChange={(e) => setNewVendor(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jenis Pekerjaan *</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full p-2 rounded-lg border border-slate-300 font-medium"
                  >
                    <option value="Bordir Komputer">Bordir Komputer</option>
                    <option value="Sablon / Screen Printing">Sablon / Printing</option>
                    <option value="Washing Garment">Washing Garment</option>
                    <option value="Jahit Subkon Line 2">Jahit Subkon CMT</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Style Alokasi *</label>
                  <select
                    value={newStyleCode}
                    onChange={(e) => setNewStyleCode(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 font-bold text-indigo-700"
                  >
                    {styles.map(s => (
                      <option key={s.id} value={s.code}>{s.code} ({s.name})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jumlah Panel Dikirim *</label>
                  <input
                    type="number"
                    min="1"
                    value={newQtySend}
                    onChange={(e) => setNewQtySend(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tarif / Pcs (Rp) *</label>
                  <input
                    type="number"
                    min="100"
                    value={newRate}
                    onChange={(e) => setNewRate(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300 font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Estimasi Balik Pabrik *</label>
                <input
                  type="date"
                  value={newEstDate}
                  onChange={(e) => setNewEstDate(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama PIC Subkon</label>
                <input
                  type="text"
                  placeholder="Contoh: Bpk. Wahyudi (Manager Subkon)"
                  value={newPicSubcon}
                  onChange={(e) => setNewPicSubcon(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 font-medium"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 rounded-lg text-slate-700 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg font-bold shadow-xs cursor-pointer"
                >
                  Terbitkan SPK Subkon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
