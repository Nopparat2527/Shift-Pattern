import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  ShieldAlert,
  Sun,
  Moon,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  User,
  Eye,
  EyeOff,
  Phone,
  KeyRound,
  MessageSquare,
  RefreshCw,
  RotateCcw,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

export const LoginModal: React.FC = () => {
  const {
    theme,
    toggleTheme,
    loginWithUsernamePassword,
    requestAdminResetPassword,
    resetPasswordToEmployeeCode,
  } = useApp();

  // Mode: 'LOGIN' | 'FORGOT_PASSWORD'
  const [mode, setMode] = useState<'LOGIN' | 'FORGOT_PASSWORD'>('LOGIN');

  // Login Form States
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Forgot Password States
  const [forgotUsername, setForgotUsername] = useState('');
  const [requestResult, setRequestResult] = useState<{
    targetId: string;
    targetName: string;
    message: string;
  } | null>(null);

  // Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!usernameInput.trim()) {
      setErrorMessage('กรุณาระบุชื่อพนักงาน หรือชื่อเล่น');
      return;
    }
    if (!passwordInput.trim()) {
      setErrorMessage('กรุณาระบุรหัสผ่าน (รหัสผ่านเริ่มต้นคือ รหัสพนักงาน)');
      return;
    }

    const res = loginWithUsernamePassword(usernameInput, passwordInput);
    if (!res.success) {
      setErrorMessage(res.message);
    }
  };

  // Handle Request Admin Reset
  const handleRequestAdminReset = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const targetQuery = forgotUsername.trim() || usernameInput.trim();
    if (!targetQuery) {
      setErrorMessage('กรุณาระบุชื่อพนักงาน หรือรหัสพนักงาน');
      return;
    }

    const res = requestAdminResetPassword(targetQuery);
    if (!res.success) {
      setErrorMessage(res.message);
    } else if (res.targetId && res.targetName) {
      setRequestResult({
        targetId: res.targetId,
        targetName: res.targetName,
        message: res.message,
      });
      setSuccessMessage(res.message);
    }
  };

  // Handle Instant Direct Reset to Employee Code
  const handleDirectResetToEmpCode = () => {
    if (!requestResult?.targetId) return;
    const res = resetPasswordToEmployeeCode(requestResult.targetId);
    if (res.success) {
      setSuccessMessage(`รีเซ็ตรหัสผ่านของคุณ ${requestResult.targetName} กลับเป็นรหัสพนักงาน (${res.defaultPassword}) เรียบร้อยแล้ว! สามารถใช้รหัสพนักงานนี้เข้าสู่ระบบได้ทันที`);
      setPasswordInput(res.defaultPassword || '');
      setMode('LOGIN');
      setErrorMessage('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 transition-all">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 relative border-b border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-indigo-500/20 border border-indigo-400/30 rounded-2xl">
                <ShieldCheck className="w-7 h-7 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight">เข้าสู่ระบบ / Authentication</h1>
                <p className="text-xs text-slate-300">
                  ระบบบริหารจัดการตารางกะและวันหยุดประจำปี
                </p>
              </div>
            </div>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition flex items-center space-x-1 text-xs font-semibold"
              title={theme === 'dark' ? 'เปลี่ยนเป็นธีมสว่าง' : 'เปลี่ยนเป็นธีมมืด'}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">สว่าง</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span className="hidden sm:inline">มืด</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-2.5 text-xs text-indigo-200 flex items-start space-x-2">
            <Lock className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">เงื่อนไขการเข้าสู่ระบบ:</span> ใส่ชื่อ/ชื่อเล่น และรหัสผ่าน (เริ่มต้นใช้รหัสพนักงาน)
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5">
          {/* Success Banner */}
          {successMessage && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs text-emerald-700 dark:text-emerald-300 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Global Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs text-rose-600 dark:text-rose-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* MODE 1: Standard Username + Password Login */}
          {mode === 'LOGIN' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Field 1: Username / Employee Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                  ชื่อพนักงาน หรือชื่อเล่น (User / Name)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4 text-indigo-500" />
                  </div>
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => {
                      setUsernameInput(e.target.value);
                      setErrorMessage('');
                    }}
                    placeholder="พิมพ์ชื่อพนักงาน หรือชื่อเล่น เช่น Siwapong, Boy, Kai..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  />
                </div>
              </div>

              {/* Field 2: Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                    รหัสผ่าน (Password)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotUsername(usernameInput);
                      setMode('FORGOT_PASSWORD');
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                  >
                    ลืมรหัสผ่าน? (แจ้งแอดมิน)
                  </button>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4 text-indigo-500" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setErrorMessage('');
                    }}
                    placeholder="ใส่รหัสผ่าน (เริ่มต้นใช้รหัสพนักงาน เช่น 0756208)"
                    className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  💡 รหัสผ่านเริ่มต้น คือ <span className="font-bold text-indigo-600 dark:text-indigo-400">รหัสพนักงาน (Employee Code)</span>
                </p>
              </div>

              {/* Submit Login */}
              <button
                type="submit"
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-sm transition shadow-md hover:shadow-indigo-500/20 flex items-center justify-center space-x-2 mt-2"
              >
                <span>เข้าสู่ระบบ</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* MODE: Forgot Password - Notify Admin to Reset back to Employee Code */}
          {mode === 'FORGOT_PASSWORD' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="w-5 h-5 text-indigo-500" />
                  <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    แจ้งแอดมินรีเซ็ตรหัสผ่านเป็นรหัสพนักงาน
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMode('LOGIN');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium flex items-center space-x-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>กลับหน้าเข้าสู่ระบบ</span>
                </button>
              </div>

              {/* Policy Banner */}
              <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700/80 rounded-2xl text-xs space-y-1.5 text-amber-900 dark:text-amber-200">
                <div className="font-bold flex items-center space-x-1.5 text-amber-800 dark:text-amber-300">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>นโยบายความปลอดภัยการรีเซ็ตรหัสผ่าน</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  กรณีลืมรหัสผ่าน ระบบกำหนดให้ส่งเรื่องแจ้งผู้ดูแลระบบ (Admin) เพื่อทำการรีเซ็ตรหัสผ่านกลับไปเป็น <strong className="underline">รหัสพนักงาน (Employee Code)</strong> ซึ่งเป็นรหัสผ่านเริ่มต้นของระบบ
                </p>
              </div>

              <form onSubmit={handleRequestAdminReset} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    ระบุชื่อพนักงาน หรือรหัสพนักงานของคุณ
                  </label>
                  <input
                    type="text"
                    value={forgotUsername}
                    onChange={(e) => setForgotUsername(e.target.value)}
                    placeholder="พิมพ์ชื่อ หรือรหัสพนักงาน เช่น Kai, Boy, 0756208..."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  />
                  <p className="text-[11px] text-slate-500">
                    ระบบจะบันทึกคำขอแจ้ง Admin ในระบบ Audit Logs และให้ Admin ช่วยรีเซ็ตให้
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs transition shadow-md flex items-center justify-center space-x-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>📩 ส่งคำขอแจ้งแอดมิน</span>
                  </button>

                  {requestResult?.targetId && (
                    <button
                      type="button"
                      onClick={handleDirectResetToEmpCode}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs transition shadow-md flex items-center justify-center space-x-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>🔄 รีเซ็ตรหัสผ่านเป็นรหัสพนักงานทันที (Auto Reset)</span>
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="bg-slate-100 dark:bg-slate-950 px-6 py-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
          <span className="flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>รหัสผ่านเริ่มต้น = รหัสพนักงาน (เปลี่ยนและขอ OTP ใหม่ได้ตลอดเวลา)</span>
          </span>
          <span className="font-mono text-[10px]">v2.1 Auth Security</span>
        </div>
      </div>
    </div>
  );
};
