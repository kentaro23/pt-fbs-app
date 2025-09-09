'use server';

import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getStripeSafe, ensureStripeCustomer, resolvePriceId } from '@/lib/stripe-helpers';
import type { $Enums } from '@prisma/client';

function appUrl(path: string = '') {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? '';
  return base ? `${base}${path}` : path || '/';
}

type PlanKey = 'SOLO' | 'CLINIC' | 'TEAM';

const PLAN_PRICE_ENV: Record<PlanKey, string | undefined> = {
  SOLO: process.env.PRICE_SOLO_MONTHLY,
  CLINIC: process.env.PRICE_CLINIC_MONTHLY,
  TEAM: process.env.PRICE_TEAM_MONTHLY,
};

export async function createCheckoutSessionAction(plan: PlanKey) {
  try {
    const user = await requireUser();
    const stripe = getStripeSafe();
    if (!stripe) return { ok: false as const, reason: 'stripe-not-configured' };

    const priceEnv = PLAN_PRICE_ENV[plan];
    const priceId = await resolvePriceId(priceEnv);
    if (!priceId) return { ok: false as const, reason: 'price-missing' };

    const current = await prisma.subscription.findFirst({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } });
    const customerId = await ensureStripeCustomer(
      user,
      (current as { stripeCustomerId?: string | null } | null)?.stripeCustomerId ?? null
    );
    if (!customerId) return { ok: false as const, reason: 'customer-failed' };

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: appUrl('/billing?ok=1'),
      cancel_url: appUrl('/billing?canceled=1'),
      metadata: { appUserId: user.id, plan },
    });

    if (!current) {
      await prisma.subscription.create({ data: { userId: user.id, plan: 'FREE', status: 'inactive' as $Enums.SubscriptionStatus, stripeCustomerId: customerId } });
    } else if (!(current as { stripeCustomerId?: string | null }).stripeCustomerId) {
      await prisma.subscription.update({ where: { id: current.id }, data: { stripeCustomerId: customerId } });
    }

    return { ok: true as const, url: session.url };
  } catch (e) {
    console.error('[billing/createCheckout]', e);
    return { ok: false as const, reason: 'exception' };
  }
}

export async function cancelAtPeriodEndAction() {
  try {
    const user = await requireUser();
    const stripe = getStripeSafe();
    if (!stripe) return { ok: false as const, reason: 'stripe-not-configured' };
    const sub = await prisma.subscription.findFirst({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } });
    const subId = (sub as { subscriptionId?: string | null } | null)?.subscriptionId ?? null;
    if (!subId) return { ok: false as const, reason: 'no-active-subscription' };

    await stripe.subscriptions.update(subId, { cancel_at_period_end: true });
    await prisma.subscription.update({ where: { id: sub!.id }, data: { status: 'canceled' as $Enums.SubscriptionStatus } });
    return { ok: true as const };
  } catch (e) {
    console.error('[billing/cancel]', e);
    return { ok: false as const, reason: 'exception' };
  }
}

export async function resumeSubscriptionAction() {
  try {
    const user = await requireUser();
    const stripe = getStripeSafe();
    if (!stripe) return { ok: false as const, reason: 'stripe-not-configured' };
    const sub = await prisma.subscription.findFirst({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } });
    const subId = (sub as { subscriptionId?: string | null } | null)?.subscriptionId ?? null;
    if (!subId) return { ok: false as const, reason: 'no-active-subscription' };

    await stripe.subscriptions.update(subId, { cancel_at_period_end: false });
    await prisma.subscription.update({ where: { id: sub!.id }, data: { status: 'active' as $Enums.SubscriptionStatus } });
    return { ok: true as const };
  } catch (e) {
    console.error('[billing/resume]', e);
    return { ok: false as const, reason: 'exception' };
  }
}

export async function createPortalSessionAction() {
  try {
    const user = await requireUser();
    const stripe = getStripeSafe();
    if (!stripe) return { ok: false as const, reason: 'stripe-not-configured' };
    const sub = await prisma.subscription.findFirst({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } });
    const customerId = await ensureStripeCustomer(user, (sub as { customerId?: string | null } | null)?.customerId ?? null);
    if (!customerId) return { ok: false as const, reason: 'customer-failed' };

    const portal = await stripe.billingPortal.sessions.create({ customer: customerId, return_url: appUrl('/billing') });
    return { ok: true as const, url: portal.url };
  } catch (e) {
    console.error('[billing/portal]', e);
    return { ok: false as const, reason: 'exception' };
  }
}


