import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { stripe, hasStripe, planByPriceId } from '@/lib/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (!hasStripe) return NextResponse.json({ ok: true });

  const sig = (await headers()).get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET!;
  const body = await req.text();

  let event: any;
  try {
    event = stripe!.webhooks.constructEvent(body, sig!, secret);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }

  const priceMap = planByPriceId();

  if (event.type === 'checkout.session.completed') {
    const s = event.data.object as any;
    const userId = s.client_reference_id as string | undefined;
    const subId = s.subscription as string | undefined;
    if (userId && subId) {
      const sub = await stripe!.subscriptions.retrieve(subId);
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
    const s = event.data.object as any;
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
    const s = event.data.object as any;
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


