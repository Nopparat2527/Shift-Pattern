import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { SHIFT_TYPES } from '../mockData';
import {
  LayoutDashboard,
  CalendarDays,
  CalendarCheck2,
  CalendarOff,
  Briefcase,
  Zap,
  Building2,
  Users,
  Award,
  Filter,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const {
    currentUser,
    isAdmin,
    isSupervisor,
    userDepartmentId,
    departments,
    employees,
    shifts,
    holidays,
    activeYear,
    setActiveYear,
    activeMonth,
    setActiveMonth,
    resetToDefaultData,
  } = useApp();

  // Filters
  const [selectedDeptId, setSelectedDeptId] = useState<string>(() => {
    if (isSupervisor && userDepartmentId) return userDepartmentId;
    return 'ALL';
  });

  // Selected Month Filter (0 = Full Year, 1..12 = Specific Month)
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<number>(0);

  const effectiveDeptId = isSupervisor ? userDepartmentId || departments[0]?.id || '' : selectedDeptId;
  const currentDept = departments.find((d) => d.id === effectiveDeptId);

  // Filter employees
  const targetEmployees = useMemo(() => {
    return employees.filter((e) => {
      if (effectiveDeptId === 'ALL') return true;
      return e.departmentId === effectiveDeptId;
    });
  }, [employees, effectiveDeptId]);

  // Compute Summary Statistics
  const stats = useMemo(() => {
    let workDaysCount = 0;
    let leaveCount = 0;
    let holidayCount = 0;
    let offCount = 0;
    let otCount = 0;

    const empBreakdown: Array<{
      id: string;
      code: string;
      name: string;
      codeName: string;
      deptName: string;
      workDays: number;
      leaves: number;
      holidays: number;
      offs: number;
      otCount: number;
      morning: number;
      afternoon: number;
      night: number;
    }> = [];

    targetEmployees.forEach((emp) => {
      let empWork = 0;
      let empLeave = 0;
      let empHol = 0;
      let empOff = 0;
      let empOt = 0;
      let empM = 0;
      let empA = 0;
      let empN = 0;

      const empShifts = shifts.filter((s) => {
        const matchEmp = s.employeeId === emp.id;
        const matchYear = s.year === activeYear;
        const matchMonth = selectedMonthFilter === 0 || s.month === selectedMonthFilter;
        return matchEmp && matchYear && matchMonth;
      });

      empShifts.forEach((s) => {
        if (s.shiftCode === 'M') {
          empWork++;
          empM++;
        } else if (s.shiftCode === 'A') {
          empWork++;
          empA++;
        } else if (s.shiftCode === 'N') {
          empWork++;
          empN++;
        } else if (s.shiftCode === 'OFF') {
          empOff++;
        } else if (s.shiftCode === 'HL') {
          empHol++;
        } else if (s.shiftCode === 'L') {
          empLeave++;
        } else if (s.shiftCode.includes('+')) {
          empWork++;
          empOt++;
          if (s.shiftCode === '+N') empN++;
          else if (s.shiftCode === '+A') empA++;
          else if (s.shiftCode === 'M+') empM++;
        }
      });

      workDaysCount += empWork;
      leaveCount += empLeave;
      holidayCount += empHol;
      offCount += empOff;
      otCount += empOt;

      const deptObj = departments.find((d) => d.id === emp.departmentId);

      empBreakdown.push({
        id: emp.id,
        code: emp.employeeCode,
        name: emp.name,
        codeName: emp.codeName,
        deptName: deptObj ? deptObj.code : '-',
        workDays: empWork,
        leaves: empLeave,
        holidays: empHol,
        offs: empOff,
        otCount: empOt,
        morning: empM,
        afternoon: empA,
        night: empN,
      });
    });

    return {
      workDaysCount,
      leaveCount,
      holidayCount,
      offCount,
      otCount,
      empBreakdown,
    };
  }, [targetEmployees, shifts, activeYear, selectedMonthFilter, departments]);

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
      {/* Header with Department & Timeframe Selector */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <LayoutDashboard className="w-6 h-6 text-indigo-400" />
            <h2 className="text-lg font-bold">
              แดชบอร์ดสรุปภาพรวมการทำงานและวันหยุด
            </h2>
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] px-2 py-0.5 rounded-full font-semibold">
              Live Summary
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            สรุปวันทำงาน วันลา วันหยุดบริษัท สถิติ OT รายบุคคล ประจำปี {activeYear + 543}
            {selectedMonthFilter > 0 ? ` (${monthNamesTh[selectedMonthFilter - 1]})` : ' (ตลอดทั้งปี)'}
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-2 shrink-0">
          {/* Department Filter (Admin view toggle) */}
          {isAdmin && (
            <div className="flex items-center space-x-1 bg-slate-800 p-1.5 rounded-xl border border-slate-700">
              <Building2 className="w-3.5 h-3.5 text-slate-400 ml-1" />
              <select
                value={selectedDeptId}
                onChange={(e) => setSelectedDeptId(e.target.value)}
                className="bg-transparent border-none text-white text-xs font-semibold focus:outline-none pr-2"
              >
                <option value="ALL" className="bg-slate-800 text-white">
                  ทุกแผนก ({employees.length} คน)
                </option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id} className="bg-slate-800 text-white">
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Timeframe Month Filter */}
          <div className="flex items-center space-x-1 bg-slate-800 p-1.5 rounded-xl border border-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1" />
            <select
              value={selectedMonthFilter}
              onChange={(e) => setSelectedMonthFilter(Number(e.target.value))}
              className="bg-transparent border-none text-white text-xs font-bold focus:outline-none pr-2"
            >
              <option value={0} className="bg-slate-800 text-white">
                ช่วงเวลา: ตลอดทั้งปี {activeYear + 543}
              </option>
              {monthNamesTh.map((mName, idx) => (
                <option key={idx + 1} value={idx + 1} className="bg-slate-800 text-white">
                  เดือน {mName} {activeYear + 543}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Seed Button */}
          <button
            onClick={() => {
              if (confirm('ต้องการโหลด/รีเซ็ตข้อมูลตัวอย่างเพื่อแสดงรายงานครบถ้วนหรือไม่?')) {
                resetToDefaultData();
              }
            }}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 p-2 rounded-xl text-xs font-semibold flex items-center space-x-1 transition"
            title="รีเซ็ตและโหลดข้อมูลตารางกะตัวอย่างครบ 12 เดือน"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">โหลดข้อมูลตัวอย่าง</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Work Days */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>วันทำงานรวม</span>
            <CalendarCheck2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {stats.workDaysCount} <span className="text-xs font-normal text-slate-400">วัน</span>
          </div>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
            กะเช้า / บ่าย / ดึก รวม
          </p>
        </div>

        {/* Leaves */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>วันสารวม (Leave)</span>
            <CalendarOff className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {stats.leaveCount} <span className="text-xs font-normal text-slate-400">วัน</span>
          </div>
          <p className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">
            ลาพักร้อน / ลากิจ
          </p>
        </div>

        {/* Company Holidays */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>นักขัตฤกษ์/บริษัท (HL)</span>
            <Award className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {stats.holidayCount} <span className="text-xs font-normal text-slate-400">วัน</span>
          </div>
          <p className="text-[10px] text-orange-600 dark:text-orange-400 font-medium">
            วันหยุดพิเศษบริษัท
          </p>
        </div>

        {/* Weekly Off */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>วันหยุดสัปดาห์ (OFF)</span>
            <CalendarDays className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {stats.offCount} <span className="text-xs font-normal text-slate-400">วัน</span>
          </div>
          <p className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">
            วันอาทิตย์ / OFF
          </p>
        </div>

        {/* OT Count */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>กะ OT รวม (+OT)</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {stats.otCount} <span className="text-xs font-normal text-slate-400">ครั้ง</span>
          </div>
          <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
            +N / +A / M+
          </p>
        </div>
      </div>

      {/* Visual Proportion Bar Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center justify-between">
          <span>สัดส่วนประเภทกะการทำงานเทียบกับวันหยุดภาพรวม</span>
          <span className="text-xs text-slate-400 font-normal">
            บุคลากร {targetEmployees.length} คน
          </span>
        </h3>

        {/* Multi-segment Progress Bar */}
        {(() => {
          const totalDays = stats.workDaysCount + stats.leaveCount + stats.holidayCount + stats.offCount || 1;
          const pWork = Math.round((stats.workDaysCount / totalDays) * 100);
          const pLeave = Math.round((stats.leaveCount / totalDays) * 100);
          const pHol = Math.round((stats.holidayCount / totalDays) * 100);
          const pOff = Math.max(0, 100 - pWork - pLeave - pHol);

          return (
            <div className="space-y-3">
              <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
                <div
                  style={{ width: `${pWork}%` }}
                  className="bg-emerald-500 hover:bg-emerald-600 transition-all"
                  title={`วันทำงาน: ${stats.workDaysCount} วัน (${pWork}%)`}
                />
                <div
                  style={{ width: `${pLeave}%` }}
                  className="bg-purple-500 hover:bg-purple-600 transition-all"
                  title={`วันลา: ${stats.leaveCount} วัน (${pLeave}%)`}
                />
                <div
                  style={{ width: `${pHol}%` }}
                  className="bg-orange-500 hover:bg-orange-600 transition-all"
                  title={`นักขัตฤกษ์: ${stats.holidayCount} วัน (${pHol}%)`}
                />
                <div
                  style={{ width: `${pOff}%` }}
                  className="bg-rose-400 hover:bg-rose-500 transition-all"
                  title={`วันหยุดสัปดาห์: ${stats.offCount} วัน (${pOff}%)`}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded bg-emerald-500 shrink-0" />
                  <span className="text-slate-600 dark:text-slate-300">
                    วันทำงาน: <strong>{stats.workDaysCount} วัน</strong> ({pWork}%)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded bg-purple-500 shrink-0" />
                  <span className="text-slate-600 dark:text-slate-300">
                    วันลา (L): <strong>{stats.leaveCount} วัน</strong> ({pLeave}%)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded bg-orange-500 shrink-0" />
                  <span className="text-slate-600 dark:text-slate-300">
                    บริษัท (HL): <strong>{stats.holidayCount} วัน</strong> ({pHol}%)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded bg-rose-400 shrink-0" />
                  <span className="text-slate-600 dark:text-slate-300">
                    วันหยุด (OFF): <strong>{stats.offCount} วัน</strong> ({pOff}%)
                  </span>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Summary Table Per Employee */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <Users className="w-4 h-4 text-indigo-500" />
            <span>ตารางสรุปการทำงานและวันลารายบุคคล ({activeYear + 543})</span>
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            แสดงข้อมูลบุคลากร {stats.empBreakdown.length} รายการ
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-2.5">ชื่อ-นามสกุล</th>
                <th className="p-2.5">ชื่อเล่น</th>
                <th className="p-2.5">แผนก</th>
                <th className="p-2.5 text-emerald-600 dark:text-emerald-400">วันทำงาน</th>
                <th className="p-2.5 text-purple-600 dark:text-purple-400">วันลา (L)</th>
                <th className="p-2.5 text-orange-600 dark:text-orange-400">นักขัตฤกษ์ (HL)</th>
                <th className="p-2.5 text-rose-600 dark:text-rose-400">วันหยุด (OFF)</th>
                <th className="p-2.5 text-amber-600 dark:text-amber-400">OT รวม</th>
                <th className="p-2.5">กะดึก (N)</th>
                <th className="p-2.5">กะบ่าย (A)</th>
                <th className="p-2.5">กะเช้า (M)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {stats.empBreakdown.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-6 text-center text-slate-400 italic">
                    ไม่พบข้อมูลพนักงานสำหรับเงื่อนไขที่เลือก
                  </td>
                </tr>
              ) : (
                stats.empBreakdown.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200">
                      {row.name}
                    </td>
                    <td className="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">
                      {row.codeName}
                    </td>
                    <td className="p-2.5 font-semibold text-purple-600 dark:text-purple-400">
                      {row.deptName}
                    </td>
                    <td className="p-2.5 font-bold text-emerald-600 dark:text-emerald-400">
                      {row.workDays} วัน
                    </td>
                    <td className="p-2.5 font-bold text-purple-600 dark:text-purple-400">
                      {row.leaves} วัน
                    </td>
                    <td className="p-2.5 font-bold text-orange-600 dark:text-orange-400">
                      {row.holidays} วัน
                    </td>
                    <td className="p-2.5 font-bold text-rose-600 dark:text-rose-400">
                      {row.offs} วัน
                    </td>
                    <td className="p-2.5 font-bold text-amber-600 dark:text-amber-400">
                      {row.otCount} ครั้ง
                    </td>
                    <td className="p-2.5 text-slate-600 dark:text-slate-400">{row.night}</td>
                    <td className="p-2.5 text-slate-600 dark:text-slate-400">{row.afternoon}</td>
                    <td className="p-2.5 text-slate-600 dark:text-slate-400">{row.morning}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

