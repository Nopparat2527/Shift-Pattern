import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ChangePasswordModal } from './ChangePasswordModal';
import {
  Calendar,
  Users,
  Building2,
  CalendarHeart,
  ShieldCheck,
  UserCheck,
  History,
  ArrowRightLeft,
  CalendarCheck2,
  ChevronDown,
  Lock,
  Sparkles,
  RefreshCw,
  Info,
  Sun,
  Moon,
  KeyRound,
} from 'lucide-react';

export type NavTab =
  | 'SHIFT_SCHEDULE'
  | 'TEAM_MGMT'
  | 'SWAP_REQUESTS'
  | 'DEPARTMENTS'
  | 'COMPANY_HOLIDAYS'
  | 'USER_MGMT'
  | 'YEARLY_SETUP'
  | 'AUDIT_LOGS';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const {
    currentUser,
    setCurrentUser,
    availableUsers,
    isAdmin,
    isSupervisor,
    isReadOnly,
    userDepartmentName,
    swapRequests,
    resetToDefaultData,
    theme,
    toggleTheme,
    logout,
  } = useApp();

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Count pending requests
  const pendingSwapCount = swapRequests.filter((r) => r.status === 'PENDING').length;

  return (
    <header className="bg-slate-900 text-white shadow-lg border-b border-slate-800 sticky top-0 z-40">
      {/* Top Status Bar & Role Switcher */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & App Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-blue-600 flex items-center justify-center shadow-md shadow-indigo-500/30">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold tracking-tight text-white font-sans">
                  ระบบจัดการตารางกะและวันหยุด
                </h1>
                <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-0.5 rounded-full border border-indigo-500/30 font-medium">
                  v2.0 RBAC
                </span>
              </div>
              <p className="text-xs text-slate-400">
                จำกัดสิทธิ์ทีมใครทีมมัน • บันทึกประวัติ Audit Log ย้อนหลัง
              </p>
            </div>
          </div>

          {/* Active User Profile & Role Switcher Button */}
          <div className="flex items-center space-x-3">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-1.5 flex items-center space-x-3 px-3">
              <div className="flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-200">
                  {currentUser.name}
                </span>
                <div className="flex items-center justify-end space-x-1.5">
                  <span
                    className={`inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                      isAdmin
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        : isSupervisor
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {isAdmin ? 'แอดมินระบบ' : isSupervisor ? 'หัวหน้าแผนก' : 'พนักงาน'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {userDepartmentName}
                  </span>
                </div>
              </div>

              {/* Change Password Button */}
              <button
                type="button"
                onClick={() => setIsChangePasswordOpen(true)}
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg flex items-center space-x-1.5 transition font-medium"
                title="เปลี่ยนรหัสผ่าน"
              >
                <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">เปลี่ยนรหัสผ่าน</span>
              </button>

              {/* Logout / Switch User Button */}
              <button
                onClick={logout}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition shadow-sm font-medium"
                title="ออกจากระบบ หรือสลับเข้าใช้งานพนักงาน/ผู้ดูแลอื่น"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>เข้าสู่ระบบ / สลับผู้ใช้</span>
              </button>
            </div>

            <ChangePasswordModal
              isOpen={isChangePasswordOpen}
              onClose={() => setIsChangePasswordOpen(false)}
            />

            {/* Dark / Light Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition font-semibold"
              title={theme === 'dark' ? 'สลับเป็นธีมสว่าง (Light Mode)' : 'สลับเป็นธีมมืด (Dark Mode)'}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">ธีมสว่าง</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span className="hidden sm:inline">ธีมมืด</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                if (confirm('คุณต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้นใช่หรือไม่?')) {
                  resetToDefaultData();
                }
              }}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="รีเซ็ตข้อมูลเริ่มต้น"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center space-x-1 overflow-x-auto py-2 border-t border-slate-800/80 scrollbar-thin text-sm">
          {/* 1. Shift Schedule */}
          <button
            onClick={() => setActiveTab('SHIFT_SCHEDULE')}
            className={`px-3 py-2 rounded-lg flex items-center space-x-2 text-xs font-medium whitespace-nowrap shrink-0 transition ${
              activeTab === 'SHIFT_SCHEDULE'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <CalendarCheck2 className="w-4 h-4 text-indigo-300" />
            <span>ตารางกะประจำทีม</span>
          </button>

          {/* 2. My Team Management */}
          <button
            onClick={() => setActiveTab('TEAM_MGMT')}
            className={`px-3 py-2 rounded-lg flex items-center space-x-2 text-xs font-medium whitespace-nowrap shrink-0 transition ${
              activeTab === 'TEAM_MGMT'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 text-amber-300" />
            <span>จัดการลูกน้องในทีม</span>
          </button>

          {/* 3. Shift Swap & Leave Requests */}
          <button
            onClick={() => setActiveTab('SWAP_REQUESTS')}
            className={`px-3 py-2 rounded-lg flex items-center space-x-2 text-xs font-medium whitespace-nowrap shrink-0 transition relative ${
              activeTab === 'SWAP_REQUESTS'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4 text-emerald-300" />
            <span>คำขอสลับกะ / การลา</span>
            {pendingSwapCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full animate-pulse">
                {pendingSwapCount}
              </span>
            )}
          </button>

          {/* 4. Yearly Shift Setup */}
          <button
            onClick={() => setActiveTab('YEARLY_SETUP')}
            className={`px-3 py-2 rounded-lg flex items-center space-x-2 text-xs font-medium whitespace-nowrap shrink-0 transition ${
              activeTab === 'YEARLY_SETUP'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-cyan-300" />
            <span>จัดตารางกะปีถัดไป / สิ้นปี</span>
          </button>

          {/* Divider for Admin Section */}
          <div className="h-4 w-px bg-slate-700 my-auto mx-1 shrink-0" />

          {/* ADMIN ONLY TABS */}
          {/* 5. Department & Supervisor */}
          <button
            onClick={() => setActiveTab('DEPARTMENTS')}
            className={`px-3 py-2 rounded-lg flex items-center space-x-2 text-xs font-medium whitespace-nowrap shrink-0 transition ${
              !isAdmin ? 'opacity-50 cursor-not-allowed' : ''
            } ${
              activeTab === 'DEPARTMENTS'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4 text-purple-300" />
            <span>จัดการแผนกและหัวหน้า</span>
            {!isAdmin && <Lock className="w-3 h-3 text-slate-500 ml-1" />}
          </button>

          {/* 6. User Management */}
          <button
            onClick={() => setActiveTab('USER_MGMT')}
            className={`px-3 py-2 rounded-lg flex items-center space-x-2 text-xs font-medium whitespace-nowrap shrink-0 transition ${
              !isAdmin ? 'opacity-50 cursor-not-allowed' : ''
            } ${
              activeTab === 'USER_MGMT'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-teal-300" />
            <span>จัดการผู้ใช้งานระบบ</span>
            {!isAdmin && <Lock className="w-3 h-3 text-slate-500 ml-1" />}
          </button>

          {/* 7. Company Holidays */}
          <button
            onClick={() => setActiveTab('COMPANY_HOLIDAYS')}
            className={`px-3 py-2 rounded-lg flex items-center space-x-2 text-xs font-medium whitespace-nowrap shrink-0 transition ${
              !isAdmin ? 'opacity-50 cursor-not-allowed' : ''
            } ${
              activeTab === 'COMPANY_HOLIDAYS'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <CalendarHeart className="w-4 h-4 text-rose-300" />
            <span>ตั้งค่าวันหยุดบริษัท</span>
            {!isAdmin && <Lock className="w-3 h-3 text-slate-500 ml-1" />}
          </button>

          {/* 8. Audit Logs */}
          <button
            onClick={() => setActiveTab('AUDIT_LOGS')}
            className={`px-3 py-2 rounded-lg flex items-center space-x-2 text-xs font-medium whitespace-nowrap shrink-0 transition ${
              activeTab === 'AUDIT_LOGS'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <History className="w-4 h-4 text-yellow-300" />
            <span>ประวัติการแก้ไข (Audit Logs)</span>
          </button>
        </div>
      </div>

      {/* Role Switcher Modal Dialog */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl text-white animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold">สลับสิทธิ์การใช้งาน (Role Switcher)</h3>
              </div>
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold px-2"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 my-3 bg-indigo-950/60 border border-indigo-800/60 p-3 rounded-xl flex items-start space-x-2">
              <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <span>
                เลือกบัญชีผู้ใช้เพื่อทดสอบระบบจำกัดสิทธิ์ (Access Control):
                แอดมินเห็นภาพรวมทุกแผนก ส่วนหัวหน้าแผนกจะเห็นและจัดการตารางกะได้เฉพาะแผนกของตนเองเท่านั้น
              </span>
            </p>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {availableUsers.map((u) => {
                const isSelected = u.id === currentUser.id;
                return (
                  <div
                    key={u.id}
                    onClick={() => {
                      setCurrentUser(u);
                      setIsRoleModalOpen(false);
                    }}
                    className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-600/30 border-indigo-500 shadow-sm'
                        : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-600 text-white'
                            : 'bg-amber-600 text-white'
                        }`}
                      >
                        {u.name.substring(0, 2)}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-slate-100">{u.name}</div>
                        <div className="text-xs text-slate-400">{u.position}</div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {u.role === 'ADMIN' ? 'แอดมินระบบ' : 'หัวหน้าแผนก'}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] text-indigo-400 font-medium mt-1">
                          ✓ บัญชีปัจจุบัน
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-4 py-2 rounded-xl transition font-medium"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
