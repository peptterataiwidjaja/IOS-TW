import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SOPWorkflowStep } from '../types';
import { 
  ClipboardCheck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Cpu, 
  Wrench, 
  Scissors, 
  FileSpreadsheet, 
  Filter, 
  Calendar, 
  Edit3, 
  Save, 
  X, 
  Check, 
  Sparkles,
  Layers,
  ArrowRight,
  CalendarCheck,
  AlertTriangle,
  Printer,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Building2,
  CalendarDays
} from 'lucide-react';

export const PEWorkflowTracker: React.FC = () => {
  const { 
    currentStyle, 
    styles, 
    selectedStyleId, 
    setSelectedStyleId,
    updateWorkflowStep, 
    updateStepActualDate, 
    currentUser, 
    setActiveTab, 
    setIsNewStyleModalOpen,
    openPrintModal
  } = useApp();

  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');
  const [editingStepId, setEditingStepId] = useState<number | null>(null);
  const [editNotes, setEditNotes] = useState<string>('');
  const [editMachineNotes, setEditMachineNotes] = useState<string>('');
  const [editStatus, setEditStatus] = useState<SOPWorkflowStep['status']>('Pending');
  const [editPicName, setEditPicName] = useState<string>('');
  const [editActualDate, setEditActualDate] = useState<string>('');

  const isPE = currentUser.role === 'PE' || currentUser.role === 'FACTORY_MANAGER';

  // Indonesian month dictionary (values: '01' - '12')
  const MONTH_NAMES = useMemo(() => [
    { value: '01', label: 'Januari', short: 'Jan' },
    { value: '02', label: 'Februari', short: 'Feb' },
    { value: '03', label: 'Maret', short: 'Mar' },
    { value: '04', label: 'April', short: 'Apr' },
    { value: '05', label: 'Mei', short: 'Mei' },
    { value: '06', label: 'Juni', short: 'Jun' },
    { value: '07', label: 'Juli', short: 'Jul' },
    { value: '08', label: 'Agustus', short: 'Agu' },
    { value: '09', label: 'September', short: 'Sep' },
    { value: '10', label: 'Oktober', short: 'Okt' },
    { value: '11', label: 'November', short: 'Nov' },
    { value: '12', label: 'Desember', short: 'Des' }
  ], []);

  // Dynamically generate available years from styles + current year + long-term range (2024 to 2035+)
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const yearSet = new Set<number>();

    // Support standard range spanning past, present and future (2024 to at least currentYear + 10)
    const minRange = Math.min(2024, currentYear - 1);
    const maxRange = Math.max(2035, currentYear + 10);
    for (let y = minRange; y <= maxRange; y++) {
      yearSet.add(y);
    }

    // Also include any years existing in style records
    styles.forEach(s => {
      if (s.startDate) {
        const y = parseInt(s.startDate.slice(0, 4), 10);
        if (!isNaN(y)) yearSet.add(y);
      }
      if (s.deliveryDate) {
        const y = parseInt(s.deliveryDate.slice(0, 4), 10);
        if (!isNaN(y)) yearSet.add(y);
      }
      s.steps.forEach(st => {
        if (st.dateScheduled) {
          const y = parseInt(st.dateScheduled.slice(0, 4), 10);
          if (!isNaN(y)) yearSet.add(y);
        }
      });
    });

    return Array.from(yearSet).sort((a, b) => a - b);
  }, [styles]);

  // Human-readable period label for UI and Print headers
  const periodLabel = useMemo(() => {
    if (selectedYear === 'ALL' && selectedMonth === 'ALL') {
      return 'Semua Periode (Semua Bulan & Tahun)';
    }
    if (selectedYear !== 'ALL' && selectedMonth === 'ALL') {
      return `Tahun ${selectedYear} (Semua Bulan)`;
    }
    const monthObj = MONTH_NAMES.find(m => m.value === selectedMonth);
    const monthText = monthObj ? monthObj.label : `Bulan ${selectedMonth}`;
    if (selectedYear === 'ALL') {
      return `Bulan ${monthText} (Semua Tahun)`;
    }
    return `${monthText} ${selectedYear}`;
  }, [selectedYear, selectedMonth, MONTH_NAMES]);

  // Filter styles running in selected Year and/or Month
  const stylesInSelectedPeriod = useMemo(() => {
    return styles.filter(style => {
      const startStr = style.startDate || '';
      const deliveryStr = style.deliveryDate || '';
      const startY = startStr.slice(0, 4);
      const delivY = deliveryStr.slice(0, 4);
      const startYM = startStr.slice(0, 7);
      const delivYM = deliveryStr.slice(0, 7);

      // Case 1: Semua Tahun & Semua Bulan
      if (selectedYear === 'ALL' && selectedMonth === 'ALL') {
        return true;
      }

      // Case 2: Tahun Spesifik, Semua Bulan
      if (selectedYear !== 'ALL' && selectedMonth === 'ALL') {
        const yearMatches =
          (startY <= selectedYear && delivY >= selectedYear) ||
          startStr.startsWith(selectedYear) ||
          deliveryStr.startsWith(selectedYear) ||
          style.steps.some(st => (st.dateScheduled || '').startsWith(selectedYear));
        return yearMatches;
      }

      // Case 3: Tahun Spesifik, Bulan Spesifik (YYYY-MM)
      if (selectedYear !== 'ALL' && selectedMonth !== 'ALL') {
        const targetYM = `${selectedYear}-${selectedMonth}`;
        const isInRange = startYM <= targetYM && delivYM >= targetYM;
        const hasStepInMonth = style.steps.some(st => (st.dateScheduled || '').startsWith(targetYM));
        return isInRange || hasStepInMonth;
      }

      // Case 4: Semua Tahun, Bulan Spesifik (misal bulan 09 di tahun manapun)
      if (selectedYear === 'ALL' && selectedMonth !== 'ALL') {
        const monthTag = `-${selectedMonth}-`;
        const matchesMonth =
          startStr.includes(monthTag) ||
          deliveryStr.includes(monthTag) ||
          style.steps.some(st => (st.dateScheduled || '').includes(monthTag));
        return matchesMonth;
      }

      return true;
    });
  }, [styles, selectedYear, selectedMonth]);

  // Handle Year / Month selection and sync selected style
  const handlePeriodChange = (newYear: string, newMonth: string) => {
    setSelectedYear(newYear);
    setSelectedMonth(newMonth);

    // Calculate matching styles for new period
    const matching = styles.filter(style => {
      const startStr = style.startDate || '';
      const deliveryStr = style.deliveryDate || '';
      const startY = startStr.slice(0, 4);
      const delivY = deliveryStr.slice(0, 4);
      const startYM = startStr.slice(0, 7);
      const delivYM = deliveryStr.slice(0, 7);

      if (newYear === 'ALL' && newMonth === 'ALL') return true;
      if (newYear !== 'ALL' && newMonth === 'ALL') {
        return (startY <= newYear && delivY >= newYear) ||
          startStr.startsWith(newYear) ||
          deliveryStr.startsWith(newYear) ||
          style.steps.some(st => (st.dateScheduled || '').startsWith(newYear) || (st.actualDate || '').startsWith(newYear));
      }
      if (newYear !== 'ALL' && newMonth !== 'ALL') {
        const targetYM = `${newYear}-${newMonth}`;
        return (startYM <= targetYM && delivYM >= targetYM) ||
          style.steps.some(st => (st.dateScheduled || '').startsWith(targetYM) || (st.actualDate || '').startsWith(targetYM));
      }
      if (newYear === 'ALL' && newMonth !== 'ALL') {
        const monthTag = `-${newMonth}-`;
        return startStr.includes(monthTag) || deliveryStr.includes(monthTag) ||
          style.steps.some(st => (st.dateScheduled || '').includes(monthTag) || (st.actualDate || '').includes(monthTag));
      }
      return true;
    });

    if (matching.length > 0) {
      if (!matching.some(s => s.id === selectedStyleId)) {
        setSelectedStyleId(matching[0].id);
      }
    } else {
      // Strictly empty when no style matches the selected month & year
      setSelectedStyleId('');
    }
  };

  // Quick month/year navigation
  const handlePrevMonth = () => {
    const currentY = selectedYear === 'ALL' ? new Date().getFullYear().toString() : selectedYear;
    const currentM = selectedMonth === 'ALL' ? String(new Date().getMonth() + 1).padStart(2, '0') : selectedMonth;
    
    let yNum = parseInt(currentY, 10);
    let mNum = parseInt(currentM, 10) - 1;
    if (mNum < 1) {
      mNum = 12;
      yNum -= 1;
    }
    handlePeriodChange(yNum.toString(), String(mNum).padStart(2, '0'));
  };

  const handleNextMonth = () => {
    const currentY = selectedYear === 'ALL' ? new Date().getFullYear().toString() : selectedYear;
    const currentM = selectedMonth === 'ALL' ? String(new Date().getMonth() + 1).padStart(2, '0') : selectedMonth;
    
    let yNum = parseInt(currentY, 10);
    let mNum = parseInt(currentM, 10) + 1;
    if (mNum > 12) {
      mNum = 1;
      yNum += 1;
    }
    handlePeriodChange(yNum.toString(), String(mNum).padStart(2, '0'));
  };

  const handleCurrentMonth = () => {
    const now = new Date();
    const yStr = now.getFullYear().toString();
    const mStr = String(now.getMonth() + 1).padStart(2, '0');
    handlePeriodChange(yStr, mStr);
  };

  const handleResetPeriod = () => {
    handlePeriodChange('ALL', 'ALL');
  };

  // Active style strictly tied to styles in the selected period
  const activeStyle = useMemo(() => {
    if (stylesInSelectedPeriod.length === 0) return null;
    return stylesInSelectedPeriod.find(s => s.id === selectedStyleId) || stylesInSelectedPeriod[0];
  }, [stylesInSelectedPeriod, selectedStyleId]);

  // Synchronize selectedStyleId with the active filtered list
  useEffect(() => {
    if (stylesInSelectedPeriod.length === 0) {
      if (selectedStyleId !== '') {
        setSelectedStyleId('');
      }
    } else {
      if (!stylesInSelectedPeriod.some(s => s.id === selectedStyleId)) {
        setSelectedStyleId(stylesInSelectedPeriod[0].id);
      }
    }
  }, [stylesInSelectedPeriod, selectedStyleId, setSelectedStyleId]);

  const completedCount = activeStyle ? activeStyle.steps.filter(s => s.status === 'Completed').length : 0;
  const totalStepsCount = activeStyle ? activeStyle.steps.length : 14;
  const progressPercent = activeStyle && totalStepsCount > 0 ? Math.round((completedCount / totalStepsCount) * 100) : 0;

  const filteredSteps = activeStyle ? activeStyle.steps.filter(step => {
    if (selectedDeptFilter === 'ALL') return true;
    if (selectedDeptFilter === 'PE') return step.assignedRole === 'PE' || step.picDept.includes('PE') || step.picDept.includes('Technical') || step.picDept.includes('Mekanik');
    if (selectedDeptFilter === 'PPIC') return step.assignedRole === 'PPIC' || step.picDept.includes('PPIC');
    if (selectedDeptFilter === 'WAREHOUSE') return step.assignedRole === 'WAREHOUSE' || step.picDept.includes('Warehouse');
    if (selectedDeptFilter === 'PRODUCTION') return step.assignedRole === 'PRODUCTION' || step.picDept.includes('Cutting') || step.picDept.includes('Sewing') || step.picDept.includes('Marker');
    return true;
  }) : [];

  const handlePrint = () => {
    openPrintModal('pe-workflow');
  };

  const handleStartEdit = (step: SOPWorkflowStep) => {
    setEditingStepId(step.id);
    setEditNotes(step.notes || '');
    setEditMachineNotes(step.machineBreakdownNotes || '');
    setEditStatus(step.status);
    setEditPicName(step.picName || '');
    setEditActualDate(step.actualDate || '');
  };

  const handleSaveEdit = (stepId: number) => {
    if (!activeStyle) return;
    updateWorkflowStep(activeStyle.id, stepId, {
      notes: editNotes,
      machineBreakdownNotes: editMachineNotes,
      status: editStatus,
      picName: editPicName,
      actualDate: editActualDate
    });
    setEditingStepId(null);
  };

  const handleQuickStatus = (stepId: number, currentStatus: SOPWorkflowStep['status']) => {
    if (!activeStyle) return;
    const nextStatus = currentStatus === 'Completed' ? 'In Progress' : (currentStatus === 'In Progress' ? 'Pending' : 'Completed');
    updateWorkflowStep(activeStyle.id, stepId, { status: nextStatus });
  };

  // Helper to compare actual date with scheduled date
  const getDateVarianceBadge = (scheduled: string, actual?: string) => {
    if (!actual || !actual.trim()) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
          Belum Realisasi
        </span>
      );
    }

    const schedMs = new Date(scheduled).getTime();
    const actMs = new Date(actual).getTime();
    const diffDays = Math.round((actMs - schedMs) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          {diffDays === 0 ? 'Tepat Waktu' : `${Math.abs(diffDays)}hr Lebih Awal`}
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md animate-pulse">
          <AlertTriangle className="w-3 h-3 text-red-600" />
          Deviasi +{diffDays} Hari
        </span>
      );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* ======================================================== */}
      {/* PRINT-ONLY OFFICIAL HEADER (PT Teratai Widjaja Garment) */}
      {/* ======================================================== */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-blue-900 text-white font-black text-xl flex items-center justify-center border-2 border-red-600">
              TW
            </div>
            <div>
              <h1 className="text-xl font-black tracking-wide text-slate-900 uppercase">
                PT Teratai Widjaja
              </h1>
              <p className="text-[10px] text-slate-600 font-semibold tracking-wider uppercase">
                Garment Industry &amp; Export Manufacturing Division
              </p>
              <p className="text-[9px] text-slate-500">
                Kawasan Industri Tekstil &amp; Garmen Jawa Barat, Indonesia
              </p>
            </div>
          </div>

          <div className="text-right text-[10px] space-y-0.5">
            <div className="font-mono font-black text-xs text-blue-950">
              DOC-SOP-PE-{activeStyle ? activeStyle.code : 'NIHIL'}
            </div>
            <div className="text-slate-600">
              Tgl Cetak: <strong>{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
            </div>
            <div className="text-slate-600">
              Penanggung Jawab PE: <strong>{currentUser.name}</strong>
            </div>
            <div className="text-slate-600">
              Periode Filter: <strong>{periodLabel}</strong>
            </div>
          </div>
        </div>

        <div className="mt-3 text-center border-y border-slate-300 py-1.5 bg-slate-50">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">
            LEMBAR KONTROL ALUR SOP PRODUKSI &amp; BREAKDOWN TEKNIS PE
          </h2>
        </div>

        {/* Print Style Summary Info Table */}
        {activeStyle ? (
          <table className="w-full mt-2.5 text-[10px] border border-slate-300 border-collapse">
            <tbody>
              <tr className="border-b border-slate-300">
                <td className="p-1.5 font-bold bg-slate-100 w-28">Kode &amp; Model Style:</td>
                <td className="p-1.5 font-extrabold text-blue-950 w-72">{activeStyle.code} — {activeStyle.name}</td>
                <td className="p-1.5 font-bold bg-slate-100 w-28">Buyer / Merk:</td>
                <td className="p-1.5 font-bold text-slate-900">{activeStyle.buyer}</td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="p-1.5 font-bold bg-slate-100">Target Order:</td>
                <td className="p-1.5 font-black text-slate-900">{activeStyle.targetQuantityPcs.toLocaleString()} Pcs</td>
                <td className="p-1.5 font-bold bg-slate-100">Target Delivery:</td>
                <td className="p-1.5 font-black text-red-700">{activeStyle.deliveryDate} (Mulai: {activeStyle.startDate})</td>
              </tr>
              <tr>
                <td className="p-1.5 font-bold bg-slate-100">Status Alur:</td>
                <td className="p-1.5 font-bold text-slate-900">{activeStyle.status} (Tahap #{activeStyle.currentWorkflowStep})</td>
                <td className="p-1.5 font-bold bg-slate-100">Progress Kesiapan:</td>
                <td className="p-1.5 font-bold text-emerald-800">{progressPercent}% ({completedCount} / {activeStyle.steps.length} Tahap Tuntas)</td>
              </tr>
            </tbody>
          </table>
        ) : (
          <div className="p-3 my-2 text-center text-xs font-bold text-slate-600 border border-slate-300 bg-slate-50">
            Tidak ada model style garment yang aktif pada periode {periodLabel}.
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* SCREEN-ONLY: FILTER PERIODE (BULAN & TAHUN) & MODEL STYLE DROPDOWN */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs print:hidden space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
              <CalendarDays className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-900">
                  Filter Periode &amp; Pemilihan Model Style
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                  {periodLabel}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Pilih periode bulan dan tahun produksi, serta pilih model style garmen langsung melalui dropdown.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              title="Cetak lembar kerja alur SOP &amp; spesifikasi teknis (PDF)"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Cetak PDF Alur SOP</span>
            </button>
          </div>
        </div>

        {/* 3 Dropdown Controls: Bulan, Tahun, dan Model Style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80">
          {/* 1. Filter Bulan */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5 text-blue-600" />
              <span>Bulan:</span>
            </label>
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => handlePeriodChange(selectedYear, e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white hover:border-blue-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs transition-all"
              >
                <option value="ALL">Semua Bulan (Januari - Desember)</option>
                {MONTH_NAMES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label} ({m.value})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. Filter Tahun */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Tahun:</span>
            </label>
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => handlePeriodChange(e.target.value, selectedMonth)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white hover:border-blue-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs transition-all"
              >
                <option value="ALL">Semua Tahun (Seluruh Arsip)</option>
                {availableYears.map((y) => (
                  <option key={y} value={String(y)}>
                    Tahun {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Model Style (Dropdown) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>Model Style Garment:</span>
              </span>
              <span className={`text-[10px] font-bold ${stylesInSelectedPeriod.length === 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                {stylesInSelectedPeriod.length === 0 ? 'Kosong (0 style)' : `${stylesInSelectedPeriod.length} style aktif`}
              </span>
            </label>
            <div className="relative">
              <select
                value={activeStyle ? activeStyle.id : ''}
                onChange={(e) => setSelectedStyleId(e.target.value)}
                disabled={stylesInSelectedPeriod.length === 0}
                className={`w-full px-3 py-2 rounded-xl border text-xs font-bold transition-all shadow-2xs ${
                  stylesInSelectedPeriod.length === 0
                    ? 'border-dashed border-amber-300 bg-amber-50/60 text-amber-900 cursor-not-allowed'
                    : 'border-blue-400 bg-blue-50/40 text-blue-950 hover:border-blue-600 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer'
                }`}
              >
                {stylesInSelectedPeriod.length === 0 ? (
                  <option value="">(Kosong — Tidak ada model style yang sesuai periode ini)</option>
                ) : (
                  stylesInSelectedPeriod.map((style) => (
                    <option key={style.id} value={style.id}>
                      {style.code} — {style.name} ({style.buyer} • {style.targetQuantityPcs.toLocaleString()} Pcs • {style.status})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Selected Style Quick Summary Pill */}
        {activeStyle ? (
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-blue-700 text-white">
                {activeStyle.code}
              </span>
              <span className="font-extrabold text-slate-900">{activeStyle.name}</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600">Buyer: <strong>{activeStyle.buyer}</strong></span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600">Target: <strong>{activeStyle.targetQuantityPcs.toLocaleString()} Pcs</strong></span>
              <span className="text-slate-400">•</span>
              <span className="text-red-700 font-bold">Delivery: {activeStyle.deliveryDate}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeStyle.status === 'Cutting' ? 'bg-amber-100 text-amber-800' :
                activeStyle.status === 'Sewing' ? 'bg-purple-100 text-purple-800' :
                activeStyle.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                Status: {activeStyle.status}
              </span>
              <span className="text-xs font-bold text-emerald-700">
                {progressPercent}% Siap
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2 text-xs bg-amber-50/80 p-2.5 rounded-xl border border-amber-200 text-amber-900">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="font-bold">Model Style Kosong:</span>
              <span>Tidak ada model style garment yang sesuai dengan filter bulan &amp; tahun {periodLabel}. Pilihan otomatis dikosongkan.</span>
            </div>
            <button
              onClick={handleResetPeriod}
              className="text-[11px] font-bold text-blue-700 hover:text-blue-900 underline cursor-pointer shrink-0"
            >
              Reset ke Semua Periode &rarr;
            </button>
          </div>
        )}
      </div>
      
      {/* Top Banner: Production Engineering Control & Style Status */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-md bg-red-100 text-red-700 text-xs font-black flex items-center gap-1 border border-red-200">
                <Cpu className="w-3.5 h-3.5 text-red-600" />
                Production Engineering (PE) Command Center
              </span>
              <span className="text-xs text-slate-400 font-medium">• Matriks Standar Operasional PT Teratai Widjaja</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Alur Kerja SOP Produksi &amp; Tracking Tanggal Aktual
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl">
              Memantau alur terintegrasi 14+ tahap: Breakdown proses RnD, kebutuhan mesin, PPS, pilot sample, technical meeting, PPM hingga serah terima material gudang &amp; potong. Dilengkapi input tanggal aktual untuk perbandingan jadwal real-time.
            </p>
          </div>

          {/* Quick Metrics & Print Button */}
          <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="text-center px-2">
              <div className="text-xs text-slate-500 font-medium">Target Order</div>
              <div className="text-lg font-black text-slate-900">{activeStyle ? activeStyle.targetQuantityPcs.toLocaleString() : '0'} <span className="text-xs font-normal">Pcs</span></div>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-center px-2">
              <div className="text-xs text-slate-500 font-medium">Tahap Selesai</div>
              <div className="text-lg font-black text-blue-700">{completedCount} <span className="text-xs font-normal text-slate-500">/ {activeStyle ? activeStyle.steps.length : 0}</span></div>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-center px-2">
              <div className="text-xs text-slate-500 font-medium">Progress SOP</div>
              <div className="text-lg font-black text-emerald-600">{progressPercent}%</div>
            </div>
          </div>
        </div>

        {/* Style Overview Cards */}
        {activeStyle ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4 text-xs">
            <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-600 text-white font-black text-sm">
                TW
              </div>
              <div>
                <div className="text-slate-500 font-medium text-[11px]">Model Aktif</div>
                <div className="font-extrabold text-blue-950 text-sm">{activeStyle.code}</div>
                <div className="text-[11px] text-slate-600 truncate">{activeStyle.name}</div>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="text-slate-500 font-medium text-[11px]">Buyer &amp; Target Delivery</div>
              <div className="font-bold text-slate-800 text-xs mt-0.5">{activeStyle.buyer}</div>
              <div className="text-red-600 font-semibold flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3 text-red-500" />
                <span>Deadline: {activeStyle.deliveryDate}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="text-slate-500 font-medium text-[11px]">Tahap Kritis Saat Ini</div>
              <div className="font-bold text-slate-900 text-xs truncate mt-0.5">
                Tahap #{activeStyle.currentWorkflowStep}: {activeStyle.steps.find(s => s.id === activeStyle.currentWorkflowStep)?.process || 'Final QC'}
              </div>
              <div className="text-blue-700 font-semibold mt-0.5">
                PIC Dept: {activeStyle.steps.find(s => s.id === activeStyle.currentWorkflowStep)?.picDept || '-'}
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col justify-between">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500 font-medium">Alokasi Anggaran</span>
                <span className="font-bold text-slate-700">Rp {(activeStyle.allocatedBudget || 0).toLocaleString('id-ID')}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 mt-2 overflow-hidden">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, progressPercent)}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-500 text-right mt-1 font-semibold">
                Kesiapan Produksi: {progressPercent}%
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
            Silakan pilih periode yang memiliki model style aktif, atau klik tombol <strong>Reset ke Semua Periode</strong> di atas.
          </div>
        )}
      </div>

      {/* Filter and Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs print:hidden">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            Filter Dept:
          </span>
          {['ALL', 'PE', 'PPIC', 'WAREHOUSE', 'PRODUCTION'].map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDeptFilter(dept)}
              className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                selectedDeptFilter === dept
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {dept === 'ALL' ? 'Semua Tahap' : dept}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 border border-slate-300 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Print Alur</span>
          </button>
          <span className="text-xs text-slate-500">
            Menampilkan <strong>{filteredSteps.length}</strong> dari <strong>{activeStyle ? activeStyle.steps.length : 0}</strong> tahapan
          </span>
        </div>
      </div>

      {/* Empty State when no activeStyle matches the period */}
      {!activeStyle && (
        <div className="bg-white rounded-2xl p-12 border border-dashed border-slate-300 text-center space-y-4 shadow-xs print:hidden">
          <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600">
            <Layers className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900">
              Model Style Garment Kosong
            </h3>
            <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
              Tidak ada model style garment atau lembar alur SOP produksi yang terdaftar pada periode <strong>{periodLabel}</strong>. Dropdown pilihan style dikosongkan secara otomatis.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={handleResetPeriod}
              className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Tampilkan Semua Periode
            </button>
            <button
              onClick={() => setIsNewStyleModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              + Buat Model Style Baru
            </button>
          </div>
        </div>
      )}

      {/* Main SOP Workflow Table with Actual Date Column */}
      {activeStyle && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden print:border print:border-slate-800 print:rounded-none">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between print:bg-white print:p-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <ClipboardCheck className="w-4 h-4 text-blue-700 print:text-black" />
              <span>Matriks 14+ Tahap SOP Produksi Garment (Teratai Widjaja Standard)</span>
            </div>
            <span className="text-[11px] text-slate-500 print:hidden">
              * Kolom <strong className="text-blue-700 font-bold">Tanggal Aktual</strong> dapat diisi langsung untuk perbandingan deviasi jadwal
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 border-collapse print:text-[9.5px]">
              <thead className="bg-slate-100/80 text-[11px] uppercase tracking-wider font-extrabold text-slate-700 border-b border-slate-200 print:bg-slate-200 print:text-black print:border-b-2 print:border-slate-900 print:text-[9px]">
                <tr>
                  <th className="py-3 px-3 w-12 text-center print:py-1.5 print:px-1 print:border print:border-slate-400">No</th>
                  <th className="py-3 px-4 w-60 print:py-1.5 print:px-2 print:border print:border-slate-400">Tahapan Proses</th>
                  <th className="py-3 px-3 w-36 print:hidden">Departemen PIC</th>
                  <th className="py-3 px-3 w-28 text-center print:py-1.5 print:px-2 print:border print:border-slate-400">Status</th>
                  <th className="py-3 px-3 w-32 text-center print:py-1.5 print:px-2 print:border print:border-slate-400">Tanggal Jadwal</th>
                  <th className="py-3 px-3 w-44 bg-blue-50/70 text-blue-900 border-x border-blue-200 text-center print:bg-white print:text-black print:py-1.5 print:px-2 print:border print:border-slate-400">
                    <div className="flex items-center justify-center gap-1 font-black">
                      <CalendarCheck className="w-3.5 h-3.5 text-blue-700 print:hidden" />
                      <span>Tanggal Aktual</span>
                    </div>
                  </th>
                  <th className="py-3 px-4 print:py-1.5 print:px-2 print:border print:border-slate-400">Output Teknis</th>
                  <th className="py-3 px-3 w-20 text-center print:hidden">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 print:divide-slate-400">
                {filteredSteps.map((step) => {
                  const isEditing = editingStepId === step.id;
                  const isCurrent = activeStyle ? activeStyle.currentWorkflowStep === step.id : false;

                let statusBadgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
                if (step.status === 'Completed') statusBadgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                if (step.status === 'In Progress') statusBadgeClass = 'bg-blue-50 text-blue-800 border-blue-200';
                if (step.status === 'Needs Review') statusBadgeClass = 'bg-red-50 text-red-800 border-red-200';

                return (
                  <tr 
                    key={step.id} 
                    className={`transition-colors print:border-b print:border-slate-300 ${
                      isCurrent 
                        ? 'bg-blue-50/40 font-medium print:bg-white' 
                        : step.status === 'Completed'
                        ? 'bg-white hover:bg-slate-50/80'
                        : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    {/* No */}
                    <td className="py-3 px-3 text-center font-bold print:py-1.5 print:px-1 print:border print:border-slate-300">
                      <div className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs print:w-5 print:h-5 print:text-[10px] ${
                        step.status === 'Completed' 
                          ? 'bg-emerald-600 text-white print:bg-slate-900' 
                          : isCurrent 
                          ? 'bg-blue-700 text-white font-black ring-2 ring-blue-400 print:bg-slate-700' 
                          : 'bg-slate-100 text-slate-600 print:bg-slate-200 print:text-black'
                      }`}>
                        {step.status === 'Completed' ? <Check className="w-4 h-4 print:w-3 print:h-3" /> : step.id}
                      </div>
                    </td>

                    {/* Process Name */}
                    <td className="py-3 px-4 print:py-1.5 print:px-2 print:border print:border-slate-300">
                      <div className="font-extrabold text-slate-900 leading-snug">
                        {step.process}
                      </div>
                      <div className="hidden print:block text-[8.5px] text-slate-600 font-medium mt-0.5">
                        PIC: {step.picDept} {step.picName ? `• ${step.picName}` : ''}
                      </div>
                      {step.isMandatory && (
                        <span className="inline-block mt-0.5 text-[9px] px-1.5 py-0.2 rounded bg-red-50 text-red-600 font-bold border border-red-200 print:border-slate-400 print:text-black">
                          Mandatory SOP
                        </span>
                      )}
                    </td>

                    {/* PIC / Dept (Screen only) */}
                    <td className="py-3 px-3 print:hidden">
                      <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        {step.picDept}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-0.5 font-medium">
                        {step.picName || '-'}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 print:py-1.5 print:px-2 print:border print:border-slate-300 print:text-center">
                      {isEditing ? (
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value as any)}
                          className="text-xs p-1 rounded border border-slate-300 font-medium focus:ring-1 focus:ring-blue-600 print:hidden"
                        >
                          <option value="Completed">Completed</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Pending">Pending</option>
                          <option value="Needs Review">Needs Review</option>
                        </select>
                      ) : (
                        <div>
                          <button
                            onClick={() => handleQuickStatus(step.id, step.status)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1 print:hidden ${statusBadgeClass}`}
                            title="Klik untuk ubah status cepat"
                          >
                            {step.status === 'Completed' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                            {step.status === 'In Progress' && <Clock className="w-3 h-3 text-blue-600" />}
                            {step.status === 'Pending' && <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />}
                            {step.status === 'Needs Review' && <AlertCircle className="w-3 h-3 text-red-600" />}
                            <span>{step.status}</span>
                          </button>
                          {/* Print Static Status */}
                          <span className="hidden print:inline font-bold text-[9px] text-center">
                            {step.status === 'Completed' ? '[V] SELESAI' : (step.status === 'In Progress' ? '[~] SEDANG JALAN' : (step.status === 'Needs Review' ? '[!] PERLU REVIEW' : '[ ] PENDING'))}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Scheduled Date */}
                    <td className="py-3 px-3 text-slate-600 font-medium print:py-1.5 print:px-2 print:border print:border-slate-300 print:text-center">
                      <div className="flex items-center justify-center gap-1 text-[11px] print:text-[9px] font-mono">
                        <Calendar className="w-3 h-3 text-slate-400 print:hidden" />
                        <span>{step.dateScheduled}</span>
                      </div>
                      {step.dateCompleted && (
                        <div className="text-[10px] text-emerald-600 font-semibold mt-0.5 print:text-black print:text-[8px]">
                          Tuntas: {step.dateCompleted}
                        </div>
                      )}
                    </td>

                    {/* Tanggal Aktual */}
                    <td className="py-3 px-3 bg-blue-50/30 border-x border-blue-100 print:bg-white print:border print:border-slate-300 print:py-1.5 print:px-2">
                      {isEditing ? (
                        <input
                          type="date"
                          value={editActualDate}
                          onChange={(e) => setEditActualDate(e.target.value)}
                          className="w-full text-xs p-1 bg-white border border-blue-400 rounded-md font-medium text-slate-800 focus:ring-1 focus:ring-blue-600 print:hidden"
                        />
                      ) : (
                        <div className="space-y-1">
                          <input
                            type="date"
                            value={step.actualDate || ''}
                            onChange={(e) => updateStepActualDate(currentStyle.id, step.id, e.target.value)}
                            className="w-full text-[11px] p-1 bg-white border border-slate-300 hover:border-blue-500 rounded-md font-bold text-blue-900 focus:ring-1 focus:ring-blue-600 cursor-pointer transition-colors print:hidden"
                            title="Klik untuk memilih tanggal aktual pelaksanaan"
                          />
                          {/* Print mode text for actual date */}
                          <div className="hidden print:block font-bold text-[9px]">
                            {step.actualDate || '-'}
                          </div>
                          <div className="print:text-[8px]">
                            {getDateVarianceBadge(step.dateScheduled, step.actualDate)}
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Output Description & Technical Notes */}
                    <td className="py-3 px-4 print:py-1.5 print:px-2 print:border print:border-slate-300">
                      {isEditing ? (
                        <div className="space-y-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Catatan Output:</label>
                            <input
                              type="text"
                              value={editNotes}
                              onChange={(e) => setEditNotes(e.target.value)}
                              placeholder="Catatan perbaikan / hasil..."
                              className="w-full text-xs p-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-600"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Kebutuhan Mesin / Attachment:</label>
                            <input
                              type="text"
                              value={editMachineNotes}
                              onChange={(e) => setEditMachineNotes(e.target.value)}
                              placeholder="Setting mesin / folder..."
                              className="w-full text-xs p-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-600"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Nama PIC:</label>
                            <input
                              type="text"
                              value={editPicName}
                              onChange={(e) => setEditPicName(e.target.value)}
                              placeholder="Nama PIC penanggung jawab..."
                              className="w-full text-xs p-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-600"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-slate-800 text-[12px] font-medium leading-snug print:text-[9.5px]">
                            {step.outputDescription}
                          </p>
                          {step.notes && (
                            <p className="text-slate-600 text-[11px] bg-slate-50 p-1.5 rounded border border-slate-200 print:bg-white print:p-0 print:border-none print:text-[8.5px] print:text-slate-700">
                              <span className="font-semibold text-slate-700">Catatan:</span> {step.notes}
                            </p>
                          )}
                          {step.machineBreakdownNotes && (
                            <p className="text-blue-900 text-[11px] bg-blue-50/70 p-1.5 rounded border border-blue-200 print:bg-white print:p-0 print:border-none print:text-[8.5px] print:text-black">
                              <span className="font-semibold text-blue-950">Mesin/Attachment:</span> {step.machineBreakdownNotes}
                            </p>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Actions (Screen only) */}
                    <td className="py-3 px-3 text-center print:hidden">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleSaveEdit(step.id)}
                            className="p-1.5 rounded bg-blue-700 hover:bg-blue-800 text-white transition-colors cursor-pointer"
                            title="Simpan Perubahan"
                          >
                            <Save className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingStepId(null)}
                            className="p-1.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors cursor-pointer"
                            title="Batal"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(step)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
                          title="Edit Catatan &amp; Status"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* ======================================================== */}
      {/* PRINT-ONLY OFFICIAL SIGNATURE APPROVAL BOX              */}
      {/* ======================================================== */}
      {activeStyle && (
        <div className="hidden print:block mt-8 pt-4 border-t-2 border-slate-900 avoid-break" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
          <div className="text-[10px] font-bold text-slate-700 mb-3 text-center uppercase tracking-wide">
            Lembar Pengesahan &amp; Verifikasi Pelaksanaan Alur Produksi PT Teratai Widjaja
          </div>
          <div className="grid grid-cols-4 gap-4 text-center text-[9.5px]">
            <div className="border border-slate-400 p-2 rounded">
              <div className="font-bold text-slate-700">Disiapkan Oleh:</div>
              <div className="text-[8.5px] text-slate-500">Production Engineer (PE)</div>
              <div className="h-14 flex items-end justify-center pb-1">
                <span className="font-extrabold text-slate-900 underline">{currentUser.name}</span>
              </div>
              <div className="border-t border-slate-300 pt-1 text-[8px] text-slate-500">Tgl: ______________</div>
            </div>

            <div className="border border-slate-400 p-2 rounded">
              <div className="font-bold text-slate-700">Diverifikasi Oleh:</div>
              <div className="text-[8.5px] text-slate-500">PPIC &amp; Merchandiser</div>
              <div className="h-14 flex items-end justify-center pb-1">
                <span className="font-extrabold text-slate-900 underline">Ratna Kusuma, S.T.</span>
              </div>
              <div className="border-t border-slate-300 pt-1 text-[8px] text-slate-500">Tgl: ______________</div>
            </div>

            <div className="border border-slate-400 p-2 rounded">
              <div className="font-bold text-slate-700">Disetujui Oleh:</div>
              <div className="text-[8.5px] text-slate-500">Factory Manager</div>
              <div className="h-14 flex items-end justify-center pb-1">
                <span className="font-extrabold text-slate-900 underline">Ir. Hendra Gunawan</span>
              </div>
              <div className="border-t border-slate-300 pt-1 text-[8px] text-slate-500">Tgl: ______________</div>
            </div>

            <div className="border border-slate-400 p-2 rounded">
              <div className="font-bold text-slate-700">Diterima &amp; Dilaksanakan:</div>
              <div className="text-[8.5px] text-slate-500">SPV Cutting / Sewing Line</div>
              <div className="h-14 flex items-end justify-center pb-1">
                <span className="font-extrabold text-slate-900 underline">Supardi (SPV Produksi)</span>
              </div>
              <div className="border-t border-slate-300 pt-1 text-[8px] text-slate-500">Tgl: ______________</div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
