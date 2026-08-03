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
  Check,
  UserPlus,
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
    assignSupervisors,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSupUserIds, setSelectedSupUserIds] = useState<string[]>([]);
  const [userSearchText, setUserSearchText] = useState('');

  const handleOpenModal = (dept?: Department) => {
    setUserSearchText('');
    if (dept) {
      setEditingDept(dept);
      setName(dept.name);
      setCode(dept.code);
      setDescription(dept.description || '');
      
      let initialSupIds: string[] = [];
      if (dept.supervisorIds && dept.supervisorIds.length > 0) {
        initialSupIds = dept.supervisorIds;
      } else if (dept.supervisorId) {
        initialSupIds = [dept.supervisorId];
      } else if (dept.supervisorName && dept.supervisorName !== 'ยังไม่ได้ตั้งแต่ง') {
        // Fallback match user by name if legacy name string
        const names = dept.supervisorName.split(',').map((s) => s.trim());
        const matched = users.filter((u) => names.some((n) => u.name.includes(n) || n.includes(u.name))).map((u) => u.id);
        initialSupIds = matched;
      }
      setSelectedSupUserIds(initialSupIds);
    } else {
      setEditingDept(null);
      setName('');
      setCode('');
      setDescription('');
      setSelectedSupUserIds([]);
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
      assignSupervisors(editingDept.id, selectedSupUserIds);
    } else {
      const newDeptId = `dept-${Date.now()}`;
      addDepartment({
        name,
        code,
        description,
        supervisorIds: selectedSupUserIds,
        supervisorId: selectedSupUserIds[0] || undefined,
      });
      // Assign supervisors after creation
      setTimeout(() => {
        assignSupervisors(newDeptId, selectedSupUserIds);
      }, 50);
    }

    setIsModalOpen(false);
  };

  const filteredUsers = users.filter((u) => {
    if (!userSearchText) return true;
    const q = userSearchText.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.position.toLowerCase().includes(q) ||
      (u.email && u.email.toLowerCase().includes(q))
    );
  });

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
            เพิ่ม/แก้ไข/ลบ รายชื่อแผนกบริษัท และแต่งตั้งหัวหน้าประจำทีม (สามารถกำหนดได้มากกว่า 1 คนต่อแผนก) เพื่อควบคุมสิทธิ์จัดตารางกะ
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
          <strong>หลักการจำกัดสิทธิ์ (Data Isolation & Multiple Supervisors):</strong> ท่านสามารถเลือกแต่งตั้งหัวหน้าแผนกได้<strong>มากกว่า 1 คนต่อหนึ่งแผนก</strong> โดยหัวหน้าแผนกทุกคนที่ถูกแต่งตั้งในแผนกนั้นๆ จะเห็นและจัดตารางกะของทีมในแผนกตนเองได้ทั้งหมด
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {departments.map((dept) => {
          const empCountInDept = employees.filter((e) => e.departmentId === dept.id).length;

          // Compute assigned supervisors list for this department
          const assignedSupUsers = users.filter(
            (u) =>
              (dept.supervisorIds && dept.supervisorIds.includes(u.id)) ||
              (u.role === 'SUPERVISOR' && u.departmentId === dept.id)
          );

          // Fallback supervisor names
          const displaySupNames =
            assignedSupUsers.length > 0
              ? assignedSupUsers.map((u) => u.name)
              : dept.supervisorNames && dept.supervisorNames.length > 0
              ? dept.supervisorNames
              : dept.supervisorName && dept.supervisorName !== 'ยังไม่ได้ตั้งแต่ง'
              ? dept.supervisorName.split(',').map((s) => s.trim()).filter(Boolean)
              : [];

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
                    title="แก้ไขแผนก / แต่งตั้งหัวหน้า"
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

              {/* Assigned Supervisors */}
              <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-3 border border-slate-100 dark:border-slate-700/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <UserCheck className="w-4 h-4 text-purple-500" />
                    <span className="text-slate-500 dark:text-slate-400 font-semibold text-[11px]">
                      หัวหน้าแผนกผู้ดูแล ({displaySupNames.length} คน):
                    </span>
                  </div>

                  <div className="flex items-center space-x-1 text-slate-500 font-semibold bg-white dark:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-600 text-xs">
                    <Users className="w-3.5 h-3.5 text-amber-500" />
                    <span>{empCountInDept} คน</span>
                  </div>
                </div>

                {displaySupNames.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {displaySupNames.map((supName, idx) => (
                      <div
                        key={idx}
                        className="bg-purple-100 dark:bg-purple-950/80 text-purple-900 dark:text-purple-200 border border-purple-300 dark:border-purple-800/80 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-sm"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        <span>{supName}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-400 dark:text-slate-500 italic text-xs pt-0.5">
                    ยังไม่ได้ตั้งแต่งหัวหน้าประจำแผนก
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Department Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveDepartment}
            className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl text-white space-y-4 my-8"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-purple-400" />
                <span>{editingDept ? 'แก้ไขแผนกและแต่งตั้งหัวหน้า' : 'เพิ่มแผนกใหม่'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    รหัสแผนก (Code):
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น F&P, INJ"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono font-bold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">
                    ชื่อแผนกเต็ม:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น แผนกการผลิต F&P"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-semibold"
                  />
                </div>
              </div>

              {/* Multi-Supervisor Picker Section */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-200 font-bold flex items-center space-x-1.5">
                    <UserPlus className="w-4 h-4 text-purple-400" />
                    <span>แต่งตั้งหัวหน้าประจำแผนก (เลือกได้มากกว่า 1 คน):</span>
                  </label>

                  <span className="text-[11px] font-extrabold text-purple-300 bg-purple-950/80 px-2.5 py-0.5 rounded-full border border-purple-800/60">
                    เลือก {selectedSupUserIds.length} คน
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    placeholder="🔍 ค้นหารายชื่อผู้ใช้..."
                    value={userSearchText}
                    onChange={(e) => setUserSearchText(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white w-full"
                  />

                  <div className="flex items-center space-x-1 shrink-0 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setSelectedSupUserIds(users.map((u) => u.id))}
                      className="px-2 py-1 bg-purple-900/60 hover:bg-purple-800 text-purple-200 rounded-lg font-semibold transition"
                    >
                      เลือกทั้งหมด
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedSupUserIds([])}
                      className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-semibold transition"
                    >
                      ล้าง
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900/90 border border-slate-700 rounded-xl p-2 max-h-48 overflow-y-auto space-y-1.5">
                  {filteredUsers.length === 0 ? (
                    <p className="text-slate-400 text-center py-3 italic">ไม่พบผู้ใช้งาน</p>
                  ) : (
                    filteredUsers.map((u) => {
                      const isChecked = selectedSupUserIds.includes(u.id);
                      return (
                        <label
                          key={u.id}
                          className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition border text-xs ${
                            isChecked
                              ? 'bg-purple-950/60 border-purple-600/80 text-white font-semibold shadow-sm'
                              : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800/80'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5 overflow-hidden">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedSupUserIds((prev) => [...prev, u.id]);
                                } else {
                                  setSelectedSupUserIds((prev) =>
                                    prev.filter((id) => id !== u.id)
                                  );
                                }
                              }}
                              className="w-4 h-4 rounded border-slate-600 text-purple-600 focus:ring-purple-500 accent-purple-600 cursor-pointer"
                            />
                            <div className="truncate">
                              <div className="font-bold text-slate-100 flex items-center space-x-1.5">
                                <span>{u.name}</span>
                                {u.role === 'ADMIN' && (
                                  <span className="text-[9px] bg-rose-900/80 text-rose-300 px-1.5 py-0.2 rounded font-mono">
                                    ADMIN
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">
                                {u.position} {u.email ? `• ${u.email}` : ''}
                              </div>
                            </div>
                          </div>

                          {isChecked && (
                            <div className="flex items-center space-x-1 bg-purple-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shrink-0">
                              <Check className="w-3 h-3" />
                              <span>หัวหน้าแผนก</span>
                            </div>
                          )}
                        </label>
                      );
                    })
                  )}
                </div>
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

            <div className="mt-6 flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold transition"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2 rounded-xl text-xs font-bold transition shadow-md flex items-center space-x-1.5"
              >
                <span>บันทึกข้อมูลแผนก</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

