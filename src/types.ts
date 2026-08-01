export type UserRole = 'ADMIN' | 'SUPERVISOR' | 'EMPLOYEE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId?: string; // Assigned department for Supervisors / Employees
  avatarUrl?: string;
  position: string;
}

export interface Department {
  id: string;
  name: string;
  code: string; // e.g., 'F&P', 'INJ', 'MAINT'
  supervisorId?: string; // ID of assigned supervisor
  supervisorName?: string;
  description?: string;
  employeeCount?: number;
}

export interface Employee {
  id: string;
  employeeCode: string; // e.g., '0756208'
  name: string; // e.g., 'Siwapong Keawkuakool'
  codeName: string; // e.g., 'Boy'
  departmentId: string;
  position: string;
  status: 'ACTIVE' | 'INACTIVE';
  joinDate: string;
  phone?: string;
}

export type ShiftTypeCode = string;

export interface ShiftType {
  code: ShiftTypeCode;
  nameTh: string;
  nameEn: string;
  colorBg: string;
  colorText: string;
  colorBorder: string;
  description: string;
  isWorkDay: boolean;
  isOvertime?: boolean;
}

export interface PlanOptionItem {
  id: string;
  code: string;
  name: string;
  colorBg: string;
  colorText: string;
  colorBorder: string;
  description?: string;
}

export interface ShiftEntry {
  id: string;
  employeeId: string;
  departmentId: string;
  date: string; // YYYY-MM-DD
  year: number;
  month: number; // 1-12
  shiftCode: ShiftTypeCode;
  note?: string;
  updatedAt: string;
  updatedBy: string;
}

export interface CompanyHoliday {
  id: string;
  date: string; // YYYY-MM-DD
  year: number;
  title: string;
  type: 'COMPANY' | 'FACTORY_SPECIAL' | 'OFFICE_SPECIAL' | 'CUSTOM';
  description?: string;
  appliesToDepartmentIds?: string[]; // Empty means all departments
}

export interface YearlyConfig {
  year: number;
  isPlanningEnabled: boolean; // Allowed for supervisors to edit next year
  isLocked: boolean; // Locked after finalized
  notes?: string;
}

export type SwapStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface ShiftSwapRequest {
  id: string;
  requestType: 'SWAP' | 'LEAVE';
  requesterId: string; // Employee requesting
  requesterName: string;
  departmentId: string;
  targetDate: string;
  currentShift: ShiftTypeCode;
  
  // For SWAP
  swapWithEmployeeId?: string;
  swapWithEmployeeName?: string;
  targetSwapDate?: string;
  targetNewShift?: ShiftTypeCode;
  
  // For LEAVE
  leaveType?: 'VACATION' | 'SICK' | 'PERSONAL';
  reason?: string;
  
  status: SwapStatus;
  requestedAt: string;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  reviewComment?: string;
}

export type AuditCategory = 
  | 'SHIFT_SCHEDULE' 
  | 'PRODUCTION_PLAN'
  | 'USER_MANAGEMENT' 
  | 'DEPARTMENT' 
  | 'COMPANY_HOLIDAY' 
  | 'YEARLY_CONFIG' 
  | 'TEAM_MEMBER' 
  | 'SWAP_LEAVE_REQUEST';

export interface ProductionPlanEntry {
  date: string; // YYYY-MM-DD
  fpPlan: string;  // e.g. 'NPL 0.6L', 'NPL 0.33L', 'NPL 1.5L'
  injPlan: string; // e.g. '24.4', '11.47'
}

export interface AuditLog {
  id: string;
  timestamp: string; // ISO string
  formattedDate: string; // e.g., '31 ก.ค. 2026 18:45'
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  actorDepartmentId?: string;
  actorDepartmentName?: string;
  category: AuditCategory;
  action: string; // e.g., 'แก้ไขตารางกะ', 'อนุมัติคำขอสลับกะ', 'เพิ่มวันหยุดบริษัท'
  targetRef: string; // e.g., 'Siwapong (Boy) - 26 Jul 2026'
  oldValue?: string;
  newValue?: string;
  ipAddress?: string;
  details?: string;
}
