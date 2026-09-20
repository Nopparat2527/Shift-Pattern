import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

import {
  SHIFT_TYPES,
  INITIAL_DEPARTMENTS,
  INITIAL_USERS,
  INITIAL_EMPLOYEES,
  INITIAL_HOLIDAYS,
  INITIAL_YEARLY_CONFIGS,
  INITIAL_SWAP_REQUESTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_PRODUCTION_PLANS,
  INITIAL_FP_PLAN_OPTIONS,
  INITIAL_INJ_PLAN_OPTIONS,
  generateSeedShifts,
} from './src/mockData';

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'app_state.json');

// Interface for shared application state
interface SharedAppState {
  shifts: any[];
  productionPlans: Record<string, { fp: string; inj: string }>;
  departments: any[];
  employees: any[];
  users: any[];
  holidays: any[];
  yearlyConfigs: any[];
  shiftTypes: any[];
  fpPlanOptions: any[];
  injPlanOptions: any[];
  swapRequests: any[];
  auditLogs: any[];
  passwords: Record<string, string>;
  lastUpdated: number;
}

// In-memory cache backed by file persistence
let sharedState: SharedAppState;

function loadInitialState(): SharedAppState {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.shifts) && parsed.shifts.length > 0) {
        console.log(`[Server] Loaded existing shared database with ${parsed.shifts.length} shifts.`);
        return parsed;
      }
    } catch (err) {
      console.error('[Server] Error reading existing DB file, generating fresh seed data:', err);
    }
  }

  console.log('[Server] Generating fresh shared seed database...');
  const defaultState: SharedAppState = {
    shifts: generateSeedShifts(),
    productionPlans: INITIAL_PRODUCTION_PLANS,
    departments: INITIAL_DEPARTMENTS,
    employees: INITIAL_EMPLOYEES,
    users: INITIAL_USERS,
    holidays: INITIAL_HOLIDAYS,
    yearlyConfigs: INITIAL_YEARLY_CONFIGS,
    shiftTypes: SHIFT_TYPES,
    fpPlanOptions: INITIAL_FP_PLAN_OPTIONS,
    injPlanOptions: INITIAL_INJ_PLAN_OPTIONS,
    swapRequests: INITIAL_SWAP_REQUESTS,
    auditLogs: INITIAL_AUDIT_LOGS,
    passwords: {},
    lastUpdated: Date.now(),
  };

  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultState, null, 2), 'utf-8');
  } catch (e) {
    console.error('[Server] Failed to write initial state to disk:', e);
  }

  return defaultState;
}

// Save state to disk
function persistState() {
  sharedState.lastUpdated = Date.now();
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(sharedState, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Server] Failed to persist state to disk:', err);
  }
}

async function startServer() {
  // Initialize data
  sharedState = loadInitialState();

  const app = express();
  app.use(express.json({ limit: '50mb' }));

  // --- API Endpoints ---
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', uptime: process.uptime(), lastUpdated: sharedState.lastUpdated });
  });

  // 1. Get complete shared application state
  app.get('/api/data', (req: Request, res: Response) => {
    res.json(sharedState);
  });

  // 2. Batch update shifts
  app.post('/api/shifts/batch', (req: Request, res: Response) => {
    const { updates, actor } = req.body;
    if (!Array.isArray(updates)) {
      return res.status(400).json({ error: 'updates array is required' });
    }

    // Merge updates into sharedState.shifts
    const shiftMap = new Map<string, any>();
    sharedState.shifts.forEach((s) => {
      shiftMap.set(`${s.employeeId}_${s.date}`, s);
    });

    updates.forEach((u: { employeeId: string; date: string; shiftCode: string }) => {
      const key = `${u.employeeId}_${u.date}`;
      const existing = shiftMap.get(key);
      if (existing) {
        existing.shiftCode = u.shiftCode;
        existing.updatedAt = new Date().toISOString();
        if (actor) existing.updatedBy = actor.name || actor.id;
      } else {
        shiftMap.set(key, {
          id: `shift-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          employeeId: u.employeeId,
          date: u.date,
          shiftCode: u.shiftCode,
          updatedAt: new Date().toISOString(),
          updatedBy: actor ? actor.name || actor.id : 'Supervisor',
        });
      }
    });

    sharedState.shifts = Array.from(shiftMap.values());
    persistState();

    res.json({ success: true, count: updates.length, lastUpdated: sharedState.lastUpdated });
  });

  // 3. Single shift update
  app.post('/api/shifts/single', (req: Request, res: Response) => {
    const { employeeId, date, shiftCode, actor } = req.body;
    if (!employeeId || !date || !shiftCode) {
      return res.status(400).json({ error: 'employeeId, date, shiftCode required' });
    }

    const idx = sharedState.shifts.findIndex((s) => s.employeeId === employeeId && s.date === date);
    if (idx >= 0) {
      sharedState.shifts[idx].shiftCode = shiftCode;
      sharedState.shifts[idx].updatedAt = new Date().toISOString();
      if (actor) sharedState.shifts[idx].updatedBy = actor.name || actor.id;
    } else {
      sharedState.shifts.push({
        id: `shift-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        employeeId,
        date,
        shiftCode,
        updatedAt: new Date().toISOString(),
        updatedBy: actor ? actor.name || actor.id : 'User',
      });
    }

    persistState();
    res.json({ success: true, lastUpdated: sharedState.lastUpdated });
  });

  // 4. Batch update production plans
  app.post('/api/production-plans/batch', (req: Request, res: Response) => {
    const { updates } = req.body;
    if (!Array.isArray(updates)) {
      return res.status(400).json({ error: 'updates array is required' });
    }

    if (!sharedState.productionPlans) {
      sharedState.productionPlans = {};
    }

    updates.forEach((u: { date: string; fp: string; inj: string }) => {
      sharedState.productionPlans[u.date] = {
        fp: u.fp !== undefined ? u.fp : (sharedState.productionPlans[u.date]?.fp || ''),
        inj: u.inj !== undefined ? u.inj : (sharedState.productionPlans[u.date]?.inj || ''),
      };
    });

    persistState();
    res.json({ success: true, count: updates.length, lastUpdated: sharedState.lastUpdated });
  });

  // 5. Single production plan update
  app.post('/api/production-plans/single', (req: Request, res: Response) => {
    const { date, field, value } = req.body;
    if (!date || !field) {
      return res.status(400).json({ error: 'date and field required' });
    }

    if (!sharedState.productionPlans) {
      sharedState.productionPlans = {};
    }

    const existing = sharedState.productionPlans[date] || { fp: '', inj: '' };
    if (field === 'fp') existing.fp = value || '';
    if (field === 'inj') existing.inj = value || '';
    sharedState.productionPlans[date] = existing;

    persistState();
    res.json({ success: true, lastUpdated: sharedState.lastUpdated });
  });

  // 6. Generic entity sync (Departments, Employees, Users, ShiftTypes, etc.)
  app.post('/api/sync-all', (req: Request, res: Response) => {
    const data = req.body;
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Valid state object required' });
    }

    if (Array.isArray(data.shifts)) sharedState.shifts = data.shifts;
    if (data.productionPlans) sharedState.productionPlans = data.productionPlans;
    if (Array.isArray(data.departments)) sharedState.departments = data.departments;
    if (Array.isArray(data.employees)) sharedState.employees = data.employees;
    if (Array.isArray(data.users)) sharedState.users = data.users;
    if (Array.isArray(data.holidays)) sharedState.holidays = data.holidays;
    if (Array.isArray(data.yearlyConfigs)) sharedState.yearlyConfigs = data.yearlyConfigs;
    if (Array.isArray(data.shiftTypes)) sharedState.shiftTypes = data.shiftTypes;
    if (Array.isArray(data.fpPlanOptions)) sharedState.fpPlanOptions = data.fpPlanOptions;
    if (Array.isArray(data.injPlanOptions)) sharedState.injPlanOptions = data.injPlanOptions;
    if (Array.isArray(data.swapRequests)) sharedState.swapRequests = data.swapRequests;
    if (Array.isArray(data.auditLogs)) sharedState.auditLogs = data.auditLogs;
    if (data.passwords) sharedState.passwords = { ...sharedState.passwords, ...data.passwords };

    persistState();
    res.json({ success: true, lastUpdated: sharedState.lastUpdated });
  });

  // 7. Reset to default data
  app.post('/api/reset-data', (req: Request, res: Response) => {
    sharedState = {
      shifts: generateSeedShifts(),
      productionPlans: INITIAL_PRODUCTION_PLANS,
      departments: INITIAL_DEPARTMENTS,
      employees: INITIAL_EMPLOYEES,
      users: INITIAL_USERS,
      holidays: INITIAL_HOLIDAYS,
      yearlyConfigs: INITIAL_YEARLY_CONFIGS,
      shiftTypes: SHIFT_TYPES,
      fpPlanOptions: INITIAL_FP_PLAN_OPTIONS,
      injPlanOptions: INITIAL_INJ_PLAN_OPTIONS,
      swapRequests: INITIAL_SWAP_REQUESTS,
      auditLogs: INITIAL_AUDIT_LOGS,
      passwords: {},
      lastUpdated: Date.now(),
    };
    persistState();
    res.json({ success: true, message: 'Reset to default data complete', lastUpdated: sharedState.lastUpdated });
  });

  // --- Vite Middleware & Production Serving ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Shift Management System running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Failed to start server:', err);
  process.exit(1);
});
