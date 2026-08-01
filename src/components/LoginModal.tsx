import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  UserCheck,
  Search,
  ShieldCheck,
  Building2,
  Users,
  Sun,
  Moon,
  Sparkles,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Eye,
  Briefcase,
} from 'lucide-react';

export const LoginModal: React.FC = () => {
  const {
    employees,
    departments,
    users,
    theme,
    toggleTheme,
    loginWithIdentifier,
    loginAsUser,
    loginAsEmployee,
  } = useApp();

  const [identifierInput, setIdentifierInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'EMPLOYEE' | 'ADMIN_SUP'>('EMPLOYEE');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');

  // Filter candidates dynamically based on identifier input
  const searchResults = useMemo(() => {
    const query = identifierInput.trim().toLowerCase();
    if (!query) return { matchedEmps: [], matchedUsers: [] };

    // Filter matching employees
    const matchedEmps = employees.filter(
      (emp) =>
        emp.employeeCode.toLowerCase().includes(query) ||
        emp.name.toLowerCase().includes(query) ||
        emp.codeName.toLowerCase().includes(query)
    );

    // Filter matching admin/supervisors
    const matchedUsers = users.filter(
      (u) =>
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.role.toLowerCase().includes(query)
    );

    return { matchedEmps, matchedUsers };
  }, [identifierInput, employees, users]);

  const handleIdentifierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifierInput.trim()) {
      setErrorMessage('กรุณาระบุรหัสพนักงาน, ชื่อ หรือชื่อเล่น');
      return;
    }

    const res = loginWithIdentifier(identifierInput);
    if (!res.success) {
      setErrorMessage(res.message);
    } else {
      setErrorMessage('');
    }
  };

  const handleSelectEmployee = (empId: string) => {
    loginAsEmployee(empId);
  };

  const handleSelectUser = (userId: string) => {
    loginAsUser(userId);
  };

  // Filter employees for roster list
  const filteredRoster = useMemo(() => {
    return employees.filter((emp) => {
      if (selectedDeptFilter === 'ALL') return true;
      return emp.departmentId === selectedDeptFilter;
    });
  }, [employees, selectedDeptFilter]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 transition-all">
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 relative border-b border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-indigo-500/20 border border-indigo-400/30 rounded-2xl">
                <ShieldCheck className="w-8 h-8 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight">เข้าสู่ระบบ / Authentication</h1>
                <p className="text-xs text-slate-300">
                  ระบบบริหารจัดการตารางกะและวันหยุดประจำปี
                </p>
              </div>
            </div>

            {/* Theme Switcher on Login Screen */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition flex items-center space-x-1.5 text-xs font-semibold"
              title={theme === 'dark' ? 'เปลี่ยนเป็นธีมสว่าง' : 'เปลี่ยนเป็นธีมมืด'}
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
          </div>

          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 text-xs text-indigo-200 flex items-start space-x-2">
            <Lock className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">เงื่อนไขการเข้าถึงระบบ:</span> พนักงานทั่วไปเข้าดูได้เฉพาะตารางกะของแผนกตนเองในโหมดอ่านอย่างเดียว (ไม่สามารถแก้ไขได้) หัวหน้างานและผู้ดูแลระบบสามารถจัดการกะตามสิทธิ์ที่ได้รับ
            </div>
          </div>
        </div>

        {/* Login Form Body */}
        <div className="p-6 space-y-6">
          {/* Quick Universal Input Box */}
          <form onSubmit={handleIdentifierSubmit} className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              ระบุชื่อ-นามสกุล หรือชื่อเล่น เพื่อเข้าสู่ระบบ
            </label>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-indigo-500" />
              </div>
              <input
                type="text"
                value={identifierInput}
                onChange={(e) => {
                  setIdentifierInput(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="พิมพ์ชื่อเล่น เช่น Boy, Kai หรือชื่อ Siwapong..."
                className="w-full pl-11 pr-24 py-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 bottom-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 transition shadow-sm"
              >
                <span>เข้าสู่ระบบ</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-600 dark:text-rose-300 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Dynamic Search Candidates Dropdown Preview */}
            {searchResults && (searchResults.matchedEmps.length > 0 || searchResults.matchedUsers.length > 0) && (
              <div className="bg-slate-50 dark:bg-slate-800/90 rounded-2xl border border-indigo-200 dark:border-indigo-900 p-3 shadow-lg space-y-2 max-h-56 overflow-y-auto">
                <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                  พบข้อมูลที่ตรงกัน ({searchResults.matchedEmps.length + searchResults.matchedUsers.length} รายการ):
                </p>

                {searchResults.matchedEmps.map((emp) => {
                  const dept = departments.find((d) => d.id === emp.departmentId);
                  return (
                    <div
                      key={emp.id}
                      onClick={() => handleSelectEmployee(emp.id)}
                      className="p-2.5 bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-slate-200 dark:border-slate-700/80 rounded-xl cursor-pointer transition flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0">
                          {emp.codeName || emp.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                            {emp.name} ({emp.codeName})
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium">
                            แผนก {dept?.name || emp.departmentId}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-lg flex items-center space-x-1">
                        <Eye className="w-3 h-3" />
                        <span>คลิกเพื่อเข้าสู่ระบบ</span>
                      </span>
                    </div>
                  );
                })}

                {searchResults.matchedUsers.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => handleSelectUser(u.id)}
                    className="p-2.5 bg-white dark:bg-slate-900 hover:bg-purple-50 dark:hover:bg-purple-950/50 border border-slate-200 dark:border-slate-700/80 rounded-xl cursor-pointer transition flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-xs shrink-0">
                        {u.role === 'ADMIN' ? 'ADM' : 'SUP'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                          {u.name}
                        </div>
                        <div className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                          สิทธิ์: {u.role === 'ADMIN' ? 'ผู้ดูแลระบบ (Admin)' : 'หัวหน้างาน (Supervisor)'}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-lg">
                      คลิกเพื่อเข้าใช้
                    </span>
                  </div>
                ))}
              </div>
            )}
          </form>
        </div>

        {/* Footer Info */}
        <div className="bg-slate-100 dark:bg-slate-950 px-6 py-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
          <span className="flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>พนักงานสามารถพิมพ์ชื่อ หรือชื่อเล่น เพื่อเข้าสู่ระบบดูตารางกะแผนกตนเองได้ทันที</span>
          </span>
          <span className="font-mono text-[10px]">v1.0 Security Mode</span>
        </div>
      </div>
    </div>
  );
};
