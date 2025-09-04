export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';

export default function TemplatesPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">テンプレート</h1>
      <p className="text-sm text-muted-foreground">このページでは評価テンプレートを管理できます（今はプレースホルダ）。</p>
    </main>
  );
}


