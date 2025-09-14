export {};
try {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Sentry = require('@sentry/nextjs');
    const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;
    Sentry.init({ dsn, tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || '0') });
  }
} catch {}
