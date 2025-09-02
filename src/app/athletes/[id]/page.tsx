import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";

export default async function AthleteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const athlete = await prisma.athlete.findUnique({ where: { id } });
  if (!athlete) return <div className="p-6">Not found</div>;
  const assessments = await prisma.assessment.findMany({ where: { athleteId: athlete.id }, orderBy: { date: "desc" } });
  return (
    <main className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{athlete.name}</h1>
        <Button asChild>
          <Link href={`/assessments/new?athleteId=${athlete.id}`}>新規Assessment</Link>
        </Button>
      </div>
      <div className="text-sm grid grid-cols-2 md:grid-cols-4 gap-2">
        <div>チーム: <span className="font-semibold">{athlete.team ?? "-"}</span></div>
        <div>ポジション: <span className="font-semibold">{athlete.position}</span></div>
        <div>投球側: <span className="font-semibold">{athlete.throwingSide}</span></div>
        <div>打席: <span className="font-semibold">{athlete.batting}</span></div>
      </div>

      <section>
        <h2 className="font-semibold mb-2">Assessments</h2>
        <div className="border rounded">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-3 py-2 text-left">日付</th>
                <th className="px-3 py-2">LBI</th>
                <th className="px-3 py-2">スイング</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {assessments.map(a => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="px-3 py-2">{new Date(a.date).toLocaleDateString()}</td>
                  <td className="px-3 py-2 text-center">{a.leanBodyIndex.toFixed(2)}</td>
                  <td className="px-3 py-2 text-center">{a.swingSpeed ?? "-"}</td>
                  <td className="px-3 py-2 text-right text-blue-600 underline"><Link href={`/assessments/${a.id}/fbs`}>FBSを見る</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}


