import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';

export default async function AdminAthletesPage() {
  await requireAdmin();
  const athletes = await prisma.athlete.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { email: true } } },
  });
  return (
    <main className="p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>全ユーザーの選手一覧（管理者専用）</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-2 py-1 text-left">氏名</th>
                  <th className="px-2 py-1 text-left">チーム</th>
                  <th className="px-2 py-1 text-left">所有者</th>
                  <th className="px-2 py-1 text-left">詳細</th>
                </tr>
              </thead>
              <tbody>
                {athletes.map(a => (
                  <tr key={a.id} className="border-b">
                    <td className="px-2 py-1">{a.name}</td>
                    <td className="px-2 py-1">{a.team ?? '-'}</td>
                    <td className="px-2 py-1">{a.user?.email ?? '-'}</td>
                    <td className="px-2 py-1"><Link href={`/athletes/${a.id}`} className="text-primary hover:underline">開く</Link></td>
                  </tr>
                ))}
                {athletes.length === 0 && (
                  <tr><td className="px-2 py-6 text-center text-muted-foreground" colSpan={4}>データがありません</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}


