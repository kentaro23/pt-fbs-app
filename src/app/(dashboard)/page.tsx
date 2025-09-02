import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const athletes = await prisma.athlete.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <main className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">選手一覧</h1>
        <Button asChild>
          <Link href="/athletes/new">新規作成</Link>
        </Button>
      </div>
      <div className="border rounded">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-3 py-2 text-left">氏名</th>
              <th className="px-3 py-2">チーム</th>
              <th className="px-3 py-2">ポジション</th>
              <th className="px-3 py-2">投球側</th>
              <th className="px-3 py-2">打席</th>
            </tr>
          </thead>
          <tbody>
            {athletes.map(a => (
              <tr key={a.id} className="hover:bg-slate-50">
                <td className="px-3 py-2 text-blue-600 underline"><Link href={`/athletes/${a.id}`}>{a.name}</Link></td>
                <td className="px-3 py-2 text-center">{a.team ?? "-"}</td>
                <td className="px-3 py-2 text-center">{a.position}</td>
                <td className="px-3 py-2 text-center">{a.throwingSide}</td>
                <td className="px-3 py-2 text-center">{a.batting}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
