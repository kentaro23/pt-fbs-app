import { requireUser } from '@/lib/auth';
import { getSubscription } from '@/lib/subscription';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';

async function postCheckout(plan: 'SOLO'|'CLINIC'|'TEAM') {
  'use server';
  const res = await fetch('/api/stripe/checkout', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ plan }),
    cache: 'no-store',
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error ?? 'Checkoutの起動に失敗しました（Stripe未設定の可能性）。');
  }
  const { url } = await res.json();
  redirect(url);
}

export default async function BillingPage() {
  const user = await requireUser();
  const sub = await getSubscription(user.id);

  const plans = [
    { plan: 'SOLO', title: 'Solo', desc: '選手15名 / 1席' },
    { plan: 'CLINIC', title: 'Clinic', desc: '選手100名 / 1席' },
    { plan: 'TEAM', title: 'Team', desc: '選手500名 / 1席' },
  ] as const;

  return (
    <div className="container max-w-2xl mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">プランとお支払い</h1>
        <p className="text-sm text-muted-foreground mt-1">
          現在: <span className="font-medium">{sub.plan}</span>（{sub.status}）
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map(p => (
          <form key={p.plan} action={postCheckout.bind(null, p.plan as 'SOLO'|'CLINIC'|'TEAM')} className="rounded-xl border p-4 space-y-2">
            <div className="font-semibold">{p.title}</div>
            <div className="text-sm text-muted-foreground">{p.desc}</div>
            <button type="submit" className="w-full rounded-lg border px-3 py-2">選択</button>
          </form>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Stripe未設定の場合、購入ボタンはエラー案内になります。</p>
    </div>
  );
}


