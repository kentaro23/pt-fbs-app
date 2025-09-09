'use client';

import { useTransition } from 'react';
import { createCheckoutSessionAction, cancelAtPeriodEndAction, resumeSubscriptionAction, createPortalSessionAction } from '../actions';

type Props = {
  plan: 'FREE' | 'SOLO' | 'CLINIC' | 'TEAM';
  status: string;
  limit: number;
  stripeConfigured: boolean;
  priceVars: { SOLO?: string; CLINIC?: string; TEAM?: string };
};

const tiers: Array<{ key: 'FREE'|'SOLO'|'CLINIC'|'TEAM'; name: string; desc: string; features: string[] }> = [
  { key: 'FREE', name: 'Free', desc: 'まずは無料でお試し', features: ['選手上限: 3', '基本機能'] },
  { key: 'SOLO', name: 'Solo', desc: '個人トレーナー向け', features: ['選手上限: 15（変更可）', '優先サポート(軽)'] },
  { key: 'CLINIC', name: 'Clinic', desc: '整骨院・治療院向け', features: ['選手上限: 100（変更可）', 'メールサポート'] },
  { key: 'TEAM', name: 'Team', desc: '部活・チーム向け', features: ['選手上限: 500（変更可）', 'チーム運用に最適'] },
];

export default function BillingClient({ plan, status, limit, stripeConfigured, priceVars }: Props) {
  const [pending, start] = useTransition();

  const onChoose = (k: 'SOLO'|'CLINIC'|'TEAM') => {
    start(async () => {
      const res = await createCheckoutSessionAction(k);
      if (!res.ok || !res.url) {
        alert(`購入画面を開けません: ${res.reason ?? 'unknown'}`);
        return;
      }
      window.location.href = res.url;
    });
  };
  const onCancel = () => start(async () => {
    const r = await cancelAtPeriodEndAction();
    if (!r.ok) alert(`解約に失敗: ${r.reason ?? 'unknown'}`);
    else window.location.reload();
  });
  const onResume = () => start(async () => {
    const r = await resumeSubscriptionAction();
    if (!r.ok) alert(`再開に失敗: ${r.reason ?? 'unknown'}`);
    else window.location.reload();
  });
  const onPortal = () => start(async () => {
    const r = await createPortalSessionAction();
    if (!r.ok || !r.url) {
      alert(`ポータルを開けません: ${r.reason ?? 'unknown'}`);
      return;
    }
    window.open(r.url, '_blank');
  });

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-semibold">サブスクリプション</h1>

      <div className="rounded-xl border p-4 bg-white shadow-sm grid gap-2 sm:grid-cols-3">
        <div><span className="text-gray-500">現在のプラン：</span><b>{plan}</b></div>
        <div><span className="text-gray-500">ステータス：</span><b>{status}</b></div>
        <div><span className="text-gray-500">選手上限：</span><b>{limit} 人</b></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tiers.map(t => {
          const isCurrent = t.key === plan;
          const disabledTier = (t.key !== 'FREE') && (!stripeConfigured || !priceVars[t.key as 'SOLO'|'CLINIC'|'TEAM']);
          return (
            <div key={t.key} className={`rounded-2xl border p-6 bg-white shadow-sm flex flex-col`}>
              <div className="text-xl font-semibold">{t.name}</div>
              <div className="text-gray-500 text-sm mt-1">{t.desc}</div>
              <ul className="mt-4 space-y-1 text-sm">
                {t.features.map(f => <li key={f}>• {f}</li>)}
              </ul>

              <div className="mt-auto pt-6">
                {t.key === 'FREE' ? (
                  isCurrent ? <button disabled className="w-full py-2 rounded-md bg-gray-200">利用中</button>
                            : <button className="w-full py-2 rounded-md bg-gray-800 text-white" onClick={() => window.location.href='/billing'}>
                                Freeで利用
                              </button>
                ) : (
                  <button
                    disabled={disabledTier || pending}
                    onClick={() => onChoose(t.key as 'SOLO'|'CLINIC'|'TEAM')}
                    className={`w-full py-2 rounded-md ${disabledTier ? 'bg-gray-300' : 'bg-black text-white hover:opacity-90'}`}
                  >
                    {isCurrent ? '現在のプラン' : pending ? '処理中…' : `${t.name}に変更`}
                  </button>
                )}
                {disabledTier && (
                  <p className="text-xs text-gray-500 mt-2">Stripeまたは価格IDが未設定のため、このプランは選択できません。</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border p-4 bg-white shadow-sm flex flex-col sm:flex-row gap-3">
        <button onClick={onPortal} disabled={!stripeConfigured || pending}
          className={`px-4 py-2 rounded-md ${stripeConfigured ? 'bg-black text-white' : 'bg-gray-300'}`}>
          サブスク管理（支払い方法・領収書）
        </button>
        {plan !== 'FREE' && (
          status === 'CANCELED'
            ? <button onClick={onResume} disabled={pending} className="px-4 py-2 rounded-md border">解約予約を取り消す</button>
            : <button onClick={onCancel} disabled={pending} className="px-4 py-2 rounded-md border">今期末で解約する</button>
        )}
      </div>
    </div>
  );
}


