'use client';

import { useTransition } from 'react';
import { createCheckoutSessionAction, cancelAtPeriodEndAction, resumeSubscriptionAction, createPortalSessionAction } from '../actions';

type Props = {
  plan: 'FREE' | 'SOLO' | 'CLINIC' | 'TEAM';
  status: string;
  limit: number;
  usage: { count: number; plan: string; limit: number; remaining: number };
  stripeConfigured: boolean;
  priceVars: { SOLO?: string; CLINIC?: string; TEAM?: string };
};

const tiers: Array<{ key: 'FREE'|'SOLO'|'CLINIC'|'TEAM'; name: string; desc: string; features: string[] }> = [
  { key: 'FREE', name: 'Free', desc: 'まずは無料でお試し', features: ['選手上限: 3', '基本機能'] },
  { key: 'SOLO', name: 'Solo', desc: '個人トレーナー向け', features: ['選手上限: 15（変更可）', '優先サポート(軽)'] },
  { key: 'CLINIC', name: 'Clinic', desc: '整骨院・治療院向け', features: ['選手上限: 100（変更可）', 'メールサポート'] },
  { key: 'TEAM', name: 'Team', desc: '部活・チーム向け', features: ['選手上限: 500（変更可）', 'チーム運用に最適'] },
];

export default function BillingClient({ plan, status, limit, usage, stripeConfigured, priceVars }: Props) {
  const [pending, start] = useTransition();

  const onChoose = (k: 'SOLO'|'CLINIC'|'TEAM') => {
    start(async () => {
      try {
        const res = await createCheckoutSessionAction(k);
        if (!res.ok || !res.url) {
          alert(`購入画面を開けません: ${res.reason ?? 'unknown'}`);
          return;
        }
        window.location.href = res.url;
      } catch (e) {
        console.error('[billing/ui choose]', e);
        alert('処理中にエラーが発生しました。時間をおいて再試行してください。');
      }
    });
  };
  const onCancel = () => start(async () => {
    try {
      const r = await cancelAtPeriodEndAction();
      if (!r.ok) alert(`解約に失敗: ${r.reason ?? 'unknown'}`);
      else window.location.reload();
    } catch (e) {
      console.error('[billing/ui cancel]', e);
      alert('処理中にエラーが発生しました。');
    }
  });
  const onResume = () => start(async () => {
    try {
      const r = await resumeSubscriptionAction();
      if (!r.ok) alert(`再開に失敗: ${r.reason ?? 'unknown'}`);
      else window.location.reload();
    } catch (e) {
      console.error('[billing/ui resume]', e);
      alert('処理中にエラーが発生しました。');
    }
  });
  const onPortal = () => start(async () => {
    try {
      const r = await createPortalSessionAction();
      if (!r.ok || !r.url) {
        alert(`ポータルを開けません: ${r.reason ?? 'unknown'}`);
        return;
      }
      window.open(r.url, '_blank');
    } catch (e) {
      console.error('[billing/ui portal]', e);
      alert('ポータルの起動に失敗しました。');
    }
  });

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-semibold">サブスクリプション</h1>

      <div className="rounded-xl border p-4 bg-white shadow-sm grid gap-2 sm:grid-cols-4">
        <div><span className="text-gray-500">現在のプラン：</span><b>{plan}</b></div>
        <div><span className="text-gray-500">ステータス：</span><b>{status}</b></div>
        <div><span className="text-gray-500">選手上限：</span><b>{limit} 人</b></div>
        <div><span className="text-gray-500">現在の使用数：</span><b className={usage.count >= limit * 0.8 ? 'text-red-600' : usage.count >= limit * 0.6 ? 'text-yellow-600' : 'text-green-600'}>{usage.count} / {limit} 人</b></div>
      </div>

      {/* 使用状況のプログレスバー */}
      <div className="rounded-xl border p-4 bg-white shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">選手使用状況</h3>
          <span className="text-sm text-gray-500">{usage.count} / {limit} 人</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-300 ${
              usage.count >= limit * 0.8 ? 'bg-red-500' : 
              usage.count >= limit * 0.6 ? 'bg-yellow-500' : 
              'bg-green-500'
            }`}
            style={{ width: `${Math.min(100, (usage.count / limit) * 100)}%` }}
          />
        </div>
        <div className="mt-2 text-sm text-gray-600">
          {usage.remaining > 0 ? (
            <span>あと <strong>{usage.remaining} 人</strong> 登録可能</span>
          ) : (
            <span className="text-red-600 font-semibold">上限に達しています</span>
          )}
        </div>
      </div>

      {/* リコメンド */}
      {usage.count >= limit * 0.8 && plan !== 'TEAM' && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-orange-800">上限に近づいています</h3>
              <div className="mt-2 text-sm text-orange-700">
                <p>現在 {usage.count}/{limit} 人を使用中です。より多くの選手を管理するには上位プランへの変更をお勧めします。</p>
                <div className="mt-3">
                  {plan === 'FREE' && (
                    <p className="font-medium">推奨: <span className="text-blue-600">Solo プラン</span> (15人まで)</p>
                  )}
                  {plan === 'SOLO' && (
                    <p className="font-medium">推奨: <span className="text-blue-600">Clinic プラン</span> (100人まで)</p>
                  )}
                  {plan === 'CLINIC' && (
                    <p className="font-medium">推奨: <span className="text-blue-600">Team プラン</span> (500人まで)</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
      <div className="text-sm text-gray-500 mt-6">
        <span className="mr-2">法務情報:</span>
        <a className="underline mr-3" href="/legal/privacy">プライバシー</a>
        <a className="underline mr-3" href="/legal/terms">利用規約</a>
        <a className="underline mr-3" href="/legal/refunds">返金・解約</a>
        <a className="underline" href="/legal/tokushoho">特商法表記</a>
      </div>
    </div>
  );
}


