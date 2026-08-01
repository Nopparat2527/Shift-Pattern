import { Department, User, Employee, ShiftType, ShiftTypeCode, CompanyHoliday, YearlyConfig, ShiftSwapRequest, AuditLog, ShiftEntry, PlanOptionItem } from './types';

export const SHIFT_TYPES: ShiftType[] = [
  {
    code: 'M',
    nameTh: 'กะเช้า',
    nameEn: 'Morning Shift',
    colorBg: 'bg-blue-100 dark:bg-blue-900/40',
    colorText: 'text-blue-800 dark:text-blue-300',
    colorBorder: 'border-blue-300 dark:border-blue-700',
    description: '08:00 - 17:00 น.',
    isWorkDay: true,
  },
  {
    code: 'A',
    nameTh: 'กะบ่าย',
    nameEn: 'Afternoon Shift',
    colorBg: 'bg-amber-100 dark:bg-amber-900/40',
    colorText: 'text-amber-800 dark:text-amber-300',
    colorBorder: 'border-amber-300 dark:border-amber-700',
    description: '16:00 - 01:00 น.',
    isWorkDay: true,
  },
  {
    code: 'N',
    nameTh: 'กะดึก',
    nameEn: 'Night Shift',
    colorBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    colorText: 'text-emerald-800 dark:text-emerald-300',
    colorBorder: 'border-emerald-300 dark:border-emerald-700',
    description: '00:00 - 09:00 น.',
    isWorkDay: true,
  },
  {
    code: 'OFF',
    nameTh: 'วันหยุดประจำสัปดาห์',
    nameEn: 'Weekly Off',
    colorBg: 'bg-rose-100 dark:bg-rose-950/60',
    colorText: 'text-rose-700 dark:text-rose-300',
    colorBorder: 'border-rose-300 dark:border-rose-800',
    description: 'วันหยุดประจำสัปดาห์ (อาทิตย์)',
    isWorkDay: false,
  },
  {
    code: 'HL',
    nameTh: 'วันหยุดบริษัท',
    nameEn: 'Company Holiday',
    colorBg: 'bg-orange-100 dark:bg-orange-950/60',
    colorText: 'text-orange-800 dark:text-orange-300',
    colorBorder: 'border-orange-300 dark:border-orange-800',
    description: 'วันหยุดประกาศพิเศษบริษัท',
    isWorkDay: false,
  },
  {
    code: 'L',
    nameTh: 'วันลาพักร้อน/ลากิจ',
    nameEn: 'Leave',
    colorBg: 'bg-purple-100 dark:bg-purple-900/40',
    colorText: 'text-purple-800 dark:text-purple-300',
    colorBorder: 'border-purple-300 dark:border-purple-700',
    description: 'การลาพักร้อน หรือลากิจที่ได้รับอนุมัติ',
    isWorkDay: false,
  },
  {
    code: '+N',
    nameTh: 'OT กะดึก',
    nameEn: 'OT Night',
    colorBg: 'bg-teal-100 dark:bg-teal-900/50',
    colorText: 'text-teal-900 dark:text-teal-200 font-bold',
    colorBorder: 'border-teal-400 dark:border-teal-600',
    description: 'ทำงานล่วงเวลา กะดึก (+OT)',
    isWorkDay: true,
    isOvertime: true,
  },
  {
    code: '+A',
    nameTh: 'OT กะบ่าย',
    nameEn: 'OT Afternoon',
    colorBg: 'bg-yellow-100 dark:bg-yellow-900/50',
    colorText: 'text-yellow-900 dark:text-yellow-200 font-bold',
    colorBorder: 'border-yellow-400 dark:border-yellow-600',
    description: 'ทำงานล่วงเวลา กะบ่าย (+OT)',
    isWorkDay: true,
    isOvertime: true,
  },
  {
    code: 'M+',
    nameTh: 'OT กะเช้า',
    nameEn: 'OT Morning',
    colorBg: 'bg-sky-100 dark:bg-sky-900/50',
    colorText: 'text-sky-900 dark:text-sky-200 font-bold',
    colorBorder: 'border-sky-400 dark:border-sky-600',
    description: 'ทำงานล่วงเวลา กะเช้า (+OT)',
    isWorkDay: true,
    isOvertime: true,
  },
  {
    code: '-',
    nameTh: 'ยังไม่จัดกะ',
    nameEn: 'Unassigned',
    colorBg: 'bg-gray-100 dark:bg-gray-800',
    colorText: 'text-gray-500 dark:text-gray-400',
    colorBorder: 'border-gray-200 dark:border-gray-700',
    description: 'รอดำเนินการระบุตารางกะ',
    isWorkDay: false,
  },
];

export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'dept-1',
    name: 'แผนกการผลิต F&P (Production F&P)',
    code: 'F&P',
    supervisorId: 'user-sup-1',
    supervisorName: 'นพรัตน์ สุขตน (Nopparat)',
    description: 'ดูแลสายการผลิตบรรจุภัณฑ์ F&P และควบคุมคุณภาพประจำไลน์',
    employeeCount: 4,
  },
  {
    id: 'dept-2',
    name: 'แผนกฉีดขึ้นรูป (Injection Dept)',
    code: 'INJ',
    supervisorId: 'user-sup-2',
    supervisorName: 'ประเสริฐ อินเจคชั่น (Prasert)',
    description: 'ดูแลกระบวนการฉีดขึ้นรูปพลาสติกโรงงาน 2',
    employeeCount: 4,
  },
  {
    id: 'dept-3',
    name: 'แผนกซ่อมบำรุง (Maintenance)',
    code: 'MAINT',
    supervisorId: undefined,
    supervisorName: 'ยังไม่ได้ตั้งแต่ง',
    description: 'ดูแลเครื่องจักรระบบไฟฟ้าและช่างบำรุงโรงงาน',
    employeeCount: 2,
  },
  {
    id: 'dept-4',
    name: 'แผนกควบคุมคุณภาพ (Quality Control)',
    code: 'QC',
    supervisorId: undefined,
    supervisorName: 'ยังไม่ได้ตั้งแต่ง',
    description: 'ตรวจสอบมาตรฐานสินค้าก่อนจัดส่งลูกค้า',
    employeeCount: 2,
  },
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin-1',
    name: 'สมชาย แอดมินใหญ่ (Somchai Admin)',
    email: 'admin@company.com',
    role: 'ADMIN',
    position: 'System Administrator / HR Director',
  },
  {
    id: 'user-sup-1',
    name: 'นพรัตน์ สุขตน (Nopparat Kai)',
    email: 'nopparat@company.com',
    role: 'SUPERVISOR',
    departmentId: 'dept-1', // F&P
    position: 'หัวหน้าแผนก F&P (Supervisor A)',
  },
  {
    id: 'user-sup-2',
    name: 'ประเสริฐ อินเจคชั่น (Prasert INJ)',
    email: 'prasert@company.com',
    role: 'SUPERVISOR',
    departmentId: 'dept-2', // INJ
    position: 'หัวหน้าแผนก INJ (Supervisor B)',
  },
  {
    id: 'user-admin-2',
    name: 'กิตติพงษ์ ระบบ (Kittipong Admin)',
    email: 'kittipong@company.com',
    role: 'ADMIN',
    position: 'ผู้ดูแลระบบร่วม (Co-Admin)',
  },
];

export const INITIAL_EMPLOYEES: Employee[] = [
  // F&P Team
  {
    id: 'emp-101',
    employeeCode: '0756208',
    name: 'Siwapong Keawkuakool',
    codeName: 'Boy',
    departmentId: 'dept-1',
    position: 'Senior Operator',
    status: 'ACTIVE',
    joinDate: '2021-03-15',
    phone: '081-234-5678',
  },
  {
    id: 'emp-102',
    employeeCode: '10776170',
    name: 'Nopparat Sukton',
    codeName: 'Kai',
    departmentId: 'dept-1',
    position: 'Shift Leader / Supervisor',
    status: 'ACTIVE',
    joinDate: '2020-01-10',
    phone: '089-876-5432',
  },
  {
    id: 'emp-103',
    employeeCode: '10806225',
    name: 'Aekkapong Krobpethpong',
    codeName: 'Aek',
    departmentId: 'dept-1',
    position: 'Technician Operator',
    status: 'ACTIVE',
    joinDate: '2022-06-01',
    phone: '086-112-2334',
  },
  {
    id: 'emp-104',
    employeeCode: '10774547',
    name: 'Kittisak Chatraksa',
    codeName: 'Beer',
    departmentId: 'dept-1',
    position: 'Line Operator',
    status: 'ACTIVE',
    joinDate: '2023-02-18',
    phone: '084-556-6778',
  },

  // INJ Team
  {
    id: 'emp-201',
    employeeCode: '20881911',
    name: 'Witthaya Pradit',
    codeName: 'Wit',
    departmentId: 'dept-2',
    position: 'Molding Master',
    status: 'ACTIVE',
    joinDate: '2019-11-01',
    phone: '082-990-1122',
  },
  {
    id: 'emp-202',
    employeeCode: '20881912',
    name: 'Thanapol Srisook',
    codeName: 'Pol',
    departmentId: 'dept-2',
    position: 'Injection Operator',
    status: 'ACTIVE',
    joinDate: '2021-08-12',
    phone: '083-445-5667',
  },
  {
    id: 'emp-203',
    employeeCode: '20881913',
    name: 'Manop Boonma',
    codeName: 'Nop',
    departmentId: 'dept-2',
    position: 'Junior Machine Tender',
    status: 'ACTIVE',
    joinDate: '2023-01-05',
    phone: '087-334-4556',
  },
  {
    id: 'emp-204',
    employeeCode: '20881914',
    name: 'Surachai Wongsawat',
    codeName: 'Chai',
    departmentId: 'dept-2',
    position: 'Quality Auditor',
    status: 'ACTIVE',
    joinDate: '2022-04-20',
    phone: '085-778-8990',
  },
];

// Seed Custom Company Holidays (Configured directly by Admin, not dependent on national calendar)
export const INITIAL_HOLIDAYS: CompanyHoliday[] = [
  {
    id: 'hol-1',
    date: '2026-01-01',
    year: 2026,
    title: 'วันหยุดต้อนรับปีใหม่ประจำบริษัท',
    type: 'COMPANY',
    description: 'วันหยุดพิเศษเริ่มปีใหม่สำหรับพนักงานทุกแผนก',
  },
  {
    id: 'hol-2',
    date: '2026-04-13',
    year: 2026,
    title: 'วันหยุดเทศกาลสงกรานต์โรงงาน (วันแรก)',
    type: 'FACTORY_SPECIAL',
    description: 'ปิดสายการผลิตประจำปี ทำความสะอาดประจำปี',
  },
  {
    id: 'hol-3',
    date: '2026-04-14',
    year: 2026,
    title: 'วันหยุดเทศกาลสงกรานต์โรงงาน (วันที่สอง)',
    type: 'FACTORY_SPECIAL',
    description: 'วันหยุดสวัสดิการโรงงาน',
  },
  {
    id: 'hol-4',
    date: '2026-04-15',
    year: 2026,
    title: 'วันหยุดเทศกาลสงกรานต์โรงงาน (วันที่สาม)',
    type: 'FACTORY_SPECIAL',
    description: 'วันหยุดสวัสดิการโรงงาน',
  },
  {
    id: 'hol-5',
    date: '2026-05-01',
    year: 2026,
    title: 'วันแรงงานสวัสดิการบริษัท',
    type: 'COMPANY',
    description: 'วันหยุดบริษัท',
  },
  {
    id: 'hol-6',
    date: '2026-07-28',
    year: 2026,
    title: 'วันหยุดพิเศษประจำโรงงานกลางปี (Big Cleaning Day)',
    type: 'FACTORY_SPECIAL',
    description: 'ปิดการผลิตเพื่อตรวจสอบบำรุงรักษาใหญ่ประจำปี',
  },
  {
    id: 'hol-7',
    date: '2026-12-31',
    year: 2026,
    title: 'วันสิ้นปีพักผ่อนสวัสดิการบริษัท',
    type: 'OFFICE_SPECIAL',
    description: 'วันหยุดปิดงบประจำปี',
  },
];

export const INITIAL_YEARLY_CONFIGS: YearlyConfig[] = [
  {
    year: 2026,
    isPlanningEnabled: true,
    isLocked: false,
    notes: 'ปีปัจจุบัน - เปิดให้จัดตารางกะปกติ',
  },
  {
    year: 2027,
    isPlanningEnabled: true, // Opened by Admin near year end!
    isLocked: false,
    notes: 'ปีถัดไป - เปิดระบบสิ้นปีให้หัวหน้าแผนกจัด/คัดลอกตารางกะล่วงหน้าได้แล้ว',
  },
];

export const INITIAL_SWAP_REQUESTS: ShiftSwapRequest[] = [
  {
    id: 'swap-1',
    requestType: 'SWAP',
    requesterId: 'emp-101',
    requesterName: 'Siwapong (Boy)',
    departmentId: 'dept-1',
    targetDate: '2026-07-28',
    currentShift: 'N',
    swapWithEmployeeId: 'emp-104',
    swapWithEmployeeName: 'Kittisak (Beer)',
    targetSwapDate: '2026-07-28',
    targetNewShift: 'A',
    status: 'PENDING',
    requestedAt: '2026-07-25 09:30',
    reason: 'ธุระส่วนตัวช่วงดึก ขอสลับกะดึกเป็นกะบ่ายกับนายกิตติศักดิ์',
  },
  {
    id: 'swap-2',
    requestType: 'LEAVE',
    requesterId: 'emp-103',
    requesterName: 'Aekkapong (Aek)',
    departmentId: 'dept-1',
    targetDate: '2026-07-30',
    currentShift: 'M',
    leaveType: 'VACATION',
    status: 'APPROVED',
    requestedAt: '2026-07-20 14:15',
    reviewedBy: 'user-sup-1',
    reviewedByName: 'นพรัตน์ สุขตน (Kai)',
    reviewedAt: '2026-07-21 10:00',
    reason: 'ขอลาพักร้อนประจำปีไปพบแพทย์',
    reviewComment: 'อนุมัติลาพักร้อน ปรับตารางกะเป็น L',
  },
  {
    id: 'swap-3',
    requestType: 'SWAP',
    requesterId: 'emp-202',
    requesterName: 'Thanapol (Pol)',
    departmentId: 'dept-2',
    targetDate: '2026-08-05',
    currentShift: 'A',
    swapWithEmployeeId: 'emp-203',
    swapWithEmployeeName: 'Manop (Nop)',
    targetSwapDate: '2026-08-05',
    targetNewShift: 'M',
    status: 'PENDING',
    requestedAt: '2026-07-29 11:20',
    reason: 'ขอสลับกะบ่ายเป็นกะเช้ากับมานพ',
  },
];

// Initial Audit Logs demonstrating history tracking
export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1001',
    timestamp: '2026-07-31T10:15:00Z',
    formattedDate: '31 ก.ค. 2026 10:15 น.',
    actorId: 'user-admin-1',
    actorName: 'สมชาย แอดมินใหญ่',
    actorRole: 'ADMIN',
    actorDepartmentName: 'ส่วนกลาง (Admin)',
    category: 'YEARLY_CONFIG',
    action: 'เปิดระบบจัดตารางกะปีถัดไป',
    targetRef: 'ปี 2027',
    oldValue: 'สถานะ: ปิดระบบจัดกะล่วงหน้า',
    newValue: 'สถานะ: เปิดให้หัวหน้าแผนกจัดกะล่วงหน้า (Active)',
    details: 'เปิดสิทธิ์สิ้นปีให้หัวหน้าแผนกเตรียมวางตารางกะและคัดลอกกะปี 2027',
  },
  {
    id: 'log-1002',
    timestamp: '2026-07-31T11:30:00Z',
    formattedDate: '31 ก.ค. 2026 11:30 น.',
    actorId: 'user-admin-1',
    actorName: 'สมชาย แอดมินใหญ่',
    actorRole: 'ADMIN',
    actorDepartmentName: 'ส่วนกลาง (Admin)',
    category: 'COMPANY_HOLIDAY',
    action: 'เพิ่มวันหยุดพิเศษบริษัท',
    targetRef: '28 ก.ค. 2026 (Big Cleaning Day)',
    oldValue: '-',
    newValue: 'วันหยุดพิเศษประจำโรงงานกลางปี',
    details: 'กำหนดวันหยุดของบริษัทโดยตรง ไม่ต้องอ้างอิงปฏิทินนักขัตฤกษ์ประเทศ',
  },
  {
    id: 'log-1003',
    timestamp: '2026-07-31T14:20:00Z',
    formattedDate: '31 ก.ค. 2026 14:20 น.',
    actorId: 'user-sup-1',
    actorName: 'นพรัตน์ สุขตน',
    actorRole: 'SUPERVISOR',
    actorDepartmentId: 'dept-1',
    actorDepartmentName: 'แผนกการผลิต F&P',
    category: 'SHIFT_SCHEDULE',
    action: 'จัดตารางกะประจำสัปดาห์',
    targetRef: 'Siwapong (Boy) - 27 ก.ค. 2026',
    oldValue: 'กะดึก (N)',
    newValue: 'OT กะดึก (+N)',
    details: 'ปรับปรุงกะการทำงานเพิ่ม OT ตามความต้องการแผนงานผลิต',
  },
  {
    id: 'log-1004',
    timestamp: '2026-07-31T15:45:00Z',
    formattedDate: '31 ก.ค. 2026 15:45 น.',
    actorId: 'user-sup-1',
    actorName: 'นพรัตน์ สุขตน',
    actorRole: 'SUPERVISOR',
    actorDepartmentId: 'dept-1',
    actorDepartmentName: 'แผนกการผลิต F&P',
    category: 'SWAP_LEAVE_REQUEST',
    action: 'อนุมัติคำขอวันลาพักร้อน',
    targetRef: 'Aekkapong (Aek) - 30 ก.ค. 2026',
    oldValue: 'คำขอ: รอการอนุมัติ (Pending)',
    newValue: 'คำขอ: อนุมัติแล้ว (Approved)',
    details: 'ปรับตารางกะของ Aekkapong เป็น L (วันลาพักร้อน) ในระบบเรียบร้อย',
  },
];

// Helper to generate seed shift entries matching the exact style of the Excel sheet in user screenshot!
export function generateSeedShifts(): ShiftEntry[] {
  const shifts: ShiftEntry[] = [];
  const year = 2026;
  const month = 7; // July 2026
  
  // Exact mapping inspired by screenshot:
  // Days July 13 to Aug 5
  // Emp 101 Siwapong (Boy): Mon-Sat N, Sun OFF, Mon-Sat +N, Sun OFF, Mon-Sat N...
  // Emp 102 Nopparat (Kai): Mon-Sat A, Sun OFF, Mon-Sat A, Sun OFF, Mon-Sat M+...
  // Emp 103 Aekkapong (Aek): Mon-Wed M, Thu-Sat L, Sun OFF, Mon-Sat M, Sun OFF, Mon-Tue L...
  // Emp 104 Kittisak (Beer): Mon-Sat M, Sun OFF, Mon-Sat M, Sun OFF, Mon-Tue HL...

  const employeeShiftPattern: Record<string, { pattern1: ShiftTypeCode[]; pattern2: ShiftTypeCode[]; pattern3: ShiftTypeCode[] }> = {
    'emp-101': {
      pattern1: ['N', 'N', 'N', 'N', 'N', 'N', 'OFF'],
      pattern2: ['+N', '+N', '+N', 'N', 'N', 'N', 'OFF'],
      pattern3: ['N', 'N', 'N', 'N', 'N', 'N', 'OFF'],
    },
    'emp-102': {
      pattern1: ['A', 'A', '+A', 'A', 'A', 'A', 'OFF'],
      pattern2: ['A', 'A', 'A', 'A', 'A', 'A', 'OFF'],
      pattern3: ['M+', 'M+', 'M+', 'A', 'A', 'A', 'OFF'],
    },
    'emp-103': {
      pattern1: ['M', 'M', 'M', 'L', 'L', 'L', 'OFF'],
      pattern2: ['L', 'M', 'M', 'M', 'M', 'L', 'OFF'],
      pattern3: ['L', 'HL', 'L', 'M', 'M', 'M', 'OFF'],
    },
    'emp-104': {
      pattern1: ['M', 'M', 'L', 'M', 'M', 'M', 'OFF'],
      pattern2: ['M', 'M', 'M', 'M', 'M', 'M', 'OFF'],
      pattern3: ['M', 'HL', 'L', 'A', 'A', 'A', 'OFF'],
    },

    // INJ team default seed
    'emp-201': {
      pattern1: ['M', 'M', 'M', 'M', 'M', 'M', 'OFF'],
      pattern2: ['A', 'A', 'A', 'A', 'A', 'A', 'OFF'],
      pattern3: ['N', 'N', 'N', 'N', 'N', 'N', 'OFF'],
    },
    'emp-202': {
      pattern1: ['A', 'A', 'A', 'A', 'A', 'A', 'OFF'],
      pattern2: ['+A', '+A', 'A', 'A', 'A', 'A', 'OFF'],
      pattern3: ['M', 'M', 'M', 'M', 'M', 'M', 'OFF'],
    },
    'emp-203': {
      pattern1: ['N', 'N', 'N', 'N', 'N', 'N', 'OFF'],
      pattern2: ['N', 'N', 'N', 'N', 'N', 'N', 'OFF'],
      pattern3: ['A', 'A', 'A', 'A', 'A', 'A', 'OFF'],
    },
    'emp-204': {
      pattern1: ['M', 'M', 'M', 'M', 'M', 'L', 'OFF'],
      pattern2: ['M', 'M', 'M', 'M', 'M', 'M', 'OFF'],
      pattern3: ['L', 'HL', 'M', 'M', 'M', 'M', 'OFF'],
    },
  };

  // Build full 12 months for 2026
  for (let m = 1; m <= 12; m++) {
    const daysInMonth = new Date(year, m, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `2026-${m < 10 ? '0' + m : m}-${day < 10 ? '0' + day : day}`;
      const d = new Date(year, m - 1, day);
      const dayOfWeek = d.getDay(); // 0 is Sun

      for (let empId of Object.keys(employeeShiftPattern)) {
        const isInj = empId.startsWith('emp-2');
        const deptId = isInj ? 'dept-2' : 'dept-1';
        const pat = employeeShiftPattern[empId];

        let code: ShiftTypeCode = 'M';
        if (dayOfWeek === 0) {
          code = 'OFF';
        } else {
          // Choose based on day ranges
          if (day <= 10) code = pat.pattern1[(day - 1) % 6];
          else if (day <= 20) code = pat.pattern2[(day - 11) % 6];
          else code = pat.pattern3[(day - 21) % 6];
        }

        // Special company holiday on July 28
        if (m === 7 && day === 28) {
          code = 'HL';
        }

        shifts.push({
          id: `shift-${empId}-${dateStr}`,
          employeeId: empId,
          departmentId: deptId,
          date: dateStr,
          year: 2026,
          month: m,
          shiftCode: code,
          updatedAt: '2026-07-25 08:00',
          updatedBy: 'system',
        });
      }
    }
  }

  return shifts;
}

export const INITIAL_FP_PLAN_OPTIONS: PlanOptionItem[] = [
  {
    id: 'fp-1',
    code: 'NPL 0.6L',
    name: 'NPL 0.6L',
    colorBg: 'bg-sky-100 dark:bg-sky-950',
    colorText: 'text-sky-900 dark:text-sky-200',
    colorBorder: 'border-sky-300 dark:border-sky-800',
    description: 'ขวด NPL ขนาด 0.6 ลิตร',
  },
  {
    id: 'fp-2',
    code: 'NPL 0.33L',
    name: 'NPL 0.33L',
    colorBg: 'bg-emerald-100 dark:bg-emerald-950',
    colorText: 'text-emerald-900 dark:text-emerald-200',
    colorBorder: 'border-emerald-300 dark:border-emerald-800',
    description: 'ขวด NPL ขนาด 0.33 ลิตร',
  },
  {
    id: 'fp-3',
    code: 'NPL 1.5L',
    name: 'NPL 1.5L',
    colorBg: 'bg-purple-100 dark:bg-purple-950',
    colorText: 'text-purple-900 dark:text-purple-200',
    colorBorder: 'border-purple-300 dark:border-purple-800',
    description: 'ขวด NPL ขนาด 1.5 ลิตร',
  },
  {
    id: 'fp-4',
    code: 'NPL 0.25L',
    name: 'NPL 0.25L',
    colorBg: 'bg-blue-100 dark:bg-blue-950',
    colorText: 'text-blue-900 dark:text-blue-200',
    colorBorder: 'border-blue-300 dark:border-blue-800',
    description: 'ขวด NPL ขนาด 0.25 ลิตร',
  },
  {
    id: 'fp-5',
    code: 'Coke 0.6L',
    name: 'Coke 0.6L',
    colorBg: 'bg-rose-100 dark:bg-rose-950',
    colorText: 'text-rose-900 dark:text-rose-200',
    colorBorder: 'border-rose-300 dark:border-rose-800',
    description: 'ขวด Coke ขนาด 0.6 ลิตร',
  },
  {
    id: 'fp-6',
    code: 'Sprite 0.6L',
    name: 'Sprite 0.6L',
    colorBg: 'bg-teal-100 dark:bg-teal-950',
    colorText: 'text-teal-900 dark:text-teal-200',
    colorBorder: 'border-teal-300 dark:border-teal-800',
    description: 'ขวด Sprite ขนาด 0.6 ลิตร',
  },
  {
    id: 'fp-7',
    code: 'OFF',
    name: 'OFF',
    colorBg: 'bg-rose-100 dark:bg-rose-950/80',
    colorText: 'text-rose-700 dark:text-rose-300',
    colorBorder: 'border-rose-300 dark:border-rose-800',
    description: 'หยุดสายการผลิต F&P',
  },
];

export const INITIAL_INJ_PLAN_OPTIONS: PlanOptionItem[] = [
  {
    id: 'inj-1',
    code: '24.4',
    name: '24.4g',
    colorBg: 'bg-amber-100 dark:bg-amber-950',
    colorText: 'text-amber-950 dark:text-amber-100',
    colorBorder: 'border-amber-400 dark:border-amber-700',
    description: 'หลอดพรีฟอร์มขนาด 24.4 กรัม',
  },
  {
    id: 'inj-2',
    code: '11.47',
    name: '11.47g',
    colorBg: 'bg-yellow-100 dark:bg-yellow-950',
    colorText: 'text-yellow-950 dark:text-yellow-100',
    colorBorder: 'border-yellow-400 dark:border-yellow-700',
    description: 'หลอดพรีฟอร์มขนาด 11.47 กรัม',
  },
  {
    id: 'inj-3',
    code: '18.2',
    name: '18.2g',
    colorBg: 'bg-orange-100 dark:bg-orange-950',
    colorText: 'text-orange-950 dark:text-orange-100',
    colorBorder: 'border-orange-400 dark:border-orange-700',
    description: 'หลอดพรีฟอร์มขนาด 18.2 กรัม',
  },
  {
    id: 'inj-4',
    code: '30.0',
    name: '30.0g',
    colorBg: 'bg-amber-200 dark:bg-amber-900',
    colorText: 'text-amber-950 dark:text-amber-100',
    colorBorder: 'border-amber-500 dark:border-amber-600',
    description: 'หลอดพรีฟอร์มขนาด 30.0 กรัม',
  },
  {
    id: 'inj-5',
    code: '24.4 / 11.47',
    name: '24.4 / 11.47',
    colorBg: 'bg-lime-100 dark:bg-lime-950',
    colorText: 'text-lime-950 dark:text-lime-100',
    colorBorder: 'border-lime-400 dark:border-lime-700',
    description: 'การผลิตผสม 24.4g และ 11.47g',
  },
  {
    id: 'inj-6',
    code: 'OFF',
    name: 'OFF',
    colorBg: 'bg-rose-100 dark:bg-rose-950/80',
    colorText: 'text-rose-700 dark:text-rose-300',
    colorBorder: 'border-rose-300 dark:border-rose-800',
    description: 'หยุดสายการผลิต INJ',
  },
];

export const FP_PLAN_OPTIONS = INITIAL_FP_PLAN_OPTIONS.map((o) => o.code);
export const INJ_PLAN_OPTIONS = INITIAL_INJ_PLAN_OPTIONS.map((o) => o.code);

export function generateSeedProductionPlans(year: number = 2026): Record<string, { fp: string; inj: string }> {
  const plans: Record<string, { fp: string; inj: string }> = {};

  for (let m = 1; m <= 12; m++) {
    const daysInMonth = new Date(year, m, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${m < 10 ? '0' + m : m}-${day < 10 ? '0' + day : day}`;
      const d = new Date(year, m - 1, day);
      const dayOfWeek = d.getDay(); // 0 is Sun

      if (dayOfWeek === 0) {
        plans[dateStr] = { fp: '', inj: '' };
      } else {
        let fp = 'NPL 0.6L';
        let inj = '';

        const cycleDay = (day % 12);
        if (cycleDay >= 1 && cycleDay <= 3) {
          fp = 'NPL 0.6L';
          inj = '';
        } else if (cycleDay >= 4 && cycleDay <= 6) {
          fp = 'NPL 0.33L';
          inj = '24.4';
        } else if (cycleDay >= 7 && cycleDay <= 9) {
          fp = 'NPL 1.5L';
          inj = '24.4';
        } else {
          fp = 'NPL 0.6L';
          inj = '11.47';
        }

        plans[dateStr] = { fp, inj };
      }
    }
  }

  return plans;
}

export const INITIAL_PRODUCTION_PLANS = generateSeedProductionPlans(2026);
