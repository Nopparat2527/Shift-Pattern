import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { AuditCategory } from '../types';
import {
  History,
  Search,
  Download,
  Filter,
  User,
  Clock,
  ShieldCheck,
  Building2,
  CalendarCheck2,
  ArrowRight,
  FileSpreadsheet,
} from 'lucide-react';

export const AuditLogViewer: React.FC = () => {
  const { auditLogs } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categoriesMap: Record<AuditCategory, { label: string; color: string }> = {
    SHIFT_SCHEDULE: { label: 'ตารางกะ', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    PRODUCTION_PLAN: { label: 'แผนการผลิต', color: 'bg-amber-100 text-amber-800 border-amber-300' },
    USER_MANAGEMENT: { label: 'สิทธิ์ผู้ใช้', color: 'bg-teal-100 text-teal-800 border-teal-300' },
    DEPARTMENT: { label: 'โครงสร้างแผนก', color: 'bg-purple-100 text-purple-800 border-purple-300' },
    COMPANY_HOLIDAY: { label: 'วันหยุดบริษัท', color: 'bg-rose-100 text-rose-800 border-rose-300' },
    YEARLY_CONFIG: { label: 'ตั้งค่ารอบปี', color: 'bg-cyan-100 text-cyan-800 border-cyan-300' },
    TEAM_MEMBER: { label: 'ข้อมูลลูกน้อง', color: 'bg-amber-100 text-amber-800 border-amber-300' },
    SWAP_LEAVE_REQUEST: { label: 'สลับกะ/ลา', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  };

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchCategory = selectedCategory === 'ALL' || log.category === selectedCategory;
      const matchSearch =
        log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.targetRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchCategory && matchSearch;
    });
  }, [auditLogs, selectedCategory, searchTerm]);

  const handleExportCSV = () => {
    const headers = [
      'Log ID',
      'Timestamp',
      'Actor Name',
      'Role',
      'Department',
      'Category',
      'Action',
      'Target Ref',
      'Old Value',
      'New Value',
      'Details',
    ];

    const rows = filteredLogs.map((log) => [
      log.id,
      `"${log.formattedDate}"`,
      `"${log.actorName}"`,
      log.actorRole,
      `"${log.actorDepartmentName || ''}"`,
      log.category,
      `"${log.action}"`,
      `"${log.targetRef}"`,
      `"${log.oldValue || ''}"`,
      `"${log.newValue || ''}"`,
      `"${log.details || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.join('\n')].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Audit_Logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <History className="w-6 h-6 text-yellow-400" />
            <h2 className="text-lg font-bold">
              ระบบบันทึกประวัติการแก้ไขข้อมูลทั้งหมด (Audit Trail Logs)
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            บันทึกการกระทำทุกขั้นตอน (การแก้ไขตารางกะ, เพิ่มวันหยุด, ปรับสิทธิ์ผู้ใช้, อนุมัติสลับกะ) พร้อมประวัติค่าเดิม ➔ ค่าใหม่ ย้อนหลัง
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 transition shadow-md shrink-0"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>ส่งออกประวัติ CSV</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="ค้นหาชื่อผู้ดำเนินการ, การกระทำ, หรือรายการอ้างอิง..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
              selectedCategory === 'ALL'
                ? 'bg-yellow-500 text-slate-950 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            ทั้งหมด ({auditLogs.length})
          </button>
          {Object.entries(categoriesMap).map(([catKey, info]) => (
            <button
              key={catKey}
              onClick={() => setSelectedCategory(catKey)}
              className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                selectedCategory === catKey
                  ? 'bg-yellow-500 text-slate-950 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {info.label}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table / List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredLogs.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-xs italic">
              ไม่พบประวัติการแก้ไขข้อมูลตามเงื่อนไขที่ค้นหา
            </div>
          ) : (
            filteredLogs.map((log) => {
              const catInfo = categoriesMap[log.category] || {
                label: log.category,
                color: 'bg-slate-100 text-slate-800',
              };

              return (
                <div
                  key={log.id}
                  className="p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition space-y-2 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${catInfo.color}`}
                      >
                        {catInfo.label}
                      </span>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                        {log.action}
                      </h4>
                      <span className="text-slate-400">➔</span>
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400 font-mono">
                        {log.targetRef}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 text-slate-400 text-[11px]">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{log.formattedDate}</span>
                      </span>
                      <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        IP: {log.ipAddress}
                      </span>
                    </div>
                  </div>

                  {/* Actor Details */}
                  <div className="flex items-center space-x-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      ผู้ดำเนินการ: {log.actorName}
                    </span>
                    <span>({log.actorRole === 'ADMIN' ? 'แอดมินระบบ' : 'หัวหน้าแผนก'})</span>
                    {log.actorDepartmentName && (
                      <span className="text-purple-600 dark:text-purple-400 font-medium">
                        • {log.actorDepartmentName}
                      </span>
                    )}
                  </div>

                  {/* Diff Box */}
                  {(log.oldValue || log.newValue) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60 text-[11px]">
                      <div className="text-rose-700 dark:text-rose-400 font-mono">
                        <span className="font-bold text-[10px] uppercase block text-slate-400">
                          ค่าเดิม (Old Value):
                        </span>
                        {log.oldValue || '-'}
                      </div>
                      <div className="text-emerald-700 dark:text-emerald-400 font-mono">
                        <span className="font-bold text-[10px] uppercase block text-slate-400">
                          ค่าใหม่ (New Value):
                        </span>
                        {log.newValue || '-'}
                      </div>
                    </div>
                  )}

                  {log.details && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                      หมายเหตุเพิ่มเติม: {log.details}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
