import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { stripe, STRIPE_ENABLED, planByPriceId } from '@/lib/stripe';
import type Stripe from 'stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (!STRIPE_ENABLED) return NextResponse.json({ ok: true });

  const sig = (await headers()).get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET!;
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = (stripe as NonNullable<typeof stripe>).webhooks.constructEvent(body, sig as string, secret);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'invalid payload';
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const priceMap = planByPriceId();

  if (event.type === 'checkout.session.completed') {
    const s = event.data.object as Stripe.Checkout.Session;
    const userId = (s.client_reference_id ?? undefined) as string | undefined;
    const subId = (s.subscription ?? undefined) as string | undefined;
    if (userId && subId) {
      const sub = await (stripe as NonNullable<typeof stripe>).subscriptions.retrieve(subId);
      const priceId = sub.items.data[0]?.price?.id ?? '';
      const plan = priceMap[priceId];
      if (plan) {
        await prisma.subscription.upsert({
          where: { userId },
          update: { plan, status: 'active' },
          create: { userId, plan, status: 'active' },
        });
      }
    }
  }

  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.created') {
    const s = event.data.object as Stripe.Subscription;
    const customerId = s.customer as string;
    const status = s.status as 'active'|'trialing'|'past_due'|'canceled'|'inactive';
    const priceId = s.items?.data?.[0]?.price?.id ?? '';
    const plan = priceMap[priceId];

    const sub = await prisma.subscription.findFirst({ where: { stripeCustomerId: customerId } });
    if (sub) {
      await prisma.subscription.update({
        where: { userId: sub.userId },
        data: { status, ...(plan ? { plan } : {}) },
      });
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const s = event.data.object as Stripe.Subscription;
    const customerId = s.customer as string;
    const sub = await prisma.subscription.findFirst({ where: { stripeCustomerId: customerId } });
    if (sub) {
      await prisma.subscription.update({
        where: { userId: sub.userId },
        data: { status: 'canceled' },
      });
    }
  }

  return NextResponse.json({ received: true });
}


