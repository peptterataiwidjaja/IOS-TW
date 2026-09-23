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
  // Catatan Keterlambatan & Ketidaksesuaian Barang
  delayNotes?: string;
  hasDiscrepancy?: boolean;
  discrepancyType?: SubconDiscrepancyType;
  discrepancyAction?: SubconDiscrepancyAction;
  discrepancyNotes?: string;
  discrepancyQty?: number;
  picQC?: string;
}
