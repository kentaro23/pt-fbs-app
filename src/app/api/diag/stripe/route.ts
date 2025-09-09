import { NextResponse } from 'next/server';
import { STRIPE_ENABLED } from '@/lib/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const has = (k: string) => !!process.env[k];
  return NextResponse.json({
    ok: STRIPE_ENABLED,
    present: {
      STRIPE_SECRET_KEY: has('STRIPE_SECRET_KEY'),
      PRICE_SOLO_MONTHLY: has('PRICE_SOLO_MONTHLY'),
      PRICE_CLINIC_MONTHLY: has('PRICE_CLINIC_MONTHLY'),
      PRICE_TEAM_MONTHLY: has('PRICE_TEAM_MONTHLY'),
    },
  });
}


