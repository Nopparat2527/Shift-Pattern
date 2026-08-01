import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar, NavTab } from './components/Navbar';
import { ShiftScheduler } from './components/Supervisor/ShiftScheduler';
import { TeamManager } from './components/Supervisor/TeamManager';
import { ShiftSwapManager } from './components/Supervisor/ShiftSwapManager';
import { DepartmentManager } from './components/Admin/DepartmentManager';
import { UserManager } from './components/Admin/UserManager';
import { HolidayManager } from './components/Admin/HolidayManager';
import { YearlyShiftSetup } from './components/Admin/YearlyShiftSetup';
import { AuditLogViewer } from './components/AuditLogViewer';
import { LoginModal } from './components/LoginModal';

function MainApp() {
  const { isLoggedIn } = useApp();
  const [activeTab, setActiveTab] = useState<NavTab>('SHIFT_SCHEDULE');

  if (!isLoggedIn) {
    return <LoginModal />;
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'SHIFT_SCHEDULE' && <ShiftScheduler />}
        {activeTab === 'TEAM_MGMT' && <TeamManager />}
        {activeTab === 'SWAP_REQUESTS' && <ShiftSwapManager />}
        {activeTab === 'DEPARTMENTS' && <DepartmentManager />}
        {activeTab === 'USER_MGMT' && <UserManager />}
        {activeTab === 'COMPANY_HOLIDAYS' && <HolidayManager />}
        {activeTab === 'YEARLY_SETUP' && <YearlyShiftSetup />}
        {activeTab === 'AUDIT_LOGS' && <AuditLogViewer />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 text-center text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ระบบจัดการตารางกะและวันหยุด • บริษัทจำกัด</span>
          <span className="font-mono text-[11px]">
            Data Security & Data Privacy Isolated • Recorded Audit History
          </span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
