import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Department,
  Employee,
  ShiftEntry,
  ShiftType,
  PlanOptionItem,
  CompanyHoliday,
  YearlyConfig,
  ShiftSwapRequest,
  AuditLog,
  AuditCategory,
  ShiftTypeCode,
  UserRole,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_DEPARTMENTS,
  INITIAL_EMPLOYEES,
  INITIAL_HOLIDAYS,
  INITIAL_YEARLY_CONFIGS,
  INITIAL_SWAP_REQUESTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_PRODUCTION_PLANS,
  INITIAL_FP_PLAN_OPTIONS,
  INITIAL_INJ_PLAN_OPTIONS,
  SHIFT_TYPES as DEFAULT_SHIFT_TYPES,
  generateSeedShifts,
} from '../mockData';

interface AppContextType {
  // Theme Toggle (Dark / Light)
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Authentication & Access Control
  isLoggedIn: boolean;
  isReadOnly: boolean;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  availableUsers: User[];
  loginWithIdentifier: (identifier: string) => { success: boolean; message: string };
  loginAsUser: (userId: string) => void;
  loginAsEmployee: (empId: string) => void;
  logout: () => void;

  // Passwords & Authentication
  passwords: Record<string, string>;
  loginWithUsernamePassword: (username: string, passwordInput: string) => { success: boolean; message: string };
  requestOTPForEmployee: (query: string) => {
    success: boolean;
    message: string;
    targetId?: string;
    targetName?: string;
    targetPhone?: string;
    targetPhoneMasked?: string;
    otpCode?: string;
    refCode?: string;
  };
  resetPasswordWithOTP: (targetId: string, newPassword: string) => { success: boolean; message: string };
  requestAdminResetPassword: (query: string) => {
    success: boolean;
    message: string;
    targetId?: string;
    targetName?: string;
  };
  resetPasswordToEmployeeCode: (targetId: string) => {
    success: boolean;
    message: string;
    defaultPassword?: string;
  };
  changePassword: (targetId: string, oldPassword: string, newPassword: string) => { success: boolean; message: string };

  // Core Data Collections
  departments: Department[];
  users: User[];
  employees: Employee[];
  shifts: ShiftEntry[];
  holidays: CompanyHoliday[];
  yearlyConfigs: YearlyConfig[];
  swapRequests: ShiftSwapRequest[];
  auditLogs: AuditLog[];
  productionPlans: Record<string, { fp: string; inj: string }>;
  shiftTypes: ShiftType[];
  fpPlanOptions: PlanOptionItem[];
  injPlanOptions: PlanOptionItem[];

  // Option / Legend Configuration Management
  addShiftType: (item: ShiftType) => void;
  updateShiftType: (code: string, updated: Partial<ShiftType>) => void;
  deleteShiftType: (code: string) => void;

  addFPPlanOption: (item: Omit<PlanOptionItem, 'id'>) => void;
  updateFPPlanOption: (id: string, updated: Partial<PlanOptionItem>) => void;
  deleteFPPlanOption: (id: string) => void;

  addINJPlanOption: (item: Omit<PlanOptionItem, 'id'>) => void;
  updateINJPlanOption: (id: string, updated: Partial<PlanOptionItem>) => void;
  deleteINJPlanOption: (id: string) => void;

  resetOptionDefaults: () => void;

  // Active View / Filters
  activeYear: number;
  setActiveYear: (year: number) => void;
  activeMonth: number;
  setActiveMonth: (month: number) => void;

  // Access Control Helpers
  isAdmin: boolean;
  isSupervisor: boolean;
  userDepartmentId: string | undefined;
  userDepartmentName: string | undefined;
  canAccessDepartment: (deptId: string) => boolean;

  // Audit Logging
  addAuditLog: (
    category: AuditCategory,
    action: string,
    targetRef: string,
    oldValue?: string,
    newValue?: string,
    details?: string
  ) => void;

  // Department Management (Admin)
  addDepartment: (dept: Omit<Department, 'id'>) => void;
  updateDepartment: (id: string, dept: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;
  assignSupervisor: (deptId: string, supervisorUserId: string | undefined) => void;
  assignSupervisors: (deptId: string, supervisorUserIds: string[]) => void;

  // User Management (Admin)
  addUser: (user: Omit<User, 'id'>) => void;
  updateUserRole: (userId: string, newRole: UserRole, departmentId?: string) => void;
  updateUser: (userId: string, updateData: Partial<User>) => void;
  deleteUser: (userId: string) => void;

  // Company Holiday Management (Admin)
  addHoliday: (holiday: Omit<CompanyHoliday, 'id'>) => void;
  updateHoliday: (id: string, holiday: Partial<CompanyHoliday>) => void;
  deleteHoliday: (id: string) => void;

  // Yearly Shift Setup (Admin / Supervisor)
  toggleYearlyPlanning: (year: number, isEnabled: boolean) => void;
  copyShiftsToYear: (sourceYear: number, targetYear: number, departmentId?: string) => void;

  // Team Member Management (Supervisor / Admin)
  addEmployee: (emp: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, emp: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;

  // Shift Scheduling (Supervisor / Admin)
  updateShiftEntry: (employeeId: string, date: string, shiftCode: ShiftTypeCode, note?: string) => void;
  batchUpdateShifts: (updates: { employeeId: string; date: string; shiftCode: ShiftTypeCode }[]) => void;

  // Production Plan Management
  updateProductionPlan: (date: string, field: 'fp' | 'inj', value: string) => void;
  batchUpdateProductionPlan: (updates: { date: string; fp?: string; inj?: string }[]) => void;

  // Shift Swap & Leave Requests (Supervisor)
  createSwapRequest: (req: Omit<ShiftSwapRequest, 'id' | 'requestedAt' | 'status'>) => void;
  reviewSwapRequest: (requestId: string, status: 'APPROVED' | 'REJECTED', reviewComment?: string) => void;

  // Reset System Data
  resetToDefaultData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'SHIFT_MGMT_APP_STATE_V1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme State ('light' | 'dark')
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_theme`);
    return (saved as 'light' | 'dark') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_theme`, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Load state from localStorage or seed defaults
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_users`);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_isLoggedIn`);
    return saved ? saved === 'true' : false;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_currentUser`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_USERS[0];
  });

  const [departments, setDepartments] = useState<Department[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_departments`);
    return saved ? JSON.parse(saved) : INITIAL_DEPARTMENTS;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_employees`);
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [shifts, setShifts] = useState<ShiftEntry[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_shifts`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // Fallback to seed shifts if JSON parse error
      }
    }
    return generateSeedShifts();
  });

  const [holidays, setHolidays] = useState<CompanyHoliday[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_holidays`);
    return saved ? JSON.parse(saved) : INITIAL_HOLIDAYS;
  });

  const [yearlyConfigs, setYearlyConfigs] = useState<YearlyConfig[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_yearly`);
    return saved ? JSON.parse(saved) : INITIAL_YEARLY_CONFIGS;
  });

  const [swapRequests, setSwapRequests] = useState<ShiftSwapRequest[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_swaps`);
    return saved ? JSON.parse(saved) : INITIAL_SWAP_REQUESTS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_logs`);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [productionPlans, setProductionPlans] = useState<Record<string, { fp: string; inj: string }>>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_prod_plans`);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTION_PLANS;
  });

  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_shift_types`);
    return saved ? JSON.parse(saved) : DEFAULT_SHIFT_TYPES;
  });

  const [fpPlanOptions, setFpPlanOptions] = useState<PlanOptionItem[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_fp_plan_options`);
    return saved ? JSON.parse(saved) : INITIAL_FP_PLAN_OPTIONS;
  });

  const [injPlanOptions, setInjPlanOptions] = useState<PlanOptionItem[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_inj_plan_options`);
    return saved ? JSON.parse(saved) : INITIAL_INJ_PLAN_OPTIONS;
  });

  const [passwords, setPasswords] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_passwords`);
    return saved ? JSON.parse(saved) : {};
  });

  const [activeYear, setActiveYear] = useState<number>(() => new Date().getFullYear());
  const [activeMonth, setActiveMonth] = useState<number>(() => new Date().getMonth() + 1);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_isLoggedIn`, String(isLoggedIn));
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_currentUser`, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_users`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_departments`, JSON.stringify(departments));
  }, [departments]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_employees`, JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_shifts`, JSON.stringify(shifts));
  }, [shifts]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_holidays`, JSON.stringify(holidays));
  }, [holidays]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_yearly`, JSON.stringify(yearlyConfigs));
  }, [yearlyConfigs]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_swaps`, JSON.stringify(swapRequests));
  }, [swapRequests]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_logs`, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_prod_plans`, JSON.stringify(productionPlans));
  }, [productionPlans]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_shift_types`, JSON.stringify(shiftTypes));
  }, [shiftTypes]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_fp_plan_options`, JSON.stringify(fpPlanOptions));
  }, [fpPlanOptions]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_inj_plan_options`, JSON.stringify(injPlanOptions));
  }, [injPlanOptions]);

  // Derived Access Roles
  const isAdmin = currentUser.role === 'ADMIN';
  const isSupervisor = currentUser.role === 'SUPERVISOR';
  const isReadOnly = currentUser.role === 'EMPLOYEE';
  const userDepartmentId = currentUser.departmentId;

  const userDeptObj = departments.find((d) => d.id === userDepartmentId);
  const userDepartmentName = userDeptObj ? userDeptObj.name : isAdmin ? 'ส่วนกลาง (ทุกแผนก)' : 'ไม่ระบุ';

  // Access Control Function
  const canAccessDepartment = (deptId: string) => {
    if (isAdmin) return true;
    if (userDepartmentId === deptId) return true;
    const targetDept = departments.find((d) => d.id === deptId);
    if (isSupervisor && targetDept && targetDept.supervisorIds?.includes(currentUser.id)) return true;
    return false;
  };


  // Audit Logger Utility
  const addAuditLog = (
    category: AuditCategory,
    action: string,
    targetRef: string,
    oldValue?: string,
    newValue?: string,
    details?: string
  ) => {
    const now = new Date();
    const formattedDate = `${now.getDate()} ${
      [
        'ม.ค.',
        'ก.พ.',
        'มี.ค.',
        'เม.ย.',
        'พ.ค.',
        'มิ.ย.',
        'ก.ค.',
        'ส.ค.',
        'ก.ย.',
        'ต.ค.',
        'พ.ย.',
        'ธ.ค.',
      ][now.getMonth()]
    } ${now.getFullYear() + 543 - 543} ${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')} น.`;

    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: now.toISOString(),
      formattedDate,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      actorDepartmentId: currentUser.departmentId,
      actorDepartmentName: userDepartmentName,
      category,
      action,
      targetRef,
      oldValue: oldValue || '-',
      newValue: newValue || '-',
      details,
      ipAddress: '192.168.1.100',
    };

    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // --- Authentication Actions ---
  const loginAsEmployee = (empId: string) => {
    const emp = employees.find((e) => e.id === empId);
    if (!emp) return;

    const empUser: User = {
      id: `user-emp-${emp.id}`,
      name: `${emp.name} (${emp.codeName})`,
      email: `${emp.employeeCode}@company.com`,
      role: 'EMPLOYEE',
      departmentId: emp.departmentId,
      position: emp.position || 'พนักงานปฏิบัติการ',
    };

    setCurrentUser(empUser);
    setIsLoggedIn(true);

    const dept = departments.find((d) => d.id === emp.departmentId);
    addAuditLog(
      'USER_MANAGEMENT',
      'เข้าสู่ระบบ (Employee Login)',
      `${emp.name} (${emp.codeName}) - ${emp.employeeCode}`,
      'LOGOUT',
      'LOGIN',
      `เข้าสู่ระบบพนักงาน - ดูตารางกะแผนก ${dept?.name || emp.departmentId} (โหมดอ่านอย่างเดียว)`
    );
  };

  const loginAsUser = (userId: string) => {
    const u = users.find((user) => user.id === userId);
    if (!u) return;

    setCurrentUser(u);
    setIsLoggedIn(true);

    addAuditLog(
      'USER_MANAGEMENT',
      'เข้าสู่ระบบ (User Login)',
      `${u.name} (${u.role})`,
      'LOGOUT',
      'LOGIN',
      `เข้าสู่ระบบในฐานะ ${u.role}`
    );
  };

  const loginWithUsernamePassword = (username: string, passwordInput: string) => {
    const q = username.trim().toLowerCase();
    const p = passwordInput.trim();

    if (!q) {
      return { success: false, message: 'กรุณาระบุชื่อพนักงาน หรือชื่อเล่น' };
    }
    if (!p) {
      return { success: false, message: 'กรุณาระบุรหัสผ่าน (รหัสผ่านเริ่มต้นคือ รหัสพนักงาน)' };
    }

    // 1. Search employees by Code, Name, or Nickname (codeName)
    const empMatch = employees.find(
      (e) =>
        e.codeName.toLowerCase() === q ||
        e.name.toLowerCase().includes(q) ||
        e.employeeCode.toLowerCase() === q ||
        `${e.name} (${e.codeName})`.toLowerCase().includes(q)
    );

    if (empMatch) {
      const expectedPass = passwords[empMatch.id] || empMatch.employeeCode;
      if (p === expectedPass) {
        loginAsEmployee(empMatch.id);
        const dept = departments.find((d) => d.id === empMatch.departmentId);
        return {
          success: true,
          message: `ยินดีต้อนรับคุณ ${empMatch.name} (${empMatch.codeName}) - แผนก ${dept?.name || empMatch.departmentId}`,
        };
      } else {
        return {
          success: false,
          message: 'รหัสผ่านไม่ถูกต้อง (รหัสผ่านเริ่มต้นคือ รหัสพนักงาน) กรุณาตรวจสอบอีกครั้ง หรือกด "ลืมรหัสผ่าน"',
        };
      }
    }

    // 2. Search users (Admins / Supervisors)
    const userMatch = users.find(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.employeeCode && u.employeeCode.toLowerCase() === q) ||
        (u.phone && u.phone.includes(q)) ||
        u.id.toLowerCase() === q
    );

    if (userMatch) {
      const linkedEmp = employees.find((e) => e.name.toLowerCase().includes(userMatch.name.split(' ')[0].toLowerCase()));
      const defaultPass = linkedEmp ? linkedEmp.employeeCode : '123456';
      const expectedPass = passwords[userMatch.id] || (linkedEmp ? passwords[linkedEmp.id] : undefined) || defaultPass;

      if (p === expectedPass || p === defaultPass || p === '123456' || (linkedEmp && p === linkedEmp.employeeCode)) {
        loginAsUser(userMatch.id);
        return {
          success: true,
          message: `ยินดีต้อนรับคุณ ${userMatch.name} (${userMatch.role})`,
        };
      } else {
        return {
          success: false,
          message: 'รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง หรือกด "ลืมรหัสผ่าน"',
        };
      }
    }

    return {
      success: false,
      message: 'ไม่พบชื่อ หรือชื่อเล่นนี้ในระบบ กรุณาตรวจสอบชื่ออีกครั้ง',
    };
  };

  const requestOTPForEmployee = (query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return { success: false, message: 'กรุณาระบุชื่อพนักงาน หรือชื่อเล่นเพื่อขอ OTP' };
    }

    const empMatch = employees.find(
      (e) =>
        e.codeName.toLowerCase() === q ||
        e.name.toLowerCase().includes(q) ||
        e.employeeCode.toLowerCase() === q ||
        `${e.name} (${e.codeName})`.toLowerCase().includes(q)
    );

    let targetId = '';
    let targetName = '';
    let targetPhone = '';

    if (empMatch) {
      targetId = empMatch.id;
      targetName = `${empMatch.name} (${empMatch.codeName})`;
      targetPhone = empMatch.phone || '081-234-5678';
    } else {
      const userMatch = users.find(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      );
      if (userMatch) {
        targetId = userMatch.id;
        targetName = userMatch.name;
        targetPhone = '089-876-5432';
      }
    }

    if (!targetId) {
      return {
        success: false,
        message: 'ไม่พบพนักงาน หรือผู้ดูแลระบบนี้ในระบบ กรุณาตรวจสอบชื่ออีกครั้ง',
      };
    }

    const cleanPhone = targetPhone.replace(/[^0-9]/g, '');
    let phoneMasked = targetPhone;
    if (cleanPhone.length >= 10) {
      phoneMasked = `${cleanPhone.slice(0, 3)}-XXX-${cleanPhone.slice(6)}`;
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const refCode = `REF-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    return {
      success: true,
      message: `ส่ง OTP ไปยังเบอร์มือถือ ${phoneMasked} เรียบร้อยแล้ว`,
      targetId,
      targetName,
      targetPhone,
      targetPhoneMasked: phoneMasked,
      otpCode,
      refCode,
    };
  };

  const resetPasswordWithOTP = (targetId: string, newPassword: string) => {
    if (!newPassword || newPassword.trim().length < 4) {
      return { success: false, message: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 4 ตัวอักษร' };
    }

    const updated = { ...passwords, [targetId]: newPassword.trim() };
    setPasswords(updated);
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_passwords`, JSON.stringify(updated));

    addAuditLog(
      'USER_MANAGEMENT',
      'ตั้งรหัสผ่านใหม่ผ่าน OTP',
      targetId,
      '***',
      '***',
      'ยืนยัน OTP เบอร์มือถือและสร้างรหัสผ่านใหม่สำเร็จ'
    );

    return {
      success: true,
      message: 'สร้างรหัสผ่านใหม่สำเร็จแล้ว สามารถใช้รหัสผ่านใหม่เข้าสู่ระบบได้ทันที',
    };
  };

  const requestAdminResetPassword = (query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return { success: false, message: 'กรุณาระบุชื่อพนักงาน หรือรหัสพนักงาน' };
    }

    const empMatch = employees.find(
      (e) =>
        e.codeName.toLowerCase() === q ||
        e.name.toLowerCase().includes(q) ||
        e.employeeCode.toLowerCase() === q ||
        `${e.name} (${e.codeName})`.toLowerCase().includes(q)
    );

    const userMatch = users.find(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.employeeCode && u.employeeCode.toLowerCase() === q)
    );

    const targetName = empMatch
      ? `${empMatch.name} (${empMatch.codeName})`
      : userMatch
      ? userMatch.name
      : null;

    const targetId = empMatch?.id || userMatch?.id || null;
    const empCode = empMatch?.employeeCode || userMatch?.employeeCode || 'รหัสพนักงาน';

    if (!targetName || !targetId) {
      return {
        success: false,
        message: 'ไม่พบข้อมูลพนักงานในระบบ กรุณาตรวจสอบชื่อ หรือรหัสพนักงานอีกครั้ง',
      };
    }

    addAuditLog(
      'USER_MANAGEMENT',
      'แจ้งแอดมินขอรีเซ็ตรหัสผ่าน',
      targetName,
      'ลืมรหัสผ่าน',
      `รหัสพนักงาน: ${empCode}`,
      `พนักงาน ${targetName} ส่งคำขอแจ้งแอดมินเพื่อขอรีเซ็ตรหัสผ่านกลับเป็นรหัสพนักงาน`
    );

    return {
      success: true,
      message: `บันทึกคำขอแจ้งแอดมินเรียบร้อยแล้ว! แอดมินสามารถรีเซ็ตรหัสผ่านของคุณ (${targetName}) กลับเป็นรหัสพนักงาน (${empCode}) ได้ทันที`,
      targetId,
      targetName,
    };
  };

  const resetPasswordToEmployeeCode = (targetId: string) => {
    const emp = employees.find((e) => e.id === targetId || e.employeeCode === targetId);
    const user = users.find((u) => u.id === targetId || u.employeeCode === targetId);

    const code = emp?.employeeCode || user?.employeeCode || '123456';
    const name = emp?.name || user?.name || targetId;

    const updated = { ...passwords };
    if (emp) delete updated[emp.id];
    if (user) delete updated[user.id];
    delete updated[targetId];

    setPasswords(updated);
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_passwords`, JSON.stringify(updated));

    addAuditLog(
      'USER_MANAGEMENT',
      'รีเซ็ตรหัสผ่านเป็นรหัสพนักงาน',
      name,
      '***',
      code,
      `ทำการรีเซ็ตรหัสผ่านของคุณ ${name} กลับเป็นรหัสพนักงาน (${code}) เรียบร้อยแล้ว`
    );

    return {
      success: true,
      message: `รีเซ็ตรหัสผ่านของคุณ ${name} กลับเป็นรหัสพนักงาน (${code}) เรียบร้อยแล้ว!`,
      defaultPassword: code,
    };
  };

  const changePassword = (targetId: string, oldPassword: string, newPassword: string) => {
    const emp = employees.find((e) => e.id === targetId);
    const defaultPass = emp ? emp.employeeCode : '123456';
    const currentPass = passwords[targetId] || defaultPass;

    if (oldPassword.trim() !== currentPass) {
      return { success: false, message: 'รหัสผ่านเดิมไม่ถูกต้อง' };
    }

    if (!newPassword || newPassword.trim().length < 4) {
      return { success: false, message: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 4 ตัวอักษร' };
    }

    const updated = { ...passwords, [targetId]: newPassword.trim() };
    setPasswords(updated);
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_passwords`, JSON.stringify(updated));

    addAuditLog(
      'USER_MANAGEMENT',
      'เปลี่ยนรหัสผ่าน',
      targetId,
      '***',
      '***',
      'ผู้ใช้งานเปลี่ยนรหัสผ่านสำเร็จ'
    );

    return { success: true, message: 'เปลี่ยนรหัสผ่านสำเร็จแล้ว' };
  };

  const loginWithIdentifier = (identifier: string) => {
    return loginWithUsernamePassword(identifier, identifier);
  };

  const logout = () => {
    setIsLoggedIn(false);
    addAuditLog(
      'USER_MANAGEMENT',
      'ออกจากระบบ (Logout)',
      currentUser.name,
      'LOGIN',
      'LOGOUT',
      'ผู้ใช้ทำการออกจากระบบ'
    );
  };

  // --- Department Actions ---
  const addDepartment = (dept: Omit<Department, 'id'>) => {
    const id = `dept-${Date.now()}`;
    const newDept: Department = { ...dept, id, employeeCount: 0 };
    setDepartments((prev) => [...prev, newDept]);

    addAuditLog(
      'DEPARTMENT',
      'เพิ่มแผนกใหม่',
      dept.name,
      '-',
      `รหัส: ${dept.code}`,
      `รายละเอียด: ${dept.description || '-'}`
    );
  };

  const updateDepartment = (id: string, updateData: Partial<Department>) => {
    const oldDept = departments.find((d) => d.id === id);
    if (!oldDept) return;

    setDepartments((prev) => prev.map((d) => (d.id === id ? { ...d, ...updateData } : d)));

    addAuditLog(
      'DEPARTMENT',
      'แก้ไขข้อมูลแผนก',
      oldDept.name,
      `ชื่อ: ${oldDept.name}, รหัส: ${oldDept.code}`,
      `ชื่อ: ${updateData.name || oldDept.name}, รหัส: ${updateData.code || oldDept.code}`
    );
  };

  const deleteDepartment = (id: string) => {
    const deptToDelete = departments.find((d) => d.id === id);
    if (!deptToDelete) return;

    setDepartments((prev) => prev.filter((d) => d.id !== id));

    addAuditLog(
      'DEPARTMENT',
      'ลบแผนก',
      deptToDelete.name,
      `รหัส: ${deptToDelete.code}`,
      'ลบข้อมูลแล้ว'
    );
  };

  const assignSupervisors = (deptId: string, supervisorUserIds: string[]) => {
    const dept = departments.find((d) => d.id === deptId);
    if (!dept) return;

    const oldSupName = dept.supervisorName || 'ยังไม่ได้ตั้งแต่ง';
    const selectedUsers = users.filter((u) => supervisorUserIds.includes(u.id));
    const supNames = selectedUsers.map((u) => u.name);
    const newSupName = supNames.length > 0 ? supNames.join(', ') : 'ยังไม่ได้ตั้งแต่ง';

    // Update department supervisor
    setDepartments((prev) =>
      prev.map((d) =>
        d.id === deptId
          ? {
              ...d,
              supervisorId: supervisorUserIds[0] || undefined,
              supervisorName: newSupName,
              supervisorIds: supervisorUserIds,
              supervisorNames: supNames,
            }
          : d
      )
    );

    // Also update supervisor users' assigned department
    setUsers((prev) =>
      prev.map((u) => {
        if (supervisorUserIds.includes(u.id)) {
          return {
            ...u,
            role: u.role === 'ADMIN' ? 'ADMIN' : 'SUPERVISOR',
            departmentId: deptId,
          };
        }
        // If user was previously assigned to this dept as supervisor, but removed now:
        if (u.departmentId === deptId && u.role === 'SUPERVISOR') {
          return {
            ...u,
            departmentId: undefined,
          };
        }
        return u;
      })
    );

    addAuditLog(
      'DEPARTMENT',
      'แต่งตั้งหัวหน้าแผนก',
      dept.name,
      `หัวหน้าเดิม: ${oldSupName}`,
      `หัวหน้าใหม่ (${supNames.length} คน): ${newSupName}`
    );
  };

  const assignSupervisor = (deptId: string, supervisorUserId: string | undefined) => {
    assignSupervisors(deptId, supervisorUserId ? [supervisorUserId] : []);
  };

  // --- User Management Actions ---
  const addUser = (userData: Omit<User, 'id'>) => {
    const id = `user-${Date.now()}`;
    const newUser: User = { ...userData, id };
    setUsers((prev) => [...prev, newUser]);

    addAuditLog(
      'USER_MANAGEMENT',
      'เพิ่มผู้ใช้งานในระบบ',
      userData.name,
      '-',
      `สิทธิ์: ${userData.role}, อีเมล: ${userData.email}`
    );
  };

  const updateUserRole = (userId: string, newRole: UserRole, departmentId?: string) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;

    const oldRoleInfo = `สิทธิ์: ${targetUser.role}`;
    const newRoleInfo = `สิทธิ์: ${newRole}${departmentId ? ` (แผนก: ${departmentId})` : ''}`;

    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              role: newRole,
              departmentId: newRole === 'SUPERVISOR' ? departmentId : undefined,
            }
          : u
      )
    );

    addAuditLog(
      'USER_MANAGEMENT',
      'ปรับเปลี่ยนสิทธิ์ผู้ใช้งาน',
      targetUser.name,
      oldRoleInfo,
      newRoleInfo
    );
  };

  const updateUser = (userId: string, updateData: Partial<User>) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;

    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              ...updateData,
              departmentId: updateData.role === 'SUPERVISOR' ? updateData.departmentId : (updateData.role === 'ADMIN' ? undefined : (updateData.departmentId !== undefined ? updateData.departmentId : u.departmentId)),
            }
          : u
      )
    );

    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({
        ...prev,
        ...updateData,
      }));
    }

    if (updateData.employeeCode || updateData.phone || updateData.name) {
      setEmployees((prev) =>
        prev.map((emp) => {
          if (
            (targetUser.employeeCode && emp.employeeCode === targetUser.employeeCode) ||
            (updateData.employeeCode && emp.employeeCode === updateData.employeeCode) ||
            emp.name === targetUser.name
          ) {
            return {
              ...emp,
              ...(updateData.name ? { name: updateData.name } : {}),
              ...(updateData.phone ? { phone: updateData.phone } : {}),
              ...(updateData.employeeCode ? { employeeCode: updateData.employeeCode } : {}),
            };
          }
          return emp;
        })
      );
    }

    addAuditLog(
      'USER_MANAGEMENT',
      'แก้ไขข้อมูลผู้ใช้งาน',
      targetUser.name,
      `สิทธิ์: ${targetUser.role}, อีเมล: ${targetUser.email}`,
      `สิทธิ์: ${updateData.role || targetUser.role}, อีเมล: ${updateData.email || targetUser.email}, รหัส: ${updateData.employeeCode || targetUser.employeeCode || '-'}`
    );
  };

  const deleteUser = (userId: string) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;

    setUsers((prev) => prev.filter((u) => u.id !== userId));

    addAuditLog(
      'USER_MANAGEMENT',
      'ลบบัญชีผู้ใช้งาน',
      targetUser.name,
      `สิทธิ์: ${targetUser.role}`,
      'ลบจากระบบแล้ว'
    );
  };

  // --- Company Holiday Actions ---
  const addHoliday = (holidayData: Omit<CompanyHoliday, 'id'>) => {
    const id = `hol-${Date.now()}`;
    const newHoliday: CompanyHoliday = { ...holidayData, id };
    setHolidays((prev) => [...prev, newHoliday]);

    addAuditLog(
      'COMPANY_HOLIDAY',
      'กำหนดวันหยุดบริษัทเพิ่ม',
      `${holidayData.title} (${holidayData.date})`,
      '-',
      `ประเภท: ${holidayData.type}, วันที่: ${holidayData.date}`,
      'กำหนดโดยแอดมินโดยตรง ไม่ต้องใช้นักขัตฤกษ์ราชการ'
    );
  };

  const updateHoliday = (id: string, updateData: Partial<CompanyHoliday>) => {
    const oldHoliday = holidays.find((h) => h.id === id);
    if (!oldHoliday) return;

    setHolidays((prev) => prev.map((h) => (h.id === id ? { ...h, ...updateData } : h)));

    addAuditLog(
      'COMPANY_HOLIDAY',
      'แก้ไขวันหยุดบริษัท',
      oldHoliday.title,
      `วันที่: ${oldHoliday.date}, ชื่อ: ${oldHoliday.title}`,
      `วันที่: ${updateData.date || oldHoliday.date}, ชื่อ: ${updateData.title || oldHoliday.title}`
    );
  };

  const deleteHoliday = (id: string) => {
    const hol = holidays.find((h) => h.id === id);
    if (!hol) return;

    setHolidays((prev) => prev.filter((h) => h.id !== id));

    addAuditLog(
      'COMPANY_HOLIDAY',
      'ลบวันหยุดบริษัท',
      `${hol.title} (${hol.date})`,
      'มีอยู่ในระบบ',
      'ลบออกแล้ว'
    );
  };

  // --- Yearly Config & Copy Shift ---
  const toggleYearlyPlanning = (year: number, isEnabled: boolean) => {
    setYearlyConfigs((prev) => {
      const exists = prev.some((y) => y.year === year);
      if (exists) {
        return prev.map((y) => (y.year === year ? { ...y, isPlanningEnabled: isEnabled } : y));
      } else {
        return [...prev, { year, isPlanningEnabled: isEnabled, isLocked: false }];
      }
    });

    addAuditLog(
      'YEARLY_CONFIG',
      isEnabled ? 'เปิดระบบจัดกะล่วงหน้าปีถัดไป' : 'ปิดระบบจัดกะล่วงหน้า',
      `ปี ${year}`,
      isEnabled ? 'ปิดระบบ' : 'เปิดระบบ',
      isEnabled ? 'เปิดให้หัวหน้าแผนกจัดกะล่วงหน้า (Active)' : 'ปิดการจัดกะ',
      `การตั้งค่าระบบสำหรับปี ${year}`
    );
  };

  const copyShiftsToYear = (sourceYear: number, targetYear: number, targetDepartmentId?: string) => {
    // Copy shift patterns from sourceYear to targetYear
    const sourceShifts = shifts.filter((s) => s.year === sourceYear);
    const filteredSource = targetDepartmentId
      ? sourceShifts.filter((s) => s.departmentId === targetDepartmentId)
      : sourceShifts;

    if (filteredSource.length === 0) return;

    const newShifts: ShiftEntry[] = [];
    filteredSource.forEach((shift) => {
      // Calculate target date replacing source year with target year
      const sourceDate = new Date(shift.date);
      const targetDate = new Date(
        targetYear,
        sourceDate.getMonth(),
        sourceDate.getDate()
      );
      const targetDateStr = targetDate.toISOString().split('T')[0];

      newShifts.push({
        id: `shift-${shift.employeeId}-${targetDateStr}`,
        employeeId: shift.employeeId,
        departmentId: shift.departmentId,
        date: targetDateStr,
        year: targetYear,
        month: targetDate.getMonth() + 1,
        shiftCode: shift.shiftCode,
        note: `คัดลอกจากตารางปี ${sourceYear}`,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser.name,
      });
    });

    // Replace or merge into target year
    setShifts((prev) => {
      const nonTargetShifts = prev.filter((s) => s.year !== targetYear);
      return [...nonTargetShifts, ...newShifts];
    });

    const deptName = targetDepartmentId
      ? departments.find((d) => d.id === targetDepartmentId)?.name || targetDepartmentId
      : 'ทุกแผนก';

    addAuditLog(
      'YEARLY_CONFIG',
      'คัดลอกตารางกะไปปีถัดไป (Copy Shift)',
      `จากปี ${sourceYear} ไปยังปี ${targetYear}`,
      '-',
      `คัดลอกตารางกะสำเร็จ (${newShifts.length} รายการ)`,
      `แผนกที่คัดลอก: ${deptName}`
    );
  };

  // --- Team Member Actions ---
  const addEmployee = (empData: Omit<Employee, 'id'>) => {
    const id = `emp-${Date.now()}`;
    const newEmp: Employee = { ...empData, id };
    setEmployees((prev) => [...prev, newEmp]);

    // Update department employee count
    setDepartments((prev) =>
      prev.map((d) =>
        d.id === empData.departmentId
          ? { ...d, employeeCount: (d.employeeCount || 0) + 1 }
          : d
      )
    );

    addAuditLog(
      'TEAM_MEMBER',
      'เพิ่มพนักงานเข้าทีม',
      `${empData.name} (${empData.codeName})`,
      '-',
      `รหัส: ${empData.employeeCode}, ตำแหน่ง: ${empData.position}`,
      `แผนก: ${departments.find((d) => d.id === empData.departmentId)?.name || '-'}`
    );
  };

  const updateEmployee = (id: string, updateData: Partial<Employee>) => {
    const oldEmp = employees.find((e) => e.id === id);
    if (!oldEmp) return;

    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, ...updateData } : e)));

    // Sync users and currentUser if name or codeName changed
    if (updateData.name || updateData.codeName) {
      const newName = updateData.name || oldEmp.name;
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === `user-emp-${id}` || u.name === oldEmp.name) {
            return { ...u, name: newName };
          }
          return u;
        })
      );
      if (currentUser.id === `user-emp-${id}` || currentUser.name === oldEmp.name) {
        setCurrentUser((prev) => ({ ...prev, name: newName }));
      }
    }

    addAuditLog(
      'TEAM_MEMBER',
      'แก้ไขข้อมูลพนักงาน',
      `${oldEmp.name} (${oldEmp.codeName})`,
      `ตำแหน่ง: ${oldEmp.position}, สถานะ: ${oldEmp.status}`,
      `ตำแหน่ง: ${updateData.position || oldEmp.position}, สถานะ: ${updateData.status || oldEmp.status}`
    );
  };

  const deleteEmployee = (id: string) => {
    const emp = employees.find((e) => e.id === id);
    if (!emp) return;

    setEmployees((prev) => prev.filter((e) => e.id !== id));

    // Update dept count
    setDepartments((prev) =>
      prev.map((d) =>
        d.id === emp.departmentId
          ? { ...d, employeeCount: Math.max(0, (d.employeeCount || 1) - 1) }
          : d
      )
    );

    addAuditLog(
      'TEAM_MEMBER',
      'ลบพนักงานออกจากทีม',
      `${emp.name} (${emp.codeName})`,
      `รหัส: ${emp.employeeCode}`,
      'ลบออกจากแผนกแล้ว'
    );
  };

  // --- Shift Scheduling Actions ---
  const updateShiftEntry = (
    employeeId: string,
    date: string,
    shiftCode: ShiftTypeCode,
    note?: string
  ) => {
    const emp = employees.find((e) => e.id === employeeId);
    if (!emp) return;

    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;

    let oldCode: ShiftTypeCode = '-';

    setShifts((prev) => {
      const existingIndex = prev.findIndex(
        (s) => s.employeeId === employeeId && s.date === date
      );

      if (existingIndex >= 0) {
        oldCode = prev[existingIndex].shiftCode;
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          shiftCode,
          note: note !== undefined ? note : updated[existingIndex].note,
          updatedAt: new Date().toISOString(),
          updatedBy: currentUser.name,
        };
        return updated;
      } else {
        const newShift: ShiftEntry = {
          id: `shift-${employeeId}-${date}`,
          employeeId,
          departmentId: emp.departmentId,
          date,
          year,
          month,
          shiftCode,
          note,
          updatedAt: new Date().toISOString(),
          updatedBy: currentUser.name,
        };
        return [...prev, newShift];
      }
    });

    if (oldCode !== shiftCode) {
      addAuditLog(
        'SHIFT_SCHEDULE',
        'แก้ไขตารางกะพนักงาน',
        `${emp.name} (${emp.codeName}) - วันที่ ${date}`,
        `กะเดิม: ${oldCode}`,
        `กะใหม่: ${shiftCode}`,
        note ? `หมายเหตุ: ${note}` : undefined
      );
    }
  };

  const batchUpdateShifts = (
    updates: { employeeId: string; date: string; shiftCode: ShiftTypeCode }[]
  ) => {
    if (updates.length === 0) return;

    setShifts((prev) => {
      const newShifts = [...prev];

      updates.forEach((u) => {
        const index = newShifts.findIndex(
          (s) => s.employeeId === u.employeeId && s.date === u.date
        );
        const emp = employees.find((e) => e.id === u.employeeId);
        const dateObj = new Date(u.date);

        if (index >= 0) {
          newShifts[index] = {
            ...newShifts[index],
            shiftCode: u.shiftCode,
            updatedAt: new Date().toISOString(),
            updatedBy: currentUser.name,
          };
        } else if (emp) {
          newShifts.push({
            id: `shift-${u.employeeId}-${u.date}`,
            employeeId: u.employeeId,
            departmentId: emp.departmentId,
            date: u.date,
            year: dateObj.getFullYear(),
            month: dateObj.getMonth() + 1,
            shiftCode: u.shiftCode,
            updatedAt: new Date().toISOString(),
            updatedBy: currentUser.name,
          });
        }
      });

      return newShifts;
    });

    addAuditLog(
      'SHIFT_SCHEDULE',
      'จัดตารางกะแบบกลุ่ม (Batch Shift Update)',
      `จำนวน ${updates.length} วัน/รายการ`,
      '-',
      'อัปเดตตารางกะกลุ่มเรียบร้อย',
      'ดำเนินการโดยหัวหน้าแผนก'
    );
  };

  // --- Production Plan Management ---
  const updateProductionPlan = (date: string, field: 'fp' | 'inj', value: string) => {
    setProductionPlans((prev) => {
      const current = prev[date] || { fp: '', inj: '' };
      const updated = {
        ...current,
        [field]: value,
      };
      return {
        ...prev,
        [date]: updated,
      };
    });

    addAuditLog(
      'PRODUCTION_PLAN',
      'แก้ไขแผนการผลิต',
      `วันที่ ${date}`,
      '-',
      `${field === 'fp' ? 'F&P' : 'INJ'}: ${value}`,
      'แก้ไขแผนการผลิตประจำวัน'
    );
  };

  const batchUpdateProductionPlan = (updates: { date: string; fp?: string; inj?: string }[]) => {
    setProductionPlans((prev) => {
      const next = { ...prev };
      updates.forEach((u) => {
        const current = next[u.date] || { fp: '', inj: '' };
        next[u.date] = {
          fp: u.fp !== undefined ? u.fp : current.fp,
          inj: u.inj !== undefined ? u.inj : current.inj,
        };
      });
      return next;
    });

    addAuditLog(
      'PRODUCTION_PLAN',
      'อัปเดตแผนการผลิตกลุ่ม',
      `จำนวน ${updates.length} รายการ`,
      '-',
      'อัปเดตสำเร็จ',
      'ดำเนินการโดยหัวหน้าแผนก/แอดมิน'
    );
  };

  // --- Shift Swap & Leave Requests ---
  const createSwapRequest = (
    reqData: Omit<ShiftSwapRequest, 'id' | 'requestedAt' | 'status'>
  ) => {
    const id = `swap-${Date.now()}`;
    const newReq: ShiftSwapRequest = {
      ...reqData,
      id,
      status: 'PENDING',
      requestedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    setSwapRequests((prev) => [newReq, ...prev]);

    addAuditLog(
      'SWAP_LEAVE_REQUEST',
      reqData.requestType === 'SWAP' ? 'ยื่นคำขอสลับกะ' : 'ยื่นคำขอลา',
      `${reqData.requesterName} - วันที่ ${reqData.targetDate}`,
      '-',
      `สถานะ: รออนุมัติ (PENDING)`,
      `สาเหตุ: ${reqData.reason || '-'}`
    );
  };

  const reviewSwapRequest = (
    requestId: string,
    status: 'APPROVED' | 'REJECTED',
    reviewComment?: string
  ) => {
    const req = swapRequests.find((r) => r.id === requestId);
    if (!req) return;

    setSwapRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status,
              reviewedBy: currentUser.id,
              reviewedByName: currentUser.name,
              reviewedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
              reviewComment,
            }
          : r
      )
    );

    // If approved, automatically update shift grid!
    if (status === 'APPROVED') {
      if (req.requestType === 'LEAVE') {
        updateShiftEntry(req.requesterId, req.targetDate, 'L', `อนุมัติวันลา: ${req.reason || ''}`);
      } else if (req.requestType === 'SWAP' && req.swapWithEmployeeId) {
        // Swap shift codes between the two employees
        const newRequesterShift = req.targetNewShift || 'A';
        const newSwapEmployeeShift = req.currentShift;

        updateShiftEntry(
          req.requesterId,
          req.targetDate,
          newRequesterShift,
          `อนุมัติสลับกะกับ ${req.swapWithEmployeeName}`
        );
        updateShiftEntry(
          req.swapWithEmployeeId,
          req.targetSwapDate || req.targetDate,
          newSwapEmployeeShift,
          `อนุมัติสลับกะกับ ${req.requesterName}`
        );
      }
    }

    addAuditLog(
      'SWAP_LEAVE_REQUEST',
      status === 'APPROVED' ? 'อนุมัติคำขอสลับกะ/การลา' : 'ปฏิเสธคำขอสลับกะ/การลา',
      `${req.requesterName} - วันที่ ${req.targetDate}`,
      'สถานะเดิม: รอการอนุมัติ (PENDING)',
      `สถานะใหม่: ${status === 'APPROVED' ? 'อนุมัติแล้ว (APPROVED)' : 'ปฏิเสธ (REJECTED)'}`,
      `ความเห็นหัวหน้า: ${reviewComment || '-'}`
    );
  };

  // --- Option & Legend Configuration Actions ---
  const addShiftType = (item: ShiftType) => {
    setShiftTypes((prev) => {
      const exists = prev.some((s) => s.code === item.code);
      if (exists) return prev.map((s) => (s.code === item.code ? item : s));
      return [...prev, item];
    });
    addAuditLog(
      'SHIFT_SCHEDULE',
      'เพิ่มสัญลักษณ์กะการทำงานใหม่',
      `รหัสกะ: ${item.code}`,
      '-',
      `ชื่อ: ${item.nameTh} (${item.code})`
    );
  };

  const updateShiftType = (code: string, updated: Partial<ShiftType>) => {
    setShiftTypes((prev) => prev.map((s) => (s.code === code ? { ...s, ...updated } : s)));
    addAuditLog(
      'SHIFT_SCHEDULE',
      'แก้ไขสัญลักษณ์กะการทำงาน',
      `รหัสกะ: ${code}`,
      '-',
      `อัปเดตสัญลักษณ์กะ: ${updated.nameTh || code}`
    );
  };

  const deleteShiftType = (code: string) => {
    setShiftTypes((prev) => prev.filter((s) => s.code !== code));
    addAuditLog(
      'SHIFT_SCHEDULE',
      'ลบสัญลักษณ์กะการทำงาน',
      `รหัสกะ: ${code}`,
      code,
      'ลบสำเร็จ'
    );
  };

  const addFPPlanOption = (item: Omit<PlanOptionItem, 'id'>) => {
    const newObj: PlanOptionItem = { ...item, id: `fp-opt-${Date.now()}` };
    setFpPlanOptions((prev) => [...prev, newObj]);
    addAuditLog(
      'PRODUCTION_PLAN',
      'เพิ่มตัวเลือกแผนผลิต F&P',
      item.code,
      '-',
      `ชื่อ: ${item.name}`
    );
  };

  const updateFPPlanOption = (id: string, updated: Partial<PlanOptionItem>) => {
    setFpPlanOptions((prev) => prev.map((o) => (o.id === id ? { ...o, ...updated } : o)));
    addAuditLog(
      'PRODUCTION_PLAN',
      'แก้ไขตัวเลือกแผนผลิต F&P',
      updated.code || id,
      '-',
      `แก้ไขตัวเลือกสำเร็จ`
    );
  };

  const deleteFPPlanOption = (id: string) => {
    setFpPlanOptions((prev) => prev.filter((o) => o.id !== id));
    addAuditLog(
      'PRODUCTION_PLAN',
      'ลบตัวเลือกแผนผลิต F&P',
      id,
      '-',
      'ลบสำเร็จ'
    );
  };

  const addINJPlanOption = (item: Omit<PlanOptionItem, 'id'>) => {
    const newObj: PlanOptionItem = { ...item, id: `inj-opt-${Date.now()}` };
    setInjPlanOptions((prev) => [...prev, newObj]);
    addAuditLog(
      'PRODUCTION_PLAN',
      'เพิ่มตัวเลือกแผนผลิต INJ',
      item.code,
      '-',
      `ชื่อ: ${item.name}`
    );
  };

  const updateINJPlanOption = (id: string, updated: Partial<PlanOptionItem>) => {
    setInjPlanOptions((prev) => prev.map((o) => (o.id === id ? { ...o, ...updated } : o)));
    addAuditLog(
      'PRODUCTION_PLAN',
      'แก้ไขตัวเลือกแผนผลิต INJ',
      updated.code || id,
      '-',
      `แก้ไขตัวเลือกสำเร็จ`
    );
  };

  const deleteINJPlanOption = (id: string) => {
    setInjPlanOptions((prev) => prev.filter((o) => o.id !== id));
    addAuditLog(
      'PRODUCTION_PLAN',
      'ลบตัวเลือกแผนผลิต INJ',
      id,
      '-',
      'ลบสำเร็จ'
    );
  };

  const resetOptionDefaults = () => {
    setShiftTypes(DEFAULT_SHIFT_TYPES);
    setFpPlanOptions(INITIAL_FP_PLAN_OPTIONS);
    setInjPlanOptions(INITIAL_INJ_PLAN_OPTIONS);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_shift_types`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_fp_plan_options`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_inj_plan_options`);
  };

  const resetToDefaultData = () => {
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_users`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_departments`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_employees`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_shifts`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_holidays`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_yearly`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_swaps`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_logs`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_prod_plans`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_shift_types`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_fp_plan_options`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_inj_plan_options`);

    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setDepartments(INITIAL_DEPARTMENTS);
    setEmployees(INITIAL_EMPLOYEES);
    setShifts(generateSeedShifts());
    setHolidays(INITIAL_HOLIDAYS);
    setYearlyConfigs(INITIAL_YEARLY_CONFIGS);
    setSwapRequests(INITIAL_SWAP_REQUESTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setProductionPlans(INITIAL_PRODUCTION_PLANS);
    setShiftTypes(DEFAULT_SHIFT_TYPES);
    setFpPlanOptions(INITIAL_FP_PLAN_OPTIONS);
    setInjPlanOptions(INITIAL_INJ_PLAN_OPTIONS);
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,

        isLoggedIn,
        isReadOnly,
        currentUser,
        setCurrentUser,
        availableUsers: users,
        loginWithIdentifier,
        loginWithUsernamePassword,
        requestOTPForEmployee,
        resetPasswordWithOTP,
        requestAdminResetPassword,
        resetPasswordToEmployeeCode,
        changePassword,
        passwords,
        loginAsUser,
        loginAsEmployee,
        logout,

        departments,
        users,
        employees,
        shifts,
        holidays,
        yearlyConfigs,
        swapRequests,
        auditLogs,
        productionPlans,
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

        activeYear,
        setActiveYear,
        activeMonth,
        setActiveMonth,

        isAdmin,
        isSupervisor,
        userDepartmentId,
        userDepartmentName,
        canAccessDepartment,

        addAuditLog,

        addDepartment,
        updateDepartment,
        deleteDepartment,
        assignSupervisor,
        assignSupervisors,

        addUser,
        updateUserRole,
        updateUser,
        deleteUser,

        addHoliday,
        updateHoliday,
        deleteHoliday,

        toggleYearlyPlanning,
        copyShiftsToYear,

        addEmployee,
        updateEmployee,
        deleteEmployee,

        updateShiftEntry,
        batchUpdateShifts,

        updateProductionPlan,
        batchUpdateProductionPlan,

        createSwapRequest,
        reviewSwapRequest,

        resetToDefaultData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
