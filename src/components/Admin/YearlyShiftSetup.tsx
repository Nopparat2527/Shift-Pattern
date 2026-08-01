import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Copy,
  Calendar,
  CheckCircle2,
  Lock,
  Unlock,
  ShieldCheck,
  Building2,
  ArrowRight,
} from 'lucide-react';

export const YearlyShiftSetup: React.FC = () => {
  const {
    isAdmin,
    yearlyConfigs,
    toggleYearlyPlanning,
    copyShiftsToYear,
    departments,
    setActiveYear,
  } = useApp();

  const year2027Config = yearlyConfigs.find((y) => y.year === 2027) || {
    year: 2027,
    isPlanningEnabled: true,
    isLocked: false,
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-cyan-400" />
            <h2 className="text-lg font-bold">
              1.4 จัดการรอบปีและจัดกะล่วงหน้าสิ้นปี (Yearly Shift Setup)
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            เปิดระบบสร้างหรือคัดลอกตารางกะล่วงหน้าสำหรับปีถัดไป ให้หัวหน้าแผนกเข้ามาจัดตารางกะล่วงหน้าได้ช่วงสิ้นปี
          </p>
        </div>
      </div>

      {/* Main Setting Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Toggle Next Year Planning */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 rounded-2xl border border-cyan-200 dark:border-cyan-800 font-bold text-lg">
                2027
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  สิทธิ์การจัดกะล่วงหน้าปี 2027
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  เปิดให้หัวหน้าแผนกเตรียมจัดกะช่วงสิ้นปี
                </span>
              </div>
            </div>

            {isAdmin && (
              <button
                onClick={() =>
                  toggleYearlyPlanning(2027, !year2027Config.isPlanningEnabled)
                }
                className="transition transform active:scale-95"
              >
                {year2027Config.isPlanningEnabled ? (
                  <ToggleRight className="w-10 h-10 text-cyan-500" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-slate-400" />
                )}
              </button>
            )}
          </div>

          <div
            className={`p-4 rounded-xl text-xs border ${
              year2027Config.isPlanningEnabled
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            <div className="font-bold flex items-center space-x-1.5 mb-1">
              {year2027Config.isPlanningEnabled ? (
                <>
                  <Unlock className="w-4 h-4 text-emerald-600" />
                  <span>สถานะ: เปิดให้หัวหน้าแผนกจัดตารางกะปี 2027 ได้แล้ว</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-slate-500" />
                  <span>สถานะ: ปิดการแก้ไขตารางกะปี 2027</span>
                </>
              )}
            </div>
            <p>
              หัวหน้าแผนกจะสามารถสลับไปเลือกปี 2027 บนหน้าจัดตารางกะ เพื่อวางตารางกะล่วงหน้าของทีมตนเองได้
            </p>
          </div>
        </div>

        {/* Card 2: Quick Mass Copy Shift */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 rounded-2xl border border-purple-200 dark:border-purple-800 font-bold">
              <Copy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                คัดลอกตารางกะทั้งบริษัท (Copy Shift)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                คัดลอกตารางกะจากปี 2026 ไปเป็นต้นแบบปี 2027
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300">
            ระบบจะคัดลอกรูปแบบกะของพนักงานทุกแผนกจากปี 2026 ไปยังวันตรงกันของปี 2027 เพื่อประหยัดเวลาการคีย์ตารางกะสิ้นปี
          </p>

          <button
            onClick={() => {
              if (
                confirm(
                  'คุณต้องการคัดลอกตารางกะปี 2026 ไปยังปี 2027 สำหรับทุกแผนกใช่หรือไม่?'
                )
              ) {
                copyShiftsToYear(2026, 2027);
                setActiveYear(2027);
                alert('คัดลอกตารางกะปี 2027 สำเร็จแล้ว! สลับไปที่ปี 2027 เรียบร้อย');
              }
            }}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center space-x-2 transition shadow-md"
          >
            <Copy className="w-4 h-4" />
            <span>คัดลอกตารางกะปี 2026 ➔ 2027 (ทุกแผนก)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Department Readiness Checklist */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center space-x-2">
          <Building2 className="w-4 h-4 text-indigo-500" />
          <span>สถานะการเตรียมตารางกะปีถัดไป รายแผนก</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {departments.map((d) => (
            <div
              key={d.id}
              className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 p-3.5 rounded-xl text-xs space-y-1.5"
            >
              <div className="font-bold text-slate-800 dark:text-slate-200">{d.name}</div>
              <div className="text-[11px] text-slate-400">หัวหน้า: {d.supervisorName}</div>
              <div className="pt-2 flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>พร้อมจัดกะปี 2027</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
