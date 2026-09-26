import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  SubcontractorTask, 
  SubconDiscrepancyType, 
  SubconDiscrepancyAction,
  SubconIssueCategory 
} from '../types';
import { 
  Truck, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  DollarSign, 
  UserCheck, 
  Calendar, 
  Edit3,
  Check,
  RotateCcw,
  ShieldAlert,
  Filter,
  CheckSquare,
  Printer,
  BarChart3,
  KeyRound,
  TrendingUp,
  TrendingDown,
  Activity,
  Send,
  LogIn,
  Eye,
  Trash2,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export const SubcontractorManager: React.FC = () => {
  const { 
    subconTasks, 
    styles, 
    updateSubconTask, 
    addSubconTask, 
    addSubconDailyLog,
    deleteSubconDailyLog,
    subconWarnings,
    currentUser, 
    setCurrentUser,
    setIsLoginModalOpen,
    users,
    openPrintModal 
  } = useApp();

  // Main View Mode: 'MONITORING' (PE/PPIC/FM Analysis & Table) vs 'SUBCON_PORTAL' (Dedicated Subcon Daily Input)
  const [viewMode, setViewMode] = useState<'MONITORING' | 'SUBCON_PORTAL'>(
    currentUser.role === 'SUBCON' ? 'SUBCON_PORTAL' : 'MONITORING'
  );

  // Sync viewMode automatically when switching user role to SUBCON
  useEffect(() => {
    if (currentUser.role === 'SUBCON') {
      setViewMode('SUBCON_PORTAL');
    }
  }, [currentUser.role]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filterTab, setFilterTab] = useState<'ALL' | 'WARNING_H3' | 'WIP' | 'DISCREPANCY' | 'COMPLETED'>('ALL');

  // Selected Task for Deep Daily Analytics Modal / Drawer
  const [analyzingTaskId, setAnalyzingTaskId] = useState<string | null>(null);
  const analyzingTask = useMemo(
    () => subconTasks.find(t => t.id === analyzingTaskId) || null,
    [subconTasks, analyzingTaskId]
  );

  // Newly created SPK account credentials banner
  const [createdAccountBanner, setCreatedAccountBanner] = useState<{
    subconName: string;
    taskId: string;
    username: string;
    password: string;
    dailyTarget: number;
  } | null>(null);

  // ============================================================================
  // SUBCON DAILY INPUT FORM STATE (Portal Input Harian Subkon)
  // ============================================================================
  const availablePortalTasks = useMemo(() => {
    if (currentUser.role === 'SUBCON') {
      const matched = subconTasks.filter(
        t =>
          t.subconAccountId === currentUser.id ||
          t.subconUsername?.toLowerCase() === currentUser.username.toLowerCase() ||
          t.subconName.toLowerCase().includes(currentUser.name.toLowerCase())
      );
      return matched.length > 0 ? matched : subconTasks.filter(t => t.status !== 'Completed');
    }
    return subconTasks;
  }, [subconTasks, currentUser]);

  const [selectedPortalTaskId, setSelectedPortalTaskId] = useState<string>(
    availablePortalTasks[0]?.id || subconTasks[0]?.id || ''
  );

  useEffect(() => {
    if (availablePortalTasks.length > 0 && !availablePortalTasks.some(t => t.id === selectedPortalTaskId)) {
      setSelectedPortalTaskId(availablePortalTasks[0].id);
    }
  }, [availablePortalTasks, selectedPortalTaskId]);

  const portalTask = useMemo(
    () => subconTasks.find(t => t.id === selectedPortalTaskId) || availablePortalTasks[0] || subconTasks[0],
    [subconTasks, selectedPortalTaskId, availablePortalTasks]
  );

  const [logDate, setLogDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [logTargetPcs, setLogTargetPcs] = useState<number>(200);
  const [logActualPcs, setLogActualPcs] = useState<number>(180);
  const [logRejectPcs, setLogRejectPcs] = useState<number>(0);
  const [logWorkers, setLogWorkers] = useState<number>(6);
  const [logHasIssue, setLogHasIssue] = useState<boolean>(false);
  const [logIssueCategory, setLogIssueCategory] = useState<SubconIssueCategory>('Mesin Bermasalah / Breakdown');
  const [logIssueNotes, setLogIssueNotes] = useState<string>('');
  const [portalFeedback, setPortalFeedback] = useState<string>('');

  // Sync default daily target when portalTask changes
  useEffect(() => {
    if (portalTask) {
      const defaultTarget = portalTask.dailyTargetPcs || Math.ceil(portalTask.quantitySend / 6);
      setLogTargetPcs(defaultTarget);
      setLogActualPcs(defaultTarget);
    }
  }, [portalTask]);

  const handleSubmitDailyLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!portalTask) return;

    const res = addSubconDailyLog(portalTask.id, {
      date: logDate,
      targetPcs: Number(logTargetPcs),
      actualOutputPcs: Number(logActualPcs),
      rejectPcs: Number(logRejectPcs),
      workersCount: Number(logWorkers),
      hasIssue: logHasIssue,
      issueCategory: logHasIssue ? logIssueCategory : 'Normal / Lancar',
      issueNotes: logHasIssue ? logIssueNotes.trim() : 'Produksi harian berjalan normal sesuai jadwal.',
      inputBy: `${currentUser.name} (${currentUser.username})`
    });

    if (res.success) {
      setPortalFeedback(res.message);
      setLogIssueNotes('');
      setLogHasIssue(false);
      setTimeout(() => setPortalFeedback(''), 4500);
    }
  };

  // ============================================================================
  // EDIT / RECEIVE MODAL STATE (Internal QC & Factory Evaluation)
  // ============================================================================
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

  // ============================================================================
  // ADD SPK + SUBCON ACCOUNT CREATION STATE
  // ============================================================================
  const [newVendor, setNewVendor] = useState('');
  const [newType, setNewType] = useState<SubcontractorTask['type']>('Bordir Komputer');
  const [newStyleCode, setNewStyleCode] = useState(styles[0]?.code || 'TW-JKT-88');
  const [newQtySend, setNewQtySend] = useState(1200);
  const [newUnit, setNewUnit] = useState('Pcs Panel');
  const [newEstDate, setNewEstDate] = useState(() => new Date(Date.now() + 6 * 86400000).toISOString().split('T')[0]);
  const [newDailyTarget, setNewDailyTarget] = useState<number>(200);
  const [newPicSubcon, setNewPicSubcon] = useState('');
  const [newRate, setNewRate] = useState(7500);
  const [createDedicatedAccount, setCreateDedicatedAccount] = useState<boolean>(true);
  const [newSubconUsername, setNewSubconUsername] = useState<string>('');
  const [newSubconPassword, setNewSubconPassword] = useState<string>('subcon123');

  // Auto-suggest username & daily target when vendor or qty/date changes
  useEffect(() => {
    if (newVendor.trim()) {
      const slug = newVendor
        .toLowerCase()
        .replace(/^(cv|pt|ud|pd)\s+/i, '')
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '')
        .slice(0, 12);
      setNewSubconUsername(`subkon_${slug || 'mitra'}`);
    } else {
      setNewSubconUsername('');
    }
  }, [newVendor]);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const est = new Date(newEstDate + 'T00:00:00');
    const days = Math.max(1, Math.ceil((est.getTime() - today.getTime()) / 86400000));
    setNewDailyTarget(Math.ceil(newQtySend / days));
  }, [newQtySend, newEstDate]);

  // Helper to compute per-task analytics
  const getTaskAnalytics = (task: SubcontractorTask) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const estDate = new Date(task.estReturnDate + 'T00:00:00');
    const sendDate = new Date(task.sendDate + 'T00:00:00');
    const daysUntilDeadline = Math.ceil((estDate.getTime() - today.getTime()) / 86400000);
    const totalPlannedDays = Math.max(1, Math.ceil((estDate.getTime() - sendDate.getTime()) / 86400000));

    const logs = task.dailyLogs || [];
    const totalLoggedOutput = logs.reduce((s, l) => s + l.actualOutputPcs, 0);
    const totalCompleted = Math.max(task.quantityReceived, totalLoggedOutput);
    const remainingQty = Math.max(0, task.quantitySend - totalCompleted);
    const progressPercent = Math.min(100, Math.round((totalCompleted / Math.max(1, task.quantitySend)) * 100));

    const dailyTarget = task.dailyTargetPcs || Math.ceil(task.quantitySend / totalPlannedDays);
    const avgActualDaily = logs.length > 0 ? Math.round(totalLoggedOutput / logs.length) : 0;
    const achievementRate = dailyTarget > 0 && avgActualDaily > 0 ? Math.round((avgActualDaily / dailyTarget) * 100) : 0;

    const effectiveDaysLeft = Math.max(1, daysUntilDeadline);
    const requiredDailyRate = remainingQty > 0 ? Math.ceil(remainingQty / effectiveDaysLeft) : 0;

    const velocity = avgActualDaily > 0 ? avgActualDaily : dailyTarget;
    const daysNeededForRemaining = remainingQty > 0 && velocity > 0 ? Math.ceil(remainingQty / velocity) : 0;
    const projectedDelayDays = Math.max(0, daysNeededForRemaining - Math.max(0, daysUntilDeadline));

    const projectedFinishDate = new Date(today);
    projectedFinishDate.setDate(projectedFinishDate.getDate() + daysNeededForRemaining);
    const projectedFinishDateStr = projectedFinishDate.toISOString().split('T')[0];

    const warningMatch = subconWarnings.find(w => w.taskId === task.id);

    return {
      daysUntilDeadline,
      totalCompleted,
      remainingQty,
      progressPercent,
      dailyTarget,
      avgActualDaily,
      achievementRate,
      requiredDailyRate,
      projectedDelayDays,
      projectedFinishDateStr,
      logs,
      warningMatch
    };
  };

  const totalCostAllSubcon = subconTasks.reduce((sum, s) => sum + s.totalCost, 0);
  const activeWIPCount = subconTasks.filter(s => s.status !== 'Completed').length;
  const discrepancyCount = subconTasks.filter(s => s.hasDiscrepancy).length;
  const completedCount = subconTasks.filter(s => s.status === 'Completed').length;

  // Quick 1-click switch to Subcon account for testing/simulation
  const handleQuickSwitchToSubcon = (task: SubcontractorTask) => {
    const foundUser = users.find(
      u =>
        (task.subconAccountId && u.id === task.subconAccountId) ||
        (task.subconUsername && u.username.toLowerCase() === task.subconUsername.toLowerCase()) ||
        (u.role === 'SUBCON' && u.name.toLowerCase().includes(task.subconName.toLowerCase()))
    );
    if (foundUser) {
      setCurrentUser(foundUser);
      setSelectedPortalTaskId(task.id);
      setViewMode('SUBCON_PORTAL');
    } else {
      setSelectedPortalTaskId(task.id);
      setViewMode('SUBCON_PORTAL');
    }
  };

  // Switch back to PE Admin
  const handleSwitchBackToPE = () => {
    const peUser = users.find(u => u.role === 'PE') || users[0];
    if (peUser) {
      setCurrentUser(peUser);
      setViewMode('MONITORING');
    }
  };

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

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;

    const qtyRec = Number(editQtyReceived);
    const defect = Number(editDefectPcs);
    const discQty = Number(editDiscrepancyQty);

    let finalStatus = editStatus;
    if (qtyRec >= editingTask.quantitySend) {
      finalStatus = 'Completed';
    } else if (qtyRec > 0 && finalStatus === 'In Progress') {
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
    const result = addSubconTask(
      {
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
        defectPcs: 0,
        dailyTargetPcs: Number(newDailyTarget) || 200
      },
      {
        createDedicatedAccount,
        username: newSubconUsername.trim() || undefined,
        password: newSubconPassword.trim() || 'subcon123'
      }
    );

    if (result.credentials) {
      setCreatedAccountBanner({
        subconName: newVendor.trim(),
        taskId: result.taskId,
        username: result.credentials.username,
        password: result.credentials.password,
        dailyTarget: Number(newDailyTarget) || 200
      });
    }

    setIsAddModalOpen(false);
    setNewVendor('');
    setNewPicSubcon('');
  };

  // Filtered tasks based on active filter tab
  const filteredTasks = useMemo(() => {
    return subconTasks.filter(task => {
      if (filterTab === 'ALL') return true;
      if (filterTab === 'WARNING_H3') return subconWarnings.some(w => w.taskId === task.id);
      if (filterTab === 'WIP') return task.status !== 'Completed';
      if (filterTab === 'DISCREPANCY') return task.hasDiscrepancy;
      if (filterTab === 'COMPLETED') return task.status === 'Completed';
      return true;
    });
  }, [subconTasks, filterTab, subconWarnings]);

  const getActionBadge = (action?: SubconDiscrepancyAction) => {
    switch (action) {
      case 'RETUR_REWORK':
        return {
          label: 'Retur Rework',
          color: 'bg-amber-100 text-amber-900 border-amber-300',
          icon: <RotateCcw className="w-3 h-3 text-amber-700" />
        };
      case 'KLAIM_POTONG_BIAYA':
        return {
          label: 'Klaim Potong Biaya',
          color: 'bg-red-100 text-red-900 border-red-300',
          icon: <DollarSign className="w-3 h-3 text-red-700" />
        };
      case 'TERIMA_TOLERANSI':
        return {
          label: 'Toleransi Grade B',
          color: 'bg-blue-100 text-blue-900 border-blue-300',
          icon: <CheckCircle2 className="w-3 h-3 text-blue-700" />
        };
      case 'AFKIR_REPLACE':
        return {
          label: 'Afkir Ganti Baru',
          color: 'bg-rose-100 text-rose-900 border-rose-300',
          icon: <ShieldAlert className="w-3 h-3 text-rose-700" />
        };
      case 'SESUAI_QC':
        return {
          label: 'Sesuai QC',
          color: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          icon: <Check className="w-3 h-3 text-emerald-700" />
        };
      default:
        return null;
    }
  };

  return (
    <div className="space-y-5">
      
      {/* ========================================================================= */}
      {/* ACTIVE SUBCON ACCOUNT BANNER (WHEN LOGGED IN AS SUBCON)                  */}
      {/* ========================================================================= */}
      {currentUser.role === 'SUBCON' && (
        <div className="bg-gradient-to-r from-cyan-900 via-cyan-800 to-slate-900 text-white rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400/30">
              <KeyRound className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-400 text-slate-950">
                  Akun Khusus Mitra Subkon Aktif
                </span>
                <span className="text-xs font-mono text-cyan-200">User: {currentUser.username}</span>
              </div>
              <h2 className="text-sm font-black mt-0.5">
                {currentUser.name} — Portal Laporan Target Harian Subkon
              </h2>
            </div>
          </div>
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5 text-cyan-300" />
            <span>Ganti Akun (Login User &amp; Pass)</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* NEWLY CREATED SUBCON ACCOUNT NOTIFICATION BANNER                          */}
      {/* ========================================================================= */}
      {createdAccountBanner && (
        <div className="bg-emerald-950 text-white rounded-2xl p-4 border border-emerald-700 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-400 text-emerald-950 text-[10px] font-black uppercase">
                SPK &amp; Akun Subkon Berhasil Dibuat
              </span>
              <span className="text-xs font-mono text-emerald-300">{createdAccountBanner.taskId}</span>
            </div>
            <div className="text-sm font-black">
              Akses Akun Khusus untuk <span className="text-emerald-300">{createdAccountBanner.subconName}</span> Siap Digunakan!
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-emerald-100 pt-1">
              <span className="bg-emerald-900/80 px-2.5 py-1 rounded-lg border border-emerald-700 font-mono">
                User: <strong className="text-white">{createdAccountBanner.username}</strong>
              </span>
              <span className="bg-emerald-900/80 px-2.5 py-1 rounded-lg border border-emerald-700 font-mono">
                Password: <strong className="text-white">•••••• (Tersimpan)</strong>
              </span>
              <span className="bg-emerald-900/80 px-2.5 py-1 rounded-lg border border-emerald-700">
                Wajib Input Target: <strong className="text-white">{createdAccountBanner.dailyTarget} Pcs/Hari</strong>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                const task = subconTasks.find(t => t.id === createdAccountBanner.taskId);
                if (task) handleQuickSwitchToSubcon(task);
                setCreatedAccountBanner(null);
              }}
              className="px-3.5 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-black text-xs cursor-pointer flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Buka Portal Input Subkon</span>
            </button>
            <button
              onClick={() => setCreatedAccountBanner(null)}
              className="p-2 text-emerald-300 hover:text-white cursor-pointer"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOP HEADER & MODE SWITCHER (INTERNAL / PE ONLY — HIDDEN FOR SUBCON)       */}
      {/* ========================================================================= */}
      {currentUser.role !== 'SUBCON' && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-md bg-cyan-100 text-cyan-800 text-xs font-bold flex items-center gap-1 border border-cyan-200">
                  <Truck className="w-3.5 h-3.5 text-cyan-700" />
                  Kontrol Subkon &amp; Target Harian
                </span>
                {subconWarnings.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-md bg-red-600 text-white text-xs font-black flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {subconWarnings.length} Warning H-3 Terdeteksi!
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Manajemen Subkon, Analisis Target Harian &amp; Peringatan Dini (H-3)
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Setiap SPK subkon dilengkapi akun khusus untuk input target harian, analisis capaian otomatis, dan deteksi masalah 3 hari sebelum batas kirim.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap shrink-0">
              {/* Switch Mode: Monitoring vs Portal Input Harian Subkon */}
              <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center gap-1">
                <button
                  onClick={() => setViewMode('MONITORING')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === 'MONITORING'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Analisis &amp; Monitoring SPK</span>
                </button>
                <button
                  onClick={() => setViewMode('SUBCON_PORTAL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === 'SUBCON_PORTAL'
                      ? 'bg-cyan-700 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Portal Input Harian Subkon</span>
                </button>
              </div>

              <button
                onClick={() => openPrintModal('subcon')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">Cetak PDF</span>
              </button>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Beri Pekerjaan Subkon &amp; Buat Akun</span>
              </button>
            </div>
          </div>

          {/* Summary KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            <div className="p-3 rounded-xl bg-red-50/70 border border-red-200">
              <div className="text-[11px] text-red-700 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Warning Masalah (H-3)</span>
              </div>
              <div className="text-xl font-black text-red-700 mt-0.5">
                {subconWarnings.length} SPK Berisiko
              </div>
              <div className="text-[10px] text-red-600/80">Deteksi otomatis 3 hari sebelum deadline</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[11px] text-slate-500 font-semibold">Pekerjaan Subkon Aktif (WIP)</div>
              <div className="text-xl font-black text-cyan-700 mt-0.5">{activeWIPCount} SPK Jalan</div>
              <div className="text-[10px] text-slate-400">Wajib lapor target harian via akun subkon</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[11px] text-slate-500 font-semibold">Ketidaksesuaian QC</div>
              <div className={`text-xl font-black mt-0.5 ${discrepancyCount > 0 ? 'text-amber-600' : 'text-slate-700'}`}>
                {discrepancyCount} Kasus
              </div>
              <div className="text-[10px] text-slate-400">Retur rework / klaim potongan biaya</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[11px] text-slate-500 font-semibold">Total Nilai Kontrak Subkon</div>
              <div className="text-xl font-black text-slate-900 mt-0.5">Rp {totalCostAllSubcon.toLocaleString('id-ID')}</div>
              <div className="text-[10px] text-slate-400">Tersinkronisasi dengan Arus Kas</div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PERINGATAN DINI H-3 (ONLY FOR INTERNAL / PE — HIDDEN FOR SUBCON)          */}
      {/* ========================================================================= */}
      {currentUser.role !== 'SUBCON' && subconWarnings.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 via-amber-50/70 to-red-50 rounded-2xl p-4 sm:p-5 border-2 border-red-300 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-red-200">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-red-600 text-white shadow-xs shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-red-600 text-white">
                    Early Warning System (H-3)
                  </span>
                  <span className="text-xs font-bold text-red-800">
                    Deteksi Masalah 3 Hari Sebelum Target Kembali
                  </span>
                </div>
                <h2 className="text-sm font-black text-slate-900 mt-0.5">
                  Perhatian! {subconWarnings.length} Pekerjaan Subkon Mengalami Defisit Target Harian / Kendala Produksi Menjelang Deadline
                </h2>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {subconWarnings.map((warn) => {
              const taskObj = subconTasks.find(t => t.id === warn.taskId);
              return (
                <div
                  key={warn.taskId}
                  className="bg-white rounded-xl p-4 border border-red-200 shadow-2xs flex flex-col justify-between gap-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-slate-900 text-sm">{warn.subconName}</span>
                          <span className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                            {warn.styleCode}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {warn.serviceType} • SPK: {warn.taskId} • Deadline: <strong>{warn.estReturnDate}</strong>
                        </div>
                      </div>

                      <span className={`px-2.5 py-1 rounded-lg text-xs font-black shrink-0 ${
                        warn.daysUntilDeadline < 0
                          ? 'bg-red-700 text-white'
                          : 'bg-red-600 text-white animate-pulse'
                      }`}>
                        {warn.daysUntilDeadline < 0
                          ? `TERLAMBAT ${Math.abs(warn.daysUntilDeadline)} HARI`
                          : warn.daysUntilDeadline === 0
                          ? 'DEADLINE HARI INI (H-0)'
                          : `WARNING H-${warn.daysUntilDeadline} (${warn.daysUntilDeadline} Hari Lagi)`}
                      </span>
                    </div>

                    {/* Analytical Comparison Box */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px]">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Target vs Aktual Harian</span>
                        <span className="font-black text-red-600">
                          {warn.avgActualDailyPcs} <span className="text-slate-400 font-normal">/ {warn.dailyTargetPcs} pcs</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Sisa Belum Selesai</span>
                        <span className="font-black text-slate-900">
                          {warn.remainingQty.toLocaleString()} <span className="text-slate-400 font-normal">dari {warn.quantitySend}</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Target Kejar Baru</span>
                        <span className="font-black text-amber-700">
                          {warn.requiredDailyRateToFinish} pcs/hari
                        </span>
                      </div>
                    </div>

                    {/* Reasons & Reported Issue */}
                    <div className="space-y-1 text-xs">
                      {warn.reasons.map((r, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-red-800 font-medium text-[11px]">
                          <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[10px] font-bold text-slate-500">
                      Prediksi Selesai: <strong className="text-red-700">Meleset +{warn.projectedDelayDays} Hari</strong> jika tanpa intervensi
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setAnalyzingTaskId(warn.taskId)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <BarChart3 className="w-3 h-3 text-cyan-400" />
                        <span>Buka Analisis</span>
                      </button>
                      {taskObj && (
                        <button
                          onClick={() => {
                            setSelectedPortalTaskId(taskObj.id);
                            setViewMode('SUBCON_PORTAL');
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Activity className="w-3 h-3" />
                          <span>Input Harian</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE 2: PORTAL INPUT HARIAN KHUSUS SUBKON                            */}
      {/* ========================================================================= */}
      {viewMode === 'SUBCON_PORTAL' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Left Column (5 cols): Form Input Data Harian Target oleh Subkon */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="bg-cyan-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-700">
                  <Activity className="w-4 h-4 text-cyan-200" />
                </div>
                <div>
                  <h2 className="text-sm font-black">Input Data Harian Target Subkon</h2>
                  <p className="text-[11px] text-cyan-200">
                    Masukkan hasil capaian produksi harian sesuai target SPK
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmitDailyLog} className="p-5 space-y-4 text-xs">
              {portalFeedback && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{portalFeedback}</span>
                </div>
              )}

              {/* Pilih SPK Subkon */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Pilih SPK Pekerjaan Subkon *
                </label>
                <select
                  value={portalTask?.id || ''}
                  onChange={(e) => setSelectedPortalTaskId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-cyan-600"
                >
                  {availablePortalTasks.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.id} — {t.subconName} ({t.styleCode} • {t.quantitySend} Pcs)
                    </option>
                  ))}
                </select>
                {portalTask?.subconUsername && (
                  <div className="mt-1.5 flex items-center justify-between text-[11px] bg-cyan-50/80 px-2.5 py-1.5 rounded-lg border border-cyan-200 text-cyan-900">
                    <span>Akun Akses: <strong>@{portalTask.subconUsername}</strong></span>
                    <span>Target Kembali: <strong>{portalTask.estReturnDate}</strong></span>
                  </div>
                )}
              </div>

              {/* Tanggal & Target Harian */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Produksi *</label>
                  <input
                    type="date"
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300 font-bold text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Harian (Pcs) *</label>
                  <input
                    type="number"
                    min="1"
                    value={logTargetPcs}
                    onChange={(e) => setLogTargetPcs(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-slate-300 font-black text-slate-700 bg-slate-50"
                    required
                  />
                </div>
              </div>

              {/* Capaian Output Aktual & Reject */}
              <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-200 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-extrabold text-blue-950 mb-1">
                      Hasil Selesai Hari Ini (Pcs OK) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={logActualPcs}
                      onChange={(e) => setLogActualPcs(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-blue-400 font-black text-base text-slate-900 bg-white focus:ring-2 focus:ring-blue-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Jumlah Cacat / Reject (Pcs)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={logRejectPcs}
                      onChange={(e) => setLogRejectPcs(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-base text-rose-600 bg-white"
                    />
                  </div>
                </div>

                {/* Live Comparison Indicator */}
                {logTargetPcs > 0 && (
                  <div className={`p-2 rounded-lg text-[11px] font-bold flex items-center justify-between ${
                    logActualPcs >= logTargetPcs
                      ? 'bg-emerald-100 text-emerald-900'
                      : 'bg-amber-100 text-amber-900'
                  }`}>
                    <span>
                      Pencapaian Hari Ini: {Math.round((logActualPcs / logTargetPcs) * 100)}% dari Target
                    </span>
                    <span>
                      {logActualPcs >= logTargetPcs
                        ? `+${logActualPcs - logTargetPcs} Pcs (Target Tercapai)`
                        : `Kurang ${logTargetPcs - logActualPcs} Pcs dari Target`}
                    </span>
                  </div>
                )}
              </div>

              {/* Jumlah Operator & Status Masalah */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Jumlah Operator / Mesin Jalan Hari Ini
                </label>
                <input
                  type="number"
                  min="1"
                  value={logWorkers}
                  onChange={(e) => setLogWorkers(Number(e.target.value))}
                  className="w-full p-2 rounded-xl border border-slate-300 font-bold text-slate-800"
                />
              </div>

              {/* Apakah Ada Masalah / Kendala? */}
              <div className="space-y-2.5 pt-1">
                <label className="block font-bold text-slate-800">
                  Catatan Kelancaran Produksi Hari Ini:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLogHasIssue(false)}
                    className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      !logHasIssue
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Lancar / Normal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogHasIssue(true)}
                    className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      logHasIssue
                        ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-amber-50'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Ada Kendala</span>
                  </button>
                </div>

                {logHasIssue && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-2.5 animate-in fade-in duration-150">
                    <div>
                      <label className="block font-bold text-amber-900 mb-1">Kategori Kendala *</label>
                      <select
                        value={logIssueCategory}
                        onChange={(e) => setLogIssueCategory(e.target.value as SubconIssueCategory)}
                        className="w-full p-2 rounded-lg border border-amber-300 font-bold text-slate-900 bg-white"
                      >
                        <option value="Mesin Bermasalah / Breakdown">Mesin Bermasalah / Breakdown</option>
                        <option value="Bahan Baku / Panel Kurang">Bahan Baku / Panel Kurang</option>
                        <option value="Operator Absen / Kurang Tenaga">Operator Absen / Kurang Tenaga</option>
                        <option value="Masalah Kualitas (Reject Tinggi)">Masalah Kualitas (Reject Tinggi)</option>
                        <option value="Listrik / Utilitas Terkendala">Listrik / Utilitas Terkendala</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-amber-900 mb-1">
                        Keterangan Kendala Produksi *
                      </label>
                      <textarea
                        rows={2}
                        value={logIssueNotes}
                        onChange={(e) => setLogIssueNotes(e.target.value)}
                        placeholder="Tuliskan keterangan kendala produksi hari ini..."
                        className="w-full p-2 rounded-lg border border-amber-300 font-medium text-slate-900 bg-white"
                        required={logHasIssue}
                      />
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-black text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>Simpan Input Data Harian</span>
              </button>
            </form>
          </div>

          {/* Right Column (7 cols): Daily Input History (Without Early Warning Notifications for SUBCON) */}
          <div className="lg:col-span-7 space-y-4">
            {portalTask && (() => {
              const stats = getTaskAnalytics(portalTask);
              return (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-black text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                          {portalTask.id}
                        </span>
                        <span className="text-xs font-mono font-bold text-indigo-700">
                          Style: {portalTask.styleCode}
                        </span>
                      </div>
                      <h3 className="text-base font-black text-slate-900 mt-1">
                        {currentUser.role === 'SUBCON'
                          ? `Rekap Input Harian: ${portalTask.subconName} (${portalTask.type})`
                          : `Analisis Target Harian: ${portalTask.subconName} (${portalTask.type})`}
                      </h3>
                    </div>

                    {currentUser.role === 'SUBCON' ? (
                      <span className="px-3 py-1 rounded-xl text-xs font-bold shrink-0 bg-slate-100 text-slate-700 border border-slate-200">
                        Target Kembali: {portalTask.estReturnDate}
                      </span>
                    ) : (
                      <span className={`px-3 py-1 rounded-xl text-xs font-black shrink-0 ${
                        stats.daysUntilDeadline <= 3 && stats.remainingQty > 0
                          ? 'bg-red-100 text-red-800 border border-red-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}>
                        {stats.daysUntilDeadline < 0
                          ? `Lewat Deadline ${Math.abs(stats.daysUntilDeadline)} Hari`
                          : `Batas Kirim: H-${stats.daysUntilDeadline} (${portalTask.estReturnDate})`}
                      </span>
                    )}
                  </div>

                  {/* Summary Metrics: Clean Input Summary for SUBCON vs Analytical Metrics for PE */}
                  {currentUser.role === 'SUBCON' ? (
                    <div className="grid grid-cols-3 gap-2.5 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">Total Order SPK</span>
                        <strong className="text-sm font-black text-slate-900">
                          {portalTask.quantitySend.toLocaleString()} {portalTask.unit}
                        </strong>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Target Harian: {stats.dailyTarget} Pcs/Hr
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">Total Sudah Diinput</span>
                        <strong className="text-sm font-black text-cyan-700">
                          {stats.totalCompleted.toLocaleString()} Pcs
                        </strong>
                        <span className="text-[10px] text-cyan-700 font-bold block mt-0.5">
                          {stats.progressPercent}% Terkumpul
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">Sisa Order</span>
                        <strong className="text-sm font-black text-slate-900">
                          {stats.remainingQty.toLocaleString()} Pcs
                        </strong>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {stats.logs.length} Hari Diinput
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">Progress Kumulatif</span>
                        <strong className="text-sm font-black text-slate-900">
                          {stats.totalCompleted.toLocaleString()} / {portalTask.quantitySend.toLocaleString()}
                        </strong>
                        <span className="text-[10px] text-cyan-700 font-bold block mt-0.5">
                          {stats.progressPercent}% Selesai
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">Rata-rata Aktual/Hari</span>
                        <strong className={`text-sm font-black ${
                          stats.avgActualDaily < stats.dailyTarget ? 'text-red-600' : 'text-emerald-700'
                        }`}>
                          {stats.avgActualDaily} Pcs/Hr
                        </strong>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Target: {stats.dailyTarget} Pcs/Hr
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">Target Kejar Sisa Waktu</span>
                        <strong className="text-sm font-black text-amber-700">
                          {stats.requiredDailyRate} Pcs/Hr
                        </strong>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Sisa: {stats.remainingQty.toLocaleString()} Pcs
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">Prediksi Selesai</span>
                        <strong className={`text-sm font-black ${
                          stats.projectedDelayDays > 0 ? 'text-red-600' : 'text-emerald-700'
                        }`}>
                          {stats.projectedDelayDays > 0 ? `Telat +${stats.projectedDelayDays} Hr` : 'Tepat Waktu'}
                        </strong>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Est: {stats.projectedFinishDateStr}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Visual Progress Bar */}
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-700">Progress Penyelesaian Target SPK</span>
                      <span className="text-cyan-800">{stats.progressPercent}% ({stats.totalCompleted} Pcs)</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className={`h-full transition-all duration-300 ${
                          currentUser.role !== 'SUBCON' && stats.warningMatch ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${stats.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Daily Log Table */}
                  <div className="space-y-2">
                    <div className="text-xs font-black text-slate-800 flex items-center justify-between">
                      <span>Riwayat Input Harian oleh Akun Subkon ({stats.logs.length} Hari Tercatat)</span>
                    </div>

                    {stats.logs.length > 0 ? (
                      <div className="overflow-x-auto border border-slate-200 rounded-xl">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-100 text-slate-700 font-bold text-[11px] border-b border-slate-200">
                              <th className="py-2.5 px-3">Tanggal</th>
                              <th className="py-2.5 px-3 text-right">Target</th>
                              <th className="py-2.5 px-3 text-right">Aktual OK</th>
                              <th className="py-2.5 px-3 text-center">% Capai</th>
                              <th className="py-2.5 px-3 text-right">Reject</th>
                              <th className="py-2.5 px-3">Status &amp; Kendala Dilaporkan</th>
                              <th className="py-2.5 px-2 text-center">Hapus</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {stats.logs.map((log) => {
                              const pct = log.targetPcs > 0 ? Math.round((log.actualOutputPcs / log.targetPcs) * 100) : 100;
                              return (
                                <tr key={log.id} className={log.hasIssue ? 'bg-red-50/50' : 'hover:bg-slate-50'}>
                                  <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">{log.date}</td>
                                  <td className="py-2.5 px-3 text-right text-slate-600 font-medium">{log.targetPcs}</td>
                                  <td className="py-2.5 px-3 text-right font-black text-slate-900">{log.actualOutputPcs}</td>
                                  <td className="py-2.5 px-3 text-center">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                      pct >= 100
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : pct >= 80
                                        ? 'bg-amber-100 text-amber-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                      {pct}%
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-bold text-rose-600">
                                    {log.rejectPcs > 0 ? log.rejectPcs : '-'}
                                  </td>
                                  <td className="py-2.5 px-3">
                                    {log.hasIssue ? (
                                      <div>
                                        <span className="text-[10px] font-black text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
                                          ⚠️ {log.issueCategory}
                                        </span>
                                        <p className="text-[11px] text-red-900 mt-0.5">{log.issueNotes}</p>
                                      </div>
                                    ) : (
                                      <span className="text-[11px] text-emerald-700 font-semibold">
                                        ✅ Lancar ({log.issueNotes || 'Normal'})
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-2 text-center">
                                    <button
                                      type="button"
                                      onClick={() => deleteSubconDailyLog(portalTask.id, log.id)}
                                      className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                                      title="Hapus baris log harian"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-400 text-xs">
                        Belum ada input data harian dari subkon untuk SPK ini. Silakan isi form di sebelah kiri.
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE 1: MONITORING, ANALISIS TARGET HARIAN & DAFTAR SPK              */}
      {/* ========================================================================= */}
      {viewMode === 'MONITORING' && (
        <>
          {/* Filter Tabs Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1 shrink-0 mr-1">
                <Filter className="w-3.5 h-3.5 text-cyan-700" />
                Filter:
              </span>
              <button
                onClick={() => setFilterTab('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  filterTab === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Semua SPK ({subconTasks.length})
              </button>
              <button
                onClick={() => setFilterTab('WARNING_H3')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1 ${
                  filterTab === 'WARNING_H3'
                    ? 'bg-red-600 text-white'
                    : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                }`}
              >
                <AlertTriangle className="w-3 h-3" />
                <span>Warning H-3 ({subconWarnings.length})</span>
              </button>
              <button
                onClick={() => setFilterTab('WIP')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  filterTab === 'WIP' ? 'bg-cyan-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Sedang Jalan ({activeWIPCount})
              </button>
              <button
                onClick={() => setFilterTab('DISCREPANCY')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  filterTab === 'DISCREPANCY'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                Ketidaksesuaian QC ({discrepancyCount})
              </button>
              <button
                onClick={() => setFilterTab('COMPLETED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  filterTab === 'COMPLETED' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Selesai ({completedCount})
              </button>
            </div>

            <div className="text-xs text-slate-500 shrink-0">
              Menampilkan <strong>{filteredTasks.length}</strong> SPK Subkon
            </div>
          </div>

          {/* Subcon Tasks Table with Daily Target Analysis & Dedicated Account Info */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                    <th className="py-3 px-3">Rekanan Subkon &amp; Akun Akses</th>
                    <th className="py-3 px-3">Style &amp; Jasa</th>
                    <th className="py-3 px-3 text-right">Target SPK</th>
                    <th className="py-3 px-3 bg-cyan-50/60 text-cyan-950">Analisis Target Harian</th>
                    <th className="py-3 px-3">Jadwal &amp; Countdown H-3</th>
                    <th className="py-3 px-3">Status, Warning &amp; QC</th>
                    <th className="py-3 px-3 text-center">Aksi &amp; Analisis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTasks.map((task) => {
                    const stats = getTaskAnalytics(task);
                    const isCompleted = task.status === 'Completed' || stats.totalCompleted >= task.quantitySend;
                    const actionBadge = getActionBadge(task.discrepancyAction);

                    return (
                      <tr key={task.id} className={`transition-colors ${stats.warningMatch ? 'bg-red-50/25 hover:bg-red-50/50' : 'hover:bg-slate-50/80'}`}>
                        {/* Subcon Name & Dedicated Account */}
                        <td className="py-3.5 px-3 align-top">
                          <div className="font-black text-slate-900 text-xs">{task.subconName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{task.id} • PIC: {task.picSubcon}</div>
                          {task.subconUsername && (
                            <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[10px]">
                              <KeyRound className="w-3 h-3 text-cyan-700 shrink-0" />
                              <span className="font-mono text-slate-700">
                                Akun: <strong>{task.subconUsername}</strong>
                              </span>
                              <button
                                onClick={() => handleQuickSwitchToSubcon(task)}
                                className="ml-1 px-1.5 py-0.5 rounded bg-cyan-700 hover:bg-cyan-800 text-white font-bold cursor-pointer"
                                title="Masuk / Simulasi sebagai akun subkon ini untuk input data harian"
                              >
                                Masuk Akun
                              </button>
                            </div>
                          )}
                        </td>

                        {/* Style & Service Type */}
                        <td className="py-3.5 px-3 align-top">
                          <div className="font-black text-indigo-700 font-mono">{task.styleCode}</div>
                          <span className="mt-1 px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-800 border border-cyan-200 font-semibold text-[10px] inline-block">
                            {task.type}
                          </span>
                          <div className="text-[10px] text-slate-500 mt-1">
                            Rp {task.totalCost.toLocaleString('id-ID')}
                          </div>
                        </td>

                        {/* Target SPK & Progress */}
                        <td className="py-3.5 px-3 text-right align-top">
                          <div className="font-black text-slate-900">{task.quantitySend.toLocaleString()} Pcs</div>
                          <div className="text-[11px] font-bold text-emerald-700 mt-0.5">
                            Selesai: {stats.totalCompleted.toLocaleString()} Pcs
                          </div>
                          <div className="text-[10px] text-amber-700 font-semibold">
                            Sisa: {stats.remainingQty.toLocaleString()} Pcs
                          </div>
                          <div className="w-24 ml-auto h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1">
                            <div
                              className={`h-full ${stats.warningMatch ? 'bg-red-500' : 'bg-emerald-500'}`}
                              style={{ width: `${stats.progressPercent}%` }}
                            />
                          </div>
                        </td>

                        {/* Daily Target Analysis Column */}
                        <td className="py-3.5 px-3 bg-cyan-50/30 align-top">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] text-slate-500">Target Harian:</span>
                            <strong className="font-black text-slate-900">{stats.dailyTarget} Pcs/hr</strong>
                          </div>
                          <div className="flex items-center justify-between gap-2 mt-0.5">
                            <span className="text-[10px] text-slate-500">Rata-rata Aktual:</span>
                            <strong className={`font-black ${
                              stats.avgActualDaily === 0
                                ? 'text-slate-400'
                                : stats.avgActualDaily < stats.dailyTarget
                                ? 'text-red-600'
                                : 'text-emerald-700'
                            }`}>
                              {stats.avgActualDaily > 0 ? `${stats.avgActualDaily} Pcs/hr` : 'Belum Input'}
                            </strong>
                          </div>
                          <div className="mt-1.5 flex items-center justify-between text-[10px] pt-1 border-t border-cyan-100">
                            <span className="text-slate-500">{stats.logs.length} log harian</span>
                            {stats.projectedDelayDays > 0 && !isCompleted ? (
                              <span className="text-red-700 font-bold">Prediksi +{stats.projectedDelayDays} hr</span>
                            ) : (
                              <span className="text-emerald-700 font-bold">On-Track</span>
                            )}
                          </div>
                        </td>

                        {/* Schedule & H-3 Countdown */}
                        <td className="py-3.5 px-3 align-top text-[11px]">
                          <div className="text-slate-500">Kirim: {task.sendDate}</div>
                          <div className="font-bold text-slate-900">Deadline: {task.estReturnDate}</div>
                          {!isCompleted && (
                            <div className="mt-1">
                              {stats.daysUntilDeadline < 0 ? (
                                <span className="px-2 py-0.5 rounded bg-red-600 text-white font-black text-[10px]">
                                  Lewat {Math.abs(stats.daysUntilDeadline)} Hari
                                </span>
                              ) : stats.daysUntilDeadline <= 3 ? (
                                <span className="px-2 py-0.5 rounded bg-red-600 text-white font-black text-[10px] animate-pulse">
                                  ⚠️ Warning H-{stats.daysUntilDeadline}
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                                  Sisa {stats.daysUntilDeadline} Hari
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Status, Early Warning & QC */}
                        <td className="py-3.5 px-3 align-top max-w-xs">
                          <div className="flex flex-wrap items-center gap-1">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isCompleted ? 'bg-emerald-100 text-emerald-800' :
                              task.status === 'Partial Received' ? 'bg-cyan-100 text-cyan-800' :
                              task.status === 'Delayed' ? 'bg-red-100 text-red-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {task.status}
                            </span>

                            {task.hasDiscrepancy && actionBadge && (
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1 ${actionBadge.color}`}>
                                {actionBadge.icon}
                                <span>{actionBadge.label}</span>
                              </span>
                            )}
                          </div>

                          {stats.warningMatch?.latestIssue && (
                            <div className="mt-1.5 p-1.5 rounded-lg bg-red-50 border border-red-200 text-[10px] text-red-900">
                              <strong>Kendala Subkon ({stats.warningMatch.latestIssue.date}):</strong> {stats.warningMatch.latestIssue.notes}
                            </div>
                          )}

                          {task.hasDiscrepancy && task.discrepancyNotes && (
                            <div className="mt-1 text-[10px] text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-200">
                              <strong>QC:</strong> {task.discrepancyNotes}
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-3 text-center align-top">
                          <div className="flex flex-col gap-1.5 items-center">
                            <button
                              onClick={() => setAnalyzingTaskId(task.id)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                            >
                              <BarChart3 className="w-3 h-3 text-cyan-400" />
                              <span>Analisis Harian</span>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedPortalTaskId(task.id);
                                setViewMode('SUBCON_PORTAL');
                              }}
                              className="w-full px-2.5 py-1 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-900 border border-cyan-300 font-bold text-[10px] flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Activity className="w-3 h-3 text-cyan-700" />
                              <span>+ Input Harian</span>
                            </button>
                            <button
                              onClick={() => handleOpenEdit(task)}
                              className="w-full px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Evaluasi QC</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DEEP DAILY TARGET ANALYTICS & EARLY WARNING H-3                    */}
      {/* ========================================================================= */}
      {analyzingTask && (() => {
        const stats = getTaskAnalytics(analyzingTask);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
              
              {/* Header */}
              <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-600 text-white">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-cyan-300">{analyzingTask.id}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-600 text-white">
                        {analyzingTask.styleCode}
                      </span>
                      {stats.warningMatch && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-red-600 text-white">
                          ⚠️ WARNING H-{Math.max(0, stats.daysUntilDeadline)}
                        </span>
                      )}
                    </div>
                    <h2 className="text-base font-black mt-0.5">
                      Analisis Capaian Target Harian Subkon — {analyzingTask.subconName}
                    </h2>
                  </div>
                </div>
                <button
                  onClick={() => setAnalyzingTaskId(null)}
                  className="text-slate-400 hover:text-white text-xl p-1 cursor-pointer"
                >
                  &times;
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
                
                {/* Subcon Account Info Bar */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <KeyRound className="w-4 h-4 text-cyan-700 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-900">
                        Akun Khusus Input Harian Subkon: <span className="font-mono text-cyan-800">{analyzingTask.subconUsername || 'subcon_prima'}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Password Akses: <strong className="font-mono">{analyzingTask.subconPassword || 'subcon123'}</strong> • PIC Vendor: {analyzingTask.picSubcon}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const t = analyzingTask;
                      setAnalyzingTaskId(null);
                      handleQuickSwitchToSubcon(t);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs cursor-pointer shrink-0"
                  >
                    + Input Data Harian sebagai Subkon Ini
                  </button>
                </div>

                {/* Early Warning H-3 Diagnostic Box */}
                {stats.warningMatch && (
                  <div className="p-4 rounded-xl bg-red-50 border-2 border-red-300 space-y-2">
                    <div className="font-black text-red-900 flex items-center gap-1.5 text-xs">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span>DIAGNOSIS PERINGATAN DINI (H-3 SEBELUM TARGET KEMBALI):</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-red-800 font-medium">
                      {stats.warningMatch.reasons.map((r, idx) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                    <div className="pt-1 text-[11px] text-red-950 font-bold bg-white/80 p-2.5 rounded-lg border border-red-200">
                      💡 Rekomendasi Keputusan PE/PPIC: Tambah kuota lembur di {analyzingTask.subconName} hingga mencapai <strong>{stats.requiredDailyRate} Pcs/hari</strong>, atau tarik sebagian sisa panel ({stats.remainingQty} Pcs) ke Line Internal / Subkon Cadangan.
                    </div>
                  </div>
                )}

                {/* 4 KPI Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Target Harian SPK</span>
                    <strong className="text-base font-black text-slate-900">{stats.dailyTarget} Pcs/hr</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Rata-rata Aktual</span>
                    <strong className={`text-base font-black ${stats.avgActualDaily < stats.dailyTarget ? 'text-red-600' : 'text-emerald-700'}`}>
                      {stats.avgActualDaily} Pcs/hr ({stats.achievementRate}%)
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Sisa Beban / Waktu</span>
                    <strong className="text-base font-black text-amber-700">
                      {stats.remainingQty} Pcs / {Math.max(0, stats.daysUntilDeadline)} Hr
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Target Kejar Baru</span>
                    <strong className="text-base font-black text-indigo-700">{stats.requiredDailyRate} Pcs/hr</strong>
                  </div>
                </div>

                {/* Visual Daily Bar Chart Comparison */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-900">Grafik Perbandingan Target Harian vs Output Aktual</span>
                    <span className="text-[11px] text-slate-500">Garis Target: {stats.dailyTarget} Pcs/hari</span>
                  </div>

                  {stats.logs.length > 0 ? (
                    <div className="space-y-2.5">
                      {stats.logs.map((log) => {
                        const pct = Math.min(100, Math.round((log.actualOutputPcs / Math.max(1, log.targetPcs)) * 100));
                        return (
                          <div key={log.id} className="space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-slate-800">
                                {log.date} {log.hasIssue && <span className="text-red-600 font-black ml-1">(⚠️ {log.issueCategory})</span>}
                              </span>
                              <span className="font-mono font-bold">
                                Aktual: <strong className={log.actualOutputPcs < log.targetPcs ? 'text-red-600' : 'text-emerald-700'}>{log.actualOutputPcs}</strong> / Target: {log.targetPcs} Pcs ({pct}%)
                              </span>
                            </div>
                            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  log.hasIssue || pct < 80
                                    ? 'bg-red-500'
                                    : pct < 100
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            {log.issueNotes && (
                              <div className="text-[10px] text-slate-600 italic pl-1">
                                Catatan Subkon: "{log.issueNotes}"
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-6 text-center text-slate-400">
                      Belum ada data input harian dari akun subkon.
                    </div>
                  )}
                </div>

              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 shrink-0">
                <button
                  onClick={() => setAnalyzingTaskId(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
                >
                  Tutup Analisis
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* MODAL: EDIT PENERIMAAN, CATATAN KETERLAMBATAN & KETIDAKSESUAIAN SUBKON    */}
      {/* ========================================================================= */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
            
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-cyan-600 text-white">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-black tracking-wide">
                    Evaluasi QC &amp; Penerimaan Barang Subkon ({editingTask.id})
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

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 overflow-y-auto text-xs flex-1">
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
                      max={editingTask.quantitySend * 1.05}
                      value={editQtyReceived}
                      onChange={(e) => setEditQtyReceived(Number(e.target.value))}
                      className="w-full p-2 rounded-lg border border-blue-300 font-black text-slate-900 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Tanggal Aktual Diterima *
                    </label>
                    <input
                      type="date"
                      value={editActualDate}
                      onChange={(e) => setEditActualDate(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 font-bold text-slate-900 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Status Pekerjaan Subkon
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as any)}
                      className="w-full p-2 rounded-lg border border-slate-300 font-bold text-slate-800 bg-white"
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
                      className="w-full p-2 rounded-lg border border-slate-300 font-medium text-slate-800 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="font-extrabold text-slate-900 flex items-center gap-1.5 text-xs">
                  <Clock className="w-4 h-4 text-red-600" />
                  <span>2. Catatan Keterlambatan Pengiriman</span>
                </div>
                <textarea
                  rows={2}
                  value={editDelayNotes}
                  onChange={(e) => setEditDelayNotes(e.target.value)}
                  placeholder="Catatan alasan keterlambatan dari rekanan vendor..."
                  className="w-full p-2 rounded-lg border border-slate-300 font-medium text-slate-800 bg-white"
                />
              </div>

              <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-extrabold text-amber-950 flex items-center gap-1.5 text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>3. Penanganan Ketidaksesuaian Barang Subkon</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-amber-900">
                    <input
                      type="checkbox"
                      checked={editHasDiscrepancy}
                      onChange={(e) => setEditHasDiscrepancy(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-600 cursor-pointer"
                    />
                    <span>Ada Ketidaksesuaian?</span>
                  </label>
                </div>

                {editHasDiscrepancy && (
                  <div className="space-y-3 pt-2 border-t border-amber-200">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block font-bold text-slate-800 mb-1">Kategori Masalah:</label>
                        <select
                          value={editDiscrepancyType}
                          onChange={(e) => setEditDiscrepancyType(e.target.value as SubconDiscrepancyType)}
                          className="w-full p-2 rounded-lg border border-amber-300 font-bold text-slate-900 bg-white"
                        >
                          <option value="Kuantitas Kurang (Shortage)">Kuantitas Kurang (Shortage)</option>
                          <option value="Cacat Fisik / Reject (Bordir/Sablon/Jahit Rusak)">Cacat Fisik / Reject</option>
                          <option value="Kain Bernoda Oli / Rusak Mesin Subkon">Kain Bernoda Oli / Rusak Mesin</option>
                          <option value="Salah Posisi / Spesifikasi Terbalik">Salah Posisi / Spesifikasi Terbalik</option>
                          <option value="Keterlambatan Fatal (Melebihi Target Delivery)">Keterlambatan Fatal</option>
                          <option value="Lainnya / Catatan Khusus">Lainnya</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Jumlah Bermasalah (Pcs):</label>
                        <input
                          type="number"
                          min="0"
                          value={editDiscrepancyQty}
                          onChange={(e) => setEditDiscrepancyQty(Number(e.target.value))}
                          className="w-full p-2 rounded-lg border border-amber-300 font-black text-rose-600 bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'RETUR_REWORK', label: 'RETUR REWORK (Bongkar Ulang)' },
                        { id: 'KLAIM_POTONG_BIAYA', label: 'KLAIM POTONG BIAYA / INVOICE' },
                        { id: 'TERIMA_TOLERANSI', label: 'TERIMA TOLERANSI GRADE B' },
                        { id: 'AFKIR_REPLACE', label: 'AFKIR TOTAL (GANTI BARU)' }
                      ].map(opt => (
                        <div
                          key={opt.id}
                          onClick={() => setEditDiscrepancyAction(opt.id as SubconDiscrepancyAction)}
                          className={`p-2 rounded-xl border text-xs font-black cursor-pointer ${
                            editDiscrepancyAction === opt.id
                              ? 'bg-amber-100 border-amber-500 text-amber-950'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          {opt.label}
                        </div>
                      ))}
                    </div>

                    <textarea
                      rows={2}
                      value={editDiscrepancyNotes}
                      onChange={(e) => setEditDiscrepancyNotes(e.target.value)}
                      placeholder="Instruksi tindak lanjut QC/PE..."
                      className="w-full p-2 rounded-lg border border-amber-300 font-medium text-slate-900 bg-white"
                    />
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl font-black shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Evaluasi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: BERI PEKERJAAN KE SUBKON (SPK BARU) + BUAT AKUN KHUSUS SUBKON      */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-black">Beri Pekerjaan ke Subkon (SPK) &amp; Akses Akun Harian</h2>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)} 
                className="text-slate-400 hover:text-white text-lg p-1 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateSubcon} className="p-6 space-y-3.5 text-xs max-h-[82vh] overflow-y-auto">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Rekanan Subkon *</label>
                <input
                  type="text"
                  placeholder="Contoh: CV Jaya Bordir / PT Sinar Sablon"
                  value={newVendor}
                  onChange={(e) => setNewVendor(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jenis Pekerjaan *</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full p-2 rounded-xl border border-slate-300 font-medium"
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
                    className="w-full p-2 rounded-xl border border-slate-300 font-bold text-indigo-700"
                  >
                    {styles.map(s => (
                      <option key={s.id} value={s.code}>{s.code} ({s.name})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Total Kirim (Pcs) *</label>
                  <input
                    type="number"
                    min="1"
                    value={newQtySend}
                    onChange={(e) => setNewQtySend(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-slate-300 font-black text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-cyan-800 mb-1">Target / Hari (Pcs) *</label>
                  <input
                    type="number"
                    min="1"
                    value={newDailyTarget}
                    onChange={(e) => setNewDailyTarget(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-cyan-400 bg-cyan-50/50 font-black text-cyan-950"
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
                    className="w-full p-2 rounded-xl border border-slate-300 font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Deadline Balik Pabrik *</label>
                  <input
                    type="date"
                    value={newEstDate}
                    onChange={(e) => setNewEstDate(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300 font-bold text-slate-900"
                    required
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    * Warning otomatis aktif H-3 sebelum tanggal ini
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama PIC Subkon</label>
                  <input
                    type="text"
                    placeholder="Contoh: Bpk. Wahyudi"
                    value={newPicSubcon}
                    onChange={(e) => setNewPicSubcon(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300 font-medium"
                  />
                </div>
              </div>

              {/* DEDICATED SUBCON ACCOUNT CREATION BOX */}
              <div className="p-4 rounded-xl bg-cyan-50/80 border border-cyan-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-black text-cyan-950">
                    <KeyRound className="w-4 h-4 text-cyan-700" />
                    <span>Berikan Akses Akun Khusus Subkon (Input Harian)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={createDedicatedAccount}
                    onChange={(e) => setCreateDedicatedAccount(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-700 cursor-pointer"
                  />
                </div>

                {createDedicatedAccount && (
                  <div className="space-y-2.5 pt-1 border-t border-cyan-200/80">
                    <p className="text-[11px] text-cyan-900 leading-snug">
                      Akun ini otomatis dibuatkan untuk mitra subkon agar dapat login dan menginput capaian target harian serta kendala produksi.
                    </p>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block font-bold text-cyan-950 mb-1 text-[11px]">Username Login Subkon *</label>
                        <input
                          type="text"
                          value={newSubconUsername}
                          onChange={(e) => setNewSubconUsername(e.target.value)}
                          placeholder="subkon_mitra"
                          className="w-full p-2 rounded-lg border border-cyan-300 bg-white font-mono font-bold text-slate-900"
                          required={createDedicatedAccount}
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-cyan-950 mb-1 text-[11px]">Password Akses *</label>
                        <input
                          type="password"
                          value={newSubconPassword}
                          onChange={(e) => setNewSubconPassword(e.target.value)}
                          placeholder="Masukkan password..."
                          className="w-full p-2 rounded-lg border border-cyan-300 bg-white font-mono font-bold text-slate-900"
                          required={createDedicatedAccount}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl text-slate-700 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl font-black shadow-xs cursor-pointer"
                >
                  Terbitkan SPK &amp; Aktifkan Akun Subkon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
