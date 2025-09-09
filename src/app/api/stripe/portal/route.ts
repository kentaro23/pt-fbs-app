import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { requireStripe } from '@/lib/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type SubSlim = { stripeCustomerId?: string | null } & { customerId?: string | null };

export async function POST() {
  try {
    const user = await requireUser();

    const sub = (await prisma.subscription.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: { id: true, stripeCustomerId: true },
    })) as (SubSlim & { id?: string }) | null;

    const customerId: string | null = sub?.stripeCustomerId ?? (sub as SubSlim | null)?.customerId ?? null;

    if (!customerId) {
      // customerId が無い場合は 404 を返す（作成はCheckoutフローで行う想定）
      return NextResponse.json({ ok: false, reason: 'no_customer' }, { status: 404 });
    }

    const stripe = requireStripe();
    const returnUrl = process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/billing`
      : '/billing';

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return NextResponse.redirect(session.url, { status: 303 });
  } catch (e) {
    const status = (e as { status?: number })?.status ?? 500;
    const msg = e instanceof Error ? e.message : 'error';
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}


