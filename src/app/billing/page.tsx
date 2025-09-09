import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import ManagePortalButton from './ManagePortalButton';
import { STRIPE_ENABLED } from '@/lib/stripe';
import { isProd } from '@/lib/env';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';

export default async function BillingPage() {
  const user = await requireUser();
  const sub = await prisma.subscription.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    select: { plan: true, status: true },
  });

  if (!STRIPE_ENABLED) {
    return (
      <div className="p-6 space-y-3">
        <h2 className="text-xl font-semibold">サブスク設定が未完了です</h2>
        <p>以下の環境変数を設定し、再デプロイしてください（本番は必須）:</p>
        <ul className="list-disc ml-6">
          <li>STRIPE_SECRET_KEY</li>
          <li>PRICE_SOLO_MONTHLY / PRICE_CLINIC_MONTHLY / PRICE_TEAM_MONTHLY</li>
        </ul>
        <p className="text-sm opacity-70">現在のモード: {isProd ? 'Production' : 'Preview/Dev'}</p>
        <div className="rounded-xl border p-4 mt-4">
          <ManagePortalButton disabled reason="Stripe未設定のため、管理ポータルは現在利用できません。" />
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">サブスクリプション</h1>
      <div className="rounded-2xl border p-4 space-y-2">
        <div>現在のプラン: <b>{sub?.plan ?? 'FREE'}</b></div>
        <div>ステータス: <b>{sub?.status ?? 'CANCELED'}</b></div>
      </div>

      <div className="rounded-2xl border p-4 space-y-3">
        <p className="text-sm text-muted-foreground">
          プランの変更・支払い情報の更新・請求履歴の確認は「サブスク管理へ」から行えます。
        </p>
        <ManagePortalButton />
        {!process.env.STRIPE_SECRET_KEY && (
          <p className="text-xs text-amber-600">
            管理者向けメモ: STRIPE_SECRET_KEY が未設定のため、ポータル作成は 501 を返します。
          </p>
        )}
      </div>
    </main>
  );
}


