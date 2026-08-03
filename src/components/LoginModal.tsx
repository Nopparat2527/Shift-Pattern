import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
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
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

export const LoginModal: React.FC = () => {
  const {
    theme,
    toggleTheme,
    loginWithUsernamePassword,
    requestOTPForEmployee,
    resetPasswordWithOTP,
  } = useApp();

  // Mode: 'LOGIN' | 'FORGOT_REQUEST_OTP' | 'FORGOT_VERIFY_OTP'
  const [mode, setMode] = useState<'LOGIN' | 'FORGOT_REQUEST_OTP' | 'FORGOT_VERIFY_OTP'>('LOGIN');

  // Login Form States
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Forgot Password / OTP States
  const [forgotUsername, setForgotUsername] = useState('');
  const [otpTargetData, setOtpTargetData] = useState<{
    targetId: string;
    targetName: string;
    targetPhone: string;
    targetPhoneMasked: string;
    otpCode: string;
    refCode: string;
  } | null>(null);

  const [enteredOtp, setEnteredOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [timerCount, setTimerCount] = useState(60);
  const [canResendOtp, setCanResendOtp] = useState(false);

  // Countdown timer for OTP
  useEffect(() => {
    let interval: any = null;
    if (mode === 'FORGOT_VERIFY_OTP' && timerCount > 0) {
      interval = setInterval(() => {
        setTimerCount((prev) => {
          if (prev <= 1) {
            setCanResendOtp(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [mode, timerCount]);

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

  // Handle Request OTP
  const handleRequestOTP = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    const targetQuery = forgotUsername.trim() || usernameInput.trim();
    if (!targetQuery) {
      setErrorMessage('กรุณาระบุชื่อพนักงาน หรือชื่อเล่นเพื่อขอ OTP');
      return;
    }

    const res = requestOTPForEmployee(targetQuery);
    if (!res.success) {
      setErrorMessage(res.message);
    } else if (res.targetId && res.otpCode) {
      setOtpTargetData({
        targetId: res.targetId,
        targetName: res.targetName || '',
        targetPhone: res.targetPhone || '',
        targetPhoneMasked: res.targetPhoneMasked || '',
        otpCode: res.otpCode,
        refCode: res.refCode || 'REF-A01',
      });
      setMode('FORGOT_VERIFY_OTP');
      setTimerCount(60);
      setCanResendOtp(false);
      setEnteredOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setErrorMessage('');
    }
  };

  // Handle Resend OTP
  const handleResendOTP = () => {
    if (!otpTargetData) return;
    handleRequestOTP();
  };

  // Handle Reset Password Submit
  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!otpTargetData) return;

    if (!enteredOtp.trim()) {
      setErrorMessage('กรุณาระบุรหัส OTP 6 หลัก');
      return;
    }

    if (enteredOtp.trim() !== otpTargetData.otpCode) {
      setErrorMessage('รหัส OTP ไม่ถูกต้อง กรุณาตรวจสอบจาก SMS จำลอง หรือกดขอ OTP อีกครั้ง');
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

    const res = resetPasswordWithOTP(otpTargetData.targetId, newPassword);
    if (!res.success) {
      setErrorMessage(res.message);
    } else {
      setSuccessMessage('สร้างรหัสผ่านใหม่สำเร็จแล้ว! กรุณาใช้รหัสผ่านใหม่เข้าสู่ระบบ');
      setMode('LOGIN');
      setPasswordInput(newPassword);
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
                      setMode('FORGOT_REQUEST_OTP');
                      setErrorMessage('');
                    }}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                  >
                    ลืมรหัสผ่าน? (ขอ OTP)
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

          {/* MODE 2: Request OTP Step */}
          {mode === 'FORGOT_REQUEST_OTP' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <Phone className="w-5 h-5 text-indigo-500" />
                  <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    ขอรหัส OTP ทางเบอร์มือถือ
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMode('LOGIN');
                    setErrorMessage('');
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium flex items-center space-x-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>กลับหน้าเข้าสู่ระบบ</span>
                </button>
              </div>

              <form onSubmit={handleRequestOTP} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    ระบุชื่อพนักงาน หรือชื่อเล่นที่ต้องการขอ OTP
                  </label>
                  <input
                    type="text"
                    value={forgotUsername}
                    onChange={(e) => setForgotUsername(e.target.value)}
                    placeholder="พิมพ์ชื่อ หรือชื่อเล่น เช่น Boy, Kai, Siwapong..."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  />
                  <p className="text-[11px] text-slate-500">
                    ระบบจะส่ง OTP ยืนยันไปยังเบอร์มือถือที่ลงทะเบียนไว้ในระบบของพนักงานท่านนี้
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-sm transition shadow-md flex items-center justify-center space-x-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>ส่งรหัส OTP ไปยังเบอร์มือถือ</span>
                </button>
              </form>
            </div>
          )}

          {/* MODE 3: Verify OTP & Set New Password */}
          {mode === 'FORGOT_VERIFY_OTP' && otpTargetData && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <KeyRound className="w-5 h-5 text-indigo-500" />
                  <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    ยืนยัน OTP และสร้างรหัสผ่านใหม่
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMode('LOGIN');
                    setErrorMessage('');
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium flex items-center space-x-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>ยกเลิก</span>
                </button>
              </div>

              {/* Target Employee Info */}
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-indigo-900 dark:text-indigo-200">
                    {otpTargetData.targetName}
                  </div>
                  <div className="text-indigo-600 dark:text-indigo-400 font-medium text-[11px]">
                    📱 เบอร์มือถือ: {otpTargetData.targetPhoneMasked}
                  </div>
                </div>
                <span className="font-mono text-[10px] bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-0.5 rounded-lg">
                  {otpTargetData.refCode}
                </span>
              </div>

              {/* Simulated SMS Notification Card */}
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/50 border-2 border-amber-300 dark:border-amber-700 rounded-2xl shadow-sm space-y-2">
                <div className="flex items-center justify-between text-amber-800 dark:text-amber-300 font-bold text-xs">
                  <span className="flex items-center space-x-1.5">
                    <MessageSquare className="w-4 h-4 text-amber-600" />
                    <span>📱 [SMS Simulator] ข้อความจำลองส่งเข้ามือถือ</span>
                  </span>
                  <span className="text-[10px] font-mono text-amber-600">SMS LIVE</span>
                </div>
                <div className="text-xs text-amber-900 dark:text-amber-200 bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800 font-mono flex items-center justify-between">
                  <div>
                    รหัส OTP คือ: <span className="font-black text-indigo-600 dark:text-indigo-400 text-base">{otpTargetData.otpCode}</span> (Ref: {otpTargetData.refCode})
                  </div>
                  <button
                    type="button"
                    onClick={() => setEnteredOtp(otpTargetData.otpCode)}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-sans font-bold shadow-sm transition"
                  >
                    กรอกให้อัตโนมัติ
                  </button>
                </div>
              </div>

              {/* Form inputs */}
              <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
                {/* OTP Input */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-slate-700 dark:text-slate-200">
                      กรอกรหัส OTP 6 หลัก
                    </label>
                    <span className="text-[11px] text-slate-500">
                      {timerCount > 0 ? (
                        `ขอรหัสใหม่ได้ใน ${timerCount}s`
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendOTP}
                          className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                        >
                          ขอรหัส OTP อีกครั้ง
                        </button>
                      )}
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full text-center tracking-widest font-mono text-lg font-bold px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* New Password */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    รหัสผ่านใหม่ (New Password)
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="กำหนดรหัสผ่านใหม่ (อย่างน้อย 4 ตัวอักษร)"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400"
                    >
                      {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    ยืนยันรหัสผ่านใหม่ (Confirm Password)
                  </label>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="กรอกรหัสผ่านใหม่อีกครั้งให้ตรงกัน"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Submit Reset Button */}
                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs transition shadow-md flex items-center justify-center space-x-1.5 mt-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>บันทึกรหัสผ่านใหม่และเข้าสู่ระบบ</span>
                </button>
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
