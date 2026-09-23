import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UserAccount, 
  UserRole, 
  StockItem, 
  StockTransaction, 
  ProductionStyle, 
  CashFlowRecord, 
  SubcontractorTask,
  SOPWorkflowStep,
  ProductionComponentAllocation,
  ProductionMaterialRequirement
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
  INITIAL_PPIC_MATERIALS
} from '../data/initialData';

interface AppContextType {
  // Authentication
  isAuthenticated: boolean;
  login: (username: string) => { success: boolean; message: string };
  logout: () => void;
  currentUser: UserAccount;
  setCurrentUser: (user: UserAccount) => void;
  users: UserAccount[];

  // PE User Management
  updateUserName: (userId: string, newName: string) => void;
  updateUserPermissions: (userId: string, allowedTabs: string[]) => void;
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
  }) => void;

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

  // Cash Flow & Fund Check (Retained for backwards compatibility)
  cashFlow: CashFlowRecord[];
  addCashFlowRecord: (record: Omit<CashFlowRecord, 'id' | 'status'>) => void;
  approveCashFlow: (id: string, approverName: string) => void;
  rejectCashFlow: (id: string, notes?: string) => void;

  // Subcontractor
  subconTasks: SubcontractorTask[];
  updateSubconTask: (id: string, updates: Partial<SubcontractorTask>) => void;
  addSubconTask: (task: Omit<SubcontractorTask, 'id'>) => void;

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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const savedAuth = localStorage.getItem('pt_tw_auth');
    return savedAuth === 'true';
  });

  // Users state with PE customization persistence
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('pt_tw_users_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<UserAccount>(() => {
    const savedUser = localStorage.getItem('pt_tw_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        const match = users.find(u => u.id === parsed.id);
        if (match) return match;
      } catch (e) {
        console.error(e);
      }
    }
    return users[0]; // Default to PE
  });

  const [styles, setStyles] = useState<ProductionStyle[]>(() => {
    const saved = localStorage.getItem('pt_tw_styles');
    return saved ? JSON.parse(saved) : INITIAL_STYLES;
  });

  const [selectedStyleId, setSelectedStyleId] = useState<string>(() => {
    return INITIAL_STYLES[0]?.id || '';
  });

  const [stock, setStock] = useState<StockItem[]>(() => {
    const saved = localStorage.getItem('pt_tw_stock');
    return saved ? JSON.parse(saved) : INITIAL_STOCK;
  });

  const [transactions, setTransactions] = useState<StockTransaction[]>(() => {
    const saved = localStorage.getItem('pt_tw_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [cashFlow, setCashFlow] = useState<CashFlowRecord[]>(() => {
    const saved = localStorage.getItem('pt_tw_cashflow');
    return saved ? JSON.parse(saved) : INITIAL_CASH_FLOW;
  });

  const [subconTasks, setSubconTasks] = useState<SubcontractorTask[]>(() => {
    const saved = localStorage.getItem('pt_tw_subcon');
    return saved ? JSON.parse(saved) : INITIAL_SUBCON_TASKS;
  });

  // PPIC Component Allocations state
  const [componentAllocations, setComponentAllocations] = useState<ProductionComponentAllocation[]>(() => {
    const saved = localStorage.getItem('pt_tw_ppic_components');
    return saved ? JSON.parse(saved) : INITIAL_PPIC_COMPONENTS;
  });

  // PPIC Material Requirements state
  const [productionMaterials, setProductionMaterials] = useState<ProductionMaterialRequirement[]>(() => {
    const saved = localStorage.getItem('pt_tw_ppic_materials');
    return saved ? JSON.parse(saved) : INITIAL_PPIC_MATERIALS;
  });

  const [activeTab, setActiveTab] = useState<string>('pe-workflow');

  // Modals state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isNewStyleModalOpen, setIsNewStyleModalOpen] = useState<boolean>(false);
  const [isUserAccessModalOpen, setIsUserAccessModalOpen] = useState<boolean>(false);
  const [isGoogleScriptModalOpen, setIsGoogleScriptModalOpen] = useState<boolean>(false);
  const [isIssueStockModalOpen, setIsIssueStockModalOpen] = useState<boolean>(false);

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
    localStorage.setItem('pt_tw_auth', isAuthenticated ? 'true' : 'false');
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('pt_tw_users_v2', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('pt_tw_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('pt_tw_styles', JSON.stringify(styles));
  }, [styles]);

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
    localStorage.setItem('pt_tw_subcon', JSON.stringify(subconTasks));
  }, [subconTasks]);

  useEffect(() => {
    localStorage.setItem('pt_tw_ppic_components', JSON.stringify(componentAllocations));
  }, [componentAllocations]);

  useEffect(() => {
    localStorage.setItem('pt_tw_ppic_materials', JSON.stringify(productionMaterials));
  }, [productionMaterials]);

  useEffect(() => {
    localStorage.setItem('pt_tw_gas_url', gasUrl);
  }, [gasUrl]);

  const currentStyle = styles.find(s => s.id === selectedStyleId) || styles[0] || INITIAL_STYLES[0];

  // Auto detect low stock
  const lowStockItems = stock.filter(item => item.currentStock <= item.minStockLevel);

  // Auto count pending funds to check
  const pendingCashFlowCount = cashFlow.filter(cf => cf.status === 'Pending Check').length;

  // Login handler (no password required on initial login)
  const login = (username: string) => {
    const cleanUsername = username.trim().toLowerCase();
    const found = users.find(
      u => u.username.toLowerCase() === cleanUsername
    );

    if (!found) {
      return { success: false, message: 'Username tidak terdaftar dalam sistem!' };
    }

    setCurrentUser(found);
    setIsAuthenticated(true);
    // Ensure activeTab is one of allowed tabs
    if (!found.allowedTabs.includes(activeTab) && found.role !== 'PE') {
      setActiveTab(found.allowedTabs[0] || 'pe-workflow');
    }

    return { success: true, message: `Selamat datang kembali, ${found.name} (${found.role})!` };
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  // Check tab permissions (Akses & Akun tab is accessible to all logged-in users; PE has full admin control)
  const isTabAllowed = (tabId: string): boolean => {
    if (tabId === 'user-access') {
      return true; // All authenticated users can open Akses & Akun
    }
    if (currentUser.role === 'PE') return true; // PE has full administrative access
    return currentUser.allowedTabs.includes(tabId);
  };

  // PE User Management: Rename user (Strictly PE Only)
  const updateUserName = (userId: string, newName: string) => {
    if (currentUser.role !== 'PE') {
      alert('Akses Ditolak: Hanya Production Engineer (PE) yang memiliki otoritas mengubah nama pengguna!');
      return;
    }
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, name: newName };
      }
      return u;
    }));

    if (currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, name: newName }));
    }
  };

  // PE User Management: Update allowed navigation bars/tabs (Strictly PE Only)
  const updateUserPermissions = (userId: string, allowedTabs: string[]) => {
    if (currentUser.role !== 'PE') {
      alert('Akses Ditolak: Hanya Production Engineer (PE) yang memiliki otoritas mengatur hak akses menu bar!');
      return;
    }
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, allowedTabs };
      }
      return u;
    }));

    if (currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, allowedTabs }));
    }
  };

  // PE User Management: Change / Reset Password for other accounts (Strictly PE Only)
  const updateUserPassword = (userId: string, newPass: string): { success: boolean; message: string } => {
    if (currentUser.role !== 'PE') {
      return { 
        success: false, 
        message: 'Akses Ditolak: Hanya Production Engineer (PE) yang berhak mengganti password untuk akun lain!' 
      };
    }

    const cleanPass = newPass.trim();
    if (!cleanPass) {
      return { success: false, message: 'Password baru tidak boleh kosong!' };
    }

    if (cleanPass.length < 4) {
      return { success: false, message: 'Password minimal terdiri dari 4 karakter!' };
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

    return { 
      success: true, 
      message: `Password untuk akun "${target.name}" (${target.username}) berhasil diperbarui menjadi "${cleanPass}"!` 
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

    const cleanUsername = params.username.trim().toLowerCase();
    if (!cleanUsername) {
      return { success: false, message: 'Username wajib diisi!' };
    }

    const cleanName = params.name.trim();
    if (!cleanName) {
      return { success: false, message: 'Nama lengkap pengguna wajib diisi!' };
    }

    const isDuplicate = users.some(u => u.username.toLowerCase() === cleanUsername);
    if (isDuplicate) {
      return { success: false, message: `Username "${params.username}" sudah dipakai oleh akun lain. Gunakan username berbeda!` };
    }

    const assignedPassword = params.password?.trim() || `${cleanUsername}123`;

    const newUser: UserAccount = {
      id: `user-${Date.now()}`,
      username: cleanUsername,
      password: assignedPassword,
      name: cleanName,
      role: params.role,
      department: params.department.trim() || 'Operasional Garment',
      email: params.email?.trim() || `${cleanUsername}@terataiwidjaja.co.id`,
      allowedTabs: params.allowedTabs && params.allowedTabs.length > 0 
        ? params.allowedTabs 
        : ['pe-workflow']
    };

    setUsers(prev => [...prev, newUser]);
    return { 
      success: true, 
      message: `Akun "${newUser.name}" (${newUser.username}) dengan password "${assignedPassword}" berhasil ditambahkan ke sistem!` 
    };
  };

  // PE User Management: Delete user account
  const deleteUser = (userId: string): { success: boolean; message: string } => {
    if (currentUser.role !== 'PE') {
      return { success: false, message: 'Hanya Production Engineer (Admin PE) yang berhak menghapus akun!' };
    }

    if (userId === 'user-pe-01' || userId === currentUser.id) {
      return { success: false, message: 'Akun Super Admin PE utama / akun yang sedang aktif tidak dapat dihapus!' };
    }

    const target = users.find(u => u.id === userId);
    setUsers(prev => prev.filter(u => u.id !== userId));
    return { success: true, message: `Akun ${target?.name || ''} telah dihapus dari sistem!` };
  };

  // Add new Production Model / Style
  const addNewStyle = (params: {
    code: string;
    name: string;
    buyer: string;
    targetQuantityPcs: number;
    startDate: string;
    deliveryDate: string;
    allocatedBudget?: number;
    dailyTargetPcs?: number;
  }) => {
    const newId = `style-${Date.now()}`;
    
    // Generate scheduled steps adapted to the new style's start and delivery dates
    const startMs = new Date(params.startDate).getTime();
    const endMs = new Date(params.deliveryDate).getTime();
    const duration = Math.max(1, endMs - startMs);
    const stepInterval = duration / 14;

    const generatedSteps: SOPWorkflowStep[] = STANDARD_SOP_STEPS.map((stdStep, index) => {
      const stepDate = new Date(startMs + stepInterval * index).toISOString().split('T')[0];
      return {
        ...stdStep,
        id: index + 1,
        status: index === 0 ? 'In Progress' : 'Pending',
        dateScheduled: stepDate,
        actualDate: '',
        dateCompleted: undefined
      };
    });

    const newStyle: ProductionStyle = {
      id: newId,
      code: params.code.trim().toUpperCase(),
      name: params.name.trim(),
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
      allocatedBudget: params.allocatedBudget || 120000000,
      usedBudget: 0
    };

    setStyles(prev => [newStyle, ...prev]);
    setSelectedStyleId(newId);
  };

  const addStockItem = (item: Omit<StockItem, 'id' | 'lastUpdated'>) => {
    const now = new Date();
    const timestamp = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`;
    const newItem: StockItem = {
      ...item,
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
  };

  // Issuing material / stock taking with style check
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

    if (targetItem.currentStock < params.quantity) {
      return { 
        success: false, 
        message: `Stok tidak mencukupi! Tersedia: ${targetItem.currentStock} ${targetItem.unit}, diminta: ${params.quantity} ${targetItem.unit}`, 
        isCrossStyle: false 
      };
    }

    const isCrossStyle = targetItem.styleCode !== params.styleTarget;
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
      isCrossStyle,
      quantity: params.quantity,
      unit: targetItem.unit,
      destinationDept: params.destinationDept,
      picReceiver: params.picReceiver,
      picGudang: currentUser.name,
      verifiedByPE: currentUser.role === 'PE' ? currentUser.name : undefined,
      referenceDoc: params.referenceDoc,
      reason: params.reason,
      notes: isCrossStyle 
        ? `[PERINGATAN CROSS-STYLE]: Barang dialokasikan untuk ${targetItem.styleCode} namun diambil untuk ${params.styleTarget}. ${params.notes || ''}`
        : params.notes
    };

    setTransactions(prev => [newTx, ...prev]);

    return { 
      success: true, 
      message: isCrossStyle 
        ? `Berhasil dikeluarkan dengan PERINGATAN: Barang diambil di luar style asli (${targetItem.styleCode} -> ${params.styleTarget})!`
        : `Berhasil mengeluarkan ${params.quantity} ${targetItem.unit} untuk ${params.styleTarget}.`, 
      isCrossStyle 
    };
  };

  const updateWorkflowStep = (styleId: string, stepId: number, updates: Partial<SOPWorkflowStep>) => {
    setStyles(prev => prev.map(sty => {
      if (sty.id === styleId) {
        const updatedSteps = sty.steps.map(step => {
          if (step.id === stepId) {
            return {
              ...step,
              ...updates,
              dateCompleted: updates.status === 'Completed' ? (updates.dateCompleted || new Date().toISOString().split('T')[0]) : step.dateCompleted
            };
          }
          return step;
        });

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

  // Specifically update Actual Date for SOP Step
  const updateStepActualDate = (styleId: string, stepId: number, actualDate: string) => {
    setStyles(prev => prev.map(sty => {
      if (sty.id === styleId) {
        const updatedSteps = sty.steps.map(step => {
          if (step.id === stepId) {
            const hasDate = Boolean(actualDate && actualDate.trim());
            return {
              ...step,
              actualDate,
              status: hasDate && step.status === 'Pending' ? 'In Progress' : step.status
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

  const addSubconTask = (task: Omit<SubcontractorTask, 'id'>) => {
    const newTask: SubcontractorTask = {
      ...task,
      id: `SUB-${Date.now().toString().slice(-4)}`
    };
    setSubconTasks(prev => [newTask, ...prev]);
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
        totalBudget: s.totalBudget,
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
        stock,
        addStockItem,
        updateStockQuantity,
        transactions,
        issueStock,
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
        cashFlow,
        addCashFlowRecord,
        approveCashFlow,
        rejectCashFlow,
        subconTasks,
        updateSubconTask,
        addSubconTask,
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
