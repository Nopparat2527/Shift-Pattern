import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Employee } from '../../types';
import {
  Users,
  UserPlus,
  Edit2,
  Trash2,
  Search,
  ShieldCheck,
  Phone,
  Calendar,
  Briefcase,
  UserCheck,
  Building2,
} from 'lucide-react';

export const TeamManager: React.FC = () => {
  const {
    currentUser,
    isAdmin,
    isSupervisor,
    userDepartmentId,
    departments,
    employees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Form State
  const [employeeCode, setEmployeeCode] = useState('');
  const [name, setName] = useState('');
  const [codeName, setCodeName] = useState('');
  const [position, setPosition] = useState('');
  const [phone, setPhone] = useState('');
  const [joinDate, setJoinDate] = useState('2026-01-01');
  const [targetDeptId, setTargetDeptId] = useState('');

  // Determine active department
  const activeDeptId = userDepartmentId || departments[0]?.id || '';
  const currentDept = departments.find((d) => d.id === activeDeptId);

  // Access control
  const canManageTeam = isAdmin || isSupervisor;

  // Helper to check if an employee is the current logged-in user
  const checkIsSelf = (emp: Employee) => {
    const cleanCurrentId = currentUser.id.replace('user-emp-', '');
    if (emp.id === cleanCurrentId) return true;
    if (currentUser.email && currentUser.email.startsWith(emp.employeeCode)) return true;
    if (currentUser.name && (currentUser.name.includes(emp.name) || currentUser.name.includes(emp.codeName))) return true;
    return false;
  };

  // Filter employees restricted to Supervisor's department
  const myTeam = employees.filter((emp) => {
    const isDeptMatch = isAdmin ? true : emp.departmentId === activeDeptId;
    const isSearchMatch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.codeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeCode.includes(searchTerm);
    return isDeptMatch && isSearchMatch;
  });

  const handleOpenModal = (emp?: Employee) => {
    if (emp) {
      setEditingEmployee(emp);
      setEmployeeCode(emp.employeeCode);
      setName(emp.name);
      setCodeName(emp.codeName);
      setPosition(emp.position);
      setPhone(emp.phone || '');
      setJoinDate(emp.joinDate || '2026-01-01');
      setTargetDeptId(emp.departmentId);
    } else {
      setEditingEmployee(null);
      setEmployeeCode(`07${Math.floor(10000 + Math.random() * 90000)}`);
      setName('');
      setCodeName('');
      setPosition('Line Operator');
      setPhone('081-123-4567');
      setJoinDate('2026-01-15');
      setTargetDeptId(activeDeptId);
    }
    setIsModalOpen(true);
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !codeName) return;

    if (editingEmployee) {
      updateEmployee(editingEmployee.id, {
        employeeCode,
        name,
        codeName,
        position,
        phone,
        joinDate,
        departmentId: isAdmin ? targetDeptId || activeDeptId : editingEmployee.departmentId,
      });
    } else {
      addEmployee({
        employeeCode,
        name,
        codeName,
        departmentId: isAdmin ? targetDeptId || activeDeptId : activeDeptId,
        position,
        status: 'ACTIVE',
        joinDate,
        phone,
      });
    }

    setIsModalOpen(false);
  };

  const isEditingSelf = editingEmployee ? checkIsSelf(editingEmployee) : false;
  const isEmployeeOnlySelf = isEditingSelf && !canManageTeam;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-6 h-6 text-amber-400" />
            <h2 className="text-lg font-bold">
              รายชื่อสมาชิกในทีม ({currentDept?.name || 'แผนกของคุณ'})
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            {isSupervisor
              ? `🔒 หัวหน้าแผนก ${currentDept?.code || ''}: สิทธิ์จัดการเพิ่ม/แก้ไข/ลบข้อมูลพนักงานในทีม`
              : isAdmin
              ? '👑 สิทธิ์แอดมิน: สามารถเพิ่ม แก้ไข และย้ายลูกน้องประจำแต่ละแผนกได้'
              : '👤 สิทธิ์พนักงาน: คุณสามารถแก้ไข "วันที่เริ่มงาน" และ "เบอร์โทรศัพท์" ของตนเองได้ (เพื่อนในทีมหรือนอกทีมไม่สามารถแก้ไขได้)'}
          </p>
        </div>

        {canManageTeam && (
          <button
            onClick={() => handleOpenModal()}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 transition shadow-md shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>เพิ่มพนักงานเข้าทีม</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="ค้นหาชื่อ หรือชื่อเล่น..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          พนักงานทั้งหมด: <strong className="text-amber-600 dark:text-amber-400">{myTeam.length}</strong> คน
        </div>
      </div>

      {/* Team Member Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {myTeam.map((emp) => {
          const isSelf = checkIsSelf(emp);
          const canEditThisEmp = canManageTeam || isSelf;
          const canDeleteThisEmp = canManageTeam;

          return (
            <div
              key={emp.id}
              className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm hover:shadow-md transition relative group ${
                isSelf
                  ? 'border-amber-400/80 dark:border-amber-500/60 ring-1 ring-amber-400/30'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-300 font-extrabold flex items-center justify-center text-base border border-amber-500/30">
                    {emp.codeName}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {emp.name}
                      </h3>
                      {isSelf && (
                        <span className="bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                          ตัวคุณ
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-medium text-amber-600 dark:text-amber-400">
                      ชื่อเล่น: {emp.codeName}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  {canEditThisEmp && (
                    <button
                      onClick={() => handleOpenModal(emp)}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-amber-500 rounded-lg transition"
                      title={
                        isSelf && !canManageTeam
                          ? 'แก้ไขวันที่เริ่มงานและเบอร์โทรส่วนตัว'
                          : 'แก้ไขข้อมูลพนักงาน'
                      }
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {canDeleteThisEmp && (
                    <button
                      onClick={() => {
                        if (confirm(`คุณต้องการลบพนักงาน ${emp.name} ออกจากทีมใช่หรือไม่?`)) {
                          deleteEmployee(emp.id);
                        }
                      }}
                      className="p-1.5 hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-500 rounded-lg transition"
                      title="ลบออกจากทีม"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {!canEditThisEmp && !canDeleteThisEmp && (
                    <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-medium">
                      🔒 อ่านอย่างเดียว
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center justify-between">
                  <span className="flex items-center space-x-1.5 text-slate-500">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>ตำแหน่ง:</span>
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {emp.position}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center space-x-1.5 text-slate-500">
                    <Phone className="w-3.5 h-3.5" />
                    <span>เบอร์โทร:</span>
                  </span>
                  <span className="font-mono">{emp.phone || '-'}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center space-x-1.5 text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>วันที่เริ่มงาน:</span>
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{emp.joinDate || '-'}</span>
                </div>
              </div>

              <div className="mt-3 flex justify-end">
                <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  ● ปฏิบัติงานปกติ
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form
            onSubmit={handleSaveEmployee}
            className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl text-white space-y-4"
          >
            <h3 className="text-base font-bold pb-2 border-b border-slate-800">
              {editingEmployee
                ? isEmployeeOnlySelf
                  ? 'แก้ไขข้อมูลส่วนตัว (วันที่เริ่มงาน / เบอร์โทร)'
                  : 'แก้ไขข้อมูลพนักงาน'
                : 'เพิ่มพนักงานใหม่เข้าทีม'}
            </h3>

            {isEmployeeOnlySelf && (
              <div className="bg-amber-950/60 border border-amber-700/80 rounded-xl p-3 text-xs text-amber-200 space-y-1">
                <p className="font-bold flex items-center space-x-1">
                  <span>ℹ️ สิทธิ์พนักงานส่วนตัว:</span>
                </p>
                <p className="text-[11px] text-amber-300/90 leading-relaxed">
                  คุณสามารถแก้ไขเฉพาะ <strong>"วันที่เริ่มงาน"</strong> และ <strong>"เบอร์โทรศัพท์"</strong> ของตนเองได้ ส่วนข้อมูลชื่อ-นามสกุล ตำแหน่ง และรหัสพนักงาน สามารถแก้ไขได้เฉพาะหัวหน้าแผนกหรือแอดมินเท่านั้น
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  รหัสพนักงาน:
                </label>
                <input
                  type="text"
                  required
                  disabled={isEmployeeOnlySelf}
                  value={employeeCode}
                  onChange={(e) => setEmployeeCode(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  ชื่อเล่น (Code Name):
                </label>
                <input
                  type="text"
                  required
                  disabled={isEmployeeOnlySelf}
                  placeholder="เช่น Boy, Kai, Beer"
                  value={codeName}
                  onChange={(e) => setCodeName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">
                  ชื่อ-นามสกุล (ภาษาไทย/อังกฤษ):
                </label>
                <input
                  type="text"
                  required
                  disabled={isEmployeeOnlySelf}
                  placeholder="เช่น Siwapong Keawkuakool"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  ตำแหน่งประจำสายงาน:
                </label>
                <input
                  type="text"
                  required
                  disabled={isEmployeeOnlySelf}
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  เบอร์โทรศัพท์:
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-amber-300 font-bold mb-1 flex items-center justify-between">
                  <span>📅 วันที่เริ่มงาน (Join Date):</span>
                  {isEmployeeOnlySelf && (
                    <span className="text-[10px] text-emerald-400 font-medium">
                      ✓ พนักงานสามารถแก้ไขได้
                    </span>
                  )}
                </label>
                <input
                  type="date"
                  required
                  value={joinDate}
                  onChange={(e) => setJoinDate(e.target.value)}
                  className="w-full bg-slate-800 border border-amber-500/50 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {isAdmin && !isEmployeeOnlySelf && (
                <div className="col-span-2">
                  <label className="block text-amber-400 font-bold mb-1">
                    สังกัดแผนก (Department):
                  </label>
                  <select
                    value={targetDeptId}
                    onChange={(e) => setTargetDeptId(e.target.value)}
                    className="w-full bg-slate-800 border border-amber-500/50 rounded-xl p-2.5 text-white font-semibold"
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

            <div className="mt-6 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold transition"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition shadow-md"
              >
                บันทึกข้อมูล
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
