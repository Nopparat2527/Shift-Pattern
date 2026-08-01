import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShiftType, PlanOptionItem } from '../../types';
import {
  X,
  Plus,
  Edit2,
  Trash2,
  Palette,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

interface OptionManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'SHIFT' | 'FP' | 'INJ';
}

export const COLOR_PRESETS = [
  {
    name: 'Blue (ฟ้า)',
    bg: 'bg-blue-100 dark:bg-blue-900/40',
    text: 'text-blue-800 dark:text-blue-300',
    border: 'border-blue-300 dark:border-blue-700',
    previewBg: 'bg-blue-500',
  },
  {
    name: 'Sky (ฟ้าใส)',
    bg: 'bg-sky-100 dark:bg-sky-950',
    text: 'text-sky-900 dark:text-sky-200',
    border: 'border-sky-300 dark:border-sky-800',
    previewBg: 'bg-sky-400',
  },
  {
    name: 'Emerald (เขียว)',
    bg: 'bg-emerald-100 dark:bg-emerald-950',
    text: 'text-emerald-900 dark:text-emerald-200',
    border: 'border-emerald-300 dark:border-emerald-800',
    previewBg: 'bg-emerald-500',
  },
  {
    name: 'Amber (เหลืองส้ม)',
    bg: 'bg-amber-100 dark:bg-amber-950',
    text: 'text-amber-950 dark:text-amber-100',
    border: 'border-amber-300 dark:border-amber-700',
    previewBg: 'bg-amber-500',
  },
  {
    name: 'Yellow (เหลืองสว่าง)',
    bg: 'bg-yellow-100 dark:bg-yellow-950',
    text: 'text-yellow-950 dark:text-yellow-100',
    border: 'border-yellow-400 dark:border-yellow-700',
    previewBg: 'bg-yellow-400',
  },
  {
    name: 'Rose (ชมพูแดง)',
    bg: 'bg-rose-100 dark:bg-rose-950/80',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-300 dark:border-rose-800',
    previewBg: 'bg-rose-500',
  },
  {
    name: 'Purple (ม่วง)',
    bg: 'bg-purple-100 dark:bg-purple-950',
    text: 'text-purple-900 dark:text-purple-200',
    border: 'border-purple-300 dark:border-purple-800',
    previewBg: 'bg-purple-500',
  },
  {
    name: 'Orange (ส้ม)',
    bg: 'bg-orange-100 dark:bg-orange-950',
    text: 'text-orange-900 dark:text-orange-200',
    border: 'border-orange-300 dark:border-orange-800',
    previewBg: 'bg-orange-500',
  },
  {
    name: 'Teal (เขียวฟ้า)',
    bg: 'bg-teal-100 dark:bg-teal-950',
    text: 'text-teal-900 dark:text-teal-200',
    border: 'border-teal-300 dark:border-teal-800',
    previewBg: 'bg-teal-500',
  },
  {
    name: 'Lime (เขียวมะนาว)',
    bg: 'bg-lime-100 dark:bg-lime-950',
    text: 'text-lime-950 dark:text-lime-200',
    border: 'border-lime-300 dark:border-lime-700',
    previewBg: 'bg-lime-500',
  },
  {
    name: 'Slate (เทา)',
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-800 dark:text-slate-200',
    border: 'border-slate-300 dark:border-slate-700',
    previewBg: 'bg-slate-500',
  },
  {
    name: 'Pink (ชมพู)',
    bg: 'bg-pink-100 dark:bg-pink-950',
    text: 'text-pink-900 dark:text-pink-200',
    border: 'border-pink-300 dark:border-pink-800',
    previewBg: 'bg-pink-500',
  },
  {
    name: 'Indigo (น้ำเงินเข้ม)',
    bg: 'bg-indigo-100 dark:bg-indigo-950',
    text: 'text-indigo-900 dark:text-indigo-200',
    border: 'border-indigo-300 dark:border-indigo-700',
    previewBg: 'bg-indigo-600',
  },
];

export const OptionManagerModal: React.FC<OptionManagerModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'SHIFT',
}) => {
  const {
    shiftTypes,
    fpPlanOptions,
    injPlanOptions,
    addShiftType,
    updateShiftType,
    deleteShiftType,
    addFPPlanOption,
    updateFPPlanOption,
    deleteFPPlanOption,
    addINJPlanOption,
    updateINJPlanOption,
    deleteINJPlanOption,
    resetOptionDefaults,
    isReadOnly,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'SHIFT' | 'FP' | 'INJ'>(defaultTab);

  // Editing state
  const [editingShiftCode, setEditingShiftCode] = useState<string | null>(null);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);

  // Form states
  const [codeVal, setCodeVal] = useState('');
  const [nameThVal, setNameThVal] = useState('');
  const [nameEnVal, setNameEnVal] = useState('');
  const [descVal, setDescVal] = useState('');
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [isWorkDayVal, setIsWorkDayVal] = useState(true);
  const [isOvertimeVal, setIsOvertimeVal] = useState(false);

  // Create state
  const [isCreating, setIsCreating] = useState(false);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<{
    category: 'SHIFT' | 'FP' | 'INJ';
    idOrCode: string;
    title: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleStartCreate = () => {
    setIsCreating(true);
    setEditingShiftCode(null);
    setEditingPlanId(null);
    setCodeVal('');
    setNameThVal('');
    setNameEnVal('');
    setDescVal('');
    setSelectedPresetIndex(0);
    setIsWorkDayVal(true);
    setIsOvertimeVal(false);
  };

  const handleStartEditShift = (shift: ShiftType) => {
    setIsCreating(false);
    setEditingShiftCode(shift.code);
    setEditingPlanId(null);
    setCodeVal(shift.code);
    setNameThVal(shift.nameTh);
    setNameEnVal(shift.nameEn || '');
    setDescVal(shift.description || '');
    setIsWorkDayVal(shift.isWorkDay);
    setIsOvertimeVal(!!shift.isOvertime);

    // find matching color preset
    const presetIdx = COLOR_PRESETS.findIndex((p) => p.bg === shift.colorBg);
    setSelectedPresetIndex(presetIdx >= 0 ? presetIdx : 0);
  };

  const handleStartEditPlan = (plan: PlanOptionItem) => {
    setIsCreating(false);
    setEditingPlanId(plan.id);
    setEditingShiftCode(null);
    setCodeVal(plan.code);
    setNameThVal(plan.name);
    setDescVal(plan.description || '');

    const presetIdx = COLOR_PRESETS.findIndex((p) => p.bg === plan.colorBg);
    setSelectedPresetIndex(presetIdx >= 0 ? presetIdx : 0);
  };

  const handleCancelForm = () => {
    setIsCreating(false);
    setEditingShiftCode(null);
    setEditingPlanId(null);
  };

  const handleSaveShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeVal.trim() || !nameThVal.trim()) return;

    const preset = COLOR_PRESETS[selectedPresetIndex] || COLOR_PRESETS[0];

    const newShiftObj: ShiftType = {
      code: codeVal.trim(),
      nameTh: nameThVal.trim(),
      nameEn: nameEnVal.trim() || nameThVal.trim(),
      colorBg: preset.bg,
      colorText: preset.text,
      colorBorder: preset.border,
      description: descVal.trim() || `${nameThVal.trim()}`,
      isWorkDay: isWorkDayVal,
      isOvertime: isOvertimeVal,
    };

    if (isCreating) {
      addShiftType(newShiftObj);
    } else if (editingShiftCode) {
      updateShiftType(editingShiftCode, newShiftObj);
    }

    handleCancelForm();
  };

  const handleSavePlanOption = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeVal.trim()) return;

    const preset = COLOR_PRESETS[selectedPresetIndex] || COLOR_PRESETS[0];

    const newPlanObj = {
      code: codeVal.trim(),
      name: nameThVal.trim() || codeVal.trim(),
      colorBg: preset.bg,
      colorText: preset.text,
      colorBorder: preset.border,
      description: descVal.trim(),
    };

    if (activeTab === 'FP') {
      if (isCreating) {
        addFPPlanOption(newPlanObj);
      } else if (editingPlanId) {
        updateFPPlanOption(editingPlanId, newPlanObj);
      }
    } else if (activeTab === 'INJ') {
      if (isCreating) {
        addINJPlanOption(newPlanObj);
      } else if (editingPlanId) {
        updateINJPlanOption(editingPlanId, newPlanObj);
      }
    }

    handleCancelForm();
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.category === 'SHIFT') {
      deleteShiftType(deleteTarget.idOrCode);
    } else if (deleteTarget.category === 'FP') {
      deleteFPPlanOption(deleteTarget.idOrCode);
    } else if (deleteTarget.category === 'INJ') {
      deleteINJPlanOption(deleteTarget.idOrCode);
    }

    setDeleteTarget(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-50 via-indigo-50/20 to-slate-50 dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-md">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <span>จัดการสัญลักษณ์กะ & แผนการผลิต</span>
                <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                เพิ่ม, แก้ไข, ลบ และเลือกโทนสีเพื่อแสดงผลในตารางจัดกะการทำงาน
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!isReadOnly && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('คุณต้องการรีเซ็ตสัญลักษณ์กะและแผนผลิตทั้งหมดเป็นค่าเริ่มต้นโรงงานหรือไม่?')) {
                    resetOptionDefaults();
                  }
                }}
                className="px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition flex items-center space-x-1"
                title="รีเซ็ตสัญลักษณ์กะและแผนผลิตกลับเป็นค่าเริ่มต้น"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">คืนค่าเริ่มต้น</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="px-6 py-2.5 bg-slate-100/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab('SHIFT');
                handleCancelForm();
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                activeTab === 'SHIFT'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-800'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <span>📋 สัญลักษณ์กะการทำงาน</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                {shiftTypes.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('FP');
                handleCancelForm();
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                activeTab === 'FP'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm border border-slate-200 dark:border-slate-800'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <span>📦 ตัวเลือกแผนผลิต F&P</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                {fpPlanOptions.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('INJ');
                handleCancelForm();
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                activeTab === 'INJ'
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm border border-slate-200 dark:border-slate-800'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <span>⚙️ ตัวเลือกแผนผลิต INJ</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                {injPlanOptions.length}
              </span>
            </button>
          </div>

          {!isReadOnly && !isCreating && !editingShiftCode && !editingPlanId && (
            <button
              type="button"
              onClick={handleStartCreate}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>
                {activeTab === 'SHIFT'
                  ? 'เพิ่มกะใหม่'
                  : activeTab === 'FP'
                  ? 'เพิ่มตัวเลือก F&P'
                  : 'เพิ่มตัวเลือก INJ'}
              </span>
            </button>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Add / Edit Form Panel */}
          {(isCreating || editingShiftCode || editingPlanId) && (
            <form
              onSubmit={activeTab === 'SHIFT' ? handleSaveShift : handleSavePlanOption}
              className="p-5 bg-gradient-to-b from-indigo-50/50 via-white to-slate-50 dark:from-slate-800/60 dark:via-slate-900 dark:to-slate-900 border-2 border-indigo-500/30 rounded-2xl space-y-4 shadow-sm animate-in slide-in-from-top-2 duration-200"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                  <Palette className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>
                    {isCreating
                      ? `สร้างรายการใหม่ (${activeTab === 'SHIFT' ? 'สัญลักษณ์กะ' : activeTab === 'FP' ? 'แผน F&P' : 'แผน INJ'})`
                      : `แก้ไขรายการ (${codeVal})`}
                  </span>
                </h3>
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-semibold"
                >
                  ยกเลิก
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Code Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {activeTab === 'SHIFT' ? 'รหัสสัญลักษณ์กะ (Code):' : 'ข้อความ/รหัสแผนผลิต (Code):'}
                  </label>
                  <input
                    type="text"
                    required
                    value={codeVal}
                    onChange={(e) => setCodeVal(e.target.value)}
                    placeholder={
                      activeTab === 'SHIFT' ? 'เช่น M, A, N, OT' : activeTab === 'FP' ? 'เช่น NPL 0.6L, Coke 0.6L' : 'เช่น 24.4, 11.47, OFF'
                    }
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                {/* Name TH Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {activeTab === 'SHIFT' ? 'ชื่อเรียกกะ (ภาษาไทย):' : 'ชื่อคำอธิบายตัวเลือก (Display Name):'}
                  </label>
                  <input
                    type="text"
                    required={activeTab === 'SHIFT'}
                    value={nameThVal}
                    onChange={(e) => setNameThVal(e.target.value)}
                    placeholder={
                      activeTab === 'SHIFT' ? 'เช่น กะเช้า, กะดึก' : 'เช่น ขวด NPL 0.6 ลิตร'
                    }
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                {/* Name EN Field (Only for Shift) */}
                {activeTab === 'SHIFT' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      ชื่อกะ (English Name):
                    </label>
                    <input
                      type="text"
                      value={nameEnVal}
                      onChange={(e) => setNameEnVal(e.target.value)}
                      placeholder="เช่น Morning Shift"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                )}

                {/* Description Field */}
                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    คำอธิบายเพิ่มเติม / เวลาทำงาน:
                  </label>
                  <input
                    type="text"
                    value={descVal}
                    onChange={(e) => setDescVal(e.target.value)}
                    placeholder={
                      activeTab === 'SHIFT'
                        ? 'เช่น 08:00 - 17:00 น.'
                        : 'เช่น รายละเอียดสินค้า หรือข้อความกำกับแผนผลิต'
                    }
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Shift Flags (For Shift tab only) */}
              {activeTab === 'SHIFT' && (
                <div className="flex items-center space-x-6 pt-1">
                  <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isWorkDayVal}
                      onChange={(e) => setIsWorkDayVal(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>นับเป็นวันทำงาน (Work Day)</span>
                  </label>

                  <label className="flex items-center space-x-2 text-xs font-bold text-amber-700 dark:text-amber-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isOvertimeVal}
                      onChange={(e) => setIsOvertimeVal(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>เป็นกะล่วงเวลา (+OT Overtime)</span>
                  </label>
                </div>
              )}

              {/* Color Theme Selector */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  เลือกโทนสีการแสดงผลในตาราง (Color Theme Palette):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                  {COLOR_PRESETS.map((preset, idx) => {
                    const isSel = selectedPresetIndex === idx;
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setSelectedPresetIndex(idx)}
                        className={`p-2 rounded-xl text-xs font-bold border transition flex items-center justify-between ${
                          preset.bg
                        } ${preset.text} ${preset.border} ${
                          isSel
                            ? 'ring-2 ring-indigo-500 shadow-md scale-105'
                            : 'hover:opacity-90'
                        }`}
                      >
                        <div className="flex items-center space-x-1.5 truncate">
                          <span className={`w-3 h-3 rounded-full ${preset.previewBg}`} />
                          <span className="truncate text-[11px]">{preset.name.split(' ')[0]}</span>
                        </div>
                        {isSel && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Preview Badge */}
              <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  ตัวอย่างการแสดงผลในตาราง:
                </span>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                      COLOR_PRESETS[selectedPresetIndex]?.bg || ''
                    } ${COLOR_PRESETS[selectedPresetIndex]?.text || ''} ${
                      COLOR_PRESETS[selectedPresetIndex]?.border || ''
                    }`}
                  >
                    {codeVal || 'CODE'} {nameThVal ? ` - ${nameThVal}` : ''}
                  </span>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-xl text-xs font-bold transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center space-x-1"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>บันทึกข้อมูล</span>
                </button>
              </div>
            </form>
          )}

          {/* Option List Display */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                รายการที่เปิดใช้งานปัจจุบัน ({
                  activeTab === 'SHIFT'
                    ? shiftTypes.length
                    : activeTab === 'FP'
                    ? fpPlanOptions.length
                    : injPlanOptions.length
                } รายการ):
              </span>
            </div>

            {/* TAB 1: Shift Codes List */}
            {activeTab === 'SHIFT' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {shiftTypes.map((shift) => (
                  <div
                    key={shift.code}
                    className={`p-3.5 rounded-2xl border transition flex flex-col justify-between space-y-2.5 ${shift.colorBg} ${shift.colorText} ${shift.colorBorder} shadow-sm`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-base font-extrabold px-2.5 py-0.5 rounded-lg bg-white/80 dark:bg-slate-900/80 shadow-sm border border-black/10">
                          {shift.code}
                        </span>
                        <div>
                          <div className="font-bold text-xs">{shift.nameTh}</div>
                          <div className="text-[10px] opacity-80">{shift.nameEn}</div>
                        </div>
                      </div>

                      {!isReadOnly && (
                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => handleStartEditShift(shift)}
                            className="p-1.5 hover:bg-white/60 dark:hover:bg-slate-900/60 rounded-lg text-slate-700 dark:text-slate-200 transition"
                            title="แก้ไขสัญลักษณ์กะนี้"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteTarget({
                                category: 'SHIFT',
                                idOrCode: shift.code,
                                title: `กะ ${shift.code} (${shift.nameTh})`,
                              })
                            }
                            className="p-1.5 hover:bg-rose-500/20 rounded-lg text-rose-600 dark:text-rose-400 transition"
                            title="ลบสัญลักษณ์กะนี้"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="text-[11px] opacity-90 leading-tight">
                      {shift.description}
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-semibold pt-1 border-t border-black/10">
                      <span>
                        {shift.isWorkDay ? '✅ วันทำงานปกติ' : '🏖️ วันหยุด/วันลา'}
                      </span>
                      {shift.isOvertime && (
                        <span className="px-1.5 py-0.5 bg-amber-500 text-white rounded-md font-bold">
                          +OT
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 2: F&P Options List */}
            {activeTab === 'FP' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {fpPlanOptions.map((opt) => (
                  <div
                    key={opt.id}
                    className={`p-3.5 rounded-2xl border transition flex items-center justify-between ${opt.colorBg} ${opt.colorText} ${opt.colorBorder} shadow-sm`}
                  >
                    <div>
                      <div className="font-extrabold text-sm flex items-center space-x-2">
                        <span>📦 {opt.code}</span>
                      </div>
                      <div className="text-xs opacity-90 mt-0.5">{opt.name}</div>
                      {opt.description && (
                        <div className="text-[10px] opacity-75 mt-1">{opt.description}</div>
                      )}
                    </div>

                    {!isReadOnly && (
                      <div className="flex items-center space-x-1 shrink-0 ml-2">
                        <button
                          type="button"
                          onClick={() => handleStartEditPlan(opt)}
                          className="p-1.5 hover:bg-white/60 dark:hover:bg-slate-900/60 rounded-lg text-slate-700 dark:text-slate-200 transition"
                          title="แก้ไขตัวเลือก F&P นี้"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteTarget({
                              category: 'FP',
                              idOrCode: opt.id,
                              title: `ตัวเลือก F&P: ${opt.code}`,
                            })
                          }
                          className="p-1.5 hover:bg-rose-500/20 rounded-lg text-rose-600 dark:text-rose-400 transition"
                          title="ลบตัวเลือก F&P นี้"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: INJ Options List */}
            {activeTab === 'INJ' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {injPlanOptions.map((opt) => (
                  <div
                    key={opt.id}
                    className={`p-3.5 rounded-2xl border transition flex items-center justify-between ${opt.colorBg} ${opt.colorText} ${opt.colorBorder} shadow-sm`}
                  >
                    <div>
                      <div className="font-extrabold text-sm flex items-center space-x-2">
                        <span>⚙️ {opt.code}</span>
                      </div>
                      <div className="text-xs opacity-90 mt-0.5">{opt.name}</div>
                      {opt.description && (
                        <div className="text-[10px] opacity-75 mt-1">{opt.description}</div>
                      )}
                    </div>

                    {!isReadOnly && (
                      <div className="flex items-center space-x-1 shrink-0 ml-2">
                        <button
                          type="button"
                          onClick={() => handleStartEditPlan(opt)}
                          className="p-1.5 hover:bg-white/60 dark:hover:bg-slate-900/60 rounded-lg text-slate-700 dark:text-slate-200 transition"
                          title="แก้ไขตัวเลือก INJ นี้"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteTarget({
                              category: 'INJ',
                              idOrCode: opt.id,
                              title: `ตัวเลือก INJ: ${opt.code}`,
                            })
                          }
                          className="p-1.5 hover:bg-rose-500/20 rounded-lg text-rose-600 dark:text-rose-400 transition"
                          title="ลบตัวเลือก INJ นี้"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center space-x-1">
            <HelpCircle className="w-4 h-4 text-indigo-500" />
            <span>การปรับเปลี่ยนสีและสัญลักษณ์จะส่งผลต่อตารางจัดกะและเครื่องมือเลือกในระบบทันที</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-white transition"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>

      {/* Delete Confirmation Sub-Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center space-x-3 text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-8 h-8 shrink-0" />
              <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">
                ยืนยันการลบรายการ?
              </h4>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              คุณกำลังจะลบ <strong className="text-rose-600">{deleteTarget.title}</strong> ออกจากรายการตัวเลือกในระบบ
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 transition"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition shadow-md"
              >
                ยืนยันลบรายการ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
