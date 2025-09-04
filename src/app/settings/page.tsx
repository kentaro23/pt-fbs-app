export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';

export default function SettingsPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">設定</h1>
      <p className="text-sm text-muted-foreground">クリニック情報や権限の管理（プレースホルダ）。</p>
    </main>
  );
}


