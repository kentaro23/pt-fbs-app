export {};
try {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN) {
    import('@sentry/nextjs').then((Sentry) => {
      const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;
      try { Sentry.init({ dsn: dsn!, tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || '0') }); } catch {}
    }).catch(() => {});
  }
} catch {}
