import { 
  UserAccount, 
  NavTabPermission,
  StockItem, 
  StockTransaction, 
  ProductionStyle, 
  SOPWorkflowStep, 
  CashFlowRecord, 
  SubcontractorTask,
  ProductionComponentAllocation,
  ProductionMaterialRequirement,
  CuttingOrderItem
} from '../types';

export const ALL_NAV_TABS: NavTabPermission[] = [
  { id: 'new-style', label: 'Input Model Baru', description: 'Registrasi model/style produksi baru, target order, jadwal delivery & inisialisasi SOP/bahan' },
  { id: 'pe-workflow', label: 'Alur SOP', description: 'Monitoring 18 tahap SOP PE, tanggal aktual, breakdown mesin' },
  { id: 'ppic-planning', label: 'PPIC & Kontrol SOP', description: 'Bar Style Perhatian Belum Sesuai SOP, alokasi komponen (Line vs Subkon) & kebutuhan bahan baku (BOM)' },
  { id: 'cutting', label: 'Cutting & Loading', description: 'Perintah potong harian per model & bahan sesuai SOP, antrian waiting list & loading ke Line/Subkon sesuai target harian' },
  { id: 'warehouse-stock', label: 'Stok Gudang', description: 'Katalog stok bahan baku, aksesoris, keranjang ambil barang & input stok' },
  { id: 'subcon', label: 'Mitra Subkon', description: 'Monitoring alur keluar-masuk subkon, portal input target harian & warning H-3' },
  { id: 'transactions', label: 'Riwayat Mutasi', description: 'Pelacakan mutasi barang & penanggung jawab PIC' },
  { id: 'spreadsheet', label: 'Spreadsheet', description: 'Tampilan tabel terpadu mirip Google Sheet / Excel (.xlsx)' },
  { id: 'analytics', label: 'Analitik', description: 'Grafik performa efisiensi produksi, gudang & subkon' },
  { id: 'user-access', label: 'Akses Akun', description: 'Khusus PE: Tambah/hapus akun, ganti nama pengguna & atur akses bar yang tersedia' }
];

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'usr-pe',
    username: 'PE',
    password: 'pe123',
    name: 'Budi Santoso, S.T. (PE)',
    role: 'PE',
    department: 'Production Engineering',
    email: 'pe.terataiwidjaja@gmail.com',
    allowedTabs: [
      'new-style',
      'pe-workflow',
      'ppic-planning',
      'cutting',
      'warehouse-stock',
      'subcon',
      'transactions',
      'spreadsheet',
      'analytics',
      'user-access'
    ]
  },
  {
    id: 'usr-wh',
    username: 'gudang_tw',
    password: 'gudang123',
    name: 'Agus Setiawan',
    role: 'WAREHOUSE',
    department: 'Gudang Bahan Baku & Aksesoris',
    email: 'warehouse.tw@terataiwidjaja.co.id',
    allowedTabs: [
      'warehouse-stock',
      'cutting',
      'transactions',
      'spreadsheet'
    ]
  },
  {
    id: 'usr-fm',
    username: 'fm_teratai',
    password: 'fm123',
    name: 'Ir. Hendra Gunawan',
    role: 'FACTORY_MANAGER',
    department: 'Plant & Factory Management',
    email: 'factory.manager@terataiwidjaja.co.id',
    allowedTabs: [
      'new-style',
      'pe-workflow',
      'warehouse-stock',
      'ppic-planning',
      'cutting',
      'subcon',
      'transactions',
      'spreadsheet',
      'analytics'
    ]
  },
  {
    id: 'usr-ppic',
    username: 'ppic_tw',
    password: 'ppic123',
    name: 'Ratna Kusuma',
    role: 'PPIC',
    department: 'PPIC & Inventory Control',
    email: 'ppic@terataiwidjaja.co.id',
    allowedTabs: [
      'new-style',
      'pe-workflow',
      'ppic-planning',
      'cutting',
      'warehouse-stock',
      'subcon',
      'transactions',
      'spreadsheet',
      'analytics'
    ]
  },
  {
    id: 'usr-prod',
    username: 'spv_produksi',
    password: 'prod123',
    name: 'Supardi (SPV Produksi)',
    role: 'PRODUCTION',
    department: 'Cutting & Sewing Floor',
    email: 'produksi.spv@terataiwidjaja.co.id',
    allowedTabs: [
      'pe-workflow',
      'ppic-planning',
      'cutting',
      'subcon',
      'transactions',
      'spreadsheet'
    ]
  },
  {
    id: 'usr-cutting',
    username: 'cutting_tw',
    password: 'cutting123',
    name: 'Dani (Leader Cutting)',
    role: 'PRODUCTION',
    department: 'Divisi Cutting & Bundling',
    email: 'cutting@terataiwidjaja.co.id',
    allowedTabs: [
      'cutting',
      'ppic-planning',
      'pe-workflow',
      'warehouse-stock',
      'transactions'
    ]
  },
  {
    id: 'usr-subcon',
    username: 'subcon_prima',
    password: 'subcon123',
    name: 'CV Prima Bordir Mandiri',
    role: 'SUBCON',
    department: 'Mitra Rekanan Subkon (Bordir)',
    email: 'subcon.prima@gmail.com',
    allowedTabs: [
      'subcon'
    ]
  },
  {
    id: 'usr-subcon-2',
    username: 'subcon_multi',
    password: 'subcon123',
    name: 'PT Multi Screen Grafika',
    role: 'SUBCON',
    department: 'Mitra Rekanan Subkon (Sablon)',
    email: 'admin@multiscreen.co.id',
    allowedTabs: [
      'subcon'
    ]
  }
];

export const STANDARD_SOP_STEPS: SOPWorkflowStep[] = [
  {
    id: 1,
    process: 'Menerima Breakdown Process dari RnD',
    picDept: 'PE',
    assignedRole: 'PE',
    status: 'Completed',
    dateScheduled: '2026-09-01',
    actualDate: '2026-09-02',
    dateCompleted: '2026-09-02',
    outputDescription: 'Breakdown process disertai dengan kebutuhan mesin',
    notes: 'Kebutuhan: 24 unit single needle, 6 unit overdeck, 2 unit kansai special.',
    machineBreakdownNotes: 'SN: 24, DN: 4, Overlock 5-thread: 8, Bartack: 2',
    picName: ''
  },
  {
    id: 2,
    process: 'Jadwal persiapan produksi',
    picDept: 'PE',
    assignedRole: 'PE',
    status: 'Completed',
    dateScheduled: '2026-09-03',
    actualDate: '2026-09-03',
    dateCompleted: '2026-09-03',
    outputDescription: 'Pendistribusian jadwal persiapan produksi kepada seluruh tim',
    notes: 'Matriks time table telah disebar ke PPIC, Gudang, Cutting, Mekanik.',
    picName: ''
  },
  {
    id: 3,
    process: 'Material dan Aksesoris PPS',
    picDept: 'PPIC',
    assignedRole: 'PPIC',
    status: 'Completed',
    dateScheduled: '2026-09-04',
    actualDate: '2026-09-05',
    dateCompleted: '2026-09-05',
    outputDescription: 'Sisa Potongan bahan diberikan kepada mekanik untuk setting mesin',
    notes: 'Kain sample TC Twill & Interlining telah disiapkan PPIC 100%.',
    picName: ''
  },
  {
    id: 4,
    process: 'Membuat PPS - Selesai',
    picDept: 'SPV Sewing',
    assignedRole: 'PRODUCTION',
    status: 'Completed',
    dateScheduled: '2026-09-06',
    actualDate: '2026-09-07',
    dateCompleted: '2026-09-07',
    outputDescription: 'Output: Catatan perbaikan terkait cutting dan pola',
    notes: 'Pola kerah perlu ditambah 0.3 cm untuk toleransi susut jahitan.',
    picName: ''
  },
  {
    id: 5,
    process: 'Persiapan Mesin dan attachment untuk pilot sample',
    picDept: 'Chief Mekanik',
    assignedRole: 'PE',
    status: 'Completed',
    dateScheduled: '2026-09-08',
    actualDate: '2026-09-08',
    dateCompleted: '2026-09-08',
    outputDescription: 'Output: Catatan kebutuhan dan setting mesin spesial sebelum mass production',
    notes: 'Folder saku bobok dan attachment pasang zipper terkalibrasi presisi.',
    machineBreakdownNotes: 'Attachment folder bibir saku siap di Line 3',
    picName: ''
  },
  {
    id: 6,
    process: 'Material dan Marker Pilot Sample (5 pcs)',
    picDept: 'SPV Cutting & Marker',
    assignedRole: 'PRODUCTION',
    status: 'Completed',
    dateScheduled: '2026-09-09',
    actualDate: '2026-09-09',
    dateCompleted: '2026-09-09',
    outputDescription: 'Bahan sample diambil dari produksi dan menjadi output produksi',
    notes: 'Marker efisiensi 86.4% untuk 5 pcs pilot.',
    picName: ''
  },
  {
    id: 7,
    process: 'Pembuatan Pilot Sample - Selesai (5pcs)',
    picDept: 'Technical Sewing',
    assignedRole: 'PE',
    status: 'Completed',
    dateScheduled: '2026-09-10',
    actualDate: '2026-09-11',
    dateCompleted: '2026-09-11',
    outputDescription: 'Output: Catatan kesulitan proses',
    notes: 'Kritis pada jahitan armhole curve, operator butuh jig bantu.',
    picName: ''
  },
  {
    id: 8,
    process: 'Technical Meeting',
    picDept: 'PE & Technical',
    assignedRole: 'PE',
    status: 'Completed',
    dateScheduled: '2026-09-11',
    actualDate: '2026-09-11',
    dateCompleted: '2026-09-11',
    outputDescription: 'Review pilot sample, bedah critical point bersama QC & Line Leader',
    notes: 'Semua rekomendasi teknis telah disetujui tim produksi.',
    picName: ''
  },
  {
    id: 9,
    process: 'PPM (Pre-Production Meeting)',
    picDept: 'PPIC & Factory Manager',
    assignedRole: 'PPIC',
    status: 'Completed',
    dateScheduled: '2026-09-12',
    actualDate: '2026-09-12',
    dateCompleted: '2026-09-12',
    outputDescription: 'Rapat koordinasi lintas departemen: target output 600 pcs/hari',
    notes: 'Target delivery buyer 30 September 2026 disepakati.',
    picName: ''
  },
  {
    id: 10,
    process: 'Cutting Plan dan Marker',
    picDept: 'Leader Marker',
    assignedRole: 'PRODUCTION',
    status: 'Completed',
    dateScheduled: '2026-09-12',
    actualDate: '2026-09-13',
    dateCompleted: '2026-09-13',
    outputDescription: 'Perhitungan yardage gelaran & rasio marker S, M, L, XL',
    notes: 'Marker length 7.2 meter, total gelaran 42 ply.',
    picName: ''
  },
  {
    id: 11,
    process: 'Kirim Material Cutting',
    picDept: 'Kepala Gudang (Warehouse)',
    assignedRole: 'WAREHOUSE',
    status: 'Completed',
    dateScheduled: '2026-09-13',
    actualDate: '2026-09-13',
    dateCompleted: '2026-09-13',
    outputDescription: 'Pengiriman 30 roll kain utama dari gudang ke ruang cutting',
    notes: 'Surat jalan WH/OUT/2026/09/112 telah tervalidasi PIC Gudang.',
    picName: ''
  },
  {
    id: 12,
    process: 'Gelar dan Potong Material',
    picDept: 'Leader Cutting',
    assignedRole: 'PRODUCTION',
    status: 'In Progress',
    dateScheduled: '2026-09-14',
    actualDate: '2026-09-14',
    outputDescription: 'Spreading fabric resting 24 jam & pemotongan mesin bandknife',
    notes: 'Resting kain selesai, saat ini proses potong batch 1 (1.200 pcs).',
    picName: ''
  },
  {
    id: 13,
    process: 'Kirim Aksesoris ke Sewing',
    picDept: 'Kepala Gudang (Warehouse)',
    assignedRole: 'WAREHOUSE',
    status: 'In Progress',
    dateScheduled: '2026-09-14',
    actualDate: '2026-09-14',
    outputDescription: 'Penyerahan benang, zipper YKK, kancing, interlining ke sewing floor',
    notes: 'Sebagian benang warna navy masih di bawah safety stock.',
    picName: ''
  },
  {
    id: 14,
    process: 'Loading Komponen',
    picDept: 'Leader Cutting',
    assignedRole: 'PRODUCTION',
    status: 'Pending',
    dateScheduled: '2026-09-15',
    actualDate: '',
    outputDescription: 'Bundling & numbering potongan panel, siap di-load ke Sewing Line 1 & 2',
    notes: 'Menunggu hasil final potongan lot B.',
    picName: ''
  },
  {
    id: 15,
    process: 'Sewing Assembly Line',
    picDept: 'SPV Sewing & PE',
    assignedRole: 'PRODUCTION',
    status: 'Pending',
    dateScheduled: '2026-09-22',
    outputDescription: 'Proses perakitan garmen, target efisiensi line 78%',
    notes: 'SMV target: 14.5 menit per garmen.',
    picName: ''
  },
  {
    id: 16,
    process: 'Proses Subkon (Bordir & Sablon)',
    picDept: 'Admin Subkon & PPIC',
    assignedRole: 'SUBCON',
    status: 'Pending',
    dateScheduled: '2026-09-24',
    outputDescription: 'Kirim panel badan depan & lengan ke CV Prima Bordir',
    notes: 'Kapasitas subkon 500 pcs/hari.',
    picName: ''
  },
  {
    id: 17,
    process: 'QC End-Line & Finishing',
    picDept: 'SPV QC & Finishing',
    assignedRole: 'PRODUCTION',
    status: 'Pending',
    dateScheduled: '2026-09-27',
    outputDescription: 'Pemeriksaan 100%, buang benang, steam ironing & metal detector',
    notes: 'AQL standard 1.5.',
    picName: ''
  },
  {
    id: 18,
    process: 'Transfer Gudang Barang Jadi (FG)',
    picDept: 'Kepala Gudang & PE',
    assignedRole: 'WAREHOUSE',
    status: 'Pending',
    dateScheduled: '2026-09-29',
    outputDescription: 'Packing polybag, karton box, final audit sebelum shipment buyer',
    notes: 'Siap ekspor/kirim ke buyer PT Teratai Widjaja.',
    picName: ''
  }
];

export const INITIAL_STYLES: ProductionStyle[] = [
  {
    id: 'sty-01',
    code: 'TW-JKT-88',
    name: 'Executive Safari Jacket Navy',
    buyer: 'PT Mitra Megah Garment Corp',
    targetQuantityPcs: 3500,
    startDate: '2026-09-01',
    deliveryDate: '2026-09-30',
    status: 'Cutting',
    currentWorkflowStep: 12,
    steps: [...STANDARD_SOP_STEPS],
    cuttingProgressPcs: 1850,
    sewingProgressPcs: 0,
    qcPassedPcs: 0,
    allocatedBudget: 185000000,
    usedBudget: 112450000
  },
  {
    id: 'sty-02',
    code: 'TW-POLO-26',
    name: 'Sport Pique Polo Shirt Black/White',
    buyer: 'Global Sportswear Retail',
    targetQuantityPcs: 5000,
    startDate: '2026-09-08',
    deliveryDate: '2026-10-10',
    status: 'Preparation',
    currentWorkflowStep: 6,
    steps: STANDARD_SOP_STEPS.map(s => {
      if (s.id <= 4) {
        return { ...s, status: 'Completed' as const, dateScheduled: '2026-09-09', actualDate: '2026-09-09', picName: '' };
      }
      if (s.id === 5) {
        return {
          ...s,
          status: 'Needs Review' as const,
          dateScheduled: '2026-09-10',
          actualDate: '2026-09-13',
          notes: 'PERHATIAN SOP: Folder placket polo shirt belum presisi (selisih 2mm), mekanik wajib kalibrasi ulang sebelum Pilot Sample!',
          machineBreakdownNotes: 'Mesin kansai placket Line 2 jarum loncat, sedang diservis mekanik.',
          picName: ''
        };
      }
      if (s.id === 6) {
        return {
          ...s,
          status: 'In Progress' as const,
          dateScheduled: '2026-09-11',
          actualDate: '2026-09-14',
          notes: 'Terlambat 3 hari dari jadwal SOP: Potongan 5 pcs pilot sample menunggu approval koreksi pola placket.',
          picName: ''
        };
      }
      if (s.id === 9) {
        return {
          ...s,
          status: 'Pending' as const,
          dateScheduled: '2026-09-13',
          actualDate: '',
          notes: 'PPM (Pre-Production Meeting) belum terlaksana padahal jadwal masuk antrian cutting sudah dekat.',
          picName: ''
        };
      }
      if (s.id < 15) {
        return {
          ...s,
          status: 'Pending' as const,
          dateScheduled: s.id <= 8 ? '2026-09-12' : (s.id <= 11 ? '2026-09-15' : (s.id <= 13 ? '2026-09-16' : '2026-09-18')),
          actualDate: '',
          picName: ''
        };
      }
      if (s.id === 15) {
        return {
          ...s,
          status: 'Pending' as const,
          dateScheduled: '2026-09-25',
          actualDate: '',
          picName: ''
        };
      }
      return {
        ...s,
        status: 'Pending' as const,
        dateScheduled: s.id === 16 ? '2026-09-28' : (s.id === 17 ? '2026-10-03' : '2026-10-08'),
        actualDate: '',
        picName: ''
      };
    }),
    cuttingProgressPcs: 0,
    sewingProgressPcs: 0,
    qcPassedPcs: 0,
    allocatedBudget: 145000000,
    usedBudget: 42300000
  },
  {
    id: 'sty-03',
    code: 'TW-CARGO-11',
    name: 'Tactical Cargo Pants Ripstop Khaki',
    buyer: 'Eiger Outdoor Apparel Ltd',
    targetQuantityPcs: 2800,
    startDate: '2026-08-20',
    deliveryDate: '2026-09-25',
    status: 'Sewing',
    currentWorkflowStep: 15,
    steps: STANDARD_SOP_STEPS.map(s => {
      const cargoDates: Record<number, string> = {
        1: '2026-08-20',
        2: '2026-08-21',
        3: '2026-08-22',
        4: '2026-08-24',
        5: '2026-08-26',
        6: '2026-08-27',
        7: '2026-08-29',
        8: '2026-08-31',
        9: '2026-09-01',
        10: '2026-09-02',
        11: '2026-09-04',
        12: '2026-09-05',
        13: '2026-09-07',
        14: '2026-09-08',
        15: '2026-09-15',
        16: '2026-09-18',
        17: '2026-09-21',
        18: '2026-09-24'
      };
      const sched = cargoDates[s.id] || s.dateScheduled;
      return {
        ...s,
        dateScheduled: sched,
        status: s.id <= 14 ? 'Completed' : (s.id === 15 ? 'In Progress' : 'Pending'),
        actualDate: s.id <= 14 ? sched : (s.id === 15 ? sched : ''),
        picName: ''
      };
    }),
    cuttingProgressPcs: 2800,
    sewingProgressPcs: 1420,
    qcPassedPcs: 450,
    allocatedBudget: 210000000,
    usedBudget: 178200000
  },
  {
    id: 'sty-04',
    code: 'TW-BATIK-09',
    name: 'Modern Batik Silk Work Shirt',
    buyer: 'Bank Mandiri Corporate Uniform',
    targetQuantityPcs: 1200,
    startDate: '2026-09-12',
    deliveryDate: '2026-10-20',
    status: 'Sample / PPS',
    currentWorkflowStep: 4,
    steps: STANDARD_SOP_STEPS.map(s => {
      if (s.id <= 2) {
        return { ...s, status: 'Completed' as const, dateScheduled: '2026-09-10', actualDate: '2026-09-10', picName: '' };
      }
      if (s.id === 3) {
        return {
          ...s,
          status: 'Needs Review' as const,
          dateScheduled: '2026-09-11',
          actualDate: '2026-09-14',
          notes: 'PERHATIAN SOP: Material kain batik motif parang korporat belum lolos uji luntur (color fastness) di lab QC!',
          picName: ''
        };
      }
      if (s.id === 4) {
        return {
          ...s,
          status: 'In Progress' as const,
          dateScheduled: '2026-09-12',
          actualDate: '',
          notes: 'PPS tertunda 2 hari karena matching motif saku depan belum simetris sesuai SOP.',
          picName: ''
        };
      }
      if (s.id < 15) {
        return {
          ...s,
          status: 'Pending' as const,
          dateScheduled: s.id <= 7 ? '2026-09-15' : (s.id <= 10 ? '2026-09-18' : (s.id <= 12 ? '2026-09-21' : '2026-09-25')),
          actualDate: '',
          picName: ''
        };
      }
      if (s.id === 15) {
        return {
          ...s,
          status: 'Pending' as const,
          dateScheduled: '2026-10-02',
          actualDate: '',
          picName: ''
        };
      }
      return {
        ...s,
        status: 'Pending' as const,
        dateScheduled: s.id === 16 ? '2026-10-06' : (s.id === 17 ? '2026-10-12' : '2026-10-18'),
        actualDate: '',
        picName: ''
      };
    }),
    cuttingProgressPcs: 0,
    sewingProgressPcs: 0,
    qcPassedPcs: 0,
    allocatedBudget: 95000000,
    usedBudget: 18500000
  }
];

export const INITIAL_STOCK: StockItem[] = [
  {
    id: 'stk-001',
    code: 'FAB-TW88-01',
    name: 'Kain Cotton Twill 20x10 Navy Blue',
    category: 'Kain Utama (Fabric)',
    styleCode: 'TW-JKT-88',
    styleName: 'Executive Safari Jacket Navy',
    currentStock: 3200,
    minStockLevel: 1000,
    unit: 'Yard',
    rackLocation: 'Gudang-A / Rak 01-A',
    unitPrice: 38500,
    supplier: 'PT Grand Textile Mills',
    lastUpdated: '2026-09-14 08:30',
    notes: 'Kualitas lot A, shrinkage test OK 1.8%'
  },
  {
    id: 'stk-002',
    code: 'FAB-TW88-02',
    name: 'Kain Furing Asahi Lining Dark Blue',
    category: 'Kain Furing (Lining)',
    styleCode: 'TW-JKT-88',
    styleName: 'Executive Safari Jacket Navy',
    currentStock: 280, // CRITICAL LOW STOCK
    minStockLevel: 600,
    unit: 'Yard',
    rackLocation: 'Gudang-A / Rak 02-B',
    unitPrice: 14200,
    supplier: 'CV Warna Tekstil',
    lastUpdated: '2026-09-13 14:15',
    notes: 'PERINGATAN: Di bawah batas aman! Butuh restock untuk batch 2.'
  },
  {
    id: 'stk-003',
    code: 'ACC-TW88-ZIP',
    name: 'Metal Zipper YKK #5 Antique Brass 28"',
    category: 'Resleting (Zipper)',
    styleCode: 'TW-JKT-88',
    styleName: 'Executive Safari Jacket Navy',
    currentStock: 3650,
    minStockLevel: 800,
    unit: 'Pcs',
    rackLocation: 'Gudang-B / Laci Z-04',
    unitPrice: 8500,
    supplier: 'PT YKK Zipper Indonesia',
    lastUpdated: '2026-09-12 11:00',
    notes: 'Stok cukup untuk full target PO'
  },
  {
    id: 'stk-004',
    code: 'ACC-TW88-BTN',
    name: 'Kancing Cor Logam Motif Teratai 24L',
    category: 'Kancing (Buttons)',
    styleCode: 'TW-JKT-88',
    styleName: 'Executive Safari Jacket Navy',
    currentStock: 45, // CRITICAL LOW (in Gross)
    minStockLevel: 100,
    unit: 'Gross',
    rackLocation: 'Gudang-B / Rak B-12',
    unitPrice: 42000,
    supplier: 'PD Megah Button',
    lastUpdated: '2026-09-14 10:20',
    notes: 'Peringatan: Stok menipis, segera ajukan PR ke PPIC'
  },
  {
    id: 'stk-005',
    code: 'THD-TW88-NAV',
    name: 'Benang Jahit Spun Poly 40/2 Navy #842',
    category: 'Benang Jahit',
    styleCode: 'TW-JKT-88',
    styleName: 'Executive Safari Jacket Navy',
    currentStock: 35, // CRITICAL LOW STOCK
    minStockLevel: 60,
    unit: 'Cones',
    rackLocation: 'Gudang-B / Lemari T-01',
    unitPrice: 18500,
    supplier: 'PT Coats Rejo Indonesia',
    lastUpdated: '2026-09-14 09:10',
    notes: 'Konsumsi sewing tinggi, butuh 50 cones tambahan'
  },
  {
    id: 'stk-006',
    code: 'FAB-POLO-PIQ',
    name: 'Kain Pique CVC 24s Black Jet',
    category: 'Kain Utama (Fabric)',
    styleCode: 'TW-POLO-26',
    styleName: 'Sport Pique Polo Shirt Black/White',
    currentStock: 4800,
    minStockLevel: 1500,
    unit: 'Kg',
    rackLocation: 'Gudang-A / Rak 04-C',
    unitPrice: 78000,
    supplier: 'PT Kahatex Bandung',
    lastUpdated: '2026-09-14 07:45',
    notes: 'Lengkap dengan rib kerah dan manset'
  },
  {
    id: 'stk-007',
    code: 'ACC-POLO-RIB',
    name: 'Kerah & Manset Rajut Katun Pique Striped',
    category: 'Aksesoris & Hangtag',
    styleCode: 'TW-POLO-26',
    styleName: 'Sport Pique Polo Shirt Black/White',
    currentStock: 5200,
    minStockLevel: 1000,
    unit: 'Set',
    rackLocation: 'Gudang-B / Rak B-08',
    unitPrice: 6500,
    supplier: 'CV Rajut Mulia Jaya',
    lastUpdated: '2026-09-10 16:30',
    notes: 'Aksesoris khusus style TW-POLO-26'
  },
  {
    id: 'stk-008',
    code: 'FAB-CRG-RIP',
    name: 'Kain Ripstop Stretch Military Khaki',
    category: 'Kain Utama (Fabric)',
    styleCode: 'TW-CARGO-11',
    styleName: 'Tactical Cargo Pants Ripstop Khaki',
    currentStock: 850, // LOW STOCK for remaining batch
    minStockLevel: 1200,
    unit: 'Yard',
    rackLocation: 'Gudang-A / Rak 05-A',
    unitPrice: 49000,
    supplier: 'PT Sritex Sukoharjo',
    lastUpdated: '2026-09-11 13:00',
    notes: 'Sisa stok untuk repeat order sedang dihitung'
  },
  {
    id: 'stk-009',
    code: 'INT-ALL-VIS',
    name: 'Interlining Viselin Kufner 25g Fusible',
    category: 'Interlining / Viselin',
    styleCode: 'TW-JKT-88',
    styleName: 'Executive Safari Jacket Navy',
    currentStock: 1400,
    minStockLevel: 500,
    unit: 'Meter',
    rackLocation: 'Gudang-B / Rak I-02',
    unitPrice: 9800,
    supplier: 'PT Freudenberg Interlining',
    lastUpdated: '2026-09-12 10:00',
    notes: 'Bahan pelapis kerah & flap kantong'
  },
  {
    id: 'stk-010',
    code: 'PKG-GEN-PLB',
    name: 'Polybag PP Tebal 0.04mm + Logo Buyer Teratai',
    category: 'Polybag & Karton',
    styleCode: 'TW-JKT-88',
    styleName: 'Executive Safari Jacket Navy',
    currentStock: 3800,
    minStockLevel: 1000,
    unit: 'Pcs',
    rackLocation: 'Gudang-C / Palet P-01',
    unitPrice: 650,
    supplier: 'CV Plastik Sentosa',
    lastUpdated: '2026-09-09 15:00',
    notes: 'Stok kemasan aman'
  }
];

export const INITIAL_TRANSACTIONS: StockTransaction[] = [
  {
    id: 'TRX-2026-09-001',
    timestamp: '2026-09-14 09:15',
    type: 'OUT',
    stockItemId: 'stk-001',
    itemCode: 'FAB-TW88-01',
    itemName: 'Kain Cotton Twill 20x10 Navy Blue',
    styleTarget: 'TW-JKT-88',
    allocatedStyleOfItem: 'TW-JKT-88',
    isCrossStyle: false,
    quantity: 1200,
    unit: 'Yard',
    destinationDept: 'Cutting',
    picReceiver: 'Dani (Cutting Leader)',
    picGudang: 'Agus Setiawan (Warehouse)',
    verifiedByPE: 'Budi Santoso, S.T.',
    referenceDoc: 'SPK-CUT-TW88-01',
    reason: 'Penggelaran kain batch 1 pemotongan safari jacket',
    notes: 'Sesuai instruksi Cutting Plan nomor 10'
  },
  {
    id: 'TRX-2026-09-002',
    timestamp: '2026-09-13 15:40',
    type: 'OUT',
    stockItemId: 'stk-005',
    itemCode: 'THD-TW88-NAV',
    itemName: 'Benang Jahit Spun Poly 40/2 Navy #842',
    styleTarget: 'TW-JKT-88',
    allocatedStyleOfItem: 'TW-JKT-88',
    isCrossStyle: false,
    quantity: 25,
    unit: 'Cones',
    destinationDept: 'Sewing',
    picReceiver: 'Supardi (SPV Sewing)',
    picGudang: 'Agus Setiawan (Warehouse)',
    verifiedByPE: 'Budi Santoso, S.T.',
    referenceDoc: 'BON-ACC-0913-08',
    reason: 'Setting awal mesin & persiapan loading jahitan line 1',
    notes: 'Pengeluaran resmi terverifikasi PPIC'
  },
  {
    id: 'TRX-2026-09-003',
    timestamp: '2026-09-12 11:20',
    type: 'IN',
    stockItemId: 'stk-003',
    itemCode: 'ACC-TW88-ZIP',
    itemName: 'Metal Zipper YKK #5 Antique Brass 28"',
    styleTarget: 'TW-JKT-88',
    allocatedStyleOfItem: 'TW-JKT-88',
    isCrossStyle: false,
    quantity: 3650,
    unit: 'Pcs',
    destinationDept: 'Gudang Lain',
    picReceiver: 'Agus Setiawan (Warehouse)',
    picGudang: 'Sopir Ekspedisi YKK',
    verifiedByPE: 'Budi Santoso, S.T.',
    referenceDoc: 'SJ-YKK-88912',
    reason: 'Penerimaan PO Material Aksesoris dari Supplier',
    notes: 'QC fisik lolos 100%, smooth slide'
  },
  {
    id: 'TRX-2026-09-004',
    timestamp: '2026-09-10 14:05',
    type: 'OUT',
    stockItemId: 'stk-001',
    itemCode: 'FAB-TW88-01',
    itemName: 'Kain Cotton Twill 20x10 Navy Blue',
    styleTarget: 'TW-JKT-88',
    allocatedStyleOfItem: 'TW-JKT-88',
    isCrossStyle: false,
    quantity: 15,
    unit: 'Yard',
    destinationDept: 'Sample / PPS',
    picReceiver: 'Bambang (Technical Sample)',
    picGudang: 'Agus Setiawan (Warehouse)',
    verifiedByPE: 'Budi Santoso, S.T.',
    referenceDoc: 'SOP-STEP-06',
    reason: 'Pembuatan 5 pcs pilot sample sesuai SOP nomor 6',
    notes: 'Sisa potongan diserahkan ke mekanik untuk setting'
  }
];

export const INITIAL_CASH_FLOW: CashFlowRecord[] = [
  {
    id: 'CF-2026-001',
    date: '2026-09-02',
    type: 'INCOME',
    category: 'PO Advance / Payment (Pemasukan)',
    styleCode: 'TW-JKT-88',
    amount: 110000000,
    description: 'Uang Muka 60% PO Buyer PT Mitra Megah Garment',
    requestedBy: 'Ratna Kusuma (PPIC)',
    picResponsibility: 'Finance & Factory Manager',
    status: 'Approved',
    approvedByFM: 'Ir. Hendra Gunawan',
    paymentMethod: 'Bank Transfer',
    invoiceRef: 'INV-DP-MMG-88'
  },
  {
    id: 'CF-2026-002',
    date: '2026-09-05',
    type: 'EXPENSE',
    category: 'Material Purchase (Bahan Baku)',
    styleCode: 'TW-JKT-88',
    amount: 65450000,
    description: 'Pelunasan Kain Cotton Twill 3.200 Yard PT Grand Textile',
    requestedBy: 'Ratna Kusuma (PPIC)',
    picResponsibility: 'Agus Setiawan (Warehouse)',
    status: 'Approved',
    approvedByFM: 'Ir. Hendra Gunawan',
    verifiedByPE: 'Budi Santoso, S.T.',
    paymentMethod: 'Bank Transfer',
    invoiceRef: 'INV-GTM-9921'
  },
  {
    id: 'CF-2026-003',
    date: '2026-09-08',
    type: 'EXPENSE',
    category: 'Machine Sparepart & Maintenance',
    styleCode: 'TW-JKT-88',
    amount: 6800000,
    description: 'Pengadaan Folder Saku Bobok & Jarum Organ DPx5 untuk Pilot Sample',
    requestedBy: 'Budi Santoso (PE)',
    picResponsibility: 'Joko (Chief Mekanik)',
    status: 'Approved',
    approvedByFM: 'Ir. Hendra Gunawan',
    verifiedByPE: 'Budi Santoso, S.T.',
    paymentMethod: 'Kas Operasional (Petty Cash)',
    invoiceRef: 'BON-MEK-04'
  },
  {
    id: 'CF-2026-004',
    date: '2026-09-13',
    type: 'EXPENSE',
    category: 'Subcontractor Fee (Jasa Subkon)',
    styleCode: 'TW-JKT-88',
    amount: 14500000,
    description: 'DP 50% Bordir Logo Teratai Dada Kiri di CV Prima Bordir (3.500 pcs @ Rp 8.200)',
    requestedBy: 'Ratna Kusuma (PPIC)',
    picResponsibility: 'Ratna Kusuma & Mandiri Subkon',
    status: 'Pending Check', // BUTUH CEK DANA OLEH FM
    paymentMethod: 'Bank Transfer',
    invoiceRef: 'SPK-SUB-0914'
  },
  {
    id: 'CF-2026-005',
    date: '2026-09-14',
    type: 'EXPENSE',
    category: 'Overtime & Wages (Lembur Produksi)',
    styleCode: 'TW-JKT-88',
    amount: 8200000,
    description: 'Uang Lembur Gelar & Potong Batch 1 Cutting 12 Operator (4 jam)',
    requestedBy: 'Supardi (SPV Produksi)',
    picResponsibility: 'Dani (Cutting Leader)',
    status: 'Pending Check', // BUTUH CEK DANA OLEH FM
    paymentMethod: 'Kas Operasional (Petty Cash)',
    invoiceRef: 'SPL-CUT-0914'
  },
  {
    id: 'CF-2026-006',
    date: '2026-09-14',
    type: 'EXPENSE',
    category: 'Material Purchase (Bahan Baku)',
    styleCode: 'TW-JKT-88',
    amount: 4500000,
    description: 'Emergency PO Tambahan Benang Jahit Navy 50 Cones (Stok Kritis Gudang)',
    requestedBy: 'Agus Setiawan (Warehouse)',
    picResponsibility: 'Agus Setiawan (Warehouse)',
    status: 'Pending Check', // BUTUH CEK DANA OLEH FM & PE
    paymentMethod: 'Kas Operasional (Petty Cash)',
    invoiceRef: 'PR-EMERGENCY-09'
  }
];

const getOffsetDate = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const INITIAL_SUBCON_TASKS: SubcontractorTask[] = [
  {
    id: 'SUB-01',
    subconName: 'CV Prima Bordir Mandiri',
    type: 'Bordir Komputer',
    styleCode: 'TW-JKT-88',
    quantitySend: 1200,
    quantityReceived: 510,
    unit: 'Pcs Panel',
    sendDate: getOffsetDate(-4),
    estReturnDate: getOffsetDate(2), // H-2 Sebelum Deadline!
    status: 'Partial Received',
    picSubcon: 'Bpk. Wahyudi (Manager CV Prima)',
    picInternal: 'Ratna Kusuma (PPIC)',
    ratePerPcs: 8200,
    totalCost: 9840000,
    defectPcs: 18,
    dailyTargetPcs: 200,
    subconAccountId: 'usr-subcon',
    subconUsername: 'subcon_prima',
    subconPassword: 'subcon123',
    dailyLogs: [
      {
        id: 'LOG-101',
        date: getOffsetDate(-3),
        targetPcs: 200,
        actualOutputPcs: 205,
        rejectPcs: 2,
        workersCount: 6,
        hasIssue: false,
        issueCategory: 'Normal / Lancar',
        issueNotes: 'Mesin jalan 6 head normal.',
        inputBy: 'CV Prima Bordir Mandiri (subcon_prima)',
        updatedAt: `${getOffsetDate(-3)} 17:00`
      },
      {
        id: 'LOG-102',
        date: getOffsetDate(-2),
        targetPcs: 200,
        actualOutputPcs: 185,
        rejectPcs: 5,
        workersCount: 6,
        hasIssue: false,
        issueCategory: 'Normal / Lancar',
        issueNotes: 'Pergantian benang gold sedikit memakan waktu.',
        inputBy: 'CV Prima Bordir Mandiri (subcon_prima)',
        updatedAt: `${getOffsetDate(-2)} 17:15`
      },
      {
        id: 'LOG-103',
        date: getOffsetDate(-1),
        targetPcs: 200,
        actualOutputPcs: 120,
        rejectPcs: 11,
        workersCount: 4,
        hasIssue: true,
        issueCategory: 'Mesin Bermasalah / Breakdown',
        issueNotes: 'Mesin bordir multi-head #3 overhaul dinamo & tension jarum miring 1.5 cm.',
        inputBy: 'CV Prima Bordir Mandiri (subcon_prima)',
        updatedAt: `${getOffsetDate(-1)} 17:30`
      }
    ],
    delayNotes: 'Output harian turun ke 120 pcs/hari karena mesin bordir multi-head nomor 3 overhaul dinamo (H-2 menjelang target selesai).',
    hasDiscrepancy: true,
    discrepancyType: 'Cacat Fisik / Reject (Bordir/Sablon/Jahit Rusak)',
    discrepancyAction: 'RETUR_REWORK',
    discrepancyQty: 18,
    discrepancyNotes: '18 pcs panel dada kiri posisi bordir miring 1.5 cm dari patokan template. Disepakati retur untuk dibongkar dan bordir ulang gratis.',
    picQC: 'Lina (QC Garment)'
  },
  {
    id: 'SUB-02',
    subconName: 'PT Multi Screen Grafika',
    type: 'Sablon / Screen Printing',
    styleCode: 'TW-POLO-26',
    quantitySend: 2500,
    quantityReceived: 720,
    unit: 'Pcs Panel',
    sendDate: getOffsetDate(-3),
    estReturnDate: getOffsetDate(3), // Tepat H-3 Sebelum Deadline!
    status: 'In Progress',
    picSubcon: 'Ibu Ratih',
    picInternal: 'Ratna Kusuma (PPIC)',
    ratePerPcs: 4500,
    totalCost: 11250000,
    defectPcs: 8,
    dailyTargetPcs: 450,
    subconAccountId: 'usr-subcon-2',
    subconUsername: 'subcon_multi',
    subconPassword: 'subcon123',
    dailyLogs: [
      {
        id: 'LOG-201',
        date: getOffsetDate(-2),
        targetPcs: 450,
        actualOutputPcs: 440,
        rejectPcs: 3,
        workersCount: 10,
        hasIssue: false,
        issueCategory: 'Normal / Lancar',
        issueNotes: 'Proses naik meja sablon plastisol lancar.',
        inputBy: 'PT Multi Screen Grafika (subcon_multi)',
        updatedAt: `${getOffsetDate(-2)} 16:45`
      },
      {
        id: 'LOG-202',
        date: getOffsetDate(-1),
        targetPcs: 450,
        actualOutputPcs: 280,
        rejectPcs: 5,
        workersCount: 7,
        hasIssue: true,
        issueCategory: 'Listrik / Utilitas Terkendala',
        issueNotes: 'Lampu curing conveyor pemanas mati 1 jalur & 3 operator absen sakit, capaian turun drastis.',
        inputBy: 'PT Multi Screen Grafika (subcon_multi)',
        updatedAt: `${getOffsetDate(-1)} 17:10`
      }
    ]
  },
  {
    id: 'SUB-03',
    subconName: 'Bandung Denim Wash Studio',
    type: 'Washing Garment',
    styleCode: 'TW-CARGO-11',
    quantitySend: 1400,
    quantityReceived: 1385,
    unit: 'Pcs Celana',
    sendDate: getOffsetDate(-9),
    estReturnDate: getOffsetDate(-4),
    actualReturnDate: getOffsetDate(-2),
    status: 'Completed',
    picSubcon: 'Kurniawan (Studio Wash)',
    picInternal: 'Budi Santoso (PE)',
    ratePerPcs: 9500,
    totalCost: 13300000,
    defectPcs: 15,
    dailyTargetPcs: 350,
    subconUsername: 'subcon_denim',
    subconPassword: 'subcon123',
    dailyLogs: [
      {
        id: 'LOG-301',
        date: getOffsetDate(-8),
        targetPcs: 350,
        actualOutputPcs: 360,
        rejectPcs: 2,
        workersCount: 8,
        hasIssue: false,
        issueCategory: 'Normal / Lancar',
        inputBy: 'Bandung Denim Wash Studio',
        updatedAt: `${getOffsetDate(-8)} 17:00`
      },
      {
        id: 'LOG-302',
        date: getOffsetDate(-7),
        targetPcs: 350,
        actualOutputPcs: 355,
        rejectPcs: 3,
        workersCount: 8,
        hasIssue: false,
        issueCategory: 'Normal / Lancar',
        inputBy: 'Bandung Denim Wash Studio',
        updatedAt: `${getOffsetDate(-7)} 17:00`
      },
      {
        id: 'LOG-303',
        date: getOffsetDate(-6),
        targetPcs: 350,
        actualOutputPcs: 340,
        rejectPcs: 5,
        workersCount: 8,
        hasIssue: false,
        issueCategory: 'Normal / Lancar',
        inputBy: 'Bandung Denim Wash Studio',
        updatedAt: `${getOffsetDate(-6)} 17:00`
      },
      {
        id: 'LOG-304',
        date: getOffsetDate(-5),
        targetPcs: 350,
        actualOutputPcs: 330,
        rejectPcs: 5,
        workersCount: 8,
        hasIssue: false,
        issueCategory: 'Normal / Lancar',
        inputBy: 'Bandung Denim Wash Studio',
        updatedAt: `${getOffsetDate(-5)} 17:00`
      }
    ],
    delayNotes: 'Terlambat 2 hari akibat proses pengeringan terhambat cuaca lembab.',
    hasDiscrepancy: true,
    discrepancyType: 'Kuantitas Kurang (Shortage)',
    discrepancyAction: 'KLAIM_POTONG_BIAYA',
    discrepancyQty: 15,
    discrepancyNotes: 'Selisih kurang 15 pcs celana hilang saat proses enzyme wash. Biaya bahan dipotong langsung dari tagihan invoice subkon.',
    picQC: 'Budi Santoso (PE)'
  }
];

export const INITIAL_PPIC_COMPONENTS: ProductionComponentAllocation[] = [
  // TW-JKT-88 (3,500 pcs)
  {
    id: 'COMP-01',
    styleCode: 'TW-JKT-88',
    componentName: 'Body Depan (Front Body Panels - Kiri & Kanan)',
    panelCategory: 'Panel Utama (Main Body)',
    qtyPerPcs: 2,
    totalRequiredQty: 7000,
    route: 'LINE',
    targetLocation: 'Line 1 Sewing (In-House)',
    processDescription: 'Cutting, Jahit Kantong Dada Bobok & Pasang Resleting Vislon',
    status: 'In Progress',
    targetDate: '2026-09-25',
    picName: 'Supardi (SPV Produksi)',
    notes: 'Kain Taslan Milky waterproof dipotong di meja potong 1.'
  },
  {
    id: 'COMP-02',
    styleCode: 'TW-JKT-88',
    componentName: 'Body Belakang (Back Body Panel)',
    panelCategory: 'Panel Utama (Main Body)',
    qtyPerPcs: 1,
    totalRequiredQty: 3500,
    route: 'LINE',
    targetLocation: 'Line 1 Sewing (In-House)',
    processDescription: 'Cutting, Sambung Pundak (Yoke Belakang) & Ventilasi Punggung',
    status: 'In Progress',
    targetDate: '2026-09-25',
    picName: 'Supardi (SPV Produksi)',
    notes: 'Dipasangkan jaring mesh respirasi.'
  },
  {
    id: 'COMP-03',
    styleCode: 'TW-JKT-88',
    componentName: 'Lengan Kiri & Kanan (Sleeves)',
    panelCategory: 'Panel Sekunder (Lengan/Saku)',
    qtyPerPcs: 2,
    totalRequiredQty: 7000,
    route: 'LINE',
    targetLocation: 'Line 1 Sewing (In-House)',
    processDescription: 'Obras Sambung Lengan, Pasang Manset Velcro Karet',
    status: 'Allocated',
    targetDate: '2026-09-28',
    picName: 'Supardi (SPV Produksi)',
    notes: 'Menunggu kiriman sablon reflektif dari subkon.'
  },
  {
    id: 'COMP-04',
    styleCode: 'TW-JKT-88',
    componentName: 'Hoodie / Topi Tudung (Detachable Hood)',
    panelCategory: 'Panel Sekunder (Lengan/Saku)',
    qtyPerPcs: 3,
    totalRequiredQty: 10500,
    route: 'LINE',
    targetLocation: 'Line 2 Sewing (In-House)',
    processDescription: 'Jahit Panel Tudung, Pasang Tali Stopper Elastis & Resleting Lepas-Pasang',
    status: 'Allocated',
    targetDate: '2026-09-27',
    picName: 'Ratna Kusuma (PPIC)',
    notes: 'Dikerjakan terpisah di Line 2 untuk efisiensi.'
  },
  {
    id: 'COMP-05',
    styleCode: 'TW-JKT-88',
    componentName: 'Bordir Logo Dada & Tulisan Punggung',
    panelCategory: 'Aplikasi Bordir / Sablon',
    qtyPerPcs: 2,
    totalRequiredQty: 7000,
    route: 'SUBCON',
    targetLocation: 'CV Prima Bordir Mandiri (Subkon)',
    processDescription: 'Bordir Komputer 6-Warna High Density Benang Rayon',
    status: 'In Progress',
    targetDate: '2026-09-22',
    picName: 'H. Anwar (Subkon)',
    notes: 'SPK SUB-01: 3,500 pasang panel dada & punggung dikirim ke subkon.'
  },
  {
    id: 'COMP-06',
    styleCode: 'TW-JKT-88',
    componentName: 'Sablon Reflektif 3M Garis Lengan & Saku',
    panelCategory: 'Aplikasi Bordir / Sablon',
    qtyPerPcs: 2,
    totalRequiredQty: 7000,
    route: 'SUBCON',
    targetLocation: 'PT Multi Screen Grafika (Subkon)',
    processDescription: 'Sablon Heat Transfer Reflective Safety Standard (Cahaya Gelap)',
    status: 'Allocated',
    targetDate: '2026-09-23',
    picName: 'Ibu Ratih (Subkon)',
    notes: 'Panel lengan dipotong di gudang lalu dikirim ke vendor sablon.'
  },
  {
    id: 'COMP-07',
    styleCode: 'TW-JKT-88',
    componentName: 'Kerah Tegak & Pelindung Dagu (Chin Guard)',
    panelCategory: 'Kerah & Manset',
    qtyPerPcs: 2,
    totalRequiredQty: 7000,
    route: 'LINE',
    targetLocation: 'Line 1 Sewing (In-House)',
    processDescription: 'Fusing Interlining Viselin & Jahit Lapisan Kerah Dalam',
    status: 'Draft',
    targetDate: '2026-09-29',
    picName: 'Budi Santoso (PE)',
    notes: 'Kain kerah dilapisi polar fleece lembut.'
  },
  {
    id: 'COMP-08',
    styleCode: 'TW-JKT-88',
    componentName: 'Furing / Lining Mesh Jaring Respirasi Dalam',
    panelCategory: 'Furing & Lapisan',
    qtyPerPcs: 3,
    totalRequiredQty: 10500,
    route: 'LINE',
    targetLocation: 'Line 2 Sewing (In-House)',
    processDescription: 'Potong Jaring Poly Mesh & Jahit Kantong Dalam Rahasia',
    status: 'Allocated',
    targetDate: '2026-09-28',
    picName: 'Supardi (SPV Produksi)',
    notes: 'Selesai potong di ruang cutting.'
  },

  // TW-POLO-26 (2,500 pcs)
  {
    id: 'COMP-09',
    styleCode: 'TW-POLO-26',
    componentName: 'Body Depan & Belakang Polo',
    panelCategory: 'Panel Utama (Main Body)',
    qtyPerPcs: 2,
    totalRequiredQty: 5000,
    route: 'LINE',
    targetLocation: 'Line 2 Sewing (In-House)',
    processDescription: 'Cutting Bahan Pique & Jahit Side Seam / Belahan Samping',
    status: 'Allocated',
    targetDate: '2026-09-20',
    picName: 'Supardi (SPV Produksi)',
    notes: 'Bahan katun pique honeycomb maroon.'
  },
  {
    id: 'COMP-10',
    styleCode: 'TW-POLO-26',
    componentName: 'Kerah Rajut Flat-Knit Rib & Manset Ujung Lengan',
    panelCategory: 'Kerah & Manset',
    qtyPerPcs: 3,
    totalRequiredQty: 7500,
    route: 'LINE',
    targetLocation: 'Line 2 Sewing (In-House)',
    processDescription: 'Pemasangan Kerah Rajut & Overdeck Rib Manset Lengan',
    status: 'Allocated',
    targetDate: '2026-09-22',
    picName: 'Supardi (SPV Produksi)',
    notes: 'Rib rajut match warna kain utama.'
  },
  {
    id: 'COMP-11',
    styleCode: 'TW-POLO-26',
    componentName: 'Sablon Grafis Waterbase Rubber Dada & Punggung',
    panelCategory: 'Aplikasi Bordir / Sablon',
    qtyPerPcs: 1,
    totalRequiredQty: 2500,
    route: 'SUBCON',
    targetLocation: 'PT Multi Screen Grafika (Subkon)',
    processDescription: 'Screen Printing 4-Warna Plastisol Eco & Curing Oven',
    status: 'In Progress',
    targetDate: '2026-09-18',
    picName: 'Ibu Ratih (Subkon)',
    notes: 'SPK SUB-02 berjalan di vendor sablon.'
  },
  {
    id: 'COMP-12',
    styleCode: 'TW-POLO-26',
    componentName: 'Placket Kancing Depan & Bar-tack',
    panelCategory: 'Panel Sekunder (Lengan/Saku)',
    qtyPerPcs: 2,
    totalRequiredQty: 5000,
    route: 'LINE',
    targetLocation: 'Line 2 Sewing (In-House)',
    processDescription: 'Pembuatan Placket Kancing, Lubang Kancing & Pasang Kancing 18L',
    status: 'Draft',
    targetDate: '2026-09-24',
    picName: 'Ratna Kusuma (PPIC)',
    notes: 'Mesin buttonhole otomatis Juki.'
  },

  // TW-CARGO-11 (1,500 pcs)
  {
    id: 'COMP-13',
    styleCode: 'TW-CARGO-11',
    componentName: 'Celana Utuh Semi-Finishing untuk Proses Washing',
    panelCategory: 'Panel Utama (Main Body)',
    qtyPerPcs: 1,
    totalRequiredQty: 1500,
    route: 'SUBCON',
    targetLocation: 'Bandung Denim Wash Studio (Subkon)',
    processDescription: 'Enzyme Bio-Wash, Softener Bath & Stone Wash Effect',
    status: 'Completed',
    targetDate: '2026-09-13',
    picName: 'Kurniawan (Studio Wash)',
    notes: 'SPK SUB-03 selesai, 1,385 celana diterima kembali.'
  },
  {
    id: 'COMP-14',
    styleCode: 'TW-CARGO-11',
    componentName: 'Saku Samping Cargo Berlipat (Gusset Pockets)',
    panelCategory: 'Panel Sekunder (Lengan/Saku)',
    qtyPerPcs: 4,
    totalRequiredQty: 6000,
    route: 'LINE',
    targetLocation: 'Line 3 Sewing (In-House)',
    processDescription: 'Jahit Lipit Saku Cargo, Pasang Flap Penutup & Kancing Snap',
    status: 'Completed',
    targetDate: '2026-09-10',
    picName: 'Supardi (SPV Produksi)',
    notes: 'Proses jahit in-house selesai sebelum dikirim wash.'
  }
];

export const INITIAL_PPIC_MATERIALS: ProductionMaterialRequirement[] = [
  // TW-JKT-88 (3,500 pcs)
  {
    id: 'MAT-01',
    styleCode: 'TW-JKT-88',
    materialName: 'Kain Parasut Taslan Milky Waterproof Dark Navy',
    category: 'Kain Utama (Fabric)',
    usedForComponent: 'Body Depan, Belakang & Hood',
    consumptionPerPcs: 1.65,
    wasteAllowancePercent: 3,
    unit: 'Yard',
    totalRequired: 5775,
    availableStock: 6200,
    allocatedFromWarehouseQty: 5800,
    balanceQty: 425,
    status: 'Ready',
    allocatedTo: 'LINE',
    targetWorkCenter: 'Ruang Potong (Cutting) & Line 1 Sewing',
    stockItemId: 'stk-001',
    unitPrice: 38000,
    notes: 'Kain utama roll utuh di Rak F-01. Kualitas waterproof teruji.'
  },
  {
    id: 'MAT-02',
    styleCode: 'TW-JKT-88',
    materialName: 'Kain Furing Jaring Poly Mesh Hitam Respirasi',
    category: 'Kain Furing (Lining)',
    usedForComponent: 'Lapisan Dalam / Furing Jaket',
    consumptionPerPcs: 0.90,
    wasteAllowancePercent: 2,
    unit: 'Yard',
    totalRequired: 3150,
    availableStock: 3400,
    allocatedFromWarehouseQty: 3200,
    balanceQty: 250,
    status: 'Ready',
    allocatedTo: 'LINE',
    targetWorkCenter: 'Line 1 & Line 2 Sewing',
    stockItemId: 'stk-002',
    unitPrice: 22500,
    notes: 'Dialokasikan untuk lapisan dalam jaket respirasi.'
  },
  {
    id: 'MAT-03',
    styleCode: 'TW-JKT-88',
    materialName: 'Benang Jahit Spun Poly 40/2 Navy #842',
    category: 'Benang Jahit',
    usedForComponent: 'Jahit Assembly & Obras Seluruh Bagian',
    consumptionPerPcs: 0.04,
    wasteAllowancePercent: 5,
    unit: 'Cones',
    totalRequired: 140,
    availableStock: 35,
    allocatedFromWarehouseQty: 35,
    balanceQty: -105,
    status: 'Shortage',
    allocatedTo: 'LINE',
    targetWorkCenter: 'Line 1 Sewing Floor',
    stockItemId: 'stk-005',
    unitPrice: 18500,
    notes: 'Peringatan PPIC: Stok di gudang hanya 35 cones, defisit 105 cones! Segera ajukan PO.'
  },
  {
    id: 'MAT-04',
    styleCode: 'TW-JKT-88',
    materialName: 'Resleting Utama YKK #5 Vislon Open-End 70cm',
    category: 'Resleting (Zipper)',
    usedForComponent: 'Bukaan Utama Tengah Depan',
    consumptionPerPcs: 1,
    wasteAllowancePercent: 0,
    unit: 'Pcs',
    totalRequired: 3500,
    availableStock: 3500,
    allocatedFromWarehouseQty: 3500,
    balanceQty: 0,
    status: 'Ready',
    allocatedTo: 'LINE',
    targetWorkCenter: 'Line 1 Sewing',
    stockItemId: 'stk-004',
    unitPrice: 16500,
    notes: 'Resleting tengah depan buka-lepas kualitas ekspor.'
  },
  {
    id: 'MAT-05',
    styleCode: 'TW-JKT-88',
    materialName: 'Benang Bordir Rayon Khusus Bordir Logo Komputer',
    category: 'Benang Jahit',
    usedForComponent: 'Panel Dada Kiri (Bordir Logo)',
    consumptionPerPcs: 0.02,
    wasteAllowancePercent: 5,
    unit: 'Cones',
    totalRequired: 70,
    availableStock: 70,
    allocatedFromWarehouseQty: 70,
    balanceQty: 0,
    status: 'Ready',
    allocatedTo: 'SUBCON',
    targetWorkCenter: 'CV Prima Bordir Mandiri (Subkon)',
    unitPrice: 24000,
    notes: 'Diserahkan langsung ke subkon bersama potongan panel dada.'
  },
  {
    id: 'MAT-06',
    styleCode: 'TW-JKT-88',
    materialName: 'Tinta Pasta Sablon Reflective 3M Powder Eco',
    category: 'Aksesoris & Hangtag',
    usedForComponent: 'Punggung Atas (Sablon Safety)',
    consumptionPerPcs: 0.01,
    wasteAllowancePercent: 5,
    unit: 'Kg',
    totalRequired: 35,
    availableStock: 15,
    allocatedFromWarehouseQty: 15,
    balanceQty: -20,
    status: 'Partial',
    allocatedTo: 'SUBCON',
    targetWorkCenter: 'PT Multi Screen Grafika (Subkon)',
    unitPrice: 145000,
    notes: 'Bahan sablon reflektif khusus safety outdoor, stok parsial 15kg.'
  },
  {
    id: 'MAT-07',
    styleCode: 'TW-JKT-88',
    materialName: 'Interlining Viselin Kufner 25g Fusible',
    category: 'Interlining / Viselin',
    usedForComponent: 'Kerah, Placket & Manset',
    consumptionPerPcs: 0.35,
    wasteAllowancePercent: 3,
    unit: 'Meter',
    totalRequired: 1225,
    availableStock: 1400,
    allocatedFromWarehouseQty: 1250,
    balanceQty: 175,
    status: 'Ready',
    allocatedTo: 'LINE',
    targetWorkCenter: 'Bagian Fusing Press & Line 1',
    stockItemId: 'stk-009',
    unitPrice: 9800,
    notes: 'Proses pelapisan panas (fusing).'
  },
  {
    id: 'MAT-08',
    styleCode: 'TW-JKT-88',
    materialName: 'Kancing Jepret Metal Snap Button 15mm Anti-Karat',
    category: 'Kancing (Buttons)',
    usedForComponent: 'Flap Saku & Penutup Resleting',
    consumptionPerPcs: 4,
    wasteAllowancePercent: 2,
    unit: 'Pcs',
    totalRequired: 14000,
    availableStock: 14000,
    allocatedFromWarehouseQty: 14000,
    balanceQty: 0,
    status: 'Ready',
    allocatedTo: 'LINE',
    targetWorkCenter: 'Line Finishing / Pasang Kancing',
    stockItemId: 'stk-007',
    unitPrice: 750,
    notes: 'Kancing flap penutup resleting dan saku.'
  },

  // TW-POLO-26 (2,500 pcs)
  {
    id: 'MAT-09',
    styleCode: 'TW-POLO-26',
    materialName: 'Kain Pique CVC 24s Black Jet',
    category: 'Kain Utama (Fabric)',
    usedForComponent: 'Body Depan & Belakang, Lengan',
    consumptionPerPcs: 0.85,
    wasteAllowancePercent: 3,
    unit: 'Kg',
    totalRequired: 2125,
    availableStock: 4800,
    allocatedFromWarehouseQty: 2200,
    balanceQty: 2675,
    status: 'Ready',
    allocatedTo: 'LINE',
    targetWorkCenter: 'Ruang Potong & Line 2 Sewing',
    stockItemId: 'stk-006',
    unitPrice: 78000,
    notes: 'Bahan polo katun rajut pique maroon/black. Stok berlebih.'
  },
  {
    id: 'MAT-10',
    styleCode: 'TW-POLO-26',
    materialName: 'Kerah & Manset Rajut Katun Pique Striped',
    category: 'Aksesoris & Hangtag',
    usedForComponent: 'Kerah Leher & Manset Ujung Lengan',
    consumptionPerPcs: 1,
    wasteAllowancePercent: 0,
    unit: 'Set',
    totalRequired: 2500,
    availableStock: 5200,
    allocatedFromWarehouseQty: 2500,
    balanceQty: 2700,
    status: 'Ready',
    allocatedTo: 'LINE',
    targetWorkCenter: 'Line 2 Sewing Floor',
    stockItemId: 'stk-007',
    unitPrice: 6500,
    notes: 'Set kerah dan rib ujung lengan lengkap.'
  },
  {
    id: 'MAT-11',
    styleCode: 'TW-POLO-26',
    materialName: 'Kancing Poliester 4 Lubang 18L Logo Teratai Laser',
    category: 'Kancing (Buttons)',
    usedForComponent: 'Placket Kerah Depan (3 pcs)',
    consumptionPerPcs: 3,
    wasteAllowancePercent: 2,
    unit: 'Pcs',
    totalRequired: 7500,
    availableStock: 7500,
    allocatedFromWarehouseQty: 7500,
    balanceQty: 0,
    status: 'Ready',
    allocatedTo: 'LINE',
    targetWorkCenter: 'Line 2 Sewing / Finishing',
    unitPrice: 350,
    notes: '3 kancing per kaos polo.'
  },
  {
    id: 'MAT-12',
    styleCode: 'TW-POLO-26',
    materialName: 'Pasta Sablon Plastisol Eco White & Grey',
    category: 'Aksesoris & Hangtag',
    usedForComponent: 'Lengan Kanan (Aksen Sport Logo)',
    consumptionPerPcs: 0.015,
    wasteAllowancePercent: 5,
    unit: 'Kg',
    totalRequired: 38,
    availableStock: 38,
    allocatedFromWarehouseQty: 38,
    balanceQty: 0,
    status: 'Ready',
    allocatedTo: 'SUBCON',
    targetWorkCenter: 'PT Multi Screen Grafika (Subkon)',
    unitPrice: 95000,
    notes: 'Dialokasikan dan dikirim ke subkon sablon.'
  }
];

export const INITIAL_CUTTING_ORDERS: CuttingOrderItem[] = [
  {
    id: 'CUT-2026-001',
    orderNumber: 'SPK-CUT/TW/09/001',
    cuttingDate: new Date().toISOString().split('T')[0],
    queueNumber: 1,
    queueStatus: 'ACTIVE_CUTTING',
    priority: 'URGENT',
    cuttingTable: 'Meja Potong 01 (Bandknife Utama)',
    styleId: 'sty-01',
    styleCode: 'TW-JKT-88',
    styleName: 'Executive Safari Jacket Navy',
    buyer: 'PT Mitra Megah Garment Corp',
    sopReferenceStepId: 12,
    sopReferenceProcess: 'Tahap 12 SOP: Gelar dan Potong Material (Setelah Step 10 Marker & Step 11 Kirim Kain)',
    sopComplianceStatus: 'SESUAI_SOP',
    sopComplianceNotes: 'SOP Step 1 s/d 11 Terverifikasi Selesai. Kain telah resting 24 jam & rasio marker 42 ply disetujui PE.',
    materialCode: 'FAB-TW88-01',
    materialName: 'Kain Cotton Twill 20x10 Navy Blue / Parasut Taslan Milky',
    materialCategory: 'Kain Utama (Fabric)',
    fabricQtyToCut: 1155,
    fabricUnit: 'Yard',
    markerRatio: 'S:1, M:2, L:2, XL:1 (Gelaran 42 Ply / 7.2m)',
    componentPanelCut: 'Body Depan & Belakang, Lengan Raglan, Panel Dada Bordir & Punggung Sablon',
    dailyTargetCutPcs: 700,
    actualCutPcs: 520,
    bundleCount: 28,
    loadingAllocations: [
      {
        id: 'LOAD-001A',
        destinationType: 'LINE',
        destinationName: 'Line 1 Sewing (In-House)',
        componentPanel: 'Body Utama Depan/Belakang & Kerah',
        dailyTargetRequirementPcs: 400,
        allocatedLoadingPcs: 400,
        loadedActualPcs: 320,
        loadingStatus: 'Partial Loaded',
        picReceiver: 'Supardi (SPV Line 1)',
        notes: 'Supply prioritas pagi untuk menjaga target 400 pcs/hari di Line 1'
      },
      {
        id: 'LOAD-001B',
        destinationType: 'LINE',
        destinationName: 'Line 2 Sewing (In-House)',
        componentPanel: 'Lengan Kiri/Kanan & Manset',
        dailyTargetRequirementPcs: 300,
        allocatedLoadingPcs: 300,
        loadedActualPcs: 200,
        loadingStatus: 'Partial Loaded',
        picReceiver: 'Rudi (Leader Line 2)',
        notes: 'Loading bertahap per 10 bundle'
      },
      {
        id: 'LOAD-001C',
        destinationType: 'SUBCON',
        destinationName: 'CV Prima Bordir Mandiri (Subkon)',
        componentPanel: 'Panel Dada Kiri (Aplikasi Bordir Logo 6 Warna)',
        dailyTargetRequirementPcs: 350,
        allocatedLoadingPcs: 350,
        loadedActualPcs: 350,
        loadingStatus: 'Loaded',
        picReceiver: 'H. Rahmat (CV Prima Bordir)',
        notes: 'Potongan panel dada langsung dikirim ke mitra bordir sesuai kuota target harian'
      },
      {
        id: 'LOAD-001D',
        destinationType: 'SUBCON',
        destinationName: 'PT Multi Screen Grafika (Subkon)',
        componentPanel: 'Panel Punggung Atas (Sablon Reflective 3M)',
        dailyTargetRequirementPcs: 350,
        allocatedLoadingPcs: 350,
        loadedActualPcs: 170,
        loadingStatus: 'Partial Loaded',
        picReceiver: 'Ibu Ratih (Multi Screen)',
        notes: 'Menunggu sisa 180 pcs potongan sore ini'
      }
    ],
    picCutting: 'Dani (Cutting Leader)',
    issuedByPPIC: 'Ratna Kusuma (PPIC)',
    notes: 'Perintah potong utama hari ini. Pastikan numbering bundle dipisah antara panel Line Internal dan panel Subkon.'
  },
  {
    id: 'CUT-2026-002',
    orderNumber: 'SPK-CUT/TW/09/002',
    cuttingDate: new Date().toISOString().split('T')[0],
    queueNumber: 2,
    queueStatus: 'ACTIVE_CUTTING',
    priority: 'HIGH',
    cuttingTable: 'Meja Potong 02 (Straight Knife & Fusing)',
    styleId: 'sty-01',
    styleCode: 'TW-JKT-88',
    styleName: 'Executive Safari Jacket Navy',
    buyer: 'PT Mitra Megah Garment Corp',
    sopReferenceStepId: 12,
    sopReferenceProcess: 'Tahap 12 SOP: Potong Furing Lining & Interlining Viselin Kerah/Flap',
    sopComplianceStatus: 'PERHATIAN_SOP',
    sopComplianceNotes: 'PERHATIAN SOP: Stok Kain Furing Asahi di gudang menipis (sisa 280 Yard < Min 600 Yard), cukup untuk batch hari ini namun batch besok perlu restock segera.',
    materialCode: 'FAB-TW88-02',
    materialName: 'Kain Furing Jaring Poly Mesh & Interlining Viselin Kufner 25g',
    materialCategory: 'Kain Furing (Lining)',
    fabricQtyToCut: 630,
    fabricUnit: 'Yard',
    markerRatio: 'S:1, M:2, L:2, XL:1 (Gelaran 50 Ply)',
    componentPanelCut: 'Furing Badan Dalam, Lapisan Saku & Viselin Kerah/Manset',
    dailyTargetCutPcs: 700,
    actualCutPcs: 700,
    bundleCount: 20,
    loadingAllocations: [
      {
        id: 'LOAD-002A',
        destinationType: 'LINE',
        destinationName: 'Line 1 Sewing (In-House)',
        componentPanel: 'Furing Dalam & Interlining Kerah (Fusing)',
        dailyTargetRequirementPcs: 400,
        allocatedLoadingPcs: 400,
        loadedActualPcs: 400,
        loadingStatus: 'Loaded',
        picReceiver: 'Supardi (SPV Line 1)',
        notes: 'Sudah melewati mesin fusing press dan masuk Line 1'
      },
      {
        id: 'LOAD-002B',
        destinationType: 'LINE',
        destinationName: 'Line 2 Sewing (In-House)',
        componentPanel: 'Lapisan Saku Dalam & Manset Fusing',
        dailyTargetRequirementPcs: 300,
        allocatedLoadingPcs: 300,
        loadedActualPcs: 300,
        loadingStatus: 'Loaded',
        picReceiver: 'Rudi (Leader Line 2)',
        notes: 'Lengkap 300 pasang sesuai target harian Line 2'
      }
    ],
    picCutting: 'Wahyu (Operator Fusing & Potong)',
    issuedByPPIC: 'Ratna Kusuma (PPIC)',
    notes: 'Potongan furing & interlining selesai 100%, siap menyuplai penuh Line 1 & Line 2.'
  },
  {
    id: 'CUT-2026-003',
    orderNumber: 'SPK-CUT/TW/09/003',
    cuttingDate: new Date().toISOString().split('T')[0],
    queueNumber: 3,
    queueStatus: 'WAITING_LIST',
    priority: 'URGENT',
    cuttingTable: 'Meja Potong 01 (Antrian Berikutnya)',
    styleId: 'sty-02',
    styleCode: 'TW-POLO-26',
    styleName: 'Sport Pique Polo Shirt Black/White',
    buyer: 'Global Sportswear Retail',
    sopReferenceStepId: 10,
    sopReferenceProcess: 'Tahap 6-10 SOP: Persiapan Marker & Potong Perdana (Menunggu Pilot Sample & PPM)',
    sopComplianceStatus: 'PERHATIAN_SOP',
    sopComplianceNotes: 'PERHATIAN BELUM SESUAI SOP: Step 5 (Setting Mesin Placket) masih Needs Review, Step 6-7 (Pilot Sample 5 pcs) terlambat 3 hari, dan Step 9 (PPM) belum selesai!',
    materialCode: 'FAB-POLO-PIQ',
    materialName: 'Kain Pique CVC 24s Black Jet',
    materialCategory: 'Kain Utama (Fabric)',
    fabricQtyToCut: 510,
    fabricUnit: 'Kg',
    markerRatio: 'S:2, M:3, L:3, XL:2 (Gelaran Tubular 36 Ply)',
    componentPanelCut: 'Body Depan, Body Belakang, Lengan Pendek & Placket Kancing',
    dailyTargetCutPcs: 600,
    actualCutPcs: 0,
    bundleCount: 24,
    loadingAllocations: [
      {
        id: 'LOAD-003A',
        destinationType: 'LINE',
        destinationName: 'Line 2 Sewing (In-House)',
        componentPanel: 'Body Depan/Belakang & Placket Kancing',
        dailyTargetRequirementPcs: 600,
        allocatedLoadingPcs: 600,
        loadedActualPcs: 0,
        loadingStatus: 'Waiting Cut',
        picReceiver: 'Supardi (SPV Produksi)',
        notes: 'Alokasi loading untuk target harian 600 pcs/hari di Line 2 setelah TW-JKT-88'
      },
      {
        id: 'LOAD-003B',
        destinationType: 'SUBCON',
        destinationName: 'PT Multi Screen Grafika (Subkon)',
        componentPanel: 'Lengan Kanan (Sablon Plastisol 4-Warna Sport Logo)',
        dailyTargetRequirementPcs: 500,
        allocatedLoadingPcs: 600,
        loadedActualPcs: 0,
        loadingStatus: 'Waiting Cut',
        picReceiver: 'Ibu Ratih (Multi Screen)',
        notes: 'Panel lengan harus dikirim ke subkon sablon H-2 sebelum masuk assembly Line 2'
      }
    ],
    picCutting: 'Dani (Cutting Leader)',
    issuedByPPIC: 'Ratna Kusuma (PPIC)',
    notes: 'Masuk Waiting List Antrian #3. Kain Pique CVC sudah siap di gudang, menunggu clearance SOP Step 7 & 9 dari PE/PPIC.'
  },
  {
    id: 'CUT-2026-004',
    orderNumber: 'SPK-CUT/TW/09/004',
    cuttingDate: new Date().toISOString().split('T')[0],
    queueNumber: 4,
    queueStatus: 'WAITING_LIST',
    priority: 'HIGH',
    cuttingTable: 'Meja Potong 03 (Line Celana & Khusus)',
    styleId: 'sty-03',
    styleCode: 'TW-CARGO-11',
    styleName: 'Tactical Cargo Pants Ripstop Khaki',
    buyer: 'Eiger Outdoor Apparel Ltd',
    sopReferenceStepId: 14,
    sopReferenceProcess: 'Tahap 12 & 14 SOP: Potong Tambahan Gusset Saku & Ban Pinggang Lot Akhir',
    sopComplianceStatus: 'SESUAI_SOP',
    sopComplianceNotes: 'Seluruh SOP Step 1-14 telah Completed tepat waktu. Potong komponen tambahan untuk menyeimbangkan loading Line 3.',
    materialCode: 'FAB-CRG-RIP',
    materialName: 'Kain Ripstop Stretch Military Khaki',
    materialCategory: 'Kain Utama (Fabric)',
    fabricQtyToCut: 320,
    fabricUnit: 'Yard',
    markerRatio: '28:1, 30:2, 32:3, 34:2, 36:1 (30 Ply)',
    componentPanelCut: 'Saku Samping Cargo Berlipat (Gusset), Flap Penutup & Waistband',
    dailyTargetCutPcs: 450,
    actualCutPcs: 0,
    bundleCount: 15,
    loadingAllocations: [
      {
        id: 'LOAD-004A',
        destinationType: 'LINE',
        destinationName: 'Line 3 Sewing (In-House)',
        componentPanel: 'Saku Samping Cargo & Ban Pinggang',
        dailyTargetRequirementPcs: 450,
        allocatedLoadingPcs: 450,
        loadedActualPcs: 0,
        loadingStatus: 'Waiting Cut',
        picReceiver: 'Hendra (Leader Line 3)',
        notes: 'Untuk menutup target harian Line 3 (450 pcs/hari) sebelum dikirim ke Subkon Washing'
      },
      {
        id: 'LOAD-004B',
        destinationType: 'SUBCON',
        destinationName: 'Bandung Denim Wash Studio (Subkon)',
        componentPanel: 'Celana Utuh Semi-Finishing (Enzyme Bio-Wash)',
        dailyTargetRequirementPcs: 450,
        allocatedLoadingPcs: 450,
        loadedActualPcs: 0,
        loadingStatus: 'Waiting Cut',
        picReceiver: 'Kurniawan (Studio Wash)',
        notes: 'Rute berlanjut ke Subkon Washing setelah dirakit di Line 3'
      }
    ],
    picCutting: 'Rian (Marker & Cutting SPV)',
    issuedByPPIC: 'Ratna Kusuma (PPIC)',
    notes: 'Antrian Waiting List #4 hari ini di Meja 03.'
  },
  {
    id: 'CUT-2026-005',
    orderNumber: 'SPK-CUT/TW/09/005',
    cuttingDate: new Date().toISOString().split('T')[0],
    queueNumber: 5,
    queueStatus: 'HOLD_SOP',
    priority: 'NORMAL',
    cuttingTable: 'Meja Potong 02 (Potong Pola Matching Motif)',
    styleId: 'sty-04',
    styleCode: 'TW-BATIK-09',
    styleName: 'Modern Batik Silk Work Shirt',
    buyer: 'Bank Mandiri Corporate Uniform',
    sopReferenceStepId: 6,
    sopReferenceProcess: 'Tahap 4-6 SOP: Menunggu Approval PPS & Uji Luntur Kain Batik',
    sopComplianceStatus: 'PERHATIAN_SOP',
    sopComplianceNotes: 'DITAHAN (HOLD SOP): Step 3 (Uji Luntur Material Batik) berstatus Needs Review & Step 4 (PPS Matching Motif Saku) belum selesai sesuai SOP!',
    materialCode: 'FAB-BTK-SLK',
    materialName: 'Kain Batik Silk Dobby Motif Parang Mandiri',
    materialCategory: 'Kain Utama (Fabric)',
    fabricQtyToCut: 360,
    fabricUnit: 'Meter',
    markerRatio: 'S:1, M:2, L:2, XL:1 (Single/Pin Table Matching Motif)',
    componentPanelCut: 'Badan Depan (Matching Motif Saku), Kerah Kemeja & Manset Panjang',
    dailyTargetCutPcs: 250,
    actualCutPcs: 0,
    bundleCount: 12,
    loadingAllocations: [
      {
        id: 'LOAD-005A',
        destinationType: 'LINE',
        destinationName: 'Line 1 Sewing (In-House)',
        componentPanel: 'Full Assembly Kemeja Batik Eksekutif',
        dailyTargetRequirementPcs: 250,
        allocatedLoadingPcs: 250,
        loadedActualPcs: 0,
        loadingStatus: 'Waiting Cut',
        picReceiver: 'Supardi (SPV Line 1)',
        notes: 'Menunggu SOP Step 3 & 4 selesai sebelum boleh dipotong'
      }
    ],
    picCutting: 'Dani (Cutting Leader)',
    issuedByPPIC: 'Ratna Kusuma (PPIC)',
    notes: 'Masuk daftar Waiting List #5 namun berstatus HOLD karena SOP belum sesuai.'
  }
];


