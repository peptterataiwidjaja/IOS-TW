import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UserAccount, 
  UserRole, 
  StockItem, 
  StockTransaction, 
  RequisitionCartItem,
  SubmittedRequisitionReceipt,
  ProductionStyle, 
  CashFlowRecord, 
  SubcontractorTask,
  SubconDailyLog,
  SubconEarlyWarning,
  SOPWorkflowStep,
  ProductionComponentAllocation,
  ProductionMaterialRequirement,
  CuttingOrderItem,
  CuttingLoadingAllocation,
  StyleSOPAttentionItem,
  SOPDeviationDetail
} from '../types';
import { 
  INITIAL_USERS, 
  INITIAL_STYLES, 
  INITIAL_STOCK, 
  INITIAL_TRANSACTIONS, 
  INITIAL_CASH_FLOW, 
  INITIAL_SUBCON_TASKS,
  STANDARD_SOP_STEPS,
  INITIAL_PPIC_COMPONENTS,
  INITIAL_PPIC_MATERIALS,
  INITIAL_CUTTING_ORDERS
} from '../data/initialData';

interface AppContextType {
  // Authentication
  isAuthenticated: boolean;
  login: (username: string, password?: string) => { success: boolean; message: string };
  logout: () => void;
  currentUser: UserAccount;
  setCurrentUser: (user: UserAccount) => void;
  users: UserAccount[];

  // PE User Management
  updateUserName: (userId: string, newName: string, newUsername?: string, newDepartment?: string) => { success: boolean; message: string };
  updateUserPermissions: (userId: string, allowedTabs: string[]) => { success: boolean; message: string };
  updateUserPassword: (userId: string, newPass: string) => { success: boolean; message: string };
  addNewUser: (params: {
    name: string;
    username: string;
    password?: string;
    role: UserRole;
    department: string;
    email?: string;
    allowedTabs: string[];
  }) => { success: boolean; message: string };
  deleteUser: (userId: string) => { success: boolean; message: string };
  isTabAllowed: (tabId: string) => boolean;

  // Modals & Navigation
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  isNewStyleModalOpen: boolean;
  setIsNewStyleModalOpen: (open: boolean) => void;
  isUserAccessModalOpen: boolean;
  setIsUserAccessModalOpen: (open: boolean) => void;
  isGoogleScriptModalOpen: boolean;
  setIsGoogleScriptModalOpen: (open: boolean) => void;
  isIssueStockModalOpen: boolean;
  setIsIssueStockModalOpen: (open: boolean) => void;

  // Style State & Actions
  styles: ProductionStyle[];
  selectedStyleId: string;
  setSelectedStyleId: (id: string) => void;
  currentStyle: ProductionStyle;
  addNewStyle: (params: {
    code: string;
    name: string;
    buyer: string;
    targetQuantityPcs: number;
    startDate: string;
    deliveryDate: string;
    allocatedBudget?: number;
    dailyTargetPcs?: number;
    primaryRoute?: 'LINE' | 'SUBCON' | 'HYBRID';
    autoSeedMaterials?: boolean;
  }) => void;
  deleteStyle: (styleId: string) => void;

  // Stock State & Actions
  stock: StockItem[];
  addStockItem: (item: Omit<StockItem, 'id' | 'lastUpdated'>) => void;
  updateStockQuantity: (id: string, qtyDelta: number) => void;

  // Transactions
  transactions: StockTransaction[];
  issueStock: (params: {
    stockItemId: string;
    styleTarget: string;
    quantity: number;
    destinationDept: StockTransaction['destinationDept'];
    picReceiver: string;
    referenceDoc: string;
    reason: string;
    notes?: string;
  }) => { success: boolean; message: string; isCrossStyle: boolean };

  // Requisition Cart (Pengambilan Barang Berbasis Keranjang Sesuai Style)
  requisitionCart: RequisitionCartItem[];
  addToRequisitionCart: (item: StockItem, quantity?: number, notes?: string) => { success: boolean; message: string };
  removeFromRequisitionCart: (stockItemId: string) => void;
  updateCartItemQuantity: (stockItemId: string, quantity: number) => void;
  clearRequisitionCart: () => void;
  submitRequisitionCart: (params: {
    destinationDept: StockTransaction['destinationDept'];
    picReceiver: string;
    referenceDoc?: string;
    reason?: string;
    notes?: string;
  }) => { success: boolean; message: string; receipt?: SubmittedRequisitionReceipt };
  lastSubmittedRequisition: SubmittedRequisitionReceipt | null;
  setLastSubmittedRequisition: (receipt: SubmittedRequisitionReceipt | null) => void;

  // Workflow SOP
  updateWorkflowStep: (styleId: string, stepId: number, updates: Partial<SOPWorkflowStep>) => void;
  updateStepActualDate: (styleId: string, stepId: number, actualDate: string) => void;

  // PPIC Component Allocations (Line vs Subkon) & Material Requirements
  componentAllocations: ProductionComponentAllocation[];
  addComponentAllocation: (allocation: Omit<ProductionComponentAllocation, 'id'>) => void;
  updateComponentAllocation: (id: string, updates: Partial<ProductionComponentAllocation>) => void;
  deleteComponentAllocation: (id: string) => void;

  productionMaterials: ProductionMaterialRequirement[];
  addProductionMaterial: (material: Omit<ProductionMaterialRequirement, 'id'>) => void;
  updateProductionMaterial: (id: string, updates: Partial<ProductionMaterialRequirement>) => void;
  deleteProductionMaterial: (id: string) => void;

  // Cutting Orders, Waiting List Queue & Loading Allocations (Line & Subkon)
  cuttingOrders: CuttingOrderItem[];
  addCuttingOrder: (order: Omit<CuttingOrderItem, 'id' | 'queueNumber'>) => void;
  updateCuttingOrder: (id: string, updates: Partial<CuttingOrderItem>) => void;
  deleteCuttingOrder: (id: string) => void;
  moveCuttingQueue: (id: string, direction: 'UP' | 'DOWN') => void;
  updateCuttingLoadingAllocation: (
    cuttingOrderId: string,
    allocationId: string,
    updates: Partial<CuttingLoadingAllocation>
  ) => void;

  // PPIC Monitor: Styles Attention Not Complying with SOP
  sopAttentionStyles: StyleSOPAttentionItem[];

  // Cash Flow & Fund Check (Retained for backwards compatibility)
  cashFlow: CashFlowRecord[];
  addCashFlowRecord: (record: Omit<CashFlowRecord, 'id' | 'status'>) => void;
  approveCashFlow: (id: string, approverName: string) => void;
  rejectCashFlow: (id: string, notes?: string) => void;

  // Subcontractor
  subconTasks: SubcontractorTask[];
  updateSubconTask: (id: string, updates: Partial<SubcontractorTask>) => void;
  addSubconTask: (
    task: Omit<SubcontractorTask, 'id'>,
    accountOptions?: {
      createDedicatedAccount: boolean;
      username?: string;
      password?: string;
    }
  ) => { taskId: string; credentials?: { username: string; password: string } };
  addSubconDailyLog: (taskId: string, log: Omit<SubconDailyLog, 'id' | 'updatedAt'>) => { success: boolean; message: string };
  deleteSubconDailyLog: (taskId: string, logId: string) => void;
  subconWarnings: SubconEarlyWarning[];

  // Notifications & Alerts
  lowStockItems: StockItem[];
  pendingCashFlowCount: number;
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Company Logo Customization
  companyLogo: string | null;
  setCompanyLogo: (logo: string | null) => void;

  // Print PDF Modal
  isPrintModalOpen: boolean;
  setIsPrintModalOpen: (open: boolean) => void;
  activePrintBar: string;
  openPrintModal: (barId?: string) => void;

  // Google Script Integration
  gasUrl: string;
  setGasUrl: (url: string) => void;
  lastSyncedGas?: string;
  syncToGoogleScript: () => Promise<{ success: boolean; message: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const ONE_WEEK_MS = 7 * ONE_DAY_MS;

const LEGACY_DEPT_TO_JABATAN: Record<number, string> = {
  1: 'PE',
  2: 'PE',
  3: 'PPIC',
  4: 'SPV Sewing',
  5: 'Chief Mekanik',
  6: 'SPV Cutting & Marker',
  7: 'Technical Sewing',
  8: 'PE & Technical',
  9: 'PPIC & Factory Manager',
  10: 'Leader Marker',
  11: 'Kepala Gudang (Warehouse)',
  12: 'Leader Cutting',
  13: 'Kepala Gudang (Warehouse)',
  14: 'Leader Cutting',
  15: 'SPV Sewing & PE',
  16: 'Admin Subkon & PPIC',
  17: 'SPV QC & Finishing',
  18: 'Kepala Gudang & PE'
};

// Ensure all steps before Sewing Assembly Line (Step 15) are scheduled at least 1 week (7 days) earlier, and only Jabatan is used
const normalizeSOPSteps = (steps: SOPWorkflowStep[], defaultSteps?: SOPWorkflowStep[]): SOPWorkflowStep[] => {
  const cleaned = steps.map((step, idx) => {
    const std = STANDARD_SOP_STEPS.find(s => s.id === step.id) || STANDARD_SOP_STEPS[idx];
    const tmpl = defaultSteps?.find(s => s.id === step.id);
    const oldDefaultDepts = ['Mekanik', 'Cutting, Marker', 'Technical', 'PE, Technical', 'PPIC', 'Marker', 'Warehouse', 'Cutting', 'Subkon & PPIC', 'QC & Finishing', 'Warehouse & PE'];
    const nextPicDept = (!step.picDept || oldDefaultDepts.includes(step.picDept))
      ? (LEGACY_DEPT_TO_JABATAN[step.id] || std?.picDept || step.picDept)
      : step.picDept;

    return {
      ...step,
      picDept: nextPicDept,
      picName: '', // Hapus nama personal PIC, hanya jabatan pada picDept
      dateScheduled: step.dateScheduled || tmpl?.dateScheduled || std?.dateScheduled || '2026-09-01'
    };
  });

  // Enforce: Tanggal jadwal tahapan sebelum Sewing Assembly Line (Step 1..14) minimal 1 minggu (7 hari) sebelum Step 15
  const sewingStep = cleaned.find(s => s.id === 15 || s.process.toLowerCase().includes('sewing assembly'));
  if (!sewingStep) return cleaned;

  const preSewingSteps = cleaned.filter(s => s.id < sewingStep.id);
  if (preSewingSteps.length === 0) return cleaned;

  // If this style had legacy un-spaced dates where steps 7..14 were all on the same date as step 15, adopt template schedule if available
  if (defaultSteps) {
    const preMax = Math.max(...preSewingSteps.map(s => new Date(s.dateScheduled + 'T00:00:00').getTime()).filter(n => !isNaN(n)));
    const sewMsCheck = new Date(sewingStep.dateScheduled + 'T00:00:00').getTime();
    if (!isNaN(preMax) && !isNaN(sewMsCheck) && (sewMsCheck - preMax < ONE_WEEK_MS)) {
      return cleaned.map(st => {
        const tmpl = defaultSteps.find(d => d.id === st.id);
        return tmpl ? { ...st, dateScheduled: tmpl.dateScheduled } : st;
      });
    }
  }

  const maxPreSewingMs = Math.max(
    ...preSewingSteps
      .map(s => new Date(s.dateScheduled + 'T00:00:00').getTime())
      .filter(ms => !isNaN(ms))
  );
  const currentSewingMs = new Date(sewingStep.dateScheduled + 'T00:00:00').getTime();

  if (!isNaN(maxPreSewingMs) && !isNaN(currentSewingMs) && currentSewingMs < maxPreSewingMs + ONE_WEEK_MS) {
    const requiredSewingMs = maxPreSewingMs + ONE_WEEK_MS;
    const shiftMs = requiredSewingMs - currentSewingMs;
    return cleaned.map(st => {
      if (st.id < sewingStep.id) return st;
      const stMs = new Date(st.dateScheduled + 'T00:00:00').getTime();
      const adjustedMs = isNaN(stMs) ? requiredSewingMs + (st.id - sewingStep.id) * 2 * ONE_DAY_MS : Math.max(requiredSewingMs + (st.id - sewingStep.id) * 2 * ONE_DAY_MS, stMs + shiftMs);
      return {
        ...st,
        dateScheduled: new Date(adjustedMs).toISOString().split('T')[0]
      };
    });
  }

  return cleaned;
};

// Helper to merge saved items across legacy & current localStorage keys so old data is never lost on update
function loadMergedList<T extends { id: string }>(storageKeys: string[], initialList: T[]): T[] {
  const mergedMap = new Map<string, T>();
  // Read from newest key to oldest key so latest user edits win
  for (const key of storageKeys) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (item && item.id && !mergedMap.has(item.id)) {
            mergedMap.set(item.id, item);
          }
        }
      }
    } catch (e) {
      console.error(`Error parsing ${key}:`, e);
    }
  }
  if (mergedMap.size === 0) {
    return initialList;
  }
  // Ensure any default initial items not yet in storage are also preserved
  for (const initItem of initialList) {
    if (!mergedMap.has(initItem.id)) {
      mergedMap.set(initItem.id, initItem);
    }
  }
  return Array.from(mergedMap.values());
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authentication State (checks current and legacy keys)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const savedAuth = localStorage.getItem('pt_tw_auth_v4') ?? localStorage.getItem('pt_tw_auth_v3') ?? localStorage.getItem('pt_tw_auth');
    return savedAuth === 'true';
  });

  // Users state with PE customization persistence (preserves all old & new users)
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const loaded = loadMergedList<UserAccount>(
      ['pt_tw_users_v4', 'pt_tw_users_v3', 'pt_tw_users_v2', 'pt_tw_users'],
      INITIAL_USERS
    );
    const migrated = loaded.map(u => {
      if (u.role !== 'SUBCON' && !u.allowedTabs.includes('cutting')) {
        return { ...u, allowedTabs: [...u.allowedTabs, 'cutting'] };
      }
      return u;
    });
    if (!migrated.some(u => u.username === 'cutting_tw')) {
      const cuttingAcc = INITIAL_USERS.find(u => u.username === 'cutting_tw');
      if (cuttingAcc) migrated.push(cuttingAcc);
    }
    return migrated;
  });

  const [currentUser, setCurrentUser] = useState<UserAccount>(() => {
    const savedUser = localStorage.getItem('pt_tw_user_v4') ?? localStorage.getItem('pt_tw_user_v3') ?? localStorage.getItem('pt_tw_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        const match = users.find(u => u.id === parsed.id || u.username.toLowerCase() === parsed.username?.toLowerCase());
        if (match) return match;
      } catch (e) {
        console.error(e);
      }
    }
    return users[0]; // Default to PE
  });

  const [styles, setStyles] = useState<ProductionStyle[]>(() => {
    const loaded = loadMergedList<ProductionStyle>(
      ['pt_tw_styles_v2', 'pt_tw_styles_v1', 'pt_tw_styles'],
      INITIAL_STYLES
    );
    return loaded.map(sty => {
      const initMatch = INITIAL_STYLES.find(s => s.id === sty.id || s.code === sty.code);
      return {
        ...sty,
        steps: normalizeSOPSteps(sty.steps || STANDARD_SOP_STEPS, initMatch?.steps)
      };
    });
  });

  const [selectedStyleId, setSelectedStyleId] = useState<string>(() => {
    const savedId = localStorage.getItem('pt_tw_selected_style_id');
    if (savedId && styles.some(s => s.id === savedId)) {
      return savedId;
    }
    return styles[0]?.id || INITIAL_STYLES[0]?.id || '';
  });

  const [stock, setStock] = useState<StockItem[]>(() => {
    return loadMergedList<StockItem>(['pt_tw_stock', 'pt_tw_stock_v1'], INITIAL_STOCK);
  });

  const [transactions, setTransactions] = useState<StockTransaction[]>(() => {
    return loadMergedList<StockTransaction>(['pt_tw_transactions', 'pt_tw_transactions_v1'], INITIAL_TRANSACTIONS);
  });

  const [cashFlow, setCashFlow] = useState<CashFlowRecord[]>(() => {
    return loadMergedList<CashFlowRecord>(['pt_tw_cashflow'], INITIAL_CASH_FLOW);
  });

  const [subconTasks, setSubconTasks] = useState<SubcontractorTask[]>(() => {
    return loadMergedList<SubcontractorTask>(
      ['pt_tw_subcon_v3', 'pt_tw_subcon_v2', 'pt_tw_subcon_v1', 'pt_tw_subcon'],
      INITIAL_SUBCON_TASKS
    );
  });

  // PPIC Component Allocations state
  const [componentAllocations, setComponentAllocations] = useState<ProductionComponentAllocation[]>(() => {
    return loadMergedList<ProductionComponentAllocation>(['pt_tw_ppic_components'], INITIAL_PPIC_COMPONENTS);
  });

  // PPIC Material Requirements state
  const [productionMaterials, setProductionMaterials] = useState<ProductionMaterialRequirement[]>(() => {
    return loadMergedList<ProductionMaterialRequirement>(['pt_tw_ppic_materials'], INITIAL_PPIC_MATERIALS);
  });

  // Cutting Orders & Waiting List Queue state
  const [cuttingOrders, setCuttingOrders] = useState<CuttingOrderItem[]>(() => {
    return loadMergedList<CuttingOrderItem>(['pt_tw_cutting_orders_v1', 'pt_tw_cutting_orders'], INITIAL_CUTTING_ORDERS);
  });

  const [activeTab, setActiveTab] = useState<string>(() => {
    return localStorage.getItem('pt_tw_active_tab') || 'pe-workflow';
  });

  // Modals state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isNewStyleModalOpen, setIsNewStyleModalOpen] = useState<boolean>(false);
  const [isUserAccessModalOpen, setIsUserAccessModalOpen] = useState<boolean>(false);
  const [isGoogleScriptModalOpen, setIsGoogleScriptModalOpen] = useState<boolean>(false);
  const [isIssueStockModalOpen, setIsIssueStockModalOpen] = useState<boolean>(false);

  // Requisition Cart State (Pengambilan Barang Berbasis Keranjang Sesuai Style)
  const [requisitionCart, setRequisitionCart] = useState<RequisitionCartItem[]>(() => {
    const saved = localStorage.getItem('pt_tw_requisition_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });
  const [lastSubmittedRequisition, setLastSubmittedRequisition] = useState<SubmittedRequisitionReceipt | null>(null);

  useEffect(() => {
    localStorage.setItem('pt_tw_requisition_cart', JSON.stringify(requisitionCart));
  }, [requisitionCart]);

  // Company Logo Customization (persisted in localStorage)
  const [companyLogo, setCompanyLogoState] = useState<string | null>(() => {
    return localStorage.getItem('pt_tw_company_logo') || null;
  });

  const setCompanyLogo = (logo: string | null) => {
    setCompanyLogoState(logo);
    if (logo) {
      localStorage.setItem('pt_tw_company_logo', logo);
    } else {
      localStorage.removeItem('pt_tw_company_logo');
    }
  };

  // Print to PDF Modal State
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [activePrintBar, setActivePrintBar] = useState<string>('pe-workflow');

  const openPrintModal = (barId?: string) => {
    if (barId) {
      setActivePrintBar(barId);
    } else {
      setActivePrintBar(activeTab);
    }
    setIsPrintModalOpen(true);
  };

  // Google Apps Script state
  const [gasUrl, setGasUrl] = useState<string>(() => {
    return localStorage.getItem('pt_tw_gas_url') || '';
  });
  const [lastSyncedGas, setLastSyncedGas] = useState<string | undefined>(() => {
    return localStorage.getItem('pt_tw_last_gas_sync') || undefined;
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('pt_tw_auth_v4', isAuthenticated ? 'true' : 'false');
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('pt_tw_users_v4', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('pt_tw_user_v4', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('pt_tw_styles_v2', JSON.stringify(styles));
  }, [styles]);

  useEffect(() => {
    if (selectedStyleId) {
      localStorage.setItem('pt_tw_selected_style_id', selectedStyleId);
    }
  }, [selectedStyleId]);

  useEffect(() => {
    if (activeTab) {
      localStorage.setItem('pt_tw_active_tab', activeTab);
    }
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('pt_tw_stock', JSON.stringify(stock));
  }, [stock]);

  useEffect(() => {
    localStorage.setItem('pt_tw_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('pt_tw_cashflow', JSON.stringify(cashFlow));
  }, [cashFlow]);

  useEffect(() => {
    localStorage.setItem('pt_tw_subcon_v3', JSON.stringify(subconTasks));
  }, [subconTasks]);

  useEffect(() => {
    localStorage.setItem('pt_tw_ppic_components', JSON.stringify(componentAllocations));
  }, [componentAllocations]);

  useEffect(() => {
    localStorage.setItem('pt_tw_ppic_materials', JSON.stringify(productionMaterials));
  }, [productionMaterials]);

  useEffect(() => {
    localStorage.setItem('pt_tw_cutting_orders_v1', JSON.stringify(cuttingOrders));
  }, [cuttingOrders]);

  useEffect(() => {
    localStorage.setItem('pt_tw_gas_url', gasUrl);
  }, [gasUrl]);

  const currentStyle = styles.find(s => s.id === selectedStyleId) || styles[0] || INITIAL_STYLES[0];

  // Auto detect low stock
  const lowStockItems = stock.filter(item => item.currentStock <= item.minStockLevel);

  // Auto count pending funds to check
  const pendingCashFlowCount = cashFlow.filter(cf => cf.status === 'Pending Check').length;

  // Early Warning Engine (H-3 Sebelum Deadline & Analisis Target Harian Subkon)
  const subconWarnings: SubconEarlyWarning[] = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const warnings: SubconEarlyWarning[] = [];

    subconTasks.forEach(task => {
      if (task.status === 'Completed' || task.quantityReceived >= task.quantitySend) {
        return;
      }

      const estDate = new Date(task.estReturnDate + 'T00:00:00');
      const diffTime = estDate.getTime() - today.getTime();
      const daysUntilDeadline = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const logs = task.dailyLogs || [];
      const totalLoggedOutput = logs.reduce((sum, l) => sum + l.actualOutputPcs, 0);
      const totalCompletedPcs = Math.max(task.quantityReceived, totalLoggedOutput);
      const remainingQty = Math.max(0, task.quantitySend - totalCompletedPcs);

      // Estimate daily target if not explicitly set
      const sendD = new Date(task.sendDate + 'T00:00:00');
      const totalPlannedDays = Math.max(1, Math.ceil((estDate.getTime() - sendD.getTime()) / (1000 * 60 * 60 * 24)));
      const dailyTargetPcs = task.dailyTargetPcs || Math.ceil(task.quantitySend / totalPlannedDays);

      const avgActualDailyPcs = logs.length > 0
        ? Math.round(totalLoggedOutput / logs.length)
        : (totalCompletedPcs > 0 ? totalCompletedPcs : 0);

      const effectiveDaysLeft = Math.max(1, daysUntilDeadline);
      const requiredDailyRateToFinish = daysUntilDeadline <= 0
        ? remainingQty
        : Math.ceil(remainingQty / effectiveDaysLeft);

      const currentVelocity = avgActualDailyPcs > 0 ? avgActualDailyPcs : dailyTargetPcs;
      const daysNeededAtCurrentVelocity = currentVelocity > 0 ? Math.ceil(remainingQty / currentVelocity) : 99;
      const projectedDelayDays = Math.max(0, daysNeededAtCurrentVelocity - Math.max(0, daysUntilDeadline));

      // Check latest reported issue in logs
      const logsWithIssues = logs.filter(l => l.hasIssue);
      const latestIssueLog = logsWithIssues.length > 0 ? logsWithIssues[logsWithIssues.length - 1] : undefined;

      const isBelowDailyTarget = logs.length > 0 && avgActualDailyPcs < dailyTargetPcs * 0.92;
      const isWithinH3 = daysUntilDeadline <= 3 && daysUntilDeadline >= 0;
      const isOverdue = daysUntilDeadline < 0 || task.status === 'Delayed';
      const hasProblem = Boolean(latestIssueLog) || isBelowDailyTarget || projectedDelayDays > 0 || task.hasDiscrepancy || (isWithinH3 && remainingQty > dailyTargetPcs * Math.max(1, daysUntilDeadline));

      // Trigger warning if within 3 days before deadline (H-3) with any risk/unfinished work, OR if overdue, OR if active issue/delay predicted within 3 days
      if ((isWithinH3 && hasProblem) || isOverdue || Boolean(latestIssueLog) || projectedDelayDays >= 1) {
        const reasons: string[] = [];

        if (isOverdue) {
          reasons.push(`Melewati batas estimasi kembali (${Math.abs(daysUntilDeadline)} hari terlambat), sisa ${remainingQty.toLocaleString()} Pcs`);
        } else if (isWithinH3) {
          reasons.push(`Peringatan H-${daysUntilDeadline} sebelum deadline (${task.estReturnDate}) — sisa ${remainingQty.toLocaleString()} Pcs belum selesai`);
        }

        if (latestIssueLog) {
          reasons.push(`Kendala dilaporkan Subkon (${latestIssueLog.date}): ${latestIssueLog.issueCategory || 'Masalah Produksi'} — "${latestIssueLog.issueNotes || '-'}"`);
        }

        if (isBelowDailyTarget) {
          reasons.push(`Rata-rata aktual harian (${avgActualDailyPcs} pcs/hr) di bawah target (${dailyTargetPcs} pcs/hr)`);
        }

        if (projectedDelayDays > 0 && !isOverdue) {
          reasons.push(`Prediksi terlambat +${projectedDelayDays} hari jika kecepatan tidak dinaikkan ke ${requiredDailyRateToFinish} pcs/hari`);
        }

        warnings.push({
          taskId: task.id,
          subconName: task.subconName,
          styleCode: task.styleCode,
          serviceType: task.type,
          daysUntilDeadline,
          estReturnDate: task.estReturnDate,
          quantitySend: task.quantitySend,
          totalCompletedPcs,
          remainingQty,
          dailyTargetPcs,
          avgActualDailyPcs,
          requiredDailyRateToFinish,
          projectedDelayDays,
          severity: isOverdue ? 'OVERDUE' : isWithinH3 ? 'WARNING_H3' : 'AT_RISK',
          reasons,
          latestIssue: latestIssueLog
            ? {
                date: latestIssueLog.date,
                category: latestIssueLog.issueCategory || 'Kendala Produksi',
                notes: latestIssueLog.issueNotes || ''
              }
            : undefined
        });
      }
    });

    return warnings.sort((a, b) => a.daysUntilDeadline - b.daysUntilDeadline);
  }, [subconTasks]);

  // PPIC Engine: Style Perhatian yang Belum Sesuai dengan SOP
  const sopAttentionStyles: StyleSOPAttentionItem[] = React.useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const attentionList: StyleSOPAttentionItem[] = [];

    styles.forEach(sty => {
      if (sty.status === 'Completed') return;

      const deviations: SOPDeviationDetail[] = [];

      // Check each SOP step for deviations
      sty.steps.forEach(step => {
        // 1. Needs Review status
        if (step.status === 'Needs Review') {
          deviations.push({
            stepId: step.id,
            process: step.process,
            picDept: step.picDept,
            picName: step.picName,
            status: step.status,
            dateScheduled: step.dateScheduled,
            actualDate: step.actualDate,
            issueType: 'NEEDS_REVIEW',
            description: step.notes || `Tahap #${step.id} (${step.process}) membutuhkan review/revisi SOP sebelum lanjut.`,
            daysDelayed: 2
          });
          return;
        }

        // 2. Machine Breakdown Notes on uncompleted step
        if (step.machineBreakdownNotes && step.status !== 'Completed') {
          deviations.push({
            stepId: step.id,
            process: step.process,
            picDept: step.picDept,
            picName: step.picName,
            status: step.status,
            dateScheduled: step.dateScheduled,
            actualDate: step.actualDate,
            issueType: 'MACHINE_ISSUE',
            description: `Kendala Mesin/Attachment: ${step.machineBreakdownNotes}`,
            daysDelayed: 1
          });
          return;
        }

        // 3. Actual Date later than Scheduled Date
        if (step.actualDate && step.dateScheduled && step.actualDate > step.dateScheduled) {
          const schedD = new Date(step.dateScheduled + 'T00:00:00');
          const actD = new Date(step.actualDate + 'T00:00:00');
          const diffDays = Math.max(1, Math.round((actD.getTime() - schedD.getTime()) / (1000 * 60 * 60 * 24)));
          // Flag if step is not completed OR if delay is >= 2 days
          if (step.status !== 'Completed' || diffDays >= 2) {
            deviations.push({
              stepId: step.id,
              process: step.process,
              picDept: step.picDept,
              picName: step.picName,
              status: step.status,
              dateScheduled: step.dateScheduled,
              actualDate: step.actualDate,
              issueType: 'LATE_ACTUAL',
              description: `Tanggal aktual (${step.actualDate}) mundur +${diffDays} hari dari jadwal SOP (${step.dateScheduled}). ${step.notes || ''}`.trim(),
              daysDelayed: diffDays
            });
            return;
          }
        }

        // 4. Bypassed Prerequisite: Step is before or at currentWorkflowStep (or required for Cutting Step <= 11) and still Pending/In Progress past schedule
        if (step.status !== 'Completed' && step.id <= Math.max(sty.currentWorkflowStep + 1, 11)) {
          if (step.id < sty.currentWorkflowStep) {
            deviations.push({
              stepId: step.id,
              process: step.process,
              picDept: step.picDept,
              picName: step.picName,
              status: step.status,
              dateScheduled: step.dateScheduled,
              actualDate: step.actualDate,
              issueType: 'BYPASSED_PREREQUISITE',
              description: `Prasyarat SOP Tahap #${step.id} (${step.process}) belum selesai (${step.status}), namun style sudah berada di Tahap #${sty.currentWorkflowStep}!`,
              daysDelayed: 2
            });
          } else if (step.notes && (step.notes.toLowerCase().includes('perhatian') || step.notes.toLowerCase().includes('terlambat') || step.notes.toLowerCase().includes('tertunda') || step.notes.toLowerCase().includes('belum') || step.notes.toLowerCase().includes('safety stock') || step.notes.toLowerCase().includes('menunggu'))) {
            deviations.push({
              stepId: step.id,
              process: step.process,
              picDept: step.picDept,
              picName: step.picName,
              status: step.status,
              dateScheduled: step.dateScheduled,
              actualDate: step.actualDate,
              issueType: 'OVERDUE',
              description: step.notes,
              daysDelayed: 1
            });
          }
        }
      });

      // Check BOM Material shortages for this style
      const styleMaterials = productionMaterials.filter(m => m.styleCode === sty.code);
      const shortMaterials = styleMaterials.filter(m => m.status === 'Shortage' || m.status === 'Partial' || (m.balanceQty !== undefined && m.balanceQty < 0));
      const lowWhStock = stock.filter(s => s.styleCode === sty.code && s.currentStock <= s.minStockLevel);

      const shortageNames = Array.from(new Set([
        ...shortMaterials.map(m => `${m.materialName} (${m.status})`),
        ...lowWhStock.map(s => `${s.name} (Stok: ${s.currentStock}/${s.minStockLevel} ${s.unit})`)
      ]));

      // Check if any Cutting Order for this style is flagged as PERHATIAN_SOP or HOLD_SOP
      const relatedCutOrders = cuttingOrders.filter(co => co.styleCode === sty.code);
      const hasHoldCut = relatedCutOrders.some(co => co.queueStatus === 'HOLD_SOP' || co.sopComplianceStatus === 'PERHATIAN_SOP');

      if (deviations.length > 0 || shortageNames.length > 0 || hasHoldCut) {
        const hasCritical = deviations.some(d => d.issueType === 'NEEDS_REVIEW' || d.issueType === 'BYPASSED_PREREQUISITE' || d.issueType === 'MACHINE_ISSUE') || shortMaterials.some(m => m.status === 'Shortage');
        const severity: StyleSOPAttentionItem['severity'] = hasCritical
          ? 'CRITICAL'
          : deviations.length >= 2 || shortageNames.length > 0
          ? 'WARNING'
          : 'ATTENTION';

        let impact = 'Berpotensi menghambat jadwal potong (Cutting) & kestabilan suplai bundle ke Line Sewing.';
        let recommendation = 'Segera koordinasikan PE, Gudang & Leader Cutting untuk menyelesaikan tahapan SOP yang tertunda.';

        if (sty.code === 'TW-POLO-26') {
          impact = 'Perintah Potong di Antrian Waiting List #3 tertahan karena kalibrasi folder placket (Step 5), Pilot Sample (Step 6-7) & PPM (Step 9) belum tuntas.';
          recommendation = 'PPIC & PE wajib memprioritaskan approval Pilot Sample 5 pcs dan menggelar PPM hari ini sebelum kain Pique CVC digelar di Meja Potong 01.';
        } else if (sty.code === 'TW-BATIK-09') {
          impact = 'Perintah Potong berstatus HOLD_SOP di Antrian #5; berisiko gagal matching motif saku & luntur warna jika dipaksakan potong.';
          recommendation = 'Tahan proses gelar kain batik sampai hasil Lab Uji Luntur (Step 3) dan revisi pola saku PPS (Step 4) dinyatakan sesuai SOP oleh QC/PE.';
        } else if (sty.code === 'TW-JKT-88') {
          impact = 'Cutting utama sedang berjalan, namun defisit Benang Spun Poly Navy & Furing Asahi serta Step 14 (Loading Komponen) belum tuntas dapat menghentikan Line 1 & 2.';
          recommendation = 'PPIC segera terbitkan PR/PO percepatan benang & furing, serta instruksikan Cutting mempercepat numbering & loading bundle ke Line 1 & Subkon.';
        }

        const completedStepsCount = sty.steps.filter(s => s.status === 'Completed').length;
        const totalStepsCount = sty.steps.length || 14;
        const sopCompletionPercent = Math.round((completedStepsCount / totalStepsCount) * 100);

        attentionList.push({
          styleId: sty.id,
          styleCode: sty.code,
          styleName: sty.name,
          buyer: sty.buyer,
          targetQuantityPcs: sty.targetQuantityPcs || 0,
          deliveryDate: sty.deliveryDate,
          styleStatus: sty.status,
          currentWorkflowStep: sty.currentWorkflowStep,
          completedStepsCount,
          totalStepsCount,
          sopCompletionPercent,
          severity,
          totalDeviations: deviations.length,
          deviations,
          materialShortageCount: shortageNames.length,
          materialShortageNames: shortageNames,
          impactOnCuttingAndLine: impact,
          recommendedAction: recommendation
        });
      }
    });

    const sevOrder = { CRITICAL: 0, WARNING: 1, ATTENTION: 2 };
    return attentionList.sort((a, b) => sevOrder[a.severity] - sevOrder[b.severity]);
  }, [styles, productionMaterials, stock, cuttingOrders]);

  // Login handler (requires username and password)
  const login = (username: string, password?: string) => {
    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanUsername || !cleanPassword) {
      return { success: false, message: 'Silakan masukkan User dan Password terlebih dahulu!' };
    }

    const found = users.find(u => {
      const uname = u.username.toLowerCase();
      if (uname === cleanUsername) return true;
      // Support 'pe' or 'pe_admin' for the PE account
      if (u.role === 'PE' && (cleanUsername === 'pe' || cleanUsername === 'pe_admin')) return true;
      return false;
    });

    if (!found) {
      return { success: false, message: 'User / Username tidak ditemukan dalam sistem!' };
    }

    const expectedPass = found.password || (found.role === 'PE' ? 'pe123' : `${found.username.toLowerCase()}123`);
    const isPeDefaultPass = found.role === 'PE' && cleanPassword === 'pe123' && (expectedPass === 'pe123' || expectedPass === 'teratai123');

    if (cleanPassword !== expectedPass && !isPeDefaultPass) {
      return { success: false, message: 'Password yang Anda masukkan tidak sesuai!' };
    }

    setCurrentUser(found);
    setIsAuthenticated(true);

    // Route user to appropriate allowed tab
    if (found.role === 'SUBCON') {
      setActiveTab('subcon');
    } else if (found.role === 'PE') {
      if (!found.allowedTabs.includes(activeTab) && activeTab !== 'user-access') {
        setActiveTab('pe-workflow');
      }
    } else {
      if (!found.allowedTabs.includes(activeTab)) {
        setActiveTab(found.allowedTabs[0] || 'pe-workflow');
      }
    }

    return { success: true, message: `Selamat datang, ${found.name} (${found.role})!` };
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  // Check tab permissions:
  // - Bar 'user-access' (Akses Akun) is strictly reserved for PE (or if PE explicitly assigns 'user-access' to a user)
  // - Other bars are governed by the allowedTabs configured by PE for each user
  const isTabAllowed = (tabId: string): boolean => {
    if (tabId === 'user-access') {
      return currentUser.role === 'PE' || currentUser.allowedTabs.includes('user-access');
    }
    if (currentUser.role === 'PE') {
      return currentUser.allowedTabs.includes(tabId) || tabId === 'user-access';
    }
    if (currentUser.role === 'SUBCON') {
      return currentUser.allowedTabs.includes(tabId) || tabId === 'subcon';
    }
    return currentUser.allowedTabs.includes(tabId);
  };

  // PE User Management: Rename user & optionally update username/department (Strictly PE Only)
  const updateUserName = (
    userId: string,
    newName: string,
    newUsername?: string,
    newDepartment?: string
  ): { success: boolean; message: string } => {
    if (currentUser.role !== 'PE') {
      return {
        success: false,
        message: 'Akses Ditolak: Hanya Production Engineer (PE) yang berhak mengubah data pengguna!'
      };
    }

    const cleanName = newName.trim();
    if (!cleanName) {
      return { success: false, message: 'Nama pengguna tidak boleh kosong!' };
    }

    const cleanUname = newUsername !== undefined ? newUsername.trim() : undefined;
    if (cleanUname !== undefined && !cleanUname) {
      return { success: false, message: 'Username login tidak boleh kosong!' };
    }

    if (cleanUname !== undefined) {
      const duplicate = users.some(
        u => u.id !== userId && u.username.toLowerCase() === cleanUname.toLowerCase()
      );
      if (duplicate) {
        return { success: false, message: `Username "${cleanUname}" sudah digunakan oleh akun lain!` };
      }
    }

    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          name: cleanName,
          username: cleanUname !== undefined ? cleanUname : u.username,
          department: newDepartment !== undefined ? newDepartment.trim() : u.department
        };
      }
      return u;
    }));

    if (currentUser.id === userId) {
      setCurrentUser(prev => ({
        ...prev,
        name: cleanName,
        username: cleanUname !== undefined ? cleanUname : prev.username,
        department: newDepartment !== undefined ? newDepartment.trim() : prev.department
      }));
    }

    // Also keep Subcon tasks synced if a subcon account is updated
    setSubconTasks(prev => prev.map(task => {
      if (task.subconAccountId === userId) {
        return {
          ...task,
          subconName: cleanName,
          subconUsername: cleanUname !== undefined ? cleanUname : task.subconUsername
        };
      }
      return task;
    }));

    return {
      success: true,
      message: `Data profil akun "${cleanName}" berhasil diperbarui!`
    };
  };

  // PE User Management: Update allowed navigation bars/tabs (Strictly PE Only)
  const updateUserPermissions = (userId: string, allowedTabs: string[]): { success: boolean; message: string } => {
    if (currentUser.role !== 'PE') {
      return {
        success: false,
        message: 'Akses Ditolak: Hanya Production Engineer (PE) yang berhak mengatur akses bar!'
      };
    }

    const target = users.find(u => u.id === userId);
    const finalTabs = target?.role === 'PE' && !allowedTabs.includes('user-access')
      ? [...allowedTabs, 'user-access']
      : allowedTabs;

    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, allowedTabs: finalTabs };
      }
      return u;
    }));

    if (currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, allowedTabs: finalTabs }));
    }

    return {
      success: true,
      message: `Akses bar menu untuk "${target?.name || 'Akun'}" berhasil disimpan (${finalTabs.length} bar aktif)!`
    };
  };

  // PE User Management: Change / Reset Password for accounts (Strictly PE Only)
  const updateUserPassword = (userId: string, newPass: string): { success: boolean; message: string } => {
    if (currentUser.role !== 'PE') {
      return { 
        success: false, 
        message: 'Akses Ditolak: Hanya Production Engineer (PE) yang berhak mengganti password akun!' 
      };
    }

    const cleanPass = newPass.trim();
    if (!cleanPass) {
      return { success: false, message: 'Password baru tidak boleh kosong!' };
    }

    if (cleanPass.length < 3) {
      return { success: false, message: 'Password minimal terdiri dari 3 karakter!' };
    }

    const target = users.find(u => u.id === userId);
    if (!target) {
      return { success: false, message: 'Akun pengguna tidak ditemukan dalam sistem!' };
    }

    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, password: cleanPass };
      }
      return u;
    }));

    if (currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, password: cleanPass }));
    }

    // Sync password if linked to subcon task
    setSubconTasks(prev => prev.map(t => {
      if (t.subconAccountId === userId) {
        return { ...t, subconPassword: cleanPass };
      }
      return t;
    }));

    return { 
      success: true, 
      message: `Password untuk akun "${target.name}" (@${target.username}) berhasil diperbarui!` 
    };
  };

  // PE User Management: Add new user account (Strictly PE Only)
  const addNewUser = (params: {
    name: string;
    username: string;
    password?: string;
    role: UserRole;
    department: string;
    email?: string;
    allowedTabs: string[];
  }): { success: boolean; message: string } => {
    if (currentUser.role !== 'PE') {
      return { success: false, message: 'Akses Ditolak: Hanya Production Engineer (PE) yang berhak menambahkan akun!' };
    }

    const cleanUsername = params.username.trim();
    if (!cleanUsername) {
      return { success: false, message: 'User / Username login wajib diisi!' };
    }

    const cleanName = params.name.trim();
    if (!cleanName) {
      return { success: false, message: 'Nama lengkap pengguna wajib diisi!' };
    }

    const isDuplicate = users.some(u => u.username.toLowerCase() === cleanUsername.toLowerCase());
    if (isDuplicate) {
      return { success: false, message: `User "${cleanUsername}" sudah dipakai oleh akun lain. Gunakan username berbeda!` };
    }

    const assignedPassword = params.password?.trim() || `${cleanUsername.toLowerCase()}123`;

    const newUser: UserAccount = {
      id: `user-${Date.now()}`,
      username: cleanUsername,
      password: assignedPassword,
      name: cleanName,
      role: params.role,
      department: params.department.trim() || 'Operasional Garment',
      email: params.email?.trim() || `${cleanUsername.toLowerCase()}@terataiwidjaja.co.id`,
      allowedTabs: params.allowedTabs && params.allowedTabs.length > 0 
        ? params.allowedTabs 
        : ['pe-workflow']
    };

    setUsers(prev => [...prev, newUser]);
    return { 
      success: true, 
      message: `Akun baru "${newUser.name}" (User: ${newUser.username}) berhasil ditambahkan dan siap digunakan untuk login!` 
    };
  };

  // PE User Management: Delete user account
  const deleteUser = (userId: string): { success: boolean; message: string } => {
    if (currentUser.role !== 'PE') {
      return { success: false, message: 'Hanya Production Engineer (PE) yang berhak menghapus akun!' };
    }

    if (userId === 'usr-pe' || userId === currentUser.id) {
      return { success: false, message: 'Akun Utama PE yang sedang aktif tidak dapat dihapus!' };
    }

    const target = users.find(u => u.id === userId);
    setUsers(prev => prev.filter(u => u.id !== userId));
    return { success: true, message: `Akun "${target?.name || ''}" (@${target?.username || ''}) berhasil dihapus dari sistem!` };
  };

  // Add new Production Model / Style (or update existing style metadata without deleting old data)
  const addNewStyle = (params: {
    code: string;
    name: string;
    buyer: string;
    targetQuantityPcs: number;
    startDate: string;
    deliveryDate: string;
    allocatedBudget?: number;
    dailyTargetPcs?: number;
    primaryRoute?: 'LINE' | 'SUBCON' | 'HYBRID';
    autoSeedMaterials?: boolean;
  }) => {
    const cleanCode = params.code.trim().toUpperCase();
    const cleanName = params.name.trim();

    // Check if style with same code already exists -> update without losing old steps/progress
    const existingStyle = styles.find(s => s.code.toUpperCase() === cleanCode);
    if (existingStyle) {
      setStyles(prev => prev.map(s => {
        if (s.id !== existingStyle.id) return s;
        return {
          ...s,
          name: cleanName || s.name,
          buyer: params.buyer.trim() || s.buyer,
          targetQuantityPcs: params.targetQuantityPcs || s.targetQuantityPcs,
          startDate: params.startDate || s.startDate,
          deliveryDate: params.deliveryDate || s.deliveryDate,
          primaryRoute: params.primaryRoute || s.primaryRoute
        };
      }));
      setSelectedStyleId(existingStyle.id);
      return;
    }

    const newId = `style-${Date.now()}`;
    
    // Generate scheduled steps where all steps before Sewing Assembly Line (Steps 1..14)
    // are scheduled AT LEAST 1 week (7 days) before Step 15 (Sewing Assembly Line)
    const startMs = new Date(params.startDate + 'T00:00:00').getTime();
    const rawEndMs = new Date(params.deliveryDate + 'T00:00:00').getTime();
    const totalSpan = Math.max(21 * ONE_DAY_MS, rawEndMs - startMs);
    const sewingMs = startMs + Math.max(14 * ONE_DAY_MS, Math.round(totalSpan * 0.68));
    const maxPreSewingMs = sewingMs - ONE_WEEK_MS; // Minimal 1 minggu (7 hari) sebelum Sewing Assembly Line
    const preSewingSpan = Math.max(ONE_DAY_MS, maxPreSewingMs - startMs);
    const postSewingEndMs = Math.max(rawEndMs, sewingMs + 5 * ONE_DAY_MS);
    const postSewingSpan = Math.max(3 * ONE_DAY_MS, postSewingEndMs - sewingMs);

    const generatedSteps: SOPWorkflowStep[] = STANDARD_SOP_STEPS.map((stdStep, index) => {
      let stepMs: number;
      if (index < 14) {
        // Steps 1 to 14: scheduled between startDate and (sewingDate - 7 days)
        stepMs = startMs + Math.round((preSewingSpan * index) / 13);
      } else if (index === 14) {
        // Step 15: Sewing Assembly Line (minimal 1 minggu setelah Step 14)
        stepMs = sewingMs;
      } else {
        // Steps 16 to 18: Subkon, QC & Finishing, Transfer FG
        stepMs = sewingMs + Math.round((postSewingSpan * (index - 14)) / 3);
      }
      const stepDate = new Date(stepMs).toISOString().split('T')[0];
      return {
        ...stdStep,
        id: index + 1,
        picName: '', // Hanya jabatan pada picDept
        status: index === 0 ? 'In Progress' : 'Pending',
        dateScheduled: stepDate,
        actualDate: '',
        dateCompleted: undefined
      };
    });

    const newStyle: ProductionStyle = {
      id: newId,
      code: cleanCode,
      name: cleanName,
      buyer: params.buyer.trim(),
      targetQuantityPcs: params.targetQuantityPcs,
      startDate: params.startDate,
      deliveryDate: params.deliveryDate,
      status: 'Preparation',
      currentWorkflowStep: 1,
      steps: generatedSteps,
      cuttingProgressPcs: 0,
      sewingProgressPcs: 0,
      qcPassedPcs: 0,
      primaryRoute: params.primaryRoute || 'HYBRID',
      allocatedBudget: params.allocatedBudget || 120000000,
      usedBudget: 0
    };

    setStyles(prev => [newStyle, ...prev]);
    setSelectedStyleId(newId);

    // Optionally seed starter stock & BOM materials for this new style so users can immediately test stock/cart/BOM
    if (params.autoSeedMaterials) {
      const now = new Date();
      const timestamp = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`;
      const qtyPcs = params.targetQuantityPcs || 1000;
      const fabricNeed = Math.ceil(qtyPcs * 1.5);
      const threadNeed = Math.ceil(qtyPcs * 0.1);

      const seededStock: StockItem[] = [
        {
          id: `stk-${Date.now()}-1`,
          code: `FAB-${cleanCode}`,
          name: `Kain Utama ${cleanName}`,
          category: 'Kain Utama (Fabric)',
          styleCode: cleanCode,
          styleName: cleanName,
          currentStock: fabricNeed + 200,
          minStockLevel: Math.max(50, Math.round(fabricNeed * 0.15)),
          unit: 'Yard',
          rackLocation: 'Gudang-A / Rak 02',
          unitPrice: 32000,
          supplier: 'PT Tekstil Nusantara',
          lastUpdated: timestamp,
          notes: `Alokasi awal otomatis untuk ${cleanCode}`
        },
        {
          id: `stk-${Date.now()}-2`,
          code: `THR-${cleanCode}`,
          name: `Benang Jahit Poliester 40/2 (${cleanCode})`,
          category: 'Benang Jahit',
          styleCode: cleanCode,
          styleName: cleanName,
          currentStock: threadNeed + 50,
          minStockLevel: 30,
          unit: 'Cones',
          rackLocation: 'Gudang-B / Rak 04',
          unitPrice: 18500,
          supplier: 'PT Coats Thread',
          lastUpdated: timestamp,
          notes: `Benang produksi ${cleanCode}`
        },
        {
          id: `stk-${Date.now()}-3`,
          code: `ACC-${cleanCode}`,
          name: `Aksesoris, Label & Polybag (${cleanCode})`,
          category: 'Aksesoris & Hangtag',
          styleCode: cleanCode,
          styleName: cleanName,
          currentStock: qtyPcs + 150,
          minStockLevel: 200,
          unit: 'Set',
          rackLocation: 'Gudang-C / Rak 01',
          unitPrice: 3500,
          supplier: 'CV Aksesoris Garmen',
          lastUpdated: timestamp,
          notes: `Set aksesoris lengkap ${cleanCode}`
        }
      ];

      setStock(prev => [...seededStock, ...prev]);

      const seededBOM: ProductionMaterialRequirement[] = [
        {
          id: `bom-${Date.now()}-1`,
          styleCode: cleanCode,
          materialName: `Kain Utama ${cleanName}`,
          category: 'Kain Utama (Fabric)',
          usedForComponent: 'Body Utama & Lengan',
          consumptionPerPcs: 1.5,
          wasteAllowancePercent: 3,
          unit: 'Yard',
          totalRequired: fabricNeed,
          availableStock: fabricNeed + 200,
          allocatedFromWarehouseQty: fabricNeed,
          balanceQty: 200,
          status: 'Ready',
          allocatedTo: 'LINE',
          targetWorkCenter: 'Ruang Cutting & Line Sewing',
          unitPrice: 32000
        },
        {
          id: `bom-${Date.now()}-2`,
          styleCode: cleanCode,
          materialName: `Benang Jahit Poliester 40/2 (${cleanCode})`,
          category: 'Benang Jahit',
          usedForComponent: 'Seluruh Perakitan',
          consumptionPerPcs: 0.1,
          wasteAllowancePercent: 2,
          unit: 'Cones',
          totalRequired: threadNeed,
          availableStock: threadNeed + 50,
          allocatedFromWarehouseQty: threadNeed,
          balanceQty: 50,
          status: 'Ready',
          allocatedTo: 'BOTH',
          targetWorkCenter: 'Line Sewing & Subkon',
          unitPrice: 18500
        }
      ];

      setProductionMaterials(prev => [...seededBOM, ...prev]);

      const seededComponents: ProductionComponentAllocation[] = [
        {
          id: `comp-${Date.now()}-1`,
          styleCode: cleanCode,
          componentName: 'Body Utama, Lengan & Perakitan Akhir',
          panelCategory: 'Panel Utama (Main Body)',
          qtyPerPcs: 1,
          totalRequiredQty: qtyPcs,
          route: params.primaryRoute === 'SUBCON' ? 'SUBCON' : 'LINE',
          targetLocation: params.primaryRoute === 'SUBCON' ? 'Mitra Jahit Subkon' : 'Line 1 Sewing (In-House)',
          processDescription: 'Cutting, Sewing Assembly & QC',
          status: 'Allocated',
          targetDate: params.deliveryDate,
          picName: currentUser.name
        }
      ];

      setComponentAllocations(prev => [...seededComponents, ...prev]);
    }
  };

  const deleteStyle = (styleId: string) => {
    if (styles.length <= 1) return;
    setStyles(prev => {
      const remaining = prev.filter(s => s.id !== styleId);
      if (selectedStyleId === styleId && remaining.length > 0) {
        setSelectedStyleId(remaining[0].id);
      }
      return remaining;
    });
  };

  const addStockItem = (item: Omit<StockItem, 'id' | 'lastUpdated'>) => {
    const now = new Date();
    const timestamp = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`;
    const cleanCode = item.code.trim().toUpperCase();

    // If an item with the same SKU code & style already exists, add to existing stock without deleting old data
    const existingItem = stock.find(
      s => s.code.toUpperCase() === cleanCode && s.styleCode.toUpperCase() === item.styleCode.toUpperCase()
    );

    if (existingItem) {
      setStock(prev => prev.map(s => {
        if (s.id !== existingItem.id) return s;
        const combinedNotes = item.notes
          ? (s.notes ? `${s.notes} | [${timestamp}] +${item.currentStock}: ${item.notes}` : item.notes)
          : s.notes;
        return {
          ...s,
          currentStock: s.currentStock + item.currentStock,
          minStockLevel: item.minStockLevel || s.minStockLevel,
          rackLocation: item.rackLocation || s.rackLocation,
          unitPrice: item.unitPrice || s.unitPrice,
          supplier: item.supplier || s.supplier,
          lastUpdated: timestamp,
          notes: combinedNotes
        };
      }));

      const addTx: StockTransaction = {
        id: `TRX-${Date.now()}`,
        timestamp,
        type: 'IN',
        stockItemId: existingItem.id,
        itemCode: existingItem.code,
        itemName: existingItem.name,
        styleTarget: existingItem.styleCode,
        allocatedStyleOfItem: existingItem.styleCode,
        isCrossStyle: false,
        quantity: item.currentStock,
        unit: existingItem.unit,
        destinationDept: 'Gudang Lain',
        picReceiver: currentUser.name,
        picGudang: currentUser.name,
        referenceDoc: `PO-ADD-${existingItem.code}`,
        reason: 'Penambahan Stok Gudang (Data Lama Tetap Tersimpan)',
        notes: item.notes || 'Penambahan kuantitas stok'
      };
      setTransactions(prev => [addTx, ...prev]);
      return;
    }

    const newItem: StockItem = {
      ...item,
      code: cleanCode,
      id: `stk-${Date.now()}`,
      lastUpdated: timestamp
    };
    setStock(prev => [newItem, ...prev]);

    // Also register IN transaction
    const newTx: StockTransaction = {
      id: `TRX-${Date.now()}`,
      timestamp,
      type: 'IN',
      stockItemId: newItem.id,
      itemCode: newItem.code,
      itemName: newItem.name,
      styleTarget: newItem.styleCode,
      allocatedStyleOfItem: newItem.styleCode,
      isCrossStyle: false,
      quantity: newItem.currentStock,
      unit: newItem.unit,
      destinationDept: 'Gudang Lain',
      picReceiver: currentUser.name,
      picGudang: currentUser.name,
      referenceDoc: `PO-REC-${newItem.code}`,
      reason: 'Penerimaan Stok Baru di Gudang',
      notes: newItem.notes || 'Pemasukan barang baru'
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const updateStockQuantity = (id: string, qtyDelta: number) => {
    const now = new Date();
    const timestamp = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`;
    const target = stock.find(item => item.id === id);
    setStock(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          currentStock: Math.max(0, item.currentStock + qtyDelta),
          lastUpdated: timestamp
        };
      }
      return item;
    }));
    if (target && qtyDelta !== 0) {
      const adjTx: StockTransaction = {
        id: `TRX-${Date.now()}`,
        timestamp,
        type: qtyDelta > 0 ? 'IN' : 'ADJUSTMENT',
        stockItemId: target.id,
        itemCode: target.code,
        itemName: target.name,
        styleTarget: target.styleCode,
        allocatedStyleOfItem: target.styleCode,
        isCrossStyle: false,
        quantity: Math.abs(qtyDelta),
        unit: target.unit,
        destinationDept: 'Gudang Lain',
        picReceiver: currentUser.name,
        picGudang: currentUser.name,
        referenceDoc: `ADJ-${target.code}-${Date.now().toString().slice(-4)}`,
        reason: qtyDelta > 0 ? 'Penambahan Stok' : 'Penyesuaian Stok',
        notes: `Perbaharuan stok (${qtyDelta > 0 ? '+' : ''}${qtyDelta} ${target.unit})`
      };
      setTransactions(prev => [adjTx, ...prev]);
    }
  };

  // Issuing material / stock taking with strict style check
  const issueStock = (params: {
    stockItemId: string;
    styleTarget: string;
    quantity: number;
    destinationDept: StockTransaction['destinationDept'];
    picReceiver: string;
    referenceDoc: string;
    reason: string;
    notes?: string;
  }) => {
    const targetItem = stock.find(s => s.id === params.stockItemId);
    if (!targetItem) {
      return { success: false, message: 'Item stok tidak ditemukan!', isCrossStyle: false };
    }

    // STRICT STYLE RULE: Materials cannot be taken for a different style!
    if (targetItem.styleCode !== params.styleTarget) {
      return { 
        success: false, 
        message: `Ditolak: Pengambilan bahan di luar alokasi style dilarang! Bahan "${targetItem.name}" dialokasikan untuk style ${targetItem.styleCode}, tidak boleh diambil untuk ${params.styleTarget}.`, 
        isCrossStyle: true 
      };
    }

    if (targetItem.currentStock < params.quantity) {
      return { 
        success: false, 
        message: `Stok tidak mencukupi! Tersedia: ${targetItem.currentStock} ${targetItem.unit}, diminta: ${params.quantity} ${targetItem.unit}`, 
        isCrossStyle: false 
      };
    }

    const now = new Date();
    const timestamp = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`;

    // Update stock
    setStock(prev => prev.map(s => {
      if (s.id === params.stockItemId) {
        return {
          ...s,
          currentStock: s.currentStock - params.quantity,
          lastUpdated: timestamp
        };
      }
      return s;
    }));

    // Add transaction with explicit accountability
    const newTx: StockTransaction = {
      id: `TRX-${Date.now()}`,
      timestamp,
      type: 'OUT',
      stockItemId: targetItem.id,
      itemCode: targetItem.code,
      itemName: targetItem.name,
      styleTarget: params.styleTarget,
      allocatedStyleOfItem: targetItem.styleCode,
      isCrossStyle: false,
      quantity: params.quantity,
      unit: targetItem.unit,
      destinationDept: params.destinationDept,
      picReceiver: params.picReceiver,
      picGudang: currentUser.name,
      verifiedByPE: currentUser.role === 'PE' ? currentUser.name : undefined,
      referenceDoc: params.referenceDoc,
      reason: params.reason,
      notes: params.notes
    };

    setTransactions(prev => [newTx, ...prev]);

    return { 
      success: true, 
      message: `Berhasil mengeluarkan ${params.quantity} ${targetItem.unit} "${targetItem.name}" untuk style ${params.styleTarget}.`, 
      isCrossStyle: false 
    };
  };

  // Requisition Cart Implementation (Pengambilan Bahan Berbasis Keranjang Sesuai Style)
  const addToRequisitionCart = (item: StockItem, quantity: number = 1, notes?: string): { success: boolean; message: string } => {
    // 1. Strict style check: Cannot mix styles in cart!
    if (requisitionCart.length > 0 && requisitionCart[0].styleCode !== item.styleCode) {
      return {
        success: false,
        message: `Keranjang saat ini dialokasikan untuk Style ${requisitionCart[0].styleCode}. Sesuai aturan, pengambilan bahan tidak boleh lintas style! Kosongkan atau ajukan keranjang terlebih dahulu.`
      };
    }

    if (quantity <= 0) {
      return { success: false, message: 'Jumlah pengambilan harus lebih besar dari 0!' };
    }

    const existingIndex = requisitionCart.findIndex(c => c.stockItemId === item.id);
    const currentQtyInCart = existingIndex >= 0 ? requisitionCart[existingIndex].quantityToIssue : 0;
    const totalDesired = currentQtyInCart + quantity;

    if (totalDesired > item.currentStock) {
      return {
        success: false,
        message: `Stok tidak mencukupi! Tersedia: ${item.currentStock} ${item.unit}. Di keranjang sudah ada: ${currentQtyInCart} ${item.unit}.`
      };
    }

    if (existingIndex >= 0) {
      setRequisitionCart(prev => prev.map((c, idx) => {
        if (idx === existingIndex) {
          return { ...c, quantityToIssue: totalDesired, notes: notes || c.notes };
        }
        return c;
      }));
    } else {
      const newCartItem: RequisitionCartItem = {
        id: `cart-${Date.now()}-${item.id}`,
        stockItemId: item.id,
        itemCode: item.code,
        itemName: item.name,
        category: item.category,
        styleCode: item.styleCode,
        styleName: item.styleName,
        currentStock: item.currentStock,
        quantityToIssue: quantity,
        unit: item.unit,
        rackLocation: item.rackLocation,
        unitPrice: item.unitPrice,
        notes: notes || ''
      };
      setRequisitionCart(prev => [...prev, newCartItem]);
    }

    return {
      success: true,
      message: `"${item.name}" (${quantity} ${item.unit}) berhasil dimasukkan ke keranjang!`
    };
  };

  const removeFromRequisitionCart = (stockItemId: string) => {
    setRequisitionCart(prev => prev.filter(c => c.stockItemId !== stockItemId));
  };

  const updateCartItemQuantity = (stockItemId: string, quantity: number) => {
    const item = stock.find(s => s.id === stockItemId);
    const maxStock = item ? item.currentStock : 999999;
    const safeQty = Math.max(1, Math.min(quantity, maxStock));
    setRequisitionCart(prev => prev.map(c => {
      if (c.stockItemId === stockItemId) {
        return { ...c, quantityToIssue: safeQty };
      }
      return c;
    }));
  };

  const clearRequisitionCart = () => {
    setRequisitionCart([]);
  };

  const submitRequisitionCart = (params: {
    destinationDept: StockTransaction['destinationDept'];
    picReceiver: string;
    referenceDoc?: string;
    reason?: string;
    notes?: string;
  }): { success: boolean; message: string; receipt?: SubmittedRequisitionReceipt } => {
    if (requisitionCart.length === 0) {
      return { success: false, message: 'Keranjang pengambilan masih kosong! Tambahkan bahan terlebih dahulu.' };
    }

    if (!params.picReceiver.trim()) {
      return { success: false, message: 'Wajib mengisi Nama Penanggung Jawab / PIC yang mengambil barang!' };
    }

    // Verify stock availability for each item in cart
    for (const cartItem of requisitionCart) {
      const stockItem = stock.find(s => s.id === cartItem.stockItemId);
      if (!stockItem) {
        return { success: false, message: `Bahan ${cartItem.itemName} tidak ditemukan di master stok!` };
      }
      if (stockItem.currentStock < cartItem.quantityToIssue) {
        return { 
          success: false, 
          message: `Stok untuk "${cartItem.itemName}" tidak mencukupi! Tersedia hanya ${stockItem.currentStock} ${stockItem.unit}, diminta ${cartItem.quantityToIssue} ${cartItem.unit}.` 
        };
      }
    }

    const now = new Date();
    const timestamp = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`;
    const styleCode = requisitionCart[0].styleCode;
    const styleName = requisitionCart[0].styleName;
    const refDoc = params.referenceDoc?.trim() || `BON-${styleCode}-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${now.toTimeString().slice(0, 2)}${now.toTimeString().slice(3, 5)}`;

    // Update stocks
    const cartItemMap = new Map<string, number>(requisitionCart.map(c => [c.stockItemId, c.quantityToIssue]));
    setStock(prev => prev.map(s => {
      if (cartItemMap.has(s.id)) {
        const issueQty = cartItemMap.get(s.id) ?? 0;
        return {
          ...s,
          currentStock: Math.max(0, s.currentStock - issueQty),
          lastUpdated: timestamp
        };
      }
      return s;
    }));

    // Generate individual transaction records
    const newTransactions: StockTransaction[] = requisitionCart.map((cartItem, idx) => ({
      id: `TRX-${Date.now()}-${idx}`,
      timestamp,
      type: 'OUT',
      stockItemId: cartItem.stockItemId,
      itemCode: cartItem.itemCode,
      itemName: cartItem.itemName,
      styleTarget: styleCode,
      allocatedStyleOfItem: cartItem.styleCode,
      isCrossStyle: false,
      quantity: cartItem.quantityToIssue,
      unit: cartItem.unit,
      destinationDept: params.destinationDept,
      picReceiver: params.picReceiver.trim(),
      picGudang: currentUser.name,
      verifiedByPE: currentUser.role === 'PE' ? currentUser.name : undefined,
      referenceDoc: refDoc,
      reason: params.reason?.trim() || `Pengeluaran material untuk proses ${params.destinationDept}`,
      notes: cartItem.notes ? `${cartItem.notes}. ${params.notes || ''}`.trim() : params.notes
    }));

    setTransactions(prev => [...newTransactions, ...prev]);

    // Build Receipt for Printing
    const receipt: SubmittedRequisitionReceipt = {
      referenceDoc: refDoc,
      timestamp,
      styleCode,
      styleName,
      destinationDept: params.destinationDept,
      picReceiver: params.picReceiver.trim(),
      picGudang: currentUser.name,
      verifiedByPE: currentUser.role === 'PE' ? currentUser.name : undefined,
      reason: params.reason?.trim() || `Pengeluaran material untuk proses ${params.destinationDept}`,
      notes: params.notes,
      items: requisitionCart.map(c => ({
        itemCode: c.itemCode,
        itemName: c.itemName,
        category: c.category,
        quantity: c.quantityToIssue,
        unit: c.unit,
        rackLocation: c.rackLocation
      }))
    };

    setLastSubmittedRequisition(receipt);
    setRequisitionCart([]); // clear cart on success

    return {
      success: true,
      message: `Pengajuan pengeluaran ${receipt.items.length} item bahan untuk style ${styleCode} berhasil diproses!`,
      receipt
    };
  };

  const updateWorkflowStep = (styleId: string, stepId: number, updates: Partial<SOPWorkflowStep>) => {
    const now = new Date();
    const timestamp = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`;

    setStyles(prev => prev.map(sty => {
      if (sty.id === styleId) {
        const rawUpdatedSteps = sty.steps.map(step => {
          if (step.id === stepId) {
            const historyEntry = {
              updatedAt: timestamp,
              updatedBy: currentUser.role,
              previousStatus: step.status,
              previousDateScheduled: step.dateScheduled,
              previousActualDate: step.actualDate,
              previousNotes: step.notes,
              previousMachineBreakdownNotes: step.machineBreakdownNotes
            };
            const prevHistory = step.updateHistory || [];
            return {
              ...step,
              ...updates,
              picName: '', // Hanya jabatan pada picDept
              dateCompleted: updates.status === 'Completed' ? (updates.dateCompleted || new Date().toISOString().split('T')[0]) : step.dateCompleted,
              updateHistory: [...prevHistory, historyEntry]
            };
          }
          return step;
        });

        // Enforce minimum 1 week (7 days) before Sewing Assembly Line (Step 15) if schedule date changed
        const updatedSteps = normalizeSOPSteps(rawUpdatedSteps);

        // Determine current step
        const firstIncomplete = updatedSteps.find(s => s.status !== 'Completed');
        const currentStepNum = firstIncomplete ? firstIncomplete.id : updatedSteps.length;

        // Determine general status
        let newStatus = sty.status;
        if (currentStepNum <= 4) newStatus = 'Preparation';
        else if (currentStepNum <= 9) newStatus = 'Sample / PPS';
        else if (currentStepNum <= 14) newStatus = 'Cutting';
        else if (currentStepNum === 15) newStatus = 'Sewing';
        else if (currentStepNum === 16) newStatus = 'Subkon';
        else if (currentStepNum === 17) newStatus = 'Finishing';
        else if (currentStepNum >= 18 && updatedSteps.every(s => s.status === 'Completed')) newStatus = 'Completed';

        return {
          ...sty,
          steps: updatedSteps,
          currentWorkflowStep: currentStepNum,
          status: newStatus
        };
      }
      return sty;
    }));
  };

  // Specifically update Actual Date for SOP Step (preserving previous actualDate in history)
  const updateStepActualDate = (styleId: string, stepId: number, actualDate: string) => {
    const now = new Date();
    const timestamp = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`;

    setStyles(prev => prev.map(sty => {
      if (sty.id === styleId) {
        const updatedSteps = sty.steps.map(step => {
          if (step.id === stepId) {
            const hasDate = Boolean(actualDate && actualDate.trim());
            const historyEntry = {
              updatedAt: timestamp,
              updatedBy: currentUser.role,
              previousStatus: step.status,
              previousActualDate: step.actualDate
            };
            return {
              ...step,
              actualDate,
              status: hasDate && step.status === 'Pending' ? 'In Progress' : step.status,
              updateHistory: [...(step.updateHistory || []), historyEntry]
            };
          }
          return step;
        });

        return {
          ...sty,
          steps: updatedSteps
        };
      }
      return sty;
    }));
  };

  const addCashFlowRecord = (record: Omit<CashFlowRecord, 'id' | 'status'>) => {
    const newRecord: CashFlowRecord = {
      ...record,
      id: `CF-${Date.now()}`,
      status: 'Pending Check', // Always needs checking as instructed
      verifiedByPE: currentUser.role === 'PE' ? currentUser.name : undefined
    };
    setCashFlow(prev => [newRecord, ...prev]);

    // Update style used budget if expense
    if (record.type === 'EXPENSE') {
      setStyles(prev => prev.map(s => {
        if (s.code === record.styleCode) {
          return {
            ...s,
            usedBudget: s.usedBudget + record.amount
          };
        }
        return s;
      }));
    }
  };

  const approveCashFlow = (id: string, approverName: string) => {
    setCashFlow(prev => prev.map(cf => {
      if (cf.id === id) {
        return {
          ...cf,
          status: 'Approved',
          approvedByFM: approverName
        };
      }
      return cf;
    }));
  };

  const rejectCashFlow = (id: string, notes?: string) => {
    setCashFlow(prev => prev.map(cf => {
      if (cf.id === id) {
        return {
          ...cf,
          status: 'Rejected',
          description: notes ? `${cf.description} [DITOLAK: ${notes}]` : `${cf.description} [DITOLAK FM]`
        };
      }
      return cf;
    }));
  };

  // PPIC Component Allocations CRUD
  const addComponentAllocation = (allocation: Omit<ProductionComponentAllocation, 'id'>) => {
    const newComponent: ProductionComponentAllocation = {
      ...allocation,
      id: `COMP-${Date.now().toString().slice(-6)}`
    };
    setComponentAllocations(prev => [newComponent, ...prev]);
  };

  const updateComponentAllocation = (id: string, updates: Partial<ProductionComponentAllocation>) => {
    setComponentAllocations(prev => prev.map(comp => {
      if (comp.id === id) {
        return { ...comp, ...updates };
      }
      return comp;
    }));
  };

  const deleteComponentAllocation = (id: string) => {
    setComponentAllocations(prev => prev.filter(comp => comp.id !== id));
  };

  // PPIC Material Requirements CRUD
  const addProductionMaterial = (material: Omit<ProductionMaterialRequirement, 'id'>) => {
    const wastePercent = material.wasteAllowancePercent ?? 0;
    const targetQty = styles.find(s => s.code === material.styleCode)?.targetQuantityPcs || 1000;
    const totalReq = material.totalRequired || Math.ceil(material.consumptionPerPcs * targetQty * (1 + wastePercent / 100));
    
    // Auto sync with warehouse stock if availableStock is not specified
    let avail = material.availableStock;
    if (avail === undefined) {
      if (material.stockItemId) {
        const found = stock.find(s => s.id === material.stockItemId || s.code === material.stockItemId);
        avail = found ? found.currentStock : 0;
      } else {
        const found = stock.find(s => 
          s.styleCode === material.styleCode &&
          (s.name.toLowerCase().includes(material.materialName.toLowerCase()) || material.materialName.toLowerCase().includes(s.name.toLowerCase()))
        );
        avail = found ? found.currentStock : 0;
      }
    }

    const balance = avail - totalReq;
    const status: ProductionMaterialRequirement['status'] = 
      material.status || (avail >= totalReq ? 'Ready' : (avail > 0 ? 'Partial' : 'Shortage'));

    const newMat: ProductionMaterialRequirement = {
      ...material,
      id: `MAT-${Date.now().toString().slice(-6)}`,
      totalRequired: totalReq,
      availableStock: avail,
      balanceQty: balance,
      status: status,
      allocatedFromWarehouseQty: material.allocatedFromWarehouseQty ?? (avail >= totalReq ? totalReq : avail)
    };
    setProductionMaterials(prev => [newMat, ...prev]);
  };

  const updateProductionMaterial = (id: string, updates: Partial<ProductionMaterialRequirement>) => {
    setProductionMaterials(prev => prev.map(mat => {
      if (mat.id === id) {
        const updated = { ...mat, ...updates };
        if (updates.consumptionPerPcs !== undefined || updates.wasteAllowancePercent !== undefined) {
          const targetQty = styles.find(s => s.code === updated.styleCode)?.targetQuantityPcs || 1000;
          const waste = updated.wasteAllowancePercent ?? 0;
          updated.totalRequired = Math.ceil(updated.consumptionPerPcs * targetQty * (1 + waste / 100));
        }
        if (updated.availableStock !== undefined && updated.totalRequired !== undefined) {
          updated.balanceQty = updated.availableStock - updated.totalRequired;
          updated.status = updated.availableStock >= updated.totalRequired ? 'Ready' : (updated.availableStock > 0 ? 'Partial' : 'Shortage');
        }
        return updated;
      }
      return mat;
    }));
  };

  const deleteProductionMaterial = (id: string) => {
    setProductionMaterials(prev => prev.filter(mat => mat.id !== id));
  };

  // Cutting Orders, Waiting List & Loading Allocations CRUD
  const addCuttingOrder = (order: Omit<CuttingOrderItem, 'id' | 'queueNumber'>) => {
    setCuttingOrders(prev => {
      const maxQueue = prev.reduce((max, item) => Math.max(max, item.queueNumber), 0);
      const newOrder: CuttingOrderItem = {
        ...order,
        id: `CUT-${Date.now().toString().slice(-6)}`,
        queueNumber: maxQueue + 1
      };
      return [...prev, newOrder];
    });
  };

  const updateCuttingOrder = (id: string, updates: Partial<CuttingOrderItem>) => {
    setCuttingOrders(prev => prev.map(order => {
      if (order.id !== id) return order;
      const updated = { ...order, ...updates };
      // Also sync cuttingProgressPcs on the style if actualCutPcs was updated
      if (updates.actualCutPcs !== undefined) {
        const diff = updates.actualCutPcs - order.actualCutPcs;
        if (diff !== 0) {
          setStyles(styPrev => styPrev.map(s => {
            if (s.code === order.styleCode) {
              return {
                ...s,
                cuttingProgressPcs: Math.min(s.targetQuantityPcs, Math.max(0, s.cuttingProgressPcs + diff))
              };
            }
            return s;
          }));
        }
      }
      return updated;
    }));
  };

  const deleteCuttingOrder = (id: string) => {
    setCuttingOrders(prev => {
      const filtered = prev.filter(o => o.id !== id);
      return filtered.map((o, idx) => ({ ...o, queueNumber: idx + 1 }));
    });
  };

  const moveCuttingQueue = (id: string, direction: 'UP' | 'DOWN') => {
    setCuttingOrders(prev => {
      const sorted = [...prev].sort((a, b) => a.queueNumber - b.queueNumber);
      const idx = sorted.findIndex(o => o.id === id);
      if (idx === -1) return prev;
      const swapIdx = direction === 'UP' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= sorted.length) return prev;

      const tempQueue = sorted[idx].queueNumber;
      sorted[idx] = { ...sorted[idx], queueNumber: sorted[swapIdx].queueNumber };
      sorted[swapIdx] = { ...sorted[swapIdx], queueNumber: tempQueue };

      return sorted.sort((a, b) => a.queueNumber - b.queueNumber);
    });
  };

  const updateCuttingLoadingAllocation = (
    cuttingOrderId: string,
    allocationId: string,
    updates: Partial<CuttingLoadingAllocation>
  ) => {
    setCuttingOrders(prev => prev.map(order => {
      if (order.id !== cuttingOrderId) return order;
      const updatedAllocations = order.loadingAllocations.map(alloc => {
        if (alloc.id !== allocationId) return alloc;
        const nextAlloc = { ...alloc, ...updates };
        if (updates.loadedActualPcs !== undefined && updates.loadingStatus === undefined) {
          if (nextAlloc.loadedActualPcs >= nextAlloc.allocatedLoadingPcs) {
            nextAlloc.loadingStatus = 'Loaded';
          } else if (nextAlloc.loadedActualPcs > 0) {
            nextAlloc.loadingStatus = 'Partial Loaded';
          } else {
            nextAlloc.loadingStatus = order.actualCutPcs > 0 ? 'Ready to Load' : 'Waiting Cut';
          }
        }
        return nextAlloc;
      });

      const allLoaded = updatedAllocations.length > 0 && updatedAllocations.every(a => a.loadingStatus === 'Loaded');
      return {
        ...order,
        loadingAllocations: updatedAllocations,
        queueStatus: allLoaded ? 'LOADED' : order.queueStatus
      };
    }));
  };

  const updateSubconTask = (id: string, updates: Partial<SubcontractorTask>) => {
    setSubconTasks(prev => prev.map(task => {
      if (task.id === id) {
        const updated = { ...task, ...updates };
        if (updated.quantityReceived >= updated.quantitySend) {
          updated.status = 'Completed';
          if (!updated.actualReturnDate) {
            updated.actualReturnDate = new Date().toISOString().split('T')[0];
          }
        } else if (updated.quantityReceived > 0) {
          updated.status = 'Partial Received';
        }
        return updated;
      }
      return task;
    }));
  };

  const addSubconTask = (
    task: Omit<SubcontractorTask, 'id'>,
    accountOptions?: {
      createDedicatedAccount: boolean;
      username?: string;
      password?: string;
    }
  ): { taskId: string; credentials?: { username: string; password: string } } => {
    const taskId = `SUB-${Date.now().toString().slice(-4)}`;
    let subconAccountId = task.subconAccountId;
    let subconUsername = task.subconUsername;
    let subconPassword = task.subconPassword;
    let createdCreds: { username: string; password: string } | undefined;

    if (accountOptions?.createDedicatedAccount) {
      const cleanUser = (accountOptions.username || `subkon_${task.subconName.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').slice(0, 14)}`)
        .trim()
        .toLowerCase();
      const cleanPass = (accountOptions.password || 'subcon123').trim();

      const existingAcc = users.find(u => u.username.toLowerCase() === cleanUser);
      if (existingAcc) {
        subconAccountId = existingAcc.id;
        subconUsername = existingAcc.username;
        subconPassword = existingAcc.password || cleanPass;
        createdCreds = { username: existingAcc.username, password: subconPassword };
      } else {
        const newAccId = `usr-sub-${Date.now().toString().slice(-5)}`;
        const newSubconUser: UserAccount = {
          id: newAccId,
          username: cleanUser,
          password: cleanPass,
          name: task.subconName,
          role: 'SUBCON',
          department: `Mitra Subkon (${task.type})`,
          email: `${cleanUser}@mitrasubkon.id`,
          allowedTabs: ['subcon']
        };
        setUsers(prev => [...prev, newSubconUser]);
        subconAccountId = newAccId;
        subconUsername = cleanUser;
        subconPassword = cleanPass;
        createdCreds = { username: cleanUser, password: cleanPass };
      }
    }

    const newTask: SubcontractorTask = {
      ...task,
      id: taskId,
      subconAccountId,
      subconUsername,
      subconPassword,
      dailyLogs: task.dailyLogs || []
    };
    setSubconTasks(prev => [newTask, ...prev]);

    return { taskId, credentials: createdCreds };
  };

  const addSubconDailyLog = (
    taskId: string,
    log: Omit<SubconDailyLog, 'id' | 'updatedAt'>
  ): { success: boolean; message: string } => {
    const targetTask = subconTasks.find(t => t.id === taskId);
    if (!targetTask) {
      return { success: false, message: 'Data SPK Subkon tidak ditemukan!' };
    }

    const now = new Date();
    const updatedAt = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`;

    setSubconTasks(prev => prev.map(task => {
      if (task.id !== taskId) return task;

      const existingLogs = task.dailyLogs || [];
      const newLog: SubconDailyLog = {
        ...log,
        id: `LOG-${Date.now().toString().slice(-5)}`,
        updatedAt
      };
      // Selalu simpan riwayat lama tanpa menimpa log sebelumnya
      const updatedLogs: SubconDailyLog[] = [...existingLogs, newLog].sort((a, b) => a.date.localeCompare(b.date));

      const totalCompletedFromLogs = updatedLogs.reduce((sum, l) => sum + l.actualOutputPcs, 0);
      const totalDefectsFromLogs = updatedLogs.reduce((sum, l) => sum + l.rejectPcs, 0);
      const newQuantityReceived = Math.min(task.quantitySend, Math.max(task.quantityReceived, totalCompletedFromLogs));
      const newDefectPcs = Math.max(task.defectPcs, totalDefectsFromLogs);

      let newStatus = task.status;
      if (newQuantityReceived >= task.quantitySend) {
        newStatus = 'Completed';
      } else if (newQuantityReceived > 0) {
        newStatus = 'Partial Received';
      }

      const newDelayNotes = log.hasIssue && log.issueNotes
        ? `[Laporan Harian Subkon ${log.date} - ${log.issueCategory}]: ${log.issueNotes}`
        : task.delayNotes;

      return {
        ...task,
        dailyLogs: updatedLogs,
        quantityReceived: newQuantityReceived,
        defectPcs: newDefectPcs,
        status: newStatus,
        delayNotes: newDelayNotes
      };
    }));

    return {
      success: true,
      message: `Data capaian harian tanggal ${log.date} (${log.actualOutputPcs} Pcs) berhasil disimpan untuk analisis!`
    };
  };

  const deleteSubconDailyLog = (taskId: string, logId: string) => {
    setSubconTasks(prev => prev.map(task => {
      if (task.id !== taskId) return task;
      const updatedLogs = (task.dailyLogs || []).filter(l => l.id !== logId);
      const totalCompletedFromLogs = updatedLogs.reduce((sum, l) => sum + l.actualOutputPcs, 0);
      return {
        ...task,
        dailyLogs: updatedLogs,
        quantityReceived: totalCompletedFromLogs
      };
    }));
  };

  // Google Script Sync Handler
  const syncToGoogleScript = async (): Promise<{ success: boolean; message: string }> => {
    if (!gasUrl || !gasUrl.trim()) {
      return { 
        success: false, 
        message: 'URL Web App Google Apps Script belum diisi! Silakan masukkan URL di menu Sinkronisasi.' 
      };
    }

    const payload = {
      source: 'PT Teratai Widjaja Garment Management',
      syncedAt: new Date().toISOString(),
      activeStyle: currentStyle,
      stylesSummary: styles.map(s => ({
        code: s.code,
        name: s.name,
        buyer: s.buyer,
        targetPcs: s.targetQuantityPcs,
        delivery: s.deliveryDate,
        status: s.status,
        totalBudget: s.allocatedBudget,
        usedBudget: s.usedBudget
      })),
      stockCount: stock.length,
      stockItems: stock,
      transactions: transactions,
      sopSteps: currentStyle.steps.map(st => ({
        id: st.id,
        process: st.process,
        dept: st.picDept,
        scheduled: st.dateScheduled,
        actualDate: st.actualDate || '-',
        status: st.status,
        outputDescription: st.outputDescription || '-',
        picName: st.picName || '-',
        notes: st.machineBreakdownNotes || st.notes || '-'
      })),
      cashFlowSummary: cashFlow,
      componentAllocations: componentAllocations,
      productionMaterials: productionMaterials,
      subconTasks: subconTasks
    };

    try {
      // POST to Google Apps Script Web App
      await fetch(gasUrl, {
        method: 'POST',
        mode: 'no-cors', // Standard for Google Apps Script Web Apps to bypass redirect CORS limits
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const nowStr = new Date().toLocaleString('id-ID');
      setLastSyncedGas(nowStr);
      localStorage.setItem('pt_tw_last_gas_sync', nowStr);

      return {
        success: true,
        message: `Data berhasil diselaraskan dengan Google Script pada ${nowStr}. Google Sheet Anda telah diperbarui.`
      };
    } catch (error: any) {
      console.error('Google Script sync error:', error);
      return {
        success: false,
        message: `Gagal menyelaraskan ke Google Script: ${error.message || 'Koneksi terganggu'}`
      };
    }
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        currentUser,
        setCurrentUser,
        users,
        updateUserName,
        updateUserPermissions,
        updateUserPassword,
        addNewUser,
        deleteUser,
        isTabAllowed,
        isLoginModalOpen,
        setIsLoginModalOpen,
        isNewStyleModalOpen,
        setIsNewStyleModalOpen,
        isUserAccessModalOpen,
        setIsUserAccessModalOpen,
        isGoogleScriptModalOpen,
        setIsGoogleScriptModalOpen,
        isIssueStockModalOpen,
        setIsIssueStockModalOpen,
        styles,
        selectedStyleId,
        setSelectedStyleId,
        currentStyle,
        addNewStyle,
        deleteStyle,
        stock,
        addStockItem,
        updateStockQuantity,
        transactions,
        issueStock,
        requisitionCart,
        addToRequisitionCart,
        removeFromRequisitionCart,
        updateCartItemQuantity,
        clearRequisitionCart,
        submitRequisitionCart,
        lastSubmittedRequisition,
        setLastSubmittedRequisition,
        updateWorkflowStep,
        updateStepActualDate,
        componentAllocations,
        addComponentAllocation,
        updateComponentAllocation,
        deleteComponentAllocation,
        productionMaterials,
        addProductionMaterial,
        updateProductionMaterial,
        deleteProductionMaterial,
        cuttingOrders,
        addCuttingOrder,
        updateCuttingOrder,
        deleteCuttingOrder,
        moveCuttingQueue,
        updateCuttingLoadingAllocation,
        sopAttentionStyles,
        cashFlow,
        addCashFlowRecord,
        approveCashFlow,
        rejectCashFlow,
        subconTasks,
        updateSubconTask,
        addSubconTask,
        addSubconDailyLog,
        deleteSubconDailyLog,
        subconWarnings,
        lowStockItems,
        pendingCashFlowCount,
        activeTab,
        setActiveTab,
        companyLogo,
        setCompanyLogo,
        isPrintModalOpen,
        setIsPrintModalOpen,
        activePrintBar,
        openPrintModal,
        gasUrl,
        setGasUrl,
        lastSyncedGas,
        syncToGoogleScript
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
