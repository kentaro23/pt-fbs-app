import { NextResponse } from 'next/server';
import { getStripeSafe, resolvePriceId } from '@/lib/stripe-helpers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const stripe = getStripeSafe();
  const hasStripe = Boolean(stripe);
  let prices: Record<string, string | null> = {};
  try {
    prices = {
      SOLO: await resolvePriceId(process.env.PRICE_SOLO_MONTHLY),
      CLINIC: await resolvePriceId(process.env.PRICE_CLINIC_MONTHLY),
      TEAM: await resolvePriceId(process.env.PRICE_TEAM_MONTHLY),
    };
  } catch {}
  return NextResponse.json({
    stripeConfigured: hasStripe,
    priceEnv: {
      SOLO: process.env.PRICE_SOLO_MONTHLY ? '[set]' : null,
      CLINIC: process.env.PRICE_CLINIC_MONTHLY ? '[set]' : null,
      TEAM: process.env.PRICE_TEAM_MONTHLY ? '[set]' : null,
    },
    resolvedPriceIds: prices,
    appUrl: process.env.NEXT_PUBLIC_APP_URL ? '[set]' : null,
  });
}


