'use client';

export default function BillingError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold">読み込みに失敗しました</h2>
      <p className="opacity-70 text-sm">一時的な問題の可能性があります。再読み込みをお試しください。</p>
      <button className="rounded-md border px-3 py-2 mt-3" onClick={() => reset()}>再読み込み</button>
    </div>
  );
}


