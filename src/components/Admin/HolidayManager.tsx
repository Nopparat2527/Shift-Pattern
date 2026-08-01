import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CompanyHoliday } from '../../types';
import {
  CalendarHeart,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  ShieldAlert,
  Info,
  Sparkles,
} from 'lucide-react';

export const HolidayManager: React.FC = () => {
  const {
    isAdmin,
    holidays,
    addHoliday,
    updateHoliday,
    deleteHoliday,
    activeYear,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<CompanyHoliday | null>(null);

  const [date, setDate] = useState('2026-08-12');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<CompanyHoliday['type']>('FACTORY_SPECIAL');
  const [description, setDescription] = useState('');

  const handleOpenModal = (hol?: CompanyHoliday) => {
    if (hol) {
      setEditingHoliday(hol);
      setDate(hol.date);
      setTitle(hol.title);
      setType(hol.type);
      setDescription(hol.description || '');
    } else {
      setEditingHoliday(null);
      setDate(`${activeYear}-08-12`);
      setTitle('');
      setType('FACTORY_SPECIAL');
      setDescription('');
    }
    setIsModalOpen(true);
  };

  const handleSaveHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) return;

    const holYear = new Date(date).getFullYear();

    if (editingHoliday) {
      updateHoliday(editingHoliday.id, {
        date,
        year: holYear,
        title,
        type,
        description,
      });
    } else {
      addHoliday({
        date,
        year: holYear,
        title,
        type,
        description,
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
          การกำหนดวันหยุดประจำปีของบริษัทและวันหยุดประกาศโรงงานเป็นอำนาจของแอดมินระบบ
        </p>
      </div>
    );
  }

  // Filter holidays by active year
  const activeYearHolidays = holidays.filter((h) => h.year === activeYear);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <CalendarHeart className="w-6 h-6 text-rose-400" />
            <h2 className="text-lg font-bold">1.3 ตั้งค่าวันหยุดประจำปีบริษัท (Company Holidays)</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            กำหนดวันหยุดโดยตรงของบริษัท/โรงงาน/ออฟฟิศ <u>โดยไม่ต้องอ้างอิงปฏิทินนักขัตฤกษ์ราชการ</u>
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 transition shadow-md shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มวันหยุดบริษัท</span>
        </button>
      </div>

      {/* Feature Highlight Callout */}
      <div className="bg-rose-950/40 border border-rose-800/50 rounded-2xl p-4 text-xs text-rose-200 flex items-start space-x-3">
        <Sparkles className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
        <div>
          <strong>อิสระในการกำหนดวันหยุด:</strong> แอดมินระบุวันหยุดของบริษัท เช่น Big Cleaning Day, วันหยุดพักผ่อนประจำปีของโรงงาน หรือวันสวัสดิการ โดยระบบจะนำไปแสดงสัญลักษณ์ <strong>HL</strong> บนตารางกะอัตโนมัติ
        </div>
      </div>

      {/* Holidays Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeYearHolidays.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-slate-900 rounded-2xl p-8 text-center text-slate-400 border border-slate-200 dark:border-slate-800">
            ยังไม่มีรายการวันหยุดบริษัทสำหรับปี {activeYear}
          </div>
        ) : (
          activeYearHolidays.map((hol) => (
            <div
              key={hol.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 rounded-xl font-mono font-bold text-xs border border-rose-200 dark:border-rose-800">
                    {hol.date}
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenModal(hol)}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded-lg transition"
                    title="แก้ไข"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`คุณต้องการลบวันหยุด ${hol.title} ใช่หรือไม่?`)) {
                        deleteHoliday(hol.id);
                      }
                    }}
                    className="p-1.5 hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-500 rounded-lg transition"
                    title="ลบวันหยุด"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {hol.title}
                </h3>
                {hol.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {hol.description}
                  </p>
                )}
              </div>

              <div className="pt-2 flex justify-between items-center text-[10px]">
                <span className="bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 border border-orange-300 dark:border-orange-800 font-bold px-2 py-0.5 rounded-md">
                  {hol.type === 'FACTORY_SPECIAL'
                    ? 'วันหยุดประกาศโรงงาน'
                    : hol.type === 'COMPANY'
                    ? 'วันหยุดประจำบริษัท'
                    : 'วันหยุดพิเศษออฟฟิศ'}
                </span>

                <span className="text-slate-400 font-semibold">มีผลกับทุกแผนก</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Holiday Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form
            onSubmit={handleSaveHoliday}
            className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl text-white space-y-4"
          >
            <h3 className="text-base font-bold pb-2 border-b border-slate-800">
              {editingHoliday ? 'แก้ไขวันหยุดบริษัท' : 'กำหนดวันหยุดบริษัทใหม่'}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  วันที่หยุด (YYYY-MM-DD):
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  ชื่อวันหยุดประกาศบริษัท:
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น วัน Big Cleaning Day ประจำโรงงาน"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  หมวดหมู่วันหยุด:
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as CompanyHoliday['type'])}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                >
                  <option value="FACTORY_SPECIAL">วันหยุดประกาศโรงงาน (Factory Special)</option>
                  <option value="COMPANY">วันหยุดประจำบริษัท (Company Holiday)</option>
                  <option value="OFFICE_SPECIAL">วันหยุดพิเศษออฟฟิศ (Office Special)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  หมายเหตุรายละเอียด:
                </label>
                <input
                  type="text"
                  placeholder="คำอธิบายเพิ่มเติม..."
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
                className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-md"
              >
                บันทึกวันหยุด
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
