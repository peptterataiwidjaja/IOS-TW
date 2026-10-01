export type UserRole = 'PE' | 'WAREHOUSE' | 'FACTORY_MANAGER' | 'PPIC' | 'PRODUCTION' | 'SUBCON';

export interface UserAccount {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: UserRole;
  department: string;
  email: string;
  allowedTabs: string[]; // Tab-tab bar yang diizinkan untuk diakses akun ini
}

export interface NavTabPermission {
  id: string;
  label: string;
  description: string;
}

export type MaterialCategory = 
  | 'Kain Utama (Fabric)' 
  | 'Kain Furing (Lining)' 
  | 'Benang Jahit' 
  | 'Kancing (Buttons)' 
  | 'Resleting (Zipper)' 
  | 'Interlining / Viselin' 
  | 'Aksesoris & Hangtag' 
  | 'Polybag & Karton';

export interface StockItem {
  id: string;
  code: string;
  name: string;
  category: MaterialCategory;
  styleCode: string; // Style grouping
  styleName: string;
  currentStock: number;
  minStockLevel: number;
  unit: 'Yard' | 'Meter' | 'Roll' | 'Cones' | 'Gross' | 'Pcs' | 'Kg' | 'Set';
  rackLocation: string;
  unitPrice: number;
  supplier: string;
  lastUpdated: string;
  notes?: string;
}

export type TransactionType = 'IN' | 'OUT' | 'RETURN' | 'ADJUSTMENT';

export interface StockTransaction {
  id: string;
  timestamp: string;
  type: TransactionType;
  stockItemId: string;
  itemCode: string;
  itemName: string;
  styleTarget: string; // Style destination
  allocatedStyleOfItem: string; // Original style assigned to item
  isCrossStyle: boolean; // Flag if taking outside allocated style
  quantity: number;
  unit: string;
  destinationDept: 'Cutting' | 'Sewing' | 'Subkon' | 'Sample / PPS' | 'Finishing' | 'Gudang Lain';
  picReceiver: string; // Siapa yang mengambil tanggung jawab
  picGudang: string; // PIC Gudang yang menyerahkan
  verifiedByPE?: string;
  referenceDoc: string; // PO / SPK / SJ Number
  reason?: string;
  notes?: string;
}

export interface RequisitionCartItem {
  id: string;
  stockItemId: string;
  itemCode: string;
  itemName: string;
  category: MaterialCategory;
  styleCode: string;
  styleName: string;
  currentStock: number;
  quantityToIssue: number;
  unit: StockItem['unit'];
  rackLocation: string;
  unitPrice: number;
  notes?: string;
}

export interface SubmittedRequisitionReceipt {
  referenceDoc: string;
  timestamp: string;
  styleCode: string;
  styleName: string;
  destinationDept: StockTransaction['destinationDept'];
  picReceiver: string;
  picGudang: string;
  verifiedByPE?: string;
  reason: string;
  notes?: string;
  items: Array<{
    itemCode: string;
    itemName: string;
    category: MaterialCategory;
    quantity: number;
    unit: string;
    rackLocation: string;
  }>;
}

export interface SOPWorkflowStep {
  id: number;
  process: string;
  picDept: string;
  assignedRole: UserRole;
  status: 'Completed' | 'In Progress' | 'Pending' | 'Needs Review';
  dateScheduled: string;
  actualDate?: string; // Tanggal aktual pelaksanaan SOP
  dateCompleted?: string;
  outputDescription: string;
  notes?: string;
  machineBreakdownNotes?: string;
  picName: string;
}

export type ProductionRoute = 'LINE' | 'SUBCON';

export interface ProductionComponentAllocation {
  id: string;
  styleCode: string;
  componentName: string; // Misal: "Body Depan & Belakang", "Lengan Kiri & Kanan", "Kerah / Collar", "Manset (Cuff)", "Saku Depan (Pocket)", "Bordir Dada & Logo", "Lining / Furing Dalam"
  panelCategory: 'Panel Utama (Main Body)' | 'Panel Sekunder (Lengan/Saku)' | 'Kerah & Manset' | 'Aplikasi Bordir / Sablon' | 'Furing & Lapisan';
  qtyPerPcs: number; // Jumlah komponen panel per 1 pcs garmen
  totalRequiredQty: number; // targetQuantityPcs * qtyPerPcs
  route: ProductionRoute; // 'LINE' (Line Internal In-House) ATAU 'SUBCON' (Mitra Subkon)
  targetLocation: string; // Misal: "Line 1 Sewing (In-House)", "Line 2 Sewing", "CV Bordir Indah Subkon", "PT Sinar Sablon"
  processDescription: string; // Misal: "Pola & Sewing Assembly", "Bordir Komputer 6 Warna", "Sablon Plastisol", "Finishing Kerah"
  status: 'Draft' | 'Allocated' | 'In Progress' | 'Completed';
  targetDate?: string;
  picName: string;
  notes?: string;
}

export interface ProductionMaterialRequirement {
  id: string;
  styleCode: string;
  materialName: string; // Misal: "Kain Parasut Taslan Milky", "Benang Astra 40/2", "Resleting YKK #5", "Kancing Poliester"
  category: MaterialCategory;
  usedForComponent?: string; // Misal: "Body Depan & Belakang", "Lengan & Kerah", "Flap Saku", "Seluruh Pakaian"
  consumptionPerPcs: number; // Standar konsumsi per 1 pcs garmen
  wasteAllowancePercent?: number; // Persentase toleransi waste / susut cutting & sewing (e.g. 3%)
  unit: 'Yard' | 'Meter' | 'Roll' | 'Cones' | 'Gross' | 'Pcs' | 'Kg' | 'Set';
  totalRequired: number; // Target Order * consumptionPerPcs * (1 + waste%)
  availableStock?: number; // Stok fisik aktual di gudang
  allocatedFromWarehouseQty: number; // Kuantitas yang telah disiapkan / di-booking dari stok
  balanceQty?: number; // Selisih stok vs kebutuhan (availableStock - totalRequired)
  status?: 'Ready' | 'Partial' | 'Shortage' | 'Available';
  allocatedTo: 'LINE' | 'SUBCON' | 'BOTH'; // Kemana bahan dialokasikan
  targetWorkCenter: string; // Misal: "Ruang Potong & Line 1 Sewing" atau "Mitra Subkon Bordir"
  stockItemId?: string; // Tautan ke katalog stok gudang jika ada
  unitPrice?: number; // Estimasi harga satuan material
  notes?: string;
}

export interface ProductionStyle {
  id: string;
  code: string;
  name: string;
  buyer: string;
  targetQuantityPcs: number;
  startDate: string;
  deliveryDate: string;
  status: 'Preparation' | 'Sample / PPS' | 'Cutting' | 'Sewing' | 'Subkon' | 'Finishing' | 'Completed';
  currentWorkflowStep: number;
  steps: SOPWorkflowStep[];
  cuttingProgressPcs: number;
  sewingProgressPcs: number;
  qcPassedPcs: number;
  primaryRoute?: 'LINE' | 'SUBCON' | 'HYBRID';
  allocatedBudget?: number;
  usedBudget?: number;
}

export type CashFlowType = 'INCOME' | 'EXPENSE';
export type CashFlowCategory = 
  | 'Material Purchase (Bahan Baku)' 
  | 'Subcontractor Fee (Jasa Subkon)' 
  | 'Machine Sparepart & Maintenance' 
  | 'Overtime & Wages (Lembur Produksi)' 
  | 'Logistics & Delivery' 
  | 'Sample & PPS Development' 
  | 'PO Advance / Payment (Pemasukan)';

export interface CashFlowRecord {
  id: string;
  date: string;
  type: CashFlowType;
  category: CashFlowCategory;
  styleCode: string;
  amount: number;
  description: string;
  requestedBy: string;
  picResponsibility: string; // Penanggung jawab pencairan/penggunaan dana
  status: 'Approved' | 'Pending Check' | 'Rejected';
  approvedByFM?: string;
  verifiedByPE?: string;
  paymentMethod: 'Bank Transfer' | 'Kas Operasional (Petty Cash)' | 'Giro';
  invoiceRef?: string;
}

export type SubconDiscrepancyType = 
  | 'Kuantitas Kurang (Shortage)'
  | 'Cacat Fisik / Reject (Bordir/Sablon/Jahit Rusak)'
  | 'Kain Bernoda Oli / Rusak Mesin Subkon'
  | 'Salah Posisi / Spesifikasi Terbalik'
  | 'Keterlambatan Fatal (Melebihi Target Delivery)'
  | 'Lainnya / Catatan Khusus';

export type SubconDiscrepancyAction =
  | 'RETUR_REWORK'        // Retur untuk Perbaikan Ulang ke Subkon
  | 'KLAIM_POTONG_BIAYA'  // Klaim Ganti Rugi / Potong Tagihan Subkon
  | 'TERIMA_TOLERANSI'    // Diterima Bersyarat (Toleransi Grade B / Diskon)
  | 'AFKIR_REPLACE'       // Afkir Total - Subkon Wajib Ganti Potongan Bahan Baru
  | 'SESUAI_QC';          // Sesuai Spesifikasi (Tidak Ada Masalah)

export type SubconIssueCategory =
  | 'Normal / Lancar'
  | 'Mesin Bermasalah / Breakdown'
  | 'Bahan Baku / Panel Kurang'
  | 'Operator Absen / Kurang Tenaga'
  | 'Masalah Kualitas (Reject Tinggi)'
  | 'Listrik / Utilitas Terkendala'
  | 'Lainnya';

export interface SubconDailyLog {
  id: string;
  date: string; // YYYY-MM-DD
  targetPcs: number; // Target output harian
  actualOutputPcs: number; // Capaian bagus/OK hari ini
  rejectPcs: number; // Jumlah reject/cacat hari ini
  workersCount?: number; // Jumlah operator/mesin aktif
  hasIssue: boolean; // Apakah ada kendala/masalah produksi?
  issueCategory?: SubconIssueCategory;
  issueNotes?: string; // Catatan kendala harian dari subkon
  inputBy: string; // Nama PIC / Akun Subkon yang menginput
  updatedAt: string;
}

export interface SubconEarlyWarning {
  taskId: string;
  subconName: string;
  styleCode: string;
  serviceType: string;
  daysUntilDeadline: number; // <= 3 berarti masuk periode H-3
  estReturnDate: string;
  quantitySend: number;
  totalCompletedPcs: number;
  remainingQty: number;
  dailyTargetPcs: number;
  avgActualDailyPcs: number;
  requiredDailyRateToFinish: number;
  projectedDelayDays: number;
  severity: 'WARNING_H3' | 'OVERDUE' | 'AT_RISK';
  reasons: string[];
  latestIssue?: {
    date: string;
    category: string;
    notes: string;
  };
}

export interface SubcontractorTask {
  id: string;
  subconName: string;
  type: 'Bordir Komputer' | 'Sablon / Screen Printing' | 'Washing Garment' | 'Jahit Subkon Line 2';
  styleCode: string;
  quantitySend: number;
  quantityReceived: number;
  unit: string;
  sendDate: string;
  estReturnDate: string;
  actualReturnDate?: string;
  status: 'In Progress' | 'Partial Received' | 'Completed' | 'Delayed';
  picSubcon: string;
  picInternal: string;
  ratePerPcs: number;
  totalCost: number;
  defectPcs: number;
  // Target Harian, Akun Khusus Subkon & Log Input Harian
  dailyTargetPcs?: number;
  subconAccountId?: string;
  subconUsername?: string;
  subconPassword?: string;
  dailyLogs?: SubconDailyLog[];
  // Catatan Keterlambatan & Ketidaksesuaian Barang
  delayNotes?: string;
  hasDiscrepancy?: boolean;
  discrepancyType?: SubconDiscrepancyType;
  discrepancyAction?: SubconDiscrepancyAction;
  discrepancyNotes?: string;
  discrepancyQty?: number;
  picQC?: string;
}

export type CuttingQueueStatus =
  | 'ACTIVE_CUTTING'     // Sedang Dipotong Hari Ini
  | 'WAITING_LIST'       // Antrian Waiting List
  | 'READY_FOR_LOADING'  // Selesai Potong - Siap Loading ke Line/Subkon
  | 'LOADED'             // Sudah Di-loading ke Line/Subkon
  | 'HOLD_SOP';          // Ditahan Sementara - SOP Belum Sesuai

export interface CuttingLoadingAllocation {
  id: string;
  destinationType: 'LINE' | 'SUBCON';
  destinationName: string; // Misal: "Line 1 Sewing (In-House)", "Line 2 Sewing", "CV Prima Bordir Mandiri (Subkon)"
  componentPanel: string; // Misal: "Body Utama, Lengan & Kerah", "Panel Dada Kiri (Bordir)"
  dailyTargetRequirementPcs: number; // Kebutuhan target harian Line / Subkon (Pcs/Hari)
  allocatedLoadingPcs: number; // Kuantitas potongan yang dialokasikan untuk di-load
  loadedActualPcs: number; // Kuantitas aktual yang sudah di-load ke Line / Subkon
  loadingStatus: 'Waiting Cut' | 'Ready to Load' | 'Partial Loaded' | 'Loaded';
  picReceiver: string; // SPV Line / PIC Subkon penerima loading
  notes?: string;
}

export interface CuttingOrderItem {
  id: string;
  orderNumber: string; // Nomor SPK Potong, misal: "SPK-CUT/TW/09/001"
  cuttingDate: string; // Tanggal Perintah Potong (YYYY-MM-DD)
  queueNumber: number; // Nomor urut sistem antrian waiting list
  queueStatus: CuttingQueueStatus;
  priority: 'URGENT' | 'HIGH' | 'NORMAL';
  cuttingTable: string; // Misal: "Meja Potong 01 (Bandknife)", "Meja Potong 02 (Straight Knife)"
  styleId: string;
  styleCode: string; // Model yang dipotong
  styleName: string;
  buyer: string;
  // Acuan SOP & Model Berjalan
  sopReferenceStepId: number; // Tahap SOP acuan (misal Step 10, 11, 12, 14)
  sopReferenceProcess: string;
  sopComplianceStatus: 'SESUAI_SOP' | 'PERHATIAN_SOP';
  sopComplianceNotes: string;
  // Bahan Baku yang Dipotong Berdasarkan SOP & BOM
  materialCode: string;
  materialName: string;
  materialCategory: MaterialCategory | string;
  fabricQtyToCut: number;
  fabricUnit: string;
  markerRatio: string; // Misal: "S:1, M:2, L:2, XL:1 (42 Ply)"
  componentPanelCut: string; // Misal: "Body Depan, Belakang, Lengan & Kerah"
  // Target Harian & Realisasi Potong
  dailyTargetCutPcs: number;
  actualCutPcs: number;
  bundleCount: number;
  // Peruntukan Loading ke Line Mana & Subkon Mana Sesuai Kebutuhan Target Harian
  loadingAllocations: CuttingLoadingAllocation[];
  picCutting: string;
  issuedByPPIC: string;
  notes?: string;
}

export interface SOPDeviationDetail {
  stepId: number;
  process: string;
  picDept: string;
  picName: string;
  status: SOPWorkflowStep['status'];
  dateScheduled: string;
  actualDate?: string;
  issueType: 'OVERDUE' | 'LATE_ACTUAL' | 'NEEDS_REVIEW' | 'BYPASSED_PREREQUISITE' | 'MACHINE_ISSUE';
  description: string;
  daysDelayed: number;
}

export interface StyleSOPAttentionItem {
  styleId: string;
  styleCode: string;
  styleName: string;
  buyer: string;
  targetQuantityPcs: number;
  deliveryDate: string;
  styleStatus: ProductionStyle['status'];
  currentWorkflowStep: number;
  completedStepsCount: number;
  totalStepsCount: number;
  sopCompletionPercent: number;
  severity: 'CRITICAL' | 'WARNING' | 'ATTENTION';
  totalDeviations: number;
  deviations: SOPDeviationDetail[];
  materialShortageCount: number;
  materialShortageNames: string[];
  impactOnCuttingAndLine: string;
  recommendedAction: string;
}

