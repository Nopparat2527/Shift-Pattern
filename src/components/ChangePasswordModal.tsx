import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { KeyRound, CheckCircle2, AlertCircle, Eye, EyeOff, Lock, X } from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, changePassword } = useApp();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!oldPassword.trim()) {
      setErrorMessage('กรุณาระบุรหัสผ่านเดิม (รหัสผ่านเริ่มต้นคือ รหัสพนักงาน)');
      return;
    }
    if (!newPassword.trim()) {
      setErrorMessage('กรุณาระบุรหัสผ่านใหม่');
      return;
    }
    if (newPassword.trim().length < 4) {
      setErrorMessage('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 4 ตัวอักษร');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('รหัสผ่านใหม่ทั้งสองช่องไม่ตรงกัน');
      return;
    }

    // Attempt change
    // Extract employee/user ID (e.g., if currentUser.id is user-emp-emp-101, target ID is emp-101)
    const targetId = currentUser.id.startsWith('user-emp-')
      ? currentUser.id.replace('user-emp-', '')
      : currentUser.id;

    const res = changePassword(targetId, oldPassword, newPassword);
    if (!res.success) {
      setErrorMessage(res.message);
    } else {
      setSuccessMessage('เปลี่ยนรหัสผ่านสำเร็จเรียบร้อยแล้ว!');
      setTimeout(() => {
        onClose();
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setSuccessMessage('');
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 text-slate-800 dark:text-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/60 rounded-xl text-indigo-600 dark:text-indigo-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">เปลี่ยนรหัสผ่าน (Change Password)</h3>
              <p className="text-[11px] text-slate-500">{currentUser.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMessage && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs text-emerald-700 dark:text-emerald-300 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs text-rose-600 dark:text-rose-300 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {/* Old Password */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-200">
              รหัสผ่านเดิม (Old Password)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="ใส่รหัสผ่านเดิม (เริ่มต้นคือ รหัสพนักงาน)"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-200">
              รหัสผ่านใหม่ (New Password)
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="กำหนดรหัสผ่านใหม่ (อย่างน้อย 4 ตัวอักษร)"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-200">
              ยืนยันรหัสผ่านใหม่ (Confirm New Password)
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="กรอกรหัสผ่านใหม่อีกครั้งให้ตรงกัน"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-2 flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="w-1/2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow-md"
            >
              บันทึกรหัสผ่าน
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
