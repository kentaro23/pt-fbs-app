import Stripe from 'stripe';

export type PriceEnv = string | undefined;

export function getStripeSafe(): Stripe | null {
  const sk = process.env.STRIPE_SECRET_KEY;
  if (!sk) return null;
  return new Stripe(sk, { apiVersion: '2024-06-20' as Stripe.LatestApiVersion });
}

/** PRICE_* が price_ または prod_ どちらでも Price ID を返す（未設定/未解決は null） */
export async function resolvePriceId(priceEnv: PriceEnv): Promise<string | null> {
  if (!priceEnv) return null;
  const stripe = getStripeSafe();
  if (!stripe) return null;

  if (priceEnv.startsWith('price_')) return priceEnv;
  if (priceEnv.startsWith('prod_')) {
    const prices = await stripe.prices.list({ product: priceEnv, active: true, limit: 100 });
    const monthly = prices.data.find(p => p.recurring?.interval === 'month') ?? prices.data[0];
    return monthly?.id ?? null;
  }
  try {
    const price = await stripe.prices.retrieve(priceEnv);
    return price?.id ?? null;
  } catch {
    return null;
  }
}

/** Stripe Customer を用意（なければ作成）して customerId を返す */
export async function ensureStripeCustomer(user: { id: string; email?: string | null }, currentCustomerId?: string | null): Promise<string | null> {
  const stripe = getStripeSafe();
  if (!stripe) return null;
  if (currentCustomerId) return currentCustomerId;
  const customer = await stripe.customers.create({
    email: user.email ?? undefined,
    metadata: { appUserId: user.id },
  });
  return customer.id;
}


