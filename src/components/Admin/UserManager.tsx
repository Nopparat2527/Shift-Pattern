import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole, Department } from '../../types';
import {
  ShieldCheck,
  UserPlus,
  Trash2,
  Key,
  ShieldAlert,
  Building2,
  Mail,
  UserCheck,
  Plus,
  Edit2,
  Check,
  X,
  PlusCircle,
  Settings,
} from 'lucide-react';

export const UserManager: React.FC = () => {
  const {
    isAdmin,
    users,
    departments,
    addUser,
    updateUserRole,
    deleteUser,
    addDepartment,
    updateDepartment,
    deleteDepartment,
  } = useApp();

  // User Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('SUPERVISOR');
  const [departmentId, setDepartmentId] = useState('');
  const [position, setPosition] = useState('');

  // Quick Department Modal State
  const [isDeptQuickModalOpen, setIsDeptQuickModalOpen] = useState(false);

  // New Department Form State
  const [newDeptCode, setNewDeptCode] = useState('');
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptDesc, setNewDeptDesc] = useState('');

  // Inline Department Editing State
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [editDeptCode, setEditDeptCode] = useState('');
  const [editDeptName, setEditDeptName] = useState('');
  const [editDeptDesc, setEditDeptDesc] = useState('');

  const handleOpenUserModal = (userToEdit?: User) => {
    if (userToEdit) {
      setEditingUser(userToEdit);
      setName(userToEdit.name);
      setEmail(userToEdit.email);
      setRole(userToEdit.role);
      setDepartmentId(userToEdit.departmentId || departments[0]?.id || '');
      setPosition(userToEdit.position || '');
    } else {
      setEditingUser(null);
      setName('');
      setEmail('');
      setRole('SUPERVISOR');
      setDepartmentId(departments[0]?.id || '');
      setPosition('หัวหน้าแผนก (Supervisor)');
    }
    setIsModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    if (editingUser) {
      updateUserRole(editingUser.id, role, role === 'SUPERVISOR' ? departmentId : undefined);
    } else {
      addUser({
        name,
        email,
        role,
        departmentId: role === 'SUPERVISOR' ? departmentId : undefined,
        position: position || (role === 'ADMIN' ? 'System Admin' : 'Supervisor'),
      });
    }

    setIsModalOpen(false);
    setName('');
    setEmail('');
  };

  // Add new department handler inside quick modal
  const handleAddNewDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptCode || !newDeptName) return;

    const id = `dept-${Date.now()}`;
    addDepartment({
      code: newDeptCode.trim().toUpperCase(),
      name: newDeptName.trim(),
      description: newDeptDesc.trim(),
    });

    // Auto-select newly created department
    setDepartmentId(id);

    setNewDeptCode('');
    setNewDeptName('');
    setNewDeptDesc('');
  };

  // Start inline editing of department
  const handleStartEditDept = (dept: Department) => {
    setEditingDeptId(dept.id);
    setEditDeptCode(dept.code);
    setEditDeptName(dept.name);
    setEditDeptDesc(dept.description || '');
  };

  // Save inline department edit
  const handleSaveEditDept = (deptId: string) => {
    if (!editDeptCode || !editDeptName) return;

    updateDepartment(deptId, {
      code: editDeptCode.trim().toUpperCase(),
      name: editDeptName.trim(),
      description: editDeptDesc.trim(),
    });

    setEditingDeptId(null);
  };

  if (!isAdmin) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-white">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold">สงวนสิทธิ์เฉพาะแอดมินระบบ (System Admin Only)</h2>
        <p className="text-xs text-slate-400 mt-1">
          หัวหน้าแผนกไม่ได้รับสิทธิ์ในการจัดการสิทธิ์ผู้ใช้งานในระบบ
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
            <ShieldCheck className="w-6 h-6 text-teal-400" />
            <h2 className="text-lg font-bold">1.2 จัดการผู้ใช้งานระบบ (User Management)</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            เพิ่ม/แก้ไข/ลบ สิทธิ์แอดมินและหัวหน้าแผนก พร้อมปรับปรุงรายชื่อแผนกได้แบบเรียลไทม์
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsDeptQuickModalOpen(true)}
            className="bg-purple-600/90 hover:bg-purple-500 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center space-x-2 transition shadow-md shrink-0 border border-purple-500/40"
          >
            <Building2 className="w-4 h-4" />
            <span>จัดการรายชื่อแผนก (Add/Edit/Delete Dept)</span>
          </button>

          <button
            onClick={() => handleOpenUserModal()}
            className="bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 transition shadow-md shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>เพิ่มผู้ใช้งานระบบ</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3">ชื่อ-นามสกุล / ตำแหน่ง</th>
                <th className="p-3">อีเมล</th>
                <th className="p-3">ระดับสิทธิ์ (Role)</th>
                <th className="p-3">แผนกที่สังกัด</th>
                <th className="p-3 text-right">การจัดการสิทธิ์ & แผนก</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((u) => {
                const assignedDept = departments.find((d) => d.id === u.departmentId);

                return (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">
                      <div>{u.name}</div>
                      <div className="text-[11px] font-normal text-slate-400">{u.position}</div>
                    </td>

                    <td className="p-3 text-slate-600 dark:text-slate-400 font-mono">
                      {u.email}
                    </td>

                    <td className="p-3">
                      <span
                        className={`inline-flex items-center text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-800 border border-purple-300'
                            : u.role === 'SUPERVISOR'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {u.role === 'ADMIN'
                          ? '👑 แอดมินระบบ (System Admin)'
                          : '👔 หัวหน้าแผนก (Supervisor)'}
                      </span>
                    </td>

                    <td className="p-3 text-slate-700 dark:text-slate-300">
                      {u.role === 'ADMIN' ? (
                        <span className="text-purple-600 dark:text-purple-400 font-semibold">
                          ทุกแผนก (ภาพรวมบริษัท)
                        </span>
                      ) : assignedDept ? (
                        <span className="font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                          {assignedDept.name} ({assignedDept.code})
                        </span>
                      ) : (
                        <span className="text-amber-500 font-medium">ยังไม่ได้เลือกแผนก</span>
                      )}
                    </td>

                    <td className="p-3 text-right space-x-1.5">
                      <button
                        onClick={() => handleOpenUserModal(u)}
                        className="bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 text-[11px] font-bold px-2.5 py-1 rounded-lg transition"
                        title="แก้ไขข้อมูล / เปลี่ยนแผนก"
                      >
                        <Edit2 className="w-3 h-3 inline mr-1" />
                        แก้ไขแผนก/สิทธิ์
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`คุณต้องการลบบัญชีผู้ใช้ ${u.name} ใช่หรือไม่?`)) {
                            deleteUser(u.id);
                          }
                        }}
                        className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition inline-flex items-center"
                        title="ลบบัญชี"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form
            onSubmit={handleSaveUser}
            className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl text-white space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold">
                {editingUser ? 'แก้ไขผู้ใช้งานระบบ / ปรับแผนก' : 'เพิ่มผู้ใช้งานระบบใหม่'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">ชื่อ-นามสกุล:</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น สมศักดิ์ จัดการระบบ"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">อีเมลผู้ใช้งาน:</label>
                <input
                  type="email"
                  required
                  placeholder="somsak@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">ระดับสิทธิ์ (Role):</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-bold"
                >
                  <option value="SUPERVISOR">หัวหน้าแผนก (Supervisor)</option>
                  <option value="ADMIN">แอดมินระบบ (System Admin)</option>
                </select>
              </div>

              {role === 'SUPERVISOR' && (
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-200 font-bold">แผนกที่รับผิดชอบ:</label>
                    <button
                      type="button"
                      onClick={() => setIsDeptQuickModalOpen(true)}
                      className="text-[11px] text-teal-400 hover:text-teal-300 font-bold flex items-center space-x-1 underline"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>+ เพิ่ม / แก้ไข / ลบแผนก</span>
                    </button>
                  </div>

                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl p-2.5 text-white font-semibold"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">ตำแหน่งงาน:</label>
                <input
                  type="text"
                  placeholder="เช่น หัวหน้าแผนกการผลิต F&P"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
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
                className="bg-teal-600 hover:bg-teal-500 text-white px-5 py-2 rounded-xl text-xs font-bold transition shadow-md"
              >
                {editingUser ? 'บันทึกการแก้ไข' : 'บันทึกผู้ใช้'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Quick Department Manager Modal (Add / Edit / Delete Departments Directly) */}
      {isDeptQuickModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl text-white space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold">จัดการช่องแผนก (เพิ่ม / แก้ไข / ลบแผนก)</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDeptQuickModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Section 1: Quick Add New Department Form */}
            <form
              onSubmit={handleAddNewDept}
              className="bg-slate-800/90 border border-purple-500/30 rounded-xl p-3.5 space-y-3"
            >
              <span className="text-xs font-bold text-purple-300 flex items-center space-x-1">
                <Plus className="w-4 h-4" />
                <span>เพิ่มแผนกใหม่เข้าสู่ระบบ:</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">รหัสแผนก (Code):</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น QA"
                    value={newDeptCode}
                    onChange={(e) => setNewDeptCode(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 mb-1 font-medium">ชื่อแผนกเต็ม:</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น แผนกควบคุมคุณภาพ QC"
                    value={newDeptName}
                    onChange={(e) => setNewDeptName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium text-xs">คำอธิบายเพิ่มเติม:</label>
                <input
                  type="text"
                  placeholder="รายละเอียดหน้าที่แผนก (ระบุหรือไม่ก็ได้)..."
                  value={newDeptDesc}
                  onChange={(e) => setNewDeptDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>บันทึกเพิ่มแผนกใหม่</span>
                </button>
              </div>
            </form>

            {/* Section 2: Existing Departments List with Edit / Delete */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                รายชื่อแผนกปัจจุบัน ({departments.length} แผนก):
              </h4>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {departments.map((dept) => {
                  const isEditingThis = editingDeptId === dept.id;

                  if (isEditingThis) {
                    return (
                      <div
                        key={dept.id}
                        className="bg-purple-950/60 border border-purple-500 rounded-xl p-3 space-y-2 text-xs"
                      >
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={editDeptCode}
                            onChange={(e) => setEditDeptCode(e.target.value)}
                            className="bg-slate-900 border border-slate-700 rounded p-1.5 font-mono text-white"
                          />
                          <input
                            type="text"
                            value={editDeptName}
                            onChange={(e) => setEditDeptName(e.target.value)}
                            className="col-span-2 bg-slate-900 border border-slate-700 rounded p-1.5 text-white"
                          />
                        </div>
                        <input
                          type="text"
                          value={editDeptDesc}
                          onChange={(e) => setEditDeptDesc(e.target.value)}
                          placeholder="คำอธิบาย..."
                          className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-white"
                        />

                        <div className="flex justify-end space-x-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setEditingDeptId(null)}
                            className="bg-slate-800 text-slate-300 text-[11px] px-2.5 py-1 rounded"
                          >
                            ยกเลิก
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEditDept(dept.id)}
                            className="bg-teal-600 text-white font-bold text-[11px] px-3 py-1 rounded flex items-center space-x-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>บันทึก</span>
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={dept.id}
                      className="bg-slate-800 border border-slate-700 rounded-xl p-3 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="bg-purple-900/80 text-purple-200 border border-purple-700 px-2 py-0.5 rounded font-mono font-bold text-[11px]">
                            {dept.code}
                          </span>
                          <span className="font-bold text-white">{dept.name}</span>
                        </div>
                        {dept.description && (
                          <div className="text-[11px] text-slate-400 mt-0.5">{dept.description}</div>
                        )}
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => handleStartEditDept(dept)}
                          className="p-1.5 hover:bg-slate-700 text-indigo-300 rounded transition"
                          title="แก้ไขแผนกนี้"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`คุณต้องการลบแผนก ${dept.name} ใช่หรือไม่?`)) {
                              deleteDepartment(dept.id);
                            }
                          }}
                          className="p-1.5 hover:bg-rose-950 text-rose-400 rounded transition"
                          title="ลบแผนกนี้"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsDeptQuickModalOpen(false)}
                className="bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs px-5 py-2 rounded-xl transition"
              >
                เสร็จสิ้น
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

