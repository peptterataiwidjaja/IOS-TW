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
import { NewStyleInputView } from './components/NewStyleInputView';
import { WarehouseStockManager } from './components/WarehouseStockManager';
import { PPICPlanningView } from './components/PPICPlanningView';
import { TransactionHistoryView } from './components/TransactionHistoryView';
import { SpreadsheetView } from './components/SpreadsheetView';
import { SubcontractorManager } from './components/SubcontractorManager';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { UserAccessManagerView } from './components/UserAccessManagerView';
import { PrintPDFModal } from './components/PrintPDFModal';
import { 
  Lock,
  Settings2
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const { 
    isAuthenticated,
    activeTab, 
    setActiveTab,
    currentUser, 
    setIsUserAccessModalOpen,
    isIssueStockModalOpen,
    setIsIssueStockModalOpen,
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
              onClick={() => setActiveTab('new-style')}
              className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs cursor-pointer"
            >
              Kembali ke Menu Utama
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
      case 'new-style':
        return <NewStyleInputView />;
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
      
      {/* Top Main Navigation Bar */}
      <div className="print:hidden no-print">
        <Navbar />
      </div>

      {/* Main Content Viewport */}
      <main className={`flex-1 max-w-7xl w-full mx-auto p-4 sm:p-5 space-y-5 print:p-0 print:m-0 print:max-w-none print:w-full ${isPrintModalOpen ? 'print:hidden' : ''}`}>
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
