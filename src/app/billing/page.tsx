import { requireUser } from '@/lib/auth';
import { getCurrentSubscription, limitByPlan } from '@/lib/subscription';
import BillingClient from './ui/BillingClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';

export default async function BillingPage() {
  const user = await requireUser();
  let sub = null as Awaited<ReturnType<typeof getCurrentSubscription>>;
  try {
    sub = await getCurrentSubscription(user.id);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[billing] getCurrentSubscription failed', e);
    sub = null;
  }
  const plan = (sub?.plan as 'FREE'|'SOLO'|'CLINIC'|'TEAM'|undefined) ?? 'FREE';
  const status = sub?.status ?? 'INACTIVE';
  const limit = limitByPlan(plan);
  const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);
  const priceVars = {
    SOLO: process.env.PRICE_SOLO_MONTHLY,
    CLINIC: process.env.PRICE_CLINIC_MONTHLY,
    TEAM: process.env.PRICE_TEAM_MONTHLY,
  };

  return (
    <BillingClient
      plan={plan}
      status={status}
      limit={limit}
      stripeConfigured={stripeConfigured}
      priceVars={priceVars}
    />
  );
}


