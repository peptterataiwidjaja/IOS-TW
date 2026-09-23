/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { LoginScreen } from './components/LoginScreen';
import { LoginModal } from './components/LoginModal';
import { StockIssueModal } from './components/StockIssueModal';
import { NewStyleModal } from './components/NewStyleModal';
import { UserAccessManagerModal } from './components/UserAccessManagerModal';
import { GoogleScriptSyncModal } from './components/GoogleScriptSyncModal';
import { PEWorkflowTracker } from './components/PEWorkflowTracker';
import { WarehouseStockManager } from './components/WarehouseStockManager';
import { PPICPlanningView } from './components/PPICPlanningView';
import { TransactionHistoryView } from './components/TransactionHistoryView';
import { SpreadsheetView } from './components/SpreadsheetView';
import { SubcontractorManager } from './components/SubcontractorManager';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { UserAccessManagerView } from './components/UserAccessManagerView';
import { PrintPDFModal } from './components/PrintPDFModal';
import { 
  Building2, 
  ShieldCheck, 
  Cpu, 
  Warehouse, 
  Layers, 
  Truck, 
  FileSpreadsheet, 
  BarChart3,
  FileText,
  UserCheck,
  Lock,
  PlusCircle,
  Settings2
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const { 
    isAuthenticated,
    activeTab, 
    setActiveTab,
    currentUser, 
    setIsLoginModalOpen, 
    setIsNewStyleModalOpen,
    setIsUserAccessModalOpen,
    isIssueStockModalOpen,
    setIsIssueStockModalOpen,
    styles, 
    currentStyle,
    isTabAllowed,
    isPrintModalOpen,
    setIsPrintModalOpen
  } = useApp();

  // If not logged in, present the initial username & password login screen
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // Check if current tab is permitted for active user
  const tabPermitted = isTabAllowed(activeTab);

  const renderActiveModule = () => {
    if (!tabPermitted) {
      return (
        <div className="bg-white rounded-2xl p-10 border border-slate-200 shadow-sm text-center max-w-lg mx-auto my-12 space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-black text-slate-900">Akses Menu Dibatasi</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Akun Anda (<strong>{currentUser.name}</strong> - <em>{currentUser.role}</em>) belum diberikan hak akses untuk membuka bar menu ini oleh <strong>Production Engineer (PE)</strong>.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => setActiveTab('pe-workflow')}
              className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs cursor-pointer"
            >
              Kembali ke Alur SOP
            </button>
            {currentUser.role === 'PE' && (
              <button
                onClick={() => setIsUserAccessModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Settings2 className="w-4 h-4" />
                <span>Atur Hak Akses</span>
              </button>
            )}
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'pe-workflow':
        return <PEWorkflowTracker />;
      case 'warehouse-stock':
        return <WarehouseStockManager />;
      case 'ppic-planning':
        return <PPICPlanningView />;
      case 'transactions':
        return <TransactionHistoryView />;
      case 'subcon':
        return <SubcontractorManager />;
      case 'spreadsheet':
        return <SpreadsheetView />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'user-access':
        return <UserAccessManagerView />;
      default:
        return <PEWorkflowTracker />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased">
      
      {/* Top Main Navigation Bar (White with Red & Blue Accents) */}
      <div className="print:hidden no-print">
        <Navbar />
      </div>

      {/* Sub Context Ribbon (Crisp White & Light Blue) */}
      <div className="bg-white text-slate-700 border-b border-slate-200 px-4 py-2 text-xs shadow-xs print:hidden no-print">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            <span className="text-slate-400 font-medium">Sistem Operasional:</span>
            <span className="text-blue-950 font-black tracking-wide">PT Teratai Widjaja Garment Industry</span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="text-blue-800 hidden sm:inline font-mono font-bold">
              Model Aktif: {currentStyle.code} — {currentStyle.name}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="text-slate-400">Login Sebagai:</span>
              <span className={`px-2 py-0.5 rounded font-bold border flex items-center gap-1 ${
                currentUser.role === 'PE'
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : 'bg-blue-50 text-blue-800 border-blue-200'
              }`}>
                <UserCheck className="w-3 h-3" />
                {currentUser.name} ({currentUser.role})
              </span>
            </div>

            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="text-[11px] font-bold text-blue-700 hover:text-blue-900 underline hover:no-underline transition-colors cursor-pointer"
            >
              Ganti Akun &rarr;
            </button>
          </div>

        </div>
      </div>

      {/* Main Content Viewport */}
      <main className={`flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 print:p-0 print:m-0 print:max-w-none print:w-full ${isPrintModalOpen ? 'print:hidden' : ''}`}>
        {renderActiveModule()}
      </main>

      {/* Global Modals */}
      <div className="print:hidden no-print">
        <NewStyleModal />
        <UserAccessManagerModal />
        <GoogleScriptSyncModal />
        <StockIssueModal 
          isOpen={isIssueStockModalOpen}
          onClose={() => setIsIssueStockModalOpen(false)}
        />
      </div>

      {/* Print PDF Modal (Active both in preview and browser print flow) */}
      <PrintPDFModal 
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
      />

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
