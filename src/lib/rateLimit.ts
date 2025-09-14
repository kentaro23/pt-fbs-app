type Key = string;
type Bucket = { count: number; resetAt: number };

const WINDOW_MS = 10 * 60 * 1000; // 10分
const LIMIT = 5;

const store = new Map<Key, Bucket>();

export type RateLimitCheck = { ok: true } | { ok: false; retryAfterSec: number };

export function rateLimitCheck(ip: string | null | undefined, kind: 'login'|'register'|'reset'|'send-mail'): RateLimitCheck {
  const now = Date.now();
  const key = `${ip ?? 'unknown'}:${kind}`;
  const cur = store.get(key);
  if (!cur || now > cur.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true };
  }
  if (cur.count < LIMIT) {
    cur.count += 1;
    return { ok: true };
  }
  const retryAfterSec = Math.max(1, Math.ceil((cur.resetAt - now) / 1000));
  return { ok: false, retryAfterSec };
}

export function getClientIp(reqHeaders: Headers | Record<string, string | string[] | undefined>): string | null {
  const get = (k: string): string | null => {
    if (reqHeaders instanceof Headers) return reqHeaders.get(k) ?? null;
    const v = (reqHeaders as Record<string, string | string[] | undefined>)[k];
    if (!v) return null;
    return Array.isArray(v) ? (v[0] ?? null) : v;
  };
  return (
    get('x-forwarded-for') ||
    get('x-real-ip') ||
    get('cf-connecting-ip') ||
    get('x-client-ip') ||
    get('remote-addr') ||
    null
  );
}


