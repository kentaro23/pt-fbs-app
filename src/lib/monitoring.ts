/*
  Sentry wrapper. Safe no-op when SENTRY_DSN or dependency is missing.
*/

let initialized = false;
let captureFn: ((e: unknown, ctx?: Record<string, unknown>) => void) | null = null;
let initPromise: Promise<void> | null = null;

function initSentry(): Promise<void> {
  if (initialized) return Promise.resolve();
  if (initPromise) return initPromise;
  initPromise = (async () => {
    try {
      if (!process.env.SENTRY_DSN) return; // disabled
      const Sentry = await import('@sentry/nextjs');
      try {
        Sentry.init({
          dsn: process.env.SENTRY_DSN,
          tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || '0'),
          enabled: true,
        });
      } catch {}
      captureFn = (e: unknown, ctx?: Record<string, unknown>) => {
        try {
          if (ctx) Sentry.setContext('extra', ctx);
          Sentry.captureException(e);
        } catch {}
      };
      initialized = true;
    } catch {
      captureFn = null;
    }
  })();
  return initPromise;
}

export function captureExceptionSafe(e: unknown, ctx?: Record<string, unknown>) {
  // Fire-and-forget init, then attempt to capture
  initSentry().then(() => {
    try {
      captureFn?.(e, ctx);
    } catch {}
  });
}


