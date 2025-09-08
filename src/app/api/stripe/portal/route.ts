import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type SubSlim = { stripeCustomerId?: string | null } & { customerId?: string | null };

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  if (!secret) {
    return NextResponse.json(
      { ok: false, error: 'Stripe is not configured (STRIPE_SECRET_KEY missing).' },
      { status: 501 },
    );
  }

  const user = await requireUser().catch(() => null);
  if (!user) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const stripe = new Stripe(secret, { apiVersion: '2024-06-20' as Stripe.LatestApiVersion });

  let customerId: string | null | undefined = null;
  try {
    const sub = (await prisma.subscription.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: { stripeCustomerId: true },
    })) as SubSlim | null;
    customerId = sub?.stripeCustomerId ?? (sub as SubSlim | null)?.customerId ?? null;
  } catch {
    // DB未作成/列不一致でも継続（後段でStripe検索/作成）
  }

  if (!customerId) {
    const list = await stripe.customers.list({
      email: typeof (user as { email?: string | null }).email === 'string' ? user.email : undefined,
      limit: 1,
    });
    if (list.data[0]) {
      customerId = list.data[0].id;
    } else {
      const created = await stripe.customers.create({
        email: typeof (user as { email?: string | null }).email === 'string' ? user.email : undefined,
        metadata: { userId: user.id },
      });
      customerId = created.id;
    }

    try {
      const existing = await prisma.subscription.findFirst({ where: { userId: user.id }, select: { id: true } });
      if (existing?.id) {
        await prisma.subscription.update({ where: { id: existing.id }, data: { stripeCustomerId: customerId } });
      }
    } catch {
      // 無視：保存失敗でもポータルは開ける
    }
  }

  if (!customerId) {
    return NextResponse.json(
      { ok: false, error: 'Stripe customer could not be determined.' },
      { status: 500 },
    );
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: new URL('/billing', origin).toString(),
  });

  return NextResponse.json({ ok: true, url: session.url });
}


