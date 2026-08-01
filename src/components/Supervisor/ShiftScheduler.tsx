import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { OptionManagerModal } from './OptionManagerModal';
import { ShiftTypeCode, Employee } from '../../types';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  Copy,
  Wand2,
  Lock,
  Search,
  CheckCircle2,
  Info,
  CalendarDays,
  UserPlus,
  ArrowRightLeft,
  ShieldAlert,
  Layers,
  Edit3,
  Sliders,
  Eye,
  EyeOff,
  Smartphone,
} from 'lucide-react';

export const ShiftScheduler: React.FC = () => {
  const {
    currentUser,
    isAdmin,
    isSupervisor,
    isReadOnly,
    userDepartmentId,
    departments,
    employees,
    shifts,
    holidays,
    activeYear,
    setActiveYear,
    activeMonth,
    setActiveMonth,
    updateShiftEntry,
    batchUpdateShifts,
    copyShiftsToYear,
    yearlyConfigs,
    productionPlans,
    updateProductionPlan,
    batchUpdateProductionPlan,
    shiftTypes,
    fpPlanOptions,
    injPlanOptions,
  } = useApp();

  // Option Manager Modal state
  const [isOptionManagerOpen, setIsOptionManagerOpen] = useState(false);
  const [optionManagerDefaultTab, setOptionManagerDefaultTab] = useState<'SHIFT' | 'FP' | 'INJ'>('SHIFT');

  // Selected Department Filter
  const [selectedDeptId, setSelectedDeptId] = useState<string>(() => {
    if ((isSupervisor || isReadOnly) && userDepartmentId) return userDepartmentId;
    return departments[0]?.id || '';
  });

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');

  // Paint Mode: Active selected shift type or production plan option to paint onto cells by clicking
  const [activePaintCode, setActivePaintCode] = useState<ShiftTypeCode | null>(null);
  const [activeFPBrush, setActiveFPBrush] = useState<string | null>(null);
  const [activeINJBrush, setActiveINJBrush] = useState<string | null>(null);
  const [activePaletteTab, setActivePaletteTab] = useState<'ALL' | 'SHIFT' | 'FP' | 'INJ'>('ALL');

  // Quick Batch Fill Modal state
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchTargetEmployee, setBatchTargetEmployee] = useState<string>('ALL');
  const [batchShiftCode, setBatchShiftCode] = useState<ShiftTypeCode>('M');
  const [batchWeekPattern, setBatchWeekPattern] = useState<'MON_SAT' | 'ALL' | 'SUN_OFF'>('MON_SAT');

  // Copy Shift Modal state
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);

  // Production Plan Cell Edit Modal State
  const [selectedPlanCell, setSelectedPlanCell] = useState<{
    dateStr: string;
    field: 'fp' | 'inj';
    currentVal: string;
    dayFormatted: string;
  } | null>(null);

  const [customPlanText, setCustomPlanText] = useState('');

  // Batch Production Plan Modal state
  const [isPlanBatchModalOpen, setIsPlanBatchModalOpen] = useState(false);
  const [batchFPValue, setBatchFPValue] = useState('NPL 0.6L');
  const [batchINJValue, setBatchINJValue] = useState('24.4');
  const [batchPlanRange, setBatchPlanRange] = useState<'MONTH' | 'MON_SAT'>('MON_SAT');

  // Column Visibility state for mobile / custom layout
  const [showFullName, setShowFullName] = useState(true);
  const [showNickName, setShowNickName] = useState(true);

  // Auto-collapse Full Name on small screens
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      setShowFullName(false);
      setShowNickName(true);
    }
  }, []);

  // Ensure at least 1 employee identifier column is visible
  const effectiveShowFullName = showFullName;
  const effectiveShowNickName = !showFullName ? true : showNickName;

  const fullNameW = effectiveShowFullName ? 150 : 0;
  const nickNameW = effectiveShowNickName ? 75 : 0;

  const totalLeftHeaderW = fullNameW + nickNameW;
  const planTitleW = fullNameW;
  const infoColsCount = (effectiveShowFullName ? 1 : 0) + (effectiveShowNickName ? 1 : 0);
  const planTitleColSpan = effectiveShowFullName ? 1 : 0;

  // Determine effective department ID: Employees & Supervisors locked to their department
  const isDeptLocked = !isAdmin && !!userDepartmentId;
  const effectiveDeptId = isDeptLocked ? userDepartmentId : selectedDeptId;
  const currentDept = departments.find((d) => d.id === effectiveDeptId);

  // Filter employees for active department
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchDept = emp.departmentId === effectiveDeptId;
      const matchSearch =
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.codeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeCode.includes(searchTerm);
      return matchDept && matchSearch;
    });
  }, [employees, effectiveDeptId, searchTerm]);

  // Generate days for active month and year
  const monthDays = useMemo(() => {
    const daysInMonth = new Date(activeYear, activeMonth, 0).getDate();
    const result = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')}`;

    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(activeYear, activeMonth - 1, day);
      const dateStr = `${activeYear}-${String(activeMonth).padStart(2, '0')}-${String(
        day
      ).padStart(2, '0')}`;
      const dayOfWeek = dateObj.getDay();
      
      // Calculate week number
      const firstDayOfYear = new Date(activeYear, 0, 1);
      const pastDaysOfYear = (dateObj.getTime() - firstDayOfYear.getTime()) / 86400000;
      const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);

      // Check if it matches a company holiday
      const holiday = holidays.find((h) => h.date === dateStr);

      result.push({
        day,
        dateStr,
        dayName: dayNames[dayOfWeek],
        dayOfWeek,
        weekNumber,
        isSunday: dayOfWeek === 0,
        isSaturday: dayOfWeek === 6,
        isToday: dateStr === todayStr,
        holiday,
      });
    }
    return result;
  }, [activeYear, activeMonth, holidays]);

  // Helper to get shift code for employee on a given date
  const getShiftForEmpDate = (employeeId: string, dateStr: string): ShiftTypeCode => {
    const entry = shifts.find((s) => s.employeeId === employeeId && s.date === dateStr);
    if (entry) return entry.shiftCode;

    // Check if auto-holiday from company holidays
    const isHol = holidays.some((h) => h.date === dateStr);
    if (isHol) return 'HL';

    return '-'; // default unassigned
  };

  // Cell click handler
  const handleCellClick = (employeeId: string, dateStr: string) => {
    if (isReadOnly) return; // Employees cannot edit shifts!
    if (activePaintCode) {
      updateShiftEntry(employeeId, dateStr, activePaintCode);
    } else {
      // Toggle to next common shift code
      const current = getShiftForEmpDate(employeeId, dateStr);
      const cycle: ShiftTypeCode[] = ['M', 'A', 'N', 'OFF', 'HL', 'L', '+N', '+A', 'M+', '-'];
      const currentIndex = cycle.indexOf(current);
      const nextCode = cycle[(currentIndex + 1) % cycle.length];
      updateShiftEntry(employeeId, dateStr, nextCode);
    }
  };

  // Execute Batch Fill
  const handleRunBatchFill = () => {
    const targetEmps =
      batchTargetEmployee === 'ALL'
        ? filteredEmployees
        : filteredEmployees.filter((e) => e.id === batchTargetEmployee);

    const updates: { employeeId: string; date: string; shiftCode: ShiftTypeCode }[] = [];

    targetEmps.forEach((emp) => {
      monthDays.forEach((d) => {
        let codeToAssign = batchShiftCode;
        if (d.isSunday && batchWeekPattern === 'SUN_OFF') {
          codeToAssign = 'OFF';
        } else if (d.isSunday && batchWeekPattern === 'MON_SAT') {
          codeToAssign = 'OFF';
        }
        updates.push({
          employeeId: emp.id,
          date: d.dateStr,
          shiftCode: codeToAssign,
        });
      });
    });

    batchUpdateShifts(updates);
    setIsBatchModalOpen(false);
  };

  // Execute Batch Production Plan Fill
  const handleRunBatchPlanFill = () => {
    const updates: { date: string; fp: string; inj: string }[] = [];
    monthDays.forEach((d) => {
      if (batchPlanRange === 'MON_SAT' && d.isSunday) {
        updates.push({ date: d.dateStr, fp: 'OFF', inj: 'OFF' });
      } else {
        updates.push({ date: d.dateStr, fp: batchFPValue, inj: batchINJValue });
      }
    });

    batchUpdateProductionPlan(updates);
    setIsPlanBatchModalOpen(false);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Employee ID', 'Name', 'Code Name', ...monthDays.map((d) => d.dateStr)];
    const rows = filteredEmployees.map((emp) => {
      const empShifts = monthDays.map((d) => getShiftForEmpDate(emp.id, d.dateStr));
      return [emp.employeeCode, `"${emp.name}"`, emp.codeName, ...empShifts].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Shift_Schedule_${currentDept?.code || 'Dept'}_${activeYear}_M${activeMonth}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const monthNamesTh = [
    'มกราคม',
    'กุมภาพันธ์',
    'มีนาคม',
    'เมษายน',
    'พฤษภาคม',
    'มิถุนายน',
    'กรกฎาคม',
    'สิงหาคม',
    'กันยายน',
    'ตุลาคม',
    'พฤศจิกายน',
    'ธันวาคม',
  ];

  return (
    <div className="space-y-6">
      {/* Role Isolation Restriction Alert Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-white">
                ตารางกะประจำทีม: {currentDept?.name || 'เลือกแผนก'}
              </h2>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                 Data Isolated
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {isReadOnly ? (
                <span className="text-amber-300 font-medium">
                  🔒 สิทธิ์พนักงานทั่วไป ({currentUser.name}): เข้าดูได้เฉพาะตารางกะแผนก {currentDept?.name} เท่านั้น (โหมดอ่านอย่างเดียว - ไม่สามารถแก้ไขได้)
                </span>
              ) : isSupervisor ? (
                <span>
                  🔒 สิทธิ์หัวหน้าแผนก: คุณกำลังจัดการข้อมูลทีมเฉพาะ <strong>{currentDept?.name}</strong> ระบบปิดกั้นไม่ให้แก้ไขหรือมองเห็นตารางกะของแผนกอื่นโดยเด็ดขาด
                </span>
              ) : (
                <span>
                  👑 สิทธิ์แอดมินระบบ: คุณสามารถสลับดูตารางกะของทุกแผนก หรือตั้งค่าภาพรวมบริษัทได้
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Department Switcher (Admin Only) */}
        {isAdmin && (
          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-xs text-slate-400 font-medium">เลือกแผนก:</span>
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Control Bar: Date Selector, Quick Paint Legend, Batch Actions */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Year and Month Navigation */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => {
                  if (activeMonth === 1) {
                    setActiveMonth(12);
                    setActiveYear(activeYear - 1);
                  } else {
                    setActiveMonth(activeMonth - 1);
                  }
                }}
                className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-3 text-xs font-bold text-slate-800 dark:text-slate-200 min-w-[120px] text-center">
                {monthNamesTh[activeMonth - 1]} {activeYear + 543}
              </div>
              <button
                onClick={() => {
                  if (activeMonth === 12) {
                    setActiveMonth(1);
                    setActiveYear(activeYear + 1);
                  } else {
                    setActiveMonth(activeMonth + 1);
                  }
                }}
                className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Target Year Selector */}
            <select
              value={activeYear}
              onChange={(e) => setActiveYear(Number(e.target.value))}
              className="bg-slate-100 dark:bg-slate-800 border-none text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl px-3 py-2"
            >
              <option value={2026}>ปี 2026 (2569)</option>
              <option value={2027}>ปี 2027 (2570) [ตารางกะสิ้นปี]</option>
            </select>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="ค้นหาชื่อ / ชื่อเล่น..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 w-36 sm:w-48"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
            {!isReadOnly && (
              <>
                <button
                  onClick={() => setIsPlanBatchModalOpen(true)}
                  className="bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>จัดการแผนผลิต (F&P / INJ)</span>
                </button>

                <button
                  onClick={() => setIsBatchModalOpen(true)}
                  className="bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>จัดกะอัตโนมัติทั้งเดือน</span>
                </button>

                <button
                  onClick={() => setIsCopyModalOpen(true)}
                  className="bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>คัดลอกตารางกะปีถัดไป</span>
                </button>
              </>
            )}

            <button
              onClick={handleExportCSV}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ส่งออก CSV</span>
            </button>
          </div>
        </div>

        {/* Shift Codes & Production Plan Legend & Brush Palette */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
          {/* Palette Category Header / Filter Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {isReadOnly
                  ? 'คำอธิบายสัญลักษณ์กะ & แผนการผลิต:'
                  : 'ตัวเลือกกะ & แผนการผลิต (คลิกเพื่อระบายสีลงตาราง):'}
              </span>
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={() => {
                    setOptionManagerDefaultTab('SHIFT');
                    setIsOptionManagerOpen(true);
                  }}
                  className="px-2.5 py-1 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold transition flex items-center space-x-1 border border-indigo-200 dark:border-indigo-800"
                  title="จัดการ เพิ่ม แก้ไข ลบ และเปลี่ยนสี สัญลักษณ์กะและแผนผลิต"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>⚙️ จัดการสัญลักษณ์กะ & แผนผลิต</span>
                </button>
              )}
            </div>

            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setActivePaletteTab('ALL')}
                className={`px-2.5 py-0.5 rounded-lg font-semibold transition ${
                  activePaletteTab === 'ALL'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                🎨 ทั้งหมด
              </button>
              <button
                type="button"
                onClick={() => setActivePaletteTab('SHIFT')}
                className={`px-2.5 py-0.5 rounded-lg font-semibold transition ${
                  activePaletteTab === 'SHIFT'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                📋 กะพนักงาน
              </button>
              <button
                type="button"
                onClick={() => setActivePaletteTab('FP')}
                className={`px-2.5 py-0.5 rounded-lg font-semibold transition ${
                  activePaletteTab === 'FP'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                📦 แผน F&P
              </button>
              <button
                type="button"
                onClick={() => setActivePaletteTab('INJ')}
                className={`px-2.5 py-0.5 rounded-lg font-semibold transition ${
                  activePaletteTab === 'INJ'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                ⚙️ แผน INJ
              </button>
            </div>
          </div>

          {/* Active Brush Banner Notification */}
          {!isReadOnly && (activePaintCode || activeFPBrush || activeINJBrush) && (
            <div className="p-2.5 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-amber-500/10 border-2 border-indigo-500/40 dark:border-indigo-500/60 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs text-slate-800 dark:text-slate-100 font-bold shadow-sm">
              <div className="flex items-center space-x-2">
                <span className="text-base animate-bounce">🖌️</span>
                <span>
                  {activePaintCode && (
                    <>
                      โหมดระบายตารางกะพนักงาน <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-md font-extrabold">{activePaintCode}</span> — คลิกเซลล์พนักงานในตารางเพื่อระบายกะนี้
                    </>
                  )}
                  {activeFPBrush && (
                    <>
                      โหมดระบายแผนผลิต F&P <span className="bg-sky-600 text-white px-2 py-0.5 rounded-md font-extrabold">{activeFPBrush}</span> — คลิกวันที่ในแถว F&P ด้านบนตารางเพื่อเปลี่ยนแผนทันที
                    </>
                  )}
                  {activeINJBrush && (
                    <>
                      โหมดระบายแผนผลิต INJ <span className="bg-amber-600 text-slate-950 px-2 py-0.5 rounded-md font-extrabold">{activeINJBrush}</span> — คลิกวันที่ในแถว INJ ด้านบนตารางเพื่อเปลี่ยนแผนทันที
                    </>
                  )}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActivePaintCode(null);
                  setActiveFPBrush(null);
                  setActiveINJBrush(null);
                }}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition shadow-sm"
              >
                ✕ ยกเลิกโหมดระบายสี
              </button>
            </div>
          )}

          {/* Group 1: Shift Codes Palette */}
          {(activePaletteTab === 'ALL' || activePaletteTab === 'SHIFT') && (
            <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  <span>📋 สัญลักษณ์กะการทำงาน (Shift Codes):</span>
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => {
                        setOptionManagerDefaultTab('SHIFT');
                        setIsOptionManagerOpen(true);
                      }}
                      className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline ml-1 font-semibold"
                    >
                      (✏️ แก้ไข/เพิ่ม/ลบ/เปลี่ยนสี)
                    </button>
                  )}
                </span>
                {activePaintCode && (
                  <span className="text-indigo-600 dark:text-indigo-400 font-extrabold text-[10px]">กำลังเลือก: {activePaintCode}</span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {shiftTypes.map((type) => {
                  const isSelected = !isReadOnly && activePaintCode === type.code;
                  return (
                    <button
                      key={type.code}
                      disabled={isReadOnly}
                      onClick={() => {
                        if (!isReadOnly) {
                          setActiveFPBrush(null);
                          setActiveINJBrush(null);
                          setActivePaintCode(isSelected ? null : type.code);
                        }
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition flex items-center space-x-1.5 ${
                        type.colorBg
                      } ${type.colorText} ${type.colorBorder} ${
                        isReadOnly
                          ? 'cursor-default'
                          : isSelected
                          ? 'ring-2 ring-indigo-500 shadow-md scale-105 font-black'
                          : 'hover:opacity-90'
                      }`}
                      title={`${type.nameTh}: ${type.description}`}
                    >
                      <span className="font-bold">{type.code}</span>
                      <span className="text-[11px] opacity-90">{type.nameTh}</span>
                      {isSelected && <CheckCircle2 className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Group 2: F&P Production Plan Options Palette */}
          {(activePaletteTab === 'ALL' || activePaletteTab === 'FP') && (
            <div className="bg-sky-50/50 dark:bg-sky-950/20 p-2.5 rounded-xl border border-sky-200/80 dark:border-sky-900/50 space-y-1.5">
              <div className="text-[11px] font-bold text-sky-900 dark:text-sky-200 flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  <span>📦 แผนผลิต F&P (Fill & Pack Options):</span>
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => {
                        setOptionManagerDefaultTab('FP');
                        setIsOptionManagerOpen(true);
                      }}
                      className="text-[10px] text-sky-600 dark:text-sky-400 hover:underline ml-1 font-semibold"
                    >
                      (✏️ แก้ไข/เพิ่ม/ลบ/เปลี่ยนสี)
                    </button>
                  )}
                </span>
                {activeFPBrush && (
                  <span className="text-sky-600 dark:text-sky-400 font-extrabold text-[10px]">กำลังเลือก: {activeFPBrush}</span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  ...fpPlanOptions.map((opt) => ({
                    value: opt.code,
                    style: `${opt.colorBg} ${opt.colorText} ${opt.colorBorder}`,
                  })),
                  { value: '-', style: 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' },
                ].map((opt) => {
                  const isSelected = !isReadOnly && activeFPBrush === opt.value;
                  return (
                    <button
                      key={`fp-opt-${opt.value}`}
                      disabled={isReadOnly}
                      onClick={() => {
                        if (!isReadOnly) {
                          setActivePaintCode(null);
                          setActiveINJBrush(null);
                          setActiveFPBrush(isSelected ? null : opt.value);
                        }
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition flex items-center space-x-1 ${
                        opt.style
                      } ${
                        isReadOnly
                          ? 'cursor-default'
                          : isSelected
                          ? 'ring-2 ring-sky-500 shadow-md scale-105 font-black'
                          : 'hover:opacity-90'
                      }`}
                      title={`คลิกเลือกแปรงแผน F&P: ${opt.value}`}
                    >
                      <span>{opt.value === '-' ? '- ล้างค่า' : opt.value}</span>
                      {isSelected && <CheckCircle2 className="w-3 h-3 text-sky-600 dark:text-sky-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Group 3: INJ Production Plan Options Palette */}
          {(activePaletteTab === 'ALL' || activePaletteTab === 'INJ') && (
            <div className="bg-amber-50/50 dark:bg-amber-950/20 p-2.5 rounded-xl border border-amber-200/80 dark:border-amber-900/50 space-y-1.5">
              <div className="text-[11px] font-bold text-amber-900 dark:text-amber-200 flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  <span>⚙️ แผนผลิต INJ (Injection Options):</span>
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => {
                        setOptionManagerDefaultTab('INJ');
                        setIsOptionManagerOpen(true);
                      }}
                      className="text-[10px] text-amber-600 dark:text-amber-400 hover:underline ml-1 font-semibold"
                    >
                      (✏️ แก้ไข/เพิ่ม/ลบ/เปลี่ยนสี)
                    </button>
                  )}
                </span>
                {activeINJBrush && (
                  <span className="text-amber-600 dark:text-amber-400 font-extrabold text-[10px]">กำลังเลือก: {activeINJBrush}</span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  ...injPlanOptions.map((opt) => ({
                    value: opt.code,
                    style: `${opt.colorBg} ${opt.colorText} ${opt.colorBorder}`,
                  })),
                  { value: '-', style: 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' },
                ].map((opt) => {
                  const isSelected = !isReadOnly && activeINJBrush === opt.value;
                  return (
                    <button
                      key={`inj-opt-${opt.value}`}
                      disabled={isReadOnly}
                      onClick={() => {
                        if (!isReadOnly) {
                          setActivePaintCode(null);
                          setActiveFPBrush(null);
                          setActiveINJBrush(isSelected ? null : opt.value);
                        }
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition flex items-center space-x-1 ${
                        opt.style
                      } ${
                        isReadOnly
                          ? 'cursor-default'
                          : isSelected
                          ? 'ring-2 ring-amber-500 shadow-md scale-105 font-black'
                          : 'hover:opacity-90'
                      }`}
                      title={`คลิกเลือกแปรงแผน INJ: ${opt.value}`}
                    >
                      <span>{opt.value === '-' ? '- ล้างค่า' : opt.value}</span>
                      {isSelected && <CheckCircle2 className="w-3 h-3 text-amber-600 dark:text-amber-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Column Visibility Control Toolbar for Mobile / Compact View */}
        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl text-xs">
          <div className="flex items-center space-x-2 flex-wrap gap-y-1.5">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
              <Eye className="w-3.5 h-3.5 text-indigo-500" />
              <span>ซ่อน/แสดง คอลัมน์:</span>
            </span>

            <button
              type="button"
              onClick={() => setShowFullName(!showFullName)}
              className={`px-2.5 py-1 rounded-lg font-semibold border transition flex items-center space-x-1 ${
                effectiveShowFullName
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{effectiveShowFullName ? '✓' : '+'} ชื่อ-นามสกุล</span>
            </button>

            <button
              type="button"
              onClick={() => setShowNickName(!showNickName)}
              className={`px-2.5 py-1 rounded-lg font-semibold border transition flex items-center space-x-1 ${
                effectiveShowNickName
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{effectiveShowNickName ? '✓' : '+'} ชื่อเล่น</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => { setShowFullName(true); setShowNickName(true); }}
              className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition"
            >
              แสดงทั้งหมด
            </button>

            <button
              type="button"
              onClick={() => { setShowFullName(false); setShowNickName(true); }}
              className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold border border-amber-400 hover:bg-amber-400 transition shadow-sm flex items-center space-x-1"
              title="ซ่อนชื่อเต็ม เพื่อเพิ่มพื้นที่ดูตารางกะบนหน้าจอมือถือ"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>📱 ย่อจอมือถือ (แสดงเฉพาะชื่อเล่น)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Excel-Style Production Shift Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto max-w-full scrollbar-thin">
          <table className="w-full text-xs text-left border-collapse select-none">
            <thead>
              {/* Row 0-A: Production Plan (F&P) */}
              <tr className="bg-slate-100 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-700">
                {planTitleW > 0 && (
                  <th
                    colSpan={planTitleColSpan}
                    style={{ width: planTitleW, minWidth: planTitleW, maxWidth: planTitleW, left: 0 }}
                    className="p-1 border-r border-slate-300 dark:border-slate-700 text-center bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-extrabold text-[11px] sticky left-0 z-30"
                  >
                    Production Plan
                  </th>
                )}
                <th
                  colSpan={1}
                  style={{ width: nickNameW || 75, minWidth: nickNameW || 75, maxWidth: nickNameW || 75, left: planTitleW }}
                  className="p-1 border-r-2 border-slate-400 dark:border-slate-600 text-center bg-indigo-100 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-200 font-black text-[11px] sticky z-30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"
                >
                  F&P
                </th>
                {monthDays.map((d, idx) => {
                  const fpPlan = productionPlans[d.dateStr]?.fp || '';
                  const matchingOpt = fpPlanOptions.find(o => o.code === fpPlan || (fpPlan && fpPlan.includes(o.code)));
                  const bgColor = matchingOpt
                    ? `${matchingOpt.colorBg} ${matchingOpt.colorText} ${matchingOpt.colorBorder}`
                    : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300';

                  const isFPBrushActive = !!activeFPBrush;
                  const isWeekEnd = d.isSunday || (idx < monthDays.length - 1 && monthDays[idx + 1].weekNumber !== d.weekNumber);
                  const borderRightClass = isWeekEnd
                    ? 'border-r-2 border-r-slate-900 dark:border-r-slate-100'
                    : 'border-r border-slate-200 dark:border-slate-700';

                  return (
                    <th
                      key={`fp-${d.dateStr}`}
                      onClick={() => {
                        if (!isReadOnly) {
                          if (activeFPBrush !== null) {
                            updateProductionPlan(d.dateStr, 'fp', activeFPBrush === '-' ? '' : activeFPBrush);
                          } else {
                            setSelectedPlanCell({
                              dateStr: d.dateStr,
                              field: 'fp',
                              currentVal: fpPlan,
                              dayFormatted: `${d.day} ${monthNamesTh[activeMonth - 1]} (${d.dayName})`,
                            });
                            setCustomPlanText(fpPlan);
                          }
                        }
                      }}
                      className={`p-0 ${borderRightClass} min-w-[38px] max-w-[38px] cursor-pointer hover:ring-2 hover:ring-sky-500 transition ${bgColor} ${
                        isFPBrushActive ? 'ring-1 ring-sky-400 font-extrabold animate-pulse' : ''
                      }`}
                      title={`แผนผลิต F&P วันที่ ${d.day} ${d.dayName}: ${fpPlan || 'ยังไม่ได้ระบุ (คลิกเพื่อแก้ไข)'}`}
                    >
                      <div className="min-h-[70px] py-1 flex items-center justify-center text-[10px] font-bold tracking-tight select-none [writing-mode:vertical-lr] rotate-180 mx-auto leading-none">
                        {fpPlan || '-'}
                      </div>
                    </th>
                  );
                })}
              </tr>

              {/* Row 0-B: Production Plan (INJ) */}
              <tr className="bg-slate-100 dark:bg-slate-900 border-b-2 border-slate-400 dark:border-slate-700">
                {planTitleW > 0 && (
                  <th
                    colSpan={planTitleColSpan}
                    style={{ width: planTitleW, minWidth: planTitleW, maxWidth: planTitleW, left: 0 }}
                    className="p-1 border-r border-slate-300 dark:border-slate-700 text-center bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-extrabold text-[11px] sticky left-0 z-30"
                  >
                    Production Plan
                  </th>
                )}
                <th
                  colSpan={1}
                  style={{ width: nickNameW || 75, minWidth: nickNameW || 75, maxWidth: nickNameW || 75, left: planTitleW }}
                  className="p-1 border-r-2 border-slate-400 dark:border-slate-600 text-center bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 font-black text-[11px] sticky z-30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"
                >
                  INJ
                </th>
                {monthDays.map((d, idx) => {
                  const injPlan = productionPlans[d.dateStr]?.inj || '';
                  const matchingOpt = injPlanOptions.find(o => o.code === injPlan || (injPlan && injPlan.includes(o.code)));
                  const bgColor = matchingOpt
                    ? `${matchingOpt.colorBg} ${matchingOpt.colorText} ${matchingOpt.colorBorder}`
                    : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300';

                  const isINJBrushActive = !!activeINJBrush;
                  const isWeekEnd = d.isSunday || (idx < monthDays.length - 1 && monthDays[idx + 1].weekNumber !== d.weekNumber);
                  const borderRightClass = isWeekEnd
                    ? 'border-r-2 border-r-slate-900 dark:border-r-slate-100'
                    : 'border-r border-slate-200 dark:border-slate-700';

                  return (
                    <th
                      key={`inj-${d.dateStr}`}
                      onClick={() => {
                        if (!isReadOnly) {
                          if (activeINJBrush !== null) {
                            updateProductionPlan(d.dateStr, 'inj', activeINJBrush === '-' ? '' : activeINJBrush);
                          } else {
                            setSelectedPlanCell({
                              dateStr: d.dateStr,
                              field: 'inj',
                              currentVal: injPlan,
                              dayFormatted: `${d.day} ${monthNamesTh[activeMonth - 1]} (${d.dayName})`,
                            });
                            setCustomPlanText(injPlan);
                          }
                        }
                      }}
                      className={`p-1 ${borderRightClass} min-w-[38px] max-w-[38px] text-center cursor-pointer hover:ring-2 hover:ring-amber-500 transition ${bgColor} ${
                        isINJBrushActive ? 'ring-1 ring-amber-400 font-extrabold animate-pulse' : ''
                      }`}
                      title={`แผนผลิต INJ วันที่ ${d.day} ${d.dayName}: ${injPlan || 'ยังไม่ได้ระบุ (คลิกเพื่อแก้ไข)'}`}
                    >
                      <div className="text-[10px] font-extrabold truncate select-none">
                        {injPlan || '-'}
                      </div>
                    </th>
                  );
                })}
              </tr>

              {/* Row 1: Week Numbers Header */}
              <tr className="bg-slate-100 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                <th
                  colSpan={infoColsCount}
                  style={{ width: totalLeftHeaderW, minWidth: totalLeftHeaderW, maxWidth: totalLeftHeaderW, left: 0 }}
                  className="p-2 border-r-2 border-slate-300 dark:border-slate-700 text-center bg-slate-200 dark:bg-slate-800 sticky left-0 z-30"
                >
                  สัปดาห์ (Week)
                </th>
                {monthDays.map((d, idx) => {
                  // Only show week label when week changes or first day
                  const isNewWeek = idx === 0 || monthDays[idx - 1].weekNumber !== d.weekNumber;
                  const isWeekEnd = d.isSunday || (idx < monthDays.length - 1 && monthDays[idx + 1].weekNumber !== d.weekNumber);
                  const borderRightClass = isWeekEnd
                    ? 'border-r-2 border-r-slate-900 dark:border-r-slate-100'
                    : 'border-r border-slate-200 dark:border-slate-700';

                  const weekBg = d.isSunday ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-700' : '';

                  return (
                    <th
                      key={`week-${d.dateStr}`}
                      className={`p-1 text-center font-bold text-[10px] ${borderRightClass} min-w-[38px] ${weekBg}`}
                    >
                      {isNewWeek ? `W${d.weekNumber}` : ''}
                    </th>
                  );
                })}
              </tr>

              {/* Row 2: Date Number Header */}
              <tr className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                <th
                  colSpan={infoColsCount}
                  style={{ width: totalLeftHeaderW, minWidth: totalLeftHeaderW, maxWidth: totalLeftHeaderW, left: 0 }}
                  className="p-2 border-r-2 border-slate-300 dark:border-slate-700 text-center bg-slate-100 dark:bg-slate-800 sticky left-0 z-30"
                >
                  วันที่ (Date)
                </th>
                {monthDays.map((d, idx) => {
                  const isWeekEnd = d.isSunday || (idx < monthDays.length - 1 && monthDays[idx + 1].weekNumber !== d.weekNumber);
                  const borderRightClass = isWeekEnd
                    ? 'border-r-2 border-r-slate-900 dark:border-r-slate-100'
                    : 'border-r border-slate-200 dark:border-slate-700';

                  const dateBg = d.isToday
                    ? 'bg-sky-500 text-white font-black shadow-lg ring-2 ring-sky-300 z-10'
                    : d.isSunday
                    ? 'bg-rose-200 dark:bg-rose-900/60 text-rose-900 dark:text-rose-200'
                    : d.holiday
                    ? 'bg-orange-200 dark:bg-orange-900/60 text-orange-900 dark:text-orange-200'
                    : '';

                  return (
                    <th
                      key={`date-${d.dateStr}`}
                      className={`p-1.5 text-center min-w-[38px] max-w-[38px] text-[11px] ${borderRightClass} ${dateBg}`}
                    >
                      <div>{d.day}</div>
                      <div className={`text-[9px] ${d.isToday ? 'font-bold text-white' : 'font-normal text-slate-500 dark:text-slate-400'}`}>
                        {d.isToday ? 'วันนี้' : d.holiday ? 'HL' : d.dayName}
                      </div>
                    </th>
                  );
                })}
              </tr>

              {/* Row 3: Employee Info Column Labels */}
              <tr className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px] border-b border-slate-300 dark:border-slate-700">
                {effectiveShowFullName && (
                  <th style={{ width: 150, minWidth: 150, maxWidth: 150, left: 0 }} className="p-2 border-r border-slate-300 dark:border-slate-700 sticky left-0 bg-slate-200 dark:bg-slate-800 z-30 text-left">
                    ชื่อ-นามสกุล
                  </th>
                )}
                {effectiveShowNickName && (
                  <th style={{ width: 75, minWidth: 75, maxWidth: 75, left: fullNameW }} className="p-2 border-r-2 border-slate-300 dark:border-slate-700 sticky bg-slate-200 dark:bg-slate-800 z-30 text-left shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                    ชื่อเล่น
                  </th>
                )}
                {monthDays.map((d, idx) => {
                  const isWeekEnd = d.isSunday || (idx < monthDays.length - 1 && monthDays[idx + 1].weekNumber !== d.weekNumber);
                  const borderRightClass = isWeekEnd
                    ? 'border-r-2 border-r-slate-900 dark:border-r-slate-100'
                    : 'border-r border-slate-200 dark:border-slate-700';

                  const dowBg = d.isSunday
                    ? 'bg-rose-300 dark:bg-rose-900 text-rose-950 dark:text-rose-100 font-extrabold'
                    : '';

                  return (
                    <th
                      key={`dow-${d.dateStr}`}
                      className={`p-1 text-center min-w-[38px] max-w-[38px] text-[10px] ${borderRightClass} ${dowBg}`}
                    >
                      {d.dayName}
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td
                    colSpan={monthDays.length + infoColsCount}
                    className="p-8 text-center text-slate-400 text-xs italic"
                  >
                    ไม่พบพนักงานในแผนกนี้ หรือไม่ตรงกับเงื่อนไขการค้นหา
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp, empIdx) => {
                  return (
                    <tr
                      key={emp.id}
                      className="border-b border-slate-200 dark:border-slate-800 transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      {/* Name */}
                      {effectiveShowFullName && (
                        <td style={{ width: 150, minWidth: 150, maxWidth: 150, left: 0 }} className="p-2 border-r border-slate-200 dark:border-slate-800 sticky left-0 bg-white dark:bg-slate-900 z-20">
                          <div className="truncate font-semibold text-slate-800 dark:text-slate-200" title={emp.name}>
                            {emp.name}
                          </div>
                        </td>
                      )}

                      {/* Code Name */}
                      {effectiveShowNickName && (
                        <td style={{ width: 75, minWidth: 75, maxWidth: 75, left: fullNameW }} className="p-2 border-r-2 border-slate-300 dark:border-slate-700 sticky bg-white dark:bg-slate-900 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                          <div className="truncate font-bold text-indigo-600 dark:text-indigo-400" title={emp.codeName}>
                            {emp.codeName}
                          </div>
                        </td>
                      )}

                      {/* Shift Code Cells */}
                      {monthDays.map((d, idx) => {
                        const code = getShiftForEmpDate(emp.id, d.dateStr);
                        const shiftInfo = shiftTypes.find((s) => s.code === code) || shiftTypes[shiftTypes.length - 1] || {
                          code,
                          nameTh: code,
                          description: '',
                          colorBg: 'bg-slate-100 dark:bg-slate-800',
                          colorText: 'text-slate-700 dark:text-slate-300',
                          colorBorder: 'border-slate-300',
                        };

                        const isWeekEnd = d.isSunday || (idx < monthDays.length - 1 && monthDays[idx + 1].weekNumber !== d.weekNumber);
                        const borderRightClass = isWeekEnd
                          ? 'border-r-2 border-r-slate-900 dark:border-r-slate-100'
                          : 'border-r border-slate-200 dark:border-slate-800';

                        return (
                          <td
                            key={`${emp.id}-${d.dateStr}`}
                            onClick={() => handleCellClick(emp.id, d.dateStr)}
                            className={`p-1.5 text-center font-bold text-xs ${borderRightClass} cursor-pointer transition hover:scale-105 ${
                              shiftInfo.colorBg
                            } ${shiftInfo.colorText}`}
                            title={`${emp.name} (${emp.codeName}) - ${d.dateStr}: ${shiftInfo.nameTh} (${shiftInfo.description})`}
                          >
                            {code}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Batch Fill Modal */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl text-white">
            <h3 className="text-base font-bold mb-2 flex items-center space-x-2">
              <Wand2 className="w-5 h-5 text-indigo-400" />
              <span>จัดกะอัตโนมัติทั้งเดือน (Batch Fill)</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              ช่วยให้จัดกะพนักงานทั้งทีมได้อย่างรวดเร็วในคลิกเดียว
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  เลือกพนักงาน:
                </label>
                <select
                  value={batchTargetEmployee}
                  onChange={(e) => setBatchTargetEmployee(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ALL">พนักงานทุกคนในแผนก ({filteredEmployees.length} คน)</option>
                  {filteredEmployees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.employeeCode} - {e.name} ({e.codeName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  เลือกกะการทำงานหลัก:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {shiftTypes.map((t) => (
                    <button
                      key={t.code}
                      type="button"
                      onClick={() => setBatchShiftCode(t.code)}
                      className={`p-2 rounded-xl text-xs font-bold border text-center transition ${
                        t.colorBg
                      } ${t.colorText} ${
                        batchShiftCode === t.code
                          ? 'ring-2 ring-indigo-500 scale-105'
                          : 'opacity-80'
                      }`}
                    >
                      {t.code}: {t.nameTh}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  เงื่อนไขวันหยุดประจำสัปดาห์:
                </label>
                <select
                  value={batchWeekPattern}
                  onChange={(e) =>
                    setBatchWeekPattern(e.target.value as 'MON_SAT' | 'ALL' | 'SUN_OFF')
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="SUN_OFF">ทำงาน จันทร์-เสาร์ / วันอาทิตย์เป็น OFF</option>
                  <option value="ALL">ลงกะนี้ให้ทุกวัน (ไม่มี OFF)</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setIsBatchModalOpen(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold transition"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleRunBatchFill}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition shadow-md"
              >
                ยืนยันจัดกะกลุ่ม
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Copy Shift Modal */}
      {isCopyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl text-white">
            <h3 className="text-base font-bold mb-2 flex items-center space-x-2">
              <Copy className="w-5 h-5 text-purple-400" />
              <span>คัดลอกตารางกะไปปีถัดไป (Copy Shift)</span>
            </h3>
            <p className="text-xs text-slate-300 mb-4 bg-purple-950/60 border border-purple-800/60 p-3 rounded-xl">
              ระบบคัดลอกตารางกะช่วยให้จัดตารางกะปี 2027 ได้เร็วขึ้นโดยใช้รูปแบบตารางกะปี 2026 เป็นต้นแบบ
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  คัดลอกจากปี:
                </label>
                <input
                  type="text"
                  disabled
                  value="2026 (ปีปัจจุบัน)"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  ไปยังปีเป้าหมาย:
                </label>
                <input
                  type="text"
                  disabled
                  value="2027 (ปีถัดไป - สิ้นปี)"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-emerald-400 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  ขอบเขตแผนก:
                </label>
                <input
                  type="text"
                  disabled
                  value={currentDept?.name}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-200"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setIsCopyModalOpen(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold transition"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  copyShiftsToYear(2026, 2027, effectiveDeptId);
                  setIsCopyModalOpen(false);
                  setActiveYear(2027);
                  alert(`คัดลอกตารางกะของแผนก ${currentDept?.name} ไปยังปี 2027 เรียบร้อยแล้ว!`);
                }}
                className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition shadow-md"
              >
                ยืนยันคัดลอกไปปี 2027
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Production Plan Single Cell Edit Modal */}
      {selectedPlanCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl text-white">
            <h3 className="text-base font-bold mb-1 flex items-center space-x-2">
              <Edit3 className="w-5 h-5 text-amber-400" />
              <span>
                แก้ไขแผนผลิต {selectedPlanCell.field === 'fp' ? 'F&P' : 'INJ'} ({selectedPlanCell.dayFormatted})
              </span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              เลือกรายการแผนผลิตจากรายการสำเร็จรูป หรือพิมพ์ข้อความกำหนดเอง
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-2">
                  ตัวเลือกสำเร็จรูป (Preset Options):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(selectedPlanCell.field === 'fp' ? fpPlanOptions : injPlanOptions).map(
                    (optItem) => {
                      const opt = optItem.code;
                      const isSel = customPlanText === opt;
                      return (
                        <button
                          key={opt}
                          onClick={() => {
                            setCustomPlanText(opt);
                            updateProductionPlan(
                              selectedPlanCell.dateStr,
                              selectedPlanCell.field,
                              opt === '-' ? '' : opt
                            );
                            setSelectedPlanCell(null);
                          }}
                          className={`p-2.5 rounded-xl font-bold border transition text-center ${
                            isSel
                              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md scale-105'
                              : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  กำหนดเอง / พิมพ์ข้อความแผนผลิต:
                </label>
                <input
                  type="text"
                  value={customPlanText}
                  onChange={(e) => setCustomPlanText(e.target.value)}
                  placeholder="เช่น NPL 0.6L, 24.4, OFF ฯลฯ"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-between items-center">
              <button
                onClick={() => {
                  updateProductionPlan(selectedPlanCell.dateStr, selectedPlanCell.field, '');
                  setSelectedPlanCell(null);
                }}
                className="text-rose-400 hover:text-rose-300 font-semibold text-xs underline"
              >
                ลบค่าแผนผลิต
              </button>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedPlanCell(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold transition"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={() => {
                    updateProductionPlan(
                      selectedPlanCell.dateStr,
                      selectedPlanCell.field,
                      customPlanText
                    );
                    setSelectedPlanCell(null);
                  }}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition shadow-md"
                >
                  บันทึกแผนผลิต
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Production Plan Batch Fill Modal */}
      {isPlanBatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl text-white">
            <h3 className="text-base font-bold mb-2 flex items-center space-x-2">
              <Layers className="w-5 h-5 text-amber-400" />
              <span>จัดการแผนการผลิตประจำเดือน (F&P / INJ Batch Fill)</span>
            </h3>
            <p className="text-xs text-slate-300 mb-4 bg-amber-950/60 border border-amber-800/60 p-3 rounded-xl">
              กำหนดแผนการผลิต F&P และ INJ พร้อมกันทั้งเดือนสำหรับทุกวันทำการ
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  แผนผลิต Fill & Pack (F&P):
                </label>
                <select
                  value={batchFPValue}
                  onChange={(e) => setBatchFPValue(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {fpPlanOptions.map((opt) => (
                    <option key={opt.code} value={opt.code}>
                      {opt.code}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  แผนผลิต Injection (INJ):
                </label>
                <select
                  value={batchINJValue}
                  onChange={(e) => setBatchINJValue(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {injPlanOptions.map((opt) => (
                    <option key={opt.code} value={opt.code}>
                      {opt.code}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  ช่วงวันในการลงแผนผลิต:
                </label>
                <select
                  value={batchPlanRange}
                  onChange={(e) =>
                    setBatchPlanRange(e.target.value as 'MONTH' | 'MON_SAT')
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="MON_SAT">เฉพาะวันจันทร์ - เสาร์ (วันอาทิตย์เป็น OFF)</option>
                  <option value="MONTH">ลงครอบคลุมทุกวันตลอดทั้งเดือน</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setIsPlanBatchModalOpen(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold transition"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleRunBatchPlanFill}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition shadow-md"
              >
                ยืนยันลงแผนผลิตทั้งเดือน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Option Manager Modal (Shift Codes & Production Plan Options CRUD) */}
      <OptionManagerModal
        isOpen={isOptionManagerOpen}
        onClose={() => setIsOptionManagerOpen(false)}
        defaultTab={optionManagerDefaultTab}
      />
    </div>
  );
};
