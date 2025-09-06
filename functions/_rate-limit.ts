interface Entry { count: number; reset: number; }

const WINDOW_MS = 60_000; // 1 minute
const LIMIT = 10; // max requests per window

const ipMap = new Map<string, Entry>();
const sessionMap = new Map<string, Entry>();

function touch(map: Map<string, Entry>, key: string, now: number): boolean {
  if (!key) return true;
  let entry = map.get(key);
  if (!entry || now > entry.reset) {
    entry = { count: 1, reset: now + WINDOW_MS };
    map.set(key, entry);
    return true;
  }
  if (entry.count >= LIMIT) return false;
  entry.count++;
  return true;
}

export function checkRateLimit(ip: string, session: string): boolean {
  const now = Date.now();
  return touch(ipMap, ip, now) && touch(sessionMap, session, now);
}
