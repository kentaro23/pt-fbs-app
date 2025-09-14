export {}; // placeholder to avoid empty module
try {
  if (process.env.SENTRY_DSN) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Sentry = require('@sentry/nextjs');
    Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || '0') });
  }
} catch {}
