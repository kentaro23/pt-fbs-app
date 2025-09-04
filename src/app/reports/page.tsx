export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';

export default function ReportsPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">レポート</h1>
      <p className="text-sm text-muted-foreground">期間/部位別の改善指標などの基本レポート（プレースホルダ）。</p>
    </main>
  );
}


