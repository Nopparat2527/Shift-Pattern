import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShiftSwapRequest } from '../../types';
import {
  ArrowRightLeft,
  CheckCircle2,
  XCircle,
  Clock,
  PlusCircle,
  MessageSquare,
  UserCheck,
  Calendar,
  AlertCircle,
} from 'lucide-react';

export const ShiftSwapManager: React.FC = () => {
  const {
    currentUser,
    isAdmin,
    isSupervisor,
    userDepartmentId,
    departments,
    employees,
    swapRequests,
    reviewSwapRequest,
    createSwapRequest,
  } = useApp();

  const [activeStatusFilter, setActiveStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ShiftSwapRequest | null>(null);
  const [reviewComment, setReviewComment] = useState('');

  // Create Request Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [reqType, setReqType] = useState<'SWAP' | 'LEAVE'>('SWAP');
  const [requesterEmpId, setRequesterEmpId] = useState('');
  const [targetDate, setTargetDate] = useState('2026-07-30');
  const [currentShift, setCurrentShift] = useState<'M' | 'A' | 'N'>('N');
  const [swapPartnerEmpId, setSwapPartnerEmpId] = useState('');
  const [targetNewShift, setTargetNewShift] = useState<'M' | 'A' | 'N'>('A');
  const [reason, setReason] = useState('');

  const activeDeptId = userDepartmentId || departments[0]?.id || '';
  const currentDept = departments.find((d) => d.id === activeDeptId);

  // Filter requests for Supervisor's department
  const filteredRequests = swapRequests.filter((req) => {
    const isDeptMatch = isAdmin ? true : req.departmentId === activeDeptId;
    const isStatusMatch = activeStatusFilter === 'ALL' ? true : req.status === activeStatusFilter;
    return isDeptMatch && isStatusMatch;
  });

  const handleOpenReview = (req: ShiftSwapRequest) => {
    setSelectedRequest(req);
    setReviewComment('');
    setIsReviewModalOpen(true);
  };

  const handleConfirmReview = (status: 'APPROVED' | 'REJECTED') => {
    if (!selectedRequest) return;
    reviewSwapRequest(selectedRequest.id, status, reviewComment);
    setIsReviewModalOpen(false);
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const reqEmp = employees.find((e) => e.id === requesterEmpId);
    if (!reqEmp) return;

    const swapPartner = employees.find((e) => e.id === swapPartnerEmpId);

    createSwapRequest({
      requestType: reqType,
      requesterId: reqEmp.id,
      requesterName: `${reqEmp.name} (${reqEmp.codeName})`,
      departmentId: reqEmp.departmentId,
      targetDate,
      currentShift,
      swapWithEmployeeId: swapPartner?.id,
      swapWithEmployeeName: swapPartner ? `${swapPartner.name} (${swapPartner.codeName})` : undefined,
      targetSwapDate: targetDate,
      targetNewShift,
      leaveType: reqType === 'LEAVE' ? 'VACATION' : undefined,
      reason,
    });

    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <ArrowRightLeft className="w-6 h-6 text-emerald-400" />
            <h2 className="text-lg font-bold">
              อนุมัติ / จัดการคำขอสลับกะและการลา ({currentDept?.name || 'ทุกแผนก'})
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            {isSupervisor
              ? `🔒 คำขอสลับกะเฉพาะพนักงานในแผนก ${currentDept?.code} - ไม่อนุมัติข้ามแผนก`
              : '👑 สิทธิ์แอดมิน: สามารถพิจารณาคำขอแทนหัวหน้าแผนกได้'}
          </p>
        </div>

        <button
          onClick={() => {
            const teamEmps = employees.filter((e) => e.departmentId === activeDeptId);
            if (teamEmps.length > 0) setRequesterEmpId(teamEmps[0].id);
            if (teamEmps.length > 1) setSwapPartnerEmpId(teamEmps[1].id);
            setIsCreateModalOpen(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 transition shadow-md shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>ยื่นคำขอสลับกะ / ลางาน</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center space-x-2">
        {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map((status) => {
          const isSelected = activeStatusFilter === status;
          const statusLabels = {
            PENDING: 'รอการอนุมัติ',
            APPROVED: 'อนุมัติแล้ว',
            REJECTED: 'ปฏิเสธคำขอ',
            ALL: 'คำขอทั้งหมด',
          };
          return (
            <button
              key={status}
              onClick={() => setActiveStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <span>{statusLabels[status]}</span>
            </button>
          );
        })}
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center text-slate-400 border border-slate-200 dark:border-slate-800">
            <Clock className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-xs font-medium">ไม่พบรายการคำขอสลับกะหรือวันลาในหมวดหมู่นี้</p>
          </div>
        ) : (
          filteredRequests.map((req) => (
            <div
              key={req.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      req.requestType === 'SWAP'
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : 'bg-purple-100 text-purple-800 border border-purple-300'
                    }`}
                  >
                    {req.requestType === 'SWAP' ? '🔄 ขอสลับกะ' : '🏖️ ขอลางาน'}
                  </span>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      req.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                        : req.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    {req.status === 'PENDING'
                      ? '● รออนุมัติ'
                      : req.status === 'APPROVED'
                      ? '✓ อนุมัติแล้ว'
                      : '✕ ปฏิเสธ'}
                  </span>

                  <span className="text-xs text-slate-400 font-mono">
                    ยื่นเมื่อ: {req.requestedAt}
                  </span>
                </div>

                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                  <span>ผู้ยื่นคำขอ: {req.requesterName}</span>
                  <span className="text-slate-400">|</span>
                  <span className="text-indigo-600 dark:text-indigo-400">
                    วันที่ {req.targetDate}
                  </span>
                </div>

                {req.requestType === 'SWAP' ? (
                  <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center space-x-2">
                    <span>
                      ขอสลับกะ <strong>({req.currentShift})</strong> ของตนเอง กับ{' '}
                      <strong>{req.swapWithEmployeeName}</strong> เป็นกะ{' '}
                      <strong className="text-emerald-600 dark:text-emerald-400">
                        ({req.targetNewShift})
                      </strong>
                    </span>
                  </div>
                ) : (
                  <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    ขอลางานพักร้อนประจำปี วันที่ {req.targetDate}
                  </div>
                )}

                {req.reason && (
                  <p className="text-xs text-slate-500 italic">
                    สาเหตุ: "{req.reason}"
                  </p>
                )}

                {req.reviewedByName && (
                  <p className="text-xs text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                    พิจารณาโดย: <strong>{req.reviewedByName}</strong> เมื่อ {req.reviewedAt}{' '}
                    {req.reviewComment && `(หมายเหตุ: ${req.reviewComment})`}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              {req.status === 'PENDING' && (
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleOpenReview(req)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center space-x-1.5 transition shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>พิจารณาอนุมัติ</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Review Modal */}
      {isReviewModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl text-white space-y-4">
            <h3 className="text-base font-bold pb-2 border-b border-slate-800 flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-emerald-400" />
              <span>พิจารณาคำขอ: {selectedRequest.requesterName}</span>
            </h3>

            <div className="text-xs text-slate-300 space-y-2 bg-slate-800/80 p-3 rounded-xl">
              <div>
                <strong>วันที่ขอสลับ/ลา:</strong> {selectedRequest.targetDate}
              </div>
              <div>
                <strong>รายละเอียด:</strong>{' '}
                {selectedRequest.requestType === 'SWAP'
                  ? `ขอสลับกะ ${selectedRequest.currentShift} กับ ${selectedRequest.swapWithEmployeeName}`
                  : 'ขอลาพักร้อนประจำวัน'}
              </div>
              {selectedRequest.reason && (
                <div>
                  <strong>สาเหตุ:</strong> {selectedRequest.reason}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ความเห็นหัวหน้าแผนก (ถ้ามี):
              </label>
              <textarea
                rows={2}
                placeholder="ระบุข้อความเหตุผลการอนุมัติ/ปฏิเสธ..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              />
            </div>

            <div className="pt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold transition"
              >
                ยกเลิก
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleConfirmReview('REJECTED')}
                  className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition"
                >
                  ปฏิเสธคำขอ
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmReview('APPROVED')}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-md"
                >
                  อนุมัติคำขอ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Request Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form
            onSubmit={handleCreateRequest}
            className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl text-white space-y-4"
          >
            <h3 className="text-base font-bold pb-2 border-b border-slate-800">
              ยื่นคำขอสลับกะ / ขอลางาน
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">ประเภทคำขอ:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReqType('SWAP')}
                    className={`p-2.5 rounded-xl font-bold border transition ${
                      reqType === 'SWAP'
                        ? 'bg-blue-600 border-blue-400 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    🔄 ขอสลับกะ
                  </button>
                  <button
                    type="button"
                    onClick={() => setReqType('LEAVE')}
                    className={`p-2.5 rounded-xl font-bold border transition ${
                      reqType === 'LEAVE'
                        ? 'bg-purple-600 border-purple-400 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    🏖️ ขอลางาน
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">ผู้ขอ:</label>
                <select
                  value={requesterEmpId}
                  onChange={(e) => setRequesterEmpId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                >
                  {employees
                    .filter((e) => e.departmentId === activeDeptId)
                    .map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name} ({e.codeName})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">วันที่:</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              {reqType === 'SWAP' && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    ต้องการสลับกับพนักงาน:
                  </label>
                  <select
                    value={swapPartnerEmpId}
                    onChange={(e) => setSwapPartnerEmpId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  >
                    {employees
                      .filter((e) => e.departmentId === activeDeptId && e.id !== requesterEmpId)
                      .map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name} ({e.codeName})
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">สาเหตุ:</label>
                <input
                  type="text"
                  placeholder="ระบุเหตุผลการสลับหรือการลา..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold transition"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-md"
              >
                ส่งคำขอ
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
