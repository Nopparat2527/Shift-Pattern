import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Department } from '../../types';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  UserCheck,
  Users,
  ShieldAlert,
  Info,
} from 'lucide-react';

export const DepartmentManager: React.FC = () => {
  const {
    isAdmin,
    departments,
    users,
    employees,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    assignSupervisor,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSupUserId, setSelectedSupUserId] = useState<string>('');

  const handleOpenModal = (dept?: Department) => {
    if (dept) {
      setEditingDept(dept);
      setName(dept.name);
      setCode(dept.code);
      setDescription(dept.description || '');
      setSelectedSupUserId(dept.supervisorId || '');
    } else {
      setEditingDept(null);
      setName('');
      setCode('');
      setDescription('');
      setSelectedSupUserId('');
    }
    setIsModalOpen(true);
  };

  const handleSaveDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;

    if (editingDept) {
      updateDepartment(editingDept.id, {
        name,
        code,
        description,
      });
      if (selectedSupUserId !== editingDept.supervisorId) {
        assignSupervisor(editingDept.id, selectedSupUserId || undefined);
      }
    } else {
      addDepartment({
        name,
        code,
        description,
        supervisorId: selectedSupUserId || undefined,
      });
    }

    setIsModalOpen(false);
  };

  if (!isAdmin) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-white">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold">สงวนสิทธิ์เฉพาะแอดมินระบบ (System Admin Only)</h2>
        <p className="text-xs text-slate-400 mt-1">
          หัวหน้าแผนกสามารถจัดการได้เฉพาะลูกน้องในทีมของตนเอง ไม่สามารถปรับเปลี่ยนโครงสร้างแผนกได้
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-purple-400" />
            <h2 className="text-lg font-bold">1.1 จัดการแผนกและหัวหน้า (Department & Supervisor)</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            เพิ่ม/แก้ไข/ลบ รายชื่อแผนกบริษัท และแต่งตั้งหัวหน้าประจำทีมเพื่อควบคุมสิทธิ์จัดตารางกะ
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 transition shadow-md shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มแผนกใหม่</span>
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-purple-950/40 border border-purple-800/50 rounded-2xl p-4 text-xs text-purple-200 flex items-start space-x-3">
        <Info className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
        <div>
          <strong>หลักการจำกัดสิทธิ์ (Data Isolation):</strong> เมื่อแต่งตั้งหัวหน้าแผนกประจำแผนกใดแล้ว หัวหน้าแผนกท่านนั้นจะเห็นและจัดตารางกะได้ <em>เฉพาะแผนกของตนเองเท่านั้น</em> ระบบจะปิดกั้นการมองเห็นข้ามแผนกโดยอัตโนมัติ
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {departments.map((dept) => {
          const empCountInDept = employees.filter((e) => e.departmentId === dept.id).length;

          return (
            <div
              key={dept.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800 font-mono font-bold text-xs px-2.5 py-0.5 rounded-md">
                      {dept.code}
                    </span>
                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                      {dept.name}
                    </h3>
                  </div>
                  {dept.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {dept.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenModal(dept)}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded-lg transition"
                    title="แก้ไขแผนก / หัวหน้า"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`คุณต้องการลบแผนก ${dept.name} ใช่หรือไม่?`)) {
                        deleteDepartment(dept.id);
                      }
                    }}
                    className="p-1.5 hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-500 rounded-lg transition"
                    title="ลบแผนก"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Assigned Supervisor */}
              <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-3 border border-slate-100 dark:border-slate-700/80 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-purple-500" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">หัวหน้าแผนกผู้ดูแล:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {dept.supervisorName || 'ยังไม่ได้ตั้งแต่ง'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1 text-slate-500 font-semibold bg-white dark:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-600">
                  <Users className="w-3.5 h-3.5 text-amber-500" />
                  <span>{empCountInDept} คน</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Department Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form
            onSubmit={handleSaveDepartment}
            className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl text-white space-y-4"
          >
            <h3 className="text-base font-bold pb-2 border-b border-slate-800">
              {editingDept ? 'แก้ไขแผนกและแต่งตั้งหัวหน้า' : 'เพิ่มแผนกใหม่'}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  รหัสแผนก (Code):
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น F&P, INJ, QC"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  ชื่อแผนกเต็ม:
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น แผนกการผลิต F&P"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  แต่งตั้งหัวหน้าประจำแผนก (Supervisor):
                </label>
                <select
                  value={selectedSupUserId}
                  onChange={(e) => setSelectedSupUserId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                >
                  <option value="">-- ยังไม่แต่งตั้ง --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.position})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  คำอธิบายเพิ่มเติม:
                </label>
                <input
                  type="text"
                  placeholder="รายละเอียดหน้าที่แผนก..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>
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
                className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-md"
              >
                บันทึกแผนก
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
