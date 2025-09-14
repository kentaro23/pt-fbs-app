/*
  Sentry wrapper. Safe no-op when SENTRY_DSN or dependency is missing.
*/

let sentryLoaded = false;
let captureFn: ((e: unknown, ctx?: Record<string, unknown>) => void) | null = null;

function loadSentry() {
  if (sentryLoaded) return;
  sentryLoaded = true;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Sentry = require('@sentry/nextjs');
    if (process.env.SENTRY_DSN) {
      // Initialize only once; if user also initializes elsewhere, this is idempotent enough
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
      return;
    }
  } catch {}
  captureFn = null;
}

export function captureExceptionSafe(e: unknown, ctx?: Record<string, unknown>) {
  if (!captureFn) loadSentry();
  try {
    captureFn?.(e, ctx);
  } catch {}
}


