'use client';

import * as React from 'react';
import { useState } from 'react';

export default function ManagePortalButton({ disabled = false, reason }: { disabled?: boolean; reason?: string }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const onClick = async () => {
    if (disabled) return;
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data?.ok || !data?.url) {
        setMsg(
          data?.error ??
            'サブスク管理ポータルの作成に失敗しました。Stripe設定やログイン状態を確認してください。',
        );
      } else {
        window.location.href = data.url as string;
      }
    } catch {
      setMsg('ネットワークエラーが発生しました。時間をおいて再度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={onClick}
        disabled={disabled || loading}
        className="rounded-xl px-4 py-2 bg-black text-white disabled:opacity-60"
      >
        {loading ? '読み込み中…' : 'サブスク管理へ'}
      </button>
      {(reason && disabled) && <p className="text-sm text-amber-700">{reason}</p>}
      {msg && <p className="text-sm text-red-600">{msg}</p>}
    </div>
  );
}


