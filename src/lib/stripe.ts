import Stripe from 'stripe';

export const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

export const hasStripe =
  !!process.env.STRIPE_SECRET_KEY &&
  !!process.env.PRICE_SOLO_MONTHLY &&
  !!process.env.PRICE_CLINIC_MONTHLY &&
  !!process.env.PRICE_TEAM_MONTHLY &&
  !!process.env.STRIPE_WEBHOOK_SECRET;

export const stripe = hasStripe
  ? new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' as unknown as Stripe.LatestApiVersion })
  : null;

export function priceIdFor(plan: 'SOLO'|'CLINIC'|'TEAM') {
  const id = {
    SOLO: process.env.PRICE_SOLO_MONTHLY,
    CLINIC: process.env.PRICE_CLINIC_MONTHLY,
    TEAM: process.env.PRICE_TEAM_MONTHLY,
  }[plan];
  if (!id) throw new Error(`Price ID not set for ${plan}`);
  return id!;
}

export const planByPriceId = () => ({
  [process.env.PRICE_SOLO_MONTHLY ?? '']: 'SOLO',
  [process.env.PRICE_CLINIC_MONTHLY ?? '']: 'CLINIC',
  [process.env.PRICE_TEAM_MONTHLY ?? '']: 'TEAM',
} as Record<string, 'SOLO'|'CLINIC'|'TEAM'>);


