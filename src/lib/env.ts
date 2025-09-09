export const isProd =
  process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';

export function getEnv(name: string, opts?: { requiredInProd?: boolean }) {
  const v = process.env[name];
  if (!v && opts?.requiredInProd && isProd) {
    throw new Error(`[ENV] ${name} is required in production`);
  }
  return v ?? '';
}


