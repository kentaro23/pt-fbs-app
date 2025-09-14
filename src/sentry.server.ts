export {};
try {
  if (process.env.SENTRY_DSN) {
    import('@sentry/nextjs').then((Sentry) => {
      try {
        Sentry.init({ dsn: process.env.SENTRY_DSN!, tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || '0') });
      } catch {}
    }).catch(() => {});
  }
} catch {}
