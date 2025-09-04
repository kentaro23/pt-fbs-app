export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';

export default function SessionsPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">セッション</h1>
      <p className="text-sm text-muted-foreground">予定/チェックイン/完了/リスケ理由などを管理（プレースホルダ）。</p>
    </main>
  );
}


