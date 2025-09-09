import Stripe from 'stripe';
import { getEnv, isProd } from './env';

export const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

const key = getEnv('STRIPE_SECRET_KEY', { requiredInProd: true });
export const PRICE_SOLO = getEnv('PRICE_SOLO_MONTHLY', { requiredInProd: true });
export const PRICE_CLINIC = getEnv('PRICE_CLINIC_MONTHLY', { requiredInProd: true });
export const PRICE_TEAM = getEnv('PRICE_TEAM_MONTHLY', { requiredInProd: true });

export const STRIPE_ENABLED =
  !!key && !!PRICE_SOLO && !!PRICE_CLINIC && !!PRICE_TEAM;

export const stripe = STRIPE_ENABLED
  ? new Stripe(key, { apiVersion: '2024-06-20' as unknown as Stripe.LatestApiVersion })
  : null;

export function priceIdFor(plan: 'SOLO'|'CLINIC'|'TEAM') {
  const id = {
    SOLO: PRICE_SOLO,
    CLINIC: PRICE_CLINIC,
    TEAM: PRICE_TEAM,
  }[plan];
  if (!id) throw new Error(`Price ID not set for ${plan}`);
  return id!;
}

export const planByPriceId = () => ({
  [PRICE_SOLO ?? '']: 'SOLO',
  [PRICE_CLINIC ?? '']: 'CLINIC',
  [PRICE_TEAM ?? '']: 'TEAM',
} as Record<string, 'SOLO'|'CLINIC'|'TEAM'>);

export function requireStripe() {
  if (!stripe) {
    const where = isProd ? 'production' : 'non-production';
    throw Object.assign(new Error(`Stripe not configured in ${where}`), { status: 501 });
  }
  return stripe!;
}


