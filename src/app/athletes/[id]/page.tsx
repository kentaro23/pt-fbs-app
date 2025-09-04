import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MOVEMENT_LABEL_JP } from "@/lib/constants";
import type { Movement } from "@/lib/types";

async function updateAthleteAction(formData: FormData) {
  "use server";
  const id = formData.get("id")?.toString() || "";
  const name = formData.get("name")?.toString() || "";
  const team = formData.get("team")?.toString() || null;
  if (!id || !name) return;
  await prisma.athlete.update({ where: { id }, data: { name, team } });
}

async function updateTargetsAction(formData: FormData) {
  "use server";
  const athleteId = formData.get("athleteId")?.toString() || "";
  if (!athleteId) return;
  const entries: Array<[Movement, number]> = [];
  Object.keys(MOVEMENT_LABEL_JP).forEach((k) => {
    const key = `t_${k}`;
    const v = formData.get(key)?.toString();
    if (v && v.length) {
      const num = Number(v);
      if (isFinite(num)) entries.push([k as Movement, num]);
    }
  });
  // upsert
  for (const [movement, targetDeg] of entries) {
    await prisma.romTarget.upsert({
      where: { athleteId_movement: { athleteId, movement } },
      update: { targetDeg },
      create: { athleteId, movement, targetDeg },
    });
  }
}

export default async function AthleteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const athlete = await prisma.athlete.findUnique({ where: { id } });
  if (!athlete) return <div className="p-6">Not found</div>;
  const assessments = await prisma.assessment.findMany({ where: { athleteId: athlete.id }, orderBy: { date: "desc" } });
  const targets = await prisma.romTarget.findMany({ where: { athleteId: athlete.id } });
  const tMap = Object.fromEntries(targets.map(t => [t.movement, t.targetDeg])) as Partial<Record<Movement, number>>;

  return (
    <main className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{athlete.name}</h1>
        <Button asChild>
          <Link href={`/assessments/new?athleteId=${athlete.id}`}>新規Assessment</Link>
        </Button>
      </div>

      <section className="space-y-2">
        <h2 className="font-semibold">基本情報の編集</h2>
        <form action={updateAthleteAction} className="flex flex-wrap gap-2 items-end">
          <input type="hidden" name="id" value={athlete.id} />
          <div>
            <label className="block text-sm text-muted-foreground">氏名</label>
            <Input name="name" defaultValue={athlete.name} className="w-64" />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground">チーム</label>
            <Input name="team" defaultValue={athlete.team ?? ""} className="w-64" />
          </div>
          <Button type="submit">保存</Button>
        </form>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">目標可動域の編集</h2>
        <form action={updateTargetsAction} className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <input type="hidden" name="athleteId" value={athlete.id} />
          {(Object.keys(MOVEMENT_LABEL_JP) as Movement[]).map((m) => (
            <div key={m} className="space-y-1">
              <div className="text-sm text-muted-foreground">{MOVEMENT_LABEL_JP[m]}</div>
              <Input name={`t_${m}`} type="number" step="1" defaultValue={tMap[m] ?? ""} />
            </div>
          ))}
          <div className="col-span-full">
            <Button type="submit">目標を保存</Button>
          </div>
        </form>
      </section>

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


