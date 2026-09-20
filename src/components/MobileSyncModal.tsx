import React, { useState } from 'react';
import { QrCode, Copy, Check, Smartphone, ExternalLink, Info, Download, Upload, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface MobileSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileSyncModal: React.FC<MobileSyncModalProps> = ({ isOpen, onClose }) => {
  const { shifts, productionPlans, departments, employees, users, holidays, yearlyConfigs, shiftTypes, fpPlanOptions, injPlanOptions } = useApp();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Determine current live URL
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const liveUrl = currentOrigin.includes('localhost') || currentOrigin.includes('127.0.0.1')
    ? 'https://ais-pre-q5q55wpg47h4qm7q2bjyje-502086985046.asia-east1.run.app'
    : currentOrigin;

  // High quality QR code API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(liveUrl)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(liveUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleExportBackup = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      version: '2.0-central-sync',
      shifts,
      productionPlans,
      departments,
      employees,
      users,
      holidays,
      yearlyConfigs,
      shiftTypes,
      fpPlanOptions,
      injPlanOptions,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shift_schedule_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">เปิดใช้งานบนมือถือ (Mobile Sync)</h3>
              <p className="text-xs text-slate-400">สแกนเปิดใช้งานเพื่อให้ข้อมูลตรงกับ PC ทันที</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Diagnostic Note about the uploaded image */}
          <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3.5 space-y-2 text-xs">
            <div className="flex items-center space-x-2 text-amber-300 font-bold">
              <Info className="w-4 h-4 shrink-0 text-amber-400" />
              <span>ทำไมข้อมูลในมือถือรูปเดิมถึงไม่ตรงกับ PC?</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              ในรูปที่ถ่ายจากมือถือ พบว่าเบราว์เซอร์เปิดอยู่ที่ลิงก์ <strong className="text-amber-200">nopparat3.vercel.app</strong> ซึ่งเป็นเว็บเก่าที่ Deploy ไว้ต่างหากบน Vercel โดยไม่มีระบบเซิร์ฟเวอร์กลาง และอ่านข้อมูลเฉพาะจากความจำเครื่อง (LocalStorage) ของมือถือนั้นๆ
            </p>
            <p className="text-emerald-300 font-medium">
              💡 <strong>วิธีแก้ให้ตรงกัน:</strong> สแกน QR Code ด้านล่างนี้ด้วยกล้องมือถือ เพื่อเปิดลิงก์ระบบกลางเดียวกัน ข้อมูลตารางกะและแผนผลิตทั้งหมดจะตรงกับบน PC 100% ทันที!
            </p>
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-950/60 border border-slate-800 rounded-2xl">
            <div className="p-3 bg-white rounded-xl shadow-lg border-2 border-indigo-500/30">
              <img
                src={qrCodeUrl}
                alt="QR Code สำหรับเปิดบนมือถือ"
                className="w-48 h-48 block"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-xs text-slate-400 mt-3 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>ใช้กล้องมือถือ (iPhone/Android) หรือ LINE สแกนเปิดใช้งานได้เลย</span>
            </p>
          </div>

          {/* Direct URL Box */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">หรือคัดลอกลิงก์นี้ไปเปิดในเบราว์เซอร์มือถือ:</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={liveUrl}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono truncate focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopy}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition shrink-0 ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>คัดลอกแล้ว</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>คัดลอกลิงก์</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Optional: Backup JSON */}
          <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
            <div className="text-xs text-slate-400">
              <p className="font-semibold text-slate-300">สำรองข้อมูลตารางกะ (JSON)</p>
              <p>สามารถดาวน์โหลดข้อมูลปัจจุบันเก็บไว้ได้</p>
            </div>
            <button
              type="button"
              onClick={handleExportBackup}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>ดาวน์โหลดไฟล์</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
