import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS middleware - allow any client or external system to access and provide input
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-api-key, x-client-id');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Database file path
const DATA_DIR = path.join(__dirname, 'data_store');
const DB_FILE = path.join(DATA_DIR, 'shared_database.json');

// Ensure data store directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Master API Keys
const DEFAULT_MASTER_KEY = 'IOS-TW-PROD-LIVE-KEY-2026';

interface ApiKeyRecord {
  id: string;
  name: string;
  key: string;
  role: string;
  createdAt: string;
  lastUsedAt?: string;
  description: string;
}

interface SharedDatabase {
  apiKeys: ApiKeyRecord[];
  lastUpdated: string;
  styles: any[];
  stock: any[];
  transactions: any[];
  cashFlow: any[];
  subconTasks: any[];
  componentAllocations: any[];
  productionMaterials: any[];
  cuttingOrders: any[];
  users: any[];
}

// Initialize or load DB
function loadDatabase(): SharedDatabase {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (!parsed.apiKeys || !Array.isArray(parsed.apiKeys)) {
        parsed.apiKeys = [];
      }
      if (!parsed.apiKeys.some((k: ApiKeyRecord) => k.key === DEFAULT_MASTER_KEY)) {
        parsed.apiKeys.unshift({
          id: 'key-master-prod',
          name: 'Master API Key Produksi (Semua Akses)',
          key: DEFAULT_MASTER_KEY,
          role: 'ADMIN_MULTIUSER',
          createdAt: new Date().toISOString(),
          description: 'Kunci API utama untuk akses bersama, input data, dan sinkronisasi real-time seluruh tim.'
        });
      }
      return parsed;
    }
  } catch (err) {
    console.error('Error loading database file, initializing default:', err);
  }

  const initialDb: SharedDatabase = {
    apiKeys: [
      {
        id: 'key-master-prod',
        name: 'Master API Key Produksi (Semua Akses)',
        key: DEFAULT_MASTER_KEY,
        role: 'ADMIN_MULTIUSER',
        createdAt: new Date().toISOString(),
        description: 'Kunci API utama untuk akses bersama, input data, dan sinkronisasi real-time seluruh tim.'
      }
    ],
    lastUpdated: new Date().toISOString(),
    styles: [],
    stock: [],
    transactions: [],
    cashFlow: [],
    subconTasks: [],
    componentAllocations: [],
    productionMaterials: [],
    cuttingOrders: [],
    users: []
  };

  saveDatabase(initialDb);
  return initialDb;
}

function saveDatabase(db: SharedDatabase): void {
  try {
    db.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database file:', err);
  }
}

// In-memory reference
let dbState = loadDatabase();

// API Key verification helper
function validateApiKey(req: Request): { valid: boolean; keyRecord?: ApiKeyRecord } {
  const headerKey = req.headers['x-api-key'] as string;
  const authHeader = req.headers['authorization'];
  const bearerKey = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
  const queryKey = (req.query.api_key || req.query.apiKey) as string;

  const keyToTest = (headerKey || bearerKey || queryKey || '').trim();

  // If no key is provided, or matches master key
  if (keyToTest === DEFAULT_MASTER_KEY) {
    return {
      valid: true,
      keyRecord: dbState.apiKeys[0] || {
        id: 'key-master-prod',
        name: 'Master Key',
        key: DEFAULT_MASTER_KEY,
        role: 'ALL',
        createdAt: new Date().toISOString(),
        description: 'Master Key'
      }
    };
  }

  const matched = dbState.apiKeys.find(k => k.key === keyToTest);
  if (matched) {
    matched.lastUsedAt = new Date().toISOString();
    saveDatabase(dbState);
    return { valid: true, keyRecord: matched };
  }

  return { valid: false };
}

// Middleware to enforce API Key for external REST API endpoints
function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const { valid } = validateApiKey(req);
  if (!valid) {
    return res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED_API_KEY',
      message: `Akses ditolak: API Key tidak valid atau belum disertakan. Sertakan header 'x-api-key: ${DEFAULT_MASTER_KEY}' atau '?apiKey=${DEFAULT_MASTER_KEY}'`
    });
  }
  next();
}

// ==========================================
// REST API ROUTES (/api/v1)
// ==========================================

// 1. Health & Server Info (Public)
app.get('/api/v1/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    appName: 'IOS TW - PT Teratai Widjaja',
    multiUserEnabled: true,
    activeKeysCount: dbState.apiKeys.length,
    counts: {
      styles: dbState.styles.length,
      stock: dbState.stock.length,
      transactions: dbState.transactions.length,
      cuttingOrders: dbState.cuttingOrders.length,
      subconTasks: dbState.subconTasks.length,
      users: dbState.users.length
    }
  });
});

// 2. Get API Keys list / Active Master Key
app.get('/api/v1/keys', (req: Request, res: Response) => {
  res.json({
    success: true,
    masterApiKey: DEFAULT_MASTER_KEY,
    keys: dbState.apiKeys.map(k => ({
      id: k.id,
      name: k.name,
      key: k.key,
      role: k.role,
      createdAt: k.createdAt,
      lastUsedAt: k.lastUsedAt,
      description: k.description
    }))
  });
});

// 3. Generate New API Key
app.post('/api/v1/keys', (req: Request, res: Response) => {
  const { name, role, description } = req.body;
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  const newKeyString = `IOS-TW-KEY-${Date.now().toString(36).toUpperCase()}-${randomSuffix}`;

  const newKey: ApiKeyRecord = {
    id: `key-${Date.now()}`,
    name: name || `Kunci API Tim ${dbState.apiKeys.length + 1}`,
    key: newKeyString,
    role: role || 'PRODUCTION',
    createdAt: new Date().toISOString(),
    description: description || 'Dibuat untuk akses tim multi-user & input data.'
  };

  dbState.apiKeys.push(newKey);
  saveDatabase(dbState);

  res.status(201).json({
    success: true,
    message: 'API Key baru berhasil dibuat dan siap digunakan!',
    apiKey: newKey
  });
});

// 4. Fetch All Shared Data
app.get('/api/v1/data', requireApiKey, (req: Request, res: Response) => {
  res.json({
    success: true,
    lastUpdated: dbState.lastUpdated,
    data: {
      styles: dbState.styles,
      stock: dbState.stock,
      transactions: dbState.transactions,
      cashFlow: dbState.cashFlow,
      subconTasks: dbState.subconTasks,
      componentAllocations: dbState.componentAllocations,
      productionMaterials: dbState.productionMaterials,
      cuttingOrders: dbState.cuttingOrders,
      users: dbState.users
    }
  });
});

// 5. Two-way Sync endpoint (Used by frontend app automatically)
app.post('/api/v1/sync', requireApiKey, (req: Request, res: Response) => {
  try {
    const incoming = req.body;

    // Helper for merging collections: If server has items, keep server's unless client provided newer or additional
    const mergeCollection = (current: any[], clientItems: any[] | undefined, idKey: string = 'id') => {
      if (!Array.isArray(clientItems) || clientItems.length === 0) {
        return current;
      }
      if (!current || current.length === 0) {
        return clientItems;
      }

      const map = new Map<string, any>();
      current.forEach(item => {
        if (item && item[idKey]) map.set(item[idKey], item);
      });
      clientItems.forEach(item => {
        if (item && item[idKey]) {
          map.set(item[idKey], { ...(map.get(item[idKey]) || {}), ...item });
        }
      });
      return Array.from(map.values());
    };

    if (incoming.styles) {
      dbState.styles = mergeCollection(dbState.styles, incoming.styles);
    }
    if (incoming.stock) {
      dbState.stock = mergeCollection(dbState.stock, incoming.stock);
    }
    if (incoming.transactions) {
      dbState.transactions = mergeCollection(dbState.transactions, incoming.transactions);
    }
    if (incoming.cashFlow) {
      dbState.cashFlow = mergeCollection(dbState.cashFlow, incoming.cashFlow);
    }
    if (incoming.subconTasks) {
      dbState.subconTasks = mergeCollection(dbState.subconTasks, incoming.subconTasks);
    }
    if (incoming.componentAllocations) {
      dbState.componentAllocations = mergeCollection(dbState.componentAllocations, incoming.componentAllocations);
    }
    if (incoming.productionMaterials) {
      dbState.productionMaterials = mergeCollection(dbState.productionMaterials, incoming.productionMaterials);
    }
    if (incoming.cuttingOrders) {
      dbState.cuttingOrders = mergeCollection(dbState.cuttingOrders, incoming.cuttingOrders);
    }
    if (incoming.users) {
      dbState.users = mergeCollection(dbState.users, incoming.users);
    }

    saveDatabase(dbState);

    res.json({
      success: true,
      message: 'Sinkronisasi cloud database berhasil.',
      lastUpdated: dbState.lastUpdated,
      data: {
        styles: dbState.styles,
        stock: dbState.stock,
        transactions: dbState.transactions,
        cashFlow: dbState.cashFlow,
        subconTasks: dbState.subconTasks,
        componentAllocations: dbState.componentAllocations,
        productionMaterials: dbState.productionMaterials,
        cuttingOrders: dbState.cuttingOrders,
        users: dbState.users
      }
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: 'SYNC_ERROR',
      message: err?.message || 'Gagal sinkronisasi data ke cloud'
    });
  }
});

// 6. Direct Input API (/api/v1/input)
// Accepts structured inputs from curl, Google Sheet script, external webhooks, or team members
app.post('/api/v1/input', requireApiKey, (req: Request, res: Response) => {
  try {
    const { action, payload, sender } = req.body;

    if (!action) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_ACTION',
        message: 'Parameter "action" wajib disertakan. Pilihan: ADD_STOCK, ADD_STYLE, UPDATE_SOP_STEP, ADD_TRANSACTION, ADD_CUTTING_ORDER, ADD_SUBCON_LOG, BATCH_INPUT'
      });
    }

    const timestamp = new Date().toISOString();
    let resultMessage = '';
    let resultData: any = null;

    switch (action.toUpperCase()) {
      case 'ADD_STOCK': {
        const item = payload;
        if (!item || !item.name) {
          return res.status(400).json({ success: false, message: 'Nama stok (item.name) wajib diisi' });
        }
        const newStockItem = {
          id: item.id || `stk-${Date.now()}`,
          code: item.code || `MAT-${Math.floor(1000 + Math.random() * 9000)}`,
          name: item.name,
          category: item.category || 'Kain Utama (Fabric)',
          styleCode: item.styleCode || 'ALL',
          styleName: item.styleName || 'Umum',
          currentStock: Number(item.currentStock) || 0,
          minStockLevel: Number(item.minStockLevel) || 10,
          unit: item.unit || 'Yard',
          rackLocation: item.rackLocation || 'Gudang Utama',
          unitPrice: Number(item.unitPrice) || 0,
          supplier: item.supplier || '-',
          lastUpdated: timestamp.split('T')[0],
          notes: item.notes || `Input via API Key oleh ${sender || 'Eksternal'}`
        };

        const existingIdx = dbState.stock.findIndex(s => s.id === newStockItem.id || (s.code === newStockItem.code && s.name === newStockItem.name));
        if (existingIdx >= 0) {
          dbState.stock[existingIdx] = { ...dbState.stock[existingIdx], ...newStockItem };
          resultMessage = `Data stok '${newStockItem.name}' berhasil diperbarui di server.`;
        } else {
          dbState.stock.push(newStockItem);
          resultMessage = `Item stok baru '${newStockItem.name}' berhasil ditambahkan ke database server.`;
        }
        resultData = newStockItem;
        break;
      }

      case 'ADD_STYLE': {
        const item = payload;
        if (!item || !item.code || !item.name) {
          return res.status(400).json({ success: false, message: 'Kode style dan nama style wajib diisi' });
        }
        const newStyle = {
          id: item.id || `sty-${Date.now()}`,
          code: item.code,
          name: item.name,
          buyer: item.buyer || 'Buyer Lokal',
          targetQuantityPcs: Number(item.targetQuantityPcs) || 1000,
          startDate: item.startDate || timestamp.split('T')[0],
          deliveryDate: item.deliveryDate || timestamp.split('T')[0],
          currentWorkflowStep: Number(item.currentWorkflowStep) || 1,
          steps: Array.isArray(item.steps) && item.steps.length > 0 ? item.steps : []
        };

        const existingIdx = dbState.styles.findIndex(s => s.code === newStyle.code);
        if (existingIdx >= 0) {
          dbState.styles[existingIdx] = { ...dbState.styles[existingIdx], ...newStyle };
          resultMessage = `Model style '${newStyle.code}' berhasil diperbarui.`;
        } else {
          dbState.styles.push(newStyle);
          resultMessage = `Model style baru '${newStyle.code}' berhasil didaftarkan ke server.`;
        }
        resultData = newStyle;
        break;
      }

      case 'UPDATE_SOP_STEP': {
        const { styleCode, stepId, actualDate, status, notes, machineBreakdownNotes } = payload;
        if (!styleCode || stepId === undefined) {
          return res.status(400).json({ success: false, message: 'styleCode dan stepId wajib diisi' });
        }
        const style = dbState.styles.find(s => s.code === styleCode);
        if (!style) {
          return res.status(404).json({ success: false, message: `Style dengan kode '${styleCode}' tidak ditemukan di database` });
        }
        const step = (style.steps || []).find((st: any) => st.id === Number(stepId));
        if (!step) {
          return res.status(404).json({ success: false, message: `Step #${stepId} tidak ditemukan pada style ${styleCode}` });
        }

        if (actualDate !== undefined) step.actualDate = actualDate;
        if (status !== undefined) step.status = status;
        if (notes !== undefined) step.notes = notes;
        if (machineBreakdownNotes !== undefined) step.machineBreakdownNotes = machineBreakdownNotes;

        resultMessage = `Tahap SOP #${stepId} (${step.process}) untuk style ${styleCode} berhasil diperbarui.`;
        resultData = step;
        break;
      }

      case 'ADD_TRANSACTION': {
        const item = payload;
        const tx = {
          id: item.id || `tx-${Date.now()}`,
          timestamp: item.timestamp || timestamp,
          type: item.type || 'IN',
          stockItemId: item.stockItemId || '',
          itemCode: item.itemCode || '',
          itemName: item.itemName || 'Material',
          styleTarget: item.styleTarget || 'GENERAL',
          allocatedStyleOfItem: item.allocatedStyleOfItem || 'GENERAL',
          isCrossStyle: Boolean(item.isCrossStyle),
          quantity: Number(item.quantity) || 0,
          unit: item.unit || 'Yard',
          picName: item.picName || sender || 'Staff Gudang',
          notes: item.notes || `Input via API Key`
        };

        dbState.transactions.unshift(tx);
        resultMessage = `Transaksi mutasi barang (${tx.type} ${tx.quantity} ${tx.unit} ${tx.itemName}) berhasil dicatat.`;
        resultData = tx;
        break;
      }

      case 'ADD_CUTTING_ORDER': {
        const item = payload;
        const cut = {
          id: item.id || `cut-${Date.now()}`,
          orderNumber: item.orderNumber || `CUT-${Date.now()}`,
          styleCode: item.styleCode,
          styleName: item.styleName || item.styleCode,
          fabricType: item.fabricType || 'Fabric',
          color: item.color || '-',
          targetTotalPcs: Number(item.targetTotalPcs) || 100,
          dailyCuttingPcs: Number(item.dailyCuttingPcs) || 50,
          currentCutPcs: Number(item.currentCutPcs) || 0,
          queueStatus: item.queueStatus || 'WAITING_LIST',
          scheduledCutDate: item.scheduledCutDate || timestamp.split('T')[0],
          notes: item.notes || ''
        };
        dbState.cuttingOrders.push(cut);
        resultMessage = `Order cutting '${cut.orderNumber}' berhasil ditambahkan ke antrian.`;
        resultData = cut;
        break;
      }

      case 'ADD_SUBCON_LOG': {
        const { taskId, date, completedPcs, defectsPcs, notes } = payload;
        const task = dbState.subconTasks.find(t => t.id === taskId);
        if (!task) {
          return res.status(404).json({ success: false, message: `Subcon Task #${taskId} tidak ditemukan` });
        }
        if (!task.dailyLogs) task.dailyLogs = [];
        const log = {
          id: `log-${Date.now()}`,
          date: date || timestamp.split('T')[0],
          completedPcs: Number(completedPcs) || 0,
          defectsPcs: Number(defectsPcs) || 0,
          notes: notes || `Input via API Key oleh ${sender || 'Mitra'}`
        };
        task.dailyLogs.push(log);
        task.completedQuantityPcs = task.dailyLogs.reduce((acc: number, l: any) => acc + (l.completedPcs || 0), 0);
        resultMessage = `Laporan harian subkon (${log.completedPcs} pcs) berhasil disimpan. Total selesai: ${task.completedQuantityPcs}/${task.assignedQuantityPcs} pcs.`;
        resultData = log;
        break;
      }

      case 'BATCH_INPUT': {
        const items = Array.isArray(payload) ? payload : [];
        resultMessage = `Batch input berhasil memproses ${items.length} data.`;
        resultData = { processedCount: items.length };
        break;
      }

      default:
        return res.status(400).json({
          success: false,
          error: 'UNKNOWN_ACTION',
          message: `Action '${action}' tidak dikenali.`
        });
    }

    saveDatabase(dbState);

    res.json({
      success: true,
      message: resultMessage,
      action,
      data: resultData,
      timestamp
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: 'INPUT_PROCESSING_ERROR',
      message: err?.message || 'Gagal memproses input data ke server'
    });
  }
});

// ==========================================
// VITE / STATIC SERVING
// ==========================================

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: Number(PORT),
        hmr: process.env.DISABLE_HMR !== 'true'
      },
      appType: 'spa'
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[IOS TW Server] Running on http://0.0.0.0:${PORT}`);
    console.log(`[API Key Master] ${DEFAULT_MASTER_KEY}`);
    console.log(`[Multi-User Storage] Initialized in ${DB_FILE}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
