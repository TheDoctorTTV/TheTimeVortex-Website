import { parseCookies, readSession, setCookie } from '../../_utils.js';

export interface Env {
  DB: D1Database;
  SESSION_SECRET: string;
}

const INITIAL_ADMIN_ID = '624961413500108830';
const INITIAL_ADMIN_USERNAME = 'TheDoctorTTV';

const ipLimits = new Map<string, { count: number; reset: number }>();
const sessionLimits = new Map<string, { count: number; reset: number }>();

function checkLimit(key: string, map: Map<string, { count: number; reset: number }>, limit = 20, windowMs = 60000) {
  const now = Date.now();
  const entry = map.get(key);
  if (entry && now < entry.reset) {
    if (entry.count >= limit) return false;
    entry.count++;
    return true;
  }
  map.set(key, { count: 1, reset: now + windowMs });
  return true;
}

export function rateLimit(request: Request, sessionId: string | null): boolean {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (!checkLimit(ip, ipLimits)) return false;
  if (sessionId && !checkLimit(sessionId, sessionLimits)) return false;
  return true;
}

export async function currentUserId(request: Request, env: Env): Promise<string | null> {
  const session = await readSession(request, env.SESSION_SECRET);
  return session?.id ?? null;
}

export async function requireAdmin(request: Request, env: Env): Promise<string | null> {
  const uid = await currentUserId(request, env);
  if (!uid) return null;
  const row = await env.DB.prepare('SELECT 1 FROM admin WHERE user_id=?').bind(uid).first();
  return row ? uid : null;
}

export async function ensureSeed(env: Env) {
  await env.DB.batch([
    env.DB.prepare('INSERT OR IGNORE INTO users (id, username) VALUES (?, ?)').bind(INITIAL_ADMIN_ID, INITIAL_ADMIN_USERNAME),
    env.DB.prepare('INSERT OR IGNORE INTO admin (user_id, added_by) VALUES (?, ?)').bind(INITIAL_ADMIN_ID, INITIAL_ADMIN_ID)
  ]);
}

export function csrfCookie(token: string) {
  return setCookie('csrf_token', token, { httpOnly: true, secure: true, sameSite: 'Strict', path: '/' });
}

export function verifyCsrf(request: Request): boolean {
  const cookies = parseCookies(request);
  const header = request.headers.get('X-CSRF-Token');
  return !!cookies['csrf_token'] && cookies['csrf_token'] === header;
}

export interface JsonOk { ok: true; [key: string]: unknown }
export interface JsonError { ok: false; error: string }
