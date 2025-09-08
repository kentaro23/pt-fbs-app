import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { stripe, hasStripe, appUrl, priceIdFor } from '@/lib/stripe';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const user = await requireUser();

  if (!hasStripe) {
    return NextResponse.json(
      { error: 'Stripeが未設定です。管理画面に Stripe鍵/PriceID/WEBHOOK を設定してください。' },
      { status: 501 }
    );
  }

  const { plan = 'SOLO' } = (await req.json().catch(() => ({}))) as { plan?: 'SOLO'|'CLINIC'|'TEAM' };
  const price = priceIdFor(plan);

  const customers = await stripe!.customers.list({ email: user.email ?? undefined, limit: 1 });
  const customer = customers.data[0] ?? await stripe!.customers.create({ email: user.email ?? undefined, metadata: { userId: user.id } });

  await prisma.subscription.upsert({
    where: { userId: user.id },
    update: { stripeCustomerId: customer.id },
    create: { userId: user.id, stripeCustomerId: customer.id },
  });

  const session = await stripe!.checkout.sessions.create({
    mode: 'subscription',
    customer: customer.id,
    line_items: [{ price, quantity: 1 }],
    allow_promotion_codes: true,
    client_reference_id: user.id,
    success_url: `${appUrl}/billing?success=1&plan=${plan}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/billing?canceled=1`,
  });

  return NextResponse.json({ url: session.url });
}


