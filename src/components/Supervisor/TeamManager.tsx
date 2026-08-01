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
      setJoinDate(emp.joinDate);
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

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-6 h-6 text-amber-400" />
            <h2 className="text-lg font-bold">
              จัดการรายชื่อลูกน้องในทีม ({currentDept?.name || 'แผนกของคุณ'})
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            {isSupervisor
              ? `🔒 ข้อมูลจำกัดเฉพาะหัวหน้าแผนก ${currentDept?.code} - ไม่เห็นข้อมูลลูกน้องแผนกอื่น`
              : '👑 สิทธิ์แอดมิน: สามารถเพิ่ม แก้ไข และย้ายลูกน้องประจำแต่ละแผนกได้'}
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 transition shadow-md shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>เพิ่มพนักงานเข้าทีม</span>
        </button>
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
        {myTeam.map((emp) => (
          <div
            key={emp.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition relative group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-300 font-extrabold flex items-center justify-center text-base border border-amber-500/30">
                  {emp.codeName}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {emp.name}
                  </h3>
                  <div className="text-xs font-medium text-amber-600 dark:text-amber-400">
                    ชื่อเล่น: {emp.codeName}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1 opacity-90 group-hover:opacity-100 transition">
                <button
                  onClick={() => handleOpenModal(emp)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded-lg transition"
                  title="แก้ไขข้อมูล"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
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
                <span>{emp.joinDate}</span>
              </div>
            </div>

            <div className="mt-3 flex justify-end">
              <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                ● ปฏิบัติงานปกติ
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form
            onSubmit={handleSaveEmployee}
            className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl text-white space-y-4"
          >
            <h3 className="text-base font-bold pb-2 border-b border-slate-800">
              {editingEmployee ? 'แก้ไขข้อมูลพนักงาน' : 'เพิ่มพนักงานใหม่เข้าทีม'}
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  รหัสพนักงาน:
                </label>
                <input
                  type="text"
                  required
                  value={employeeCode}
                  onChange={(e) => setEmployeeCode(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  ชื่อเล่น (Code Name):
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น Boy, Kai, Beer"
                  value={codeName}
                  onChange={(e) => setCodeName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">
                  ชื่อ-นามสกุล (ภาษาไทย/อังกฤษ):
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น Siwapong Keawkuakool"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  ตำแหน่งประจำสายงาน:
                </label>
                <input
                  type="text"
                  required
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
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
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              {isAdmin && (
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
                บันทึกพนักงาน
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
