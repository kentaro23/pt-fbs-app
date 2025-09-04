import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/athletes/${athlete.id}/compare`}>比較</Link>
          </Button>
          <Button asChild>
            <Link href={`/assessments/new?athleteId=${athlete.id}`}>新規Assessment</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base">基本情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2 items-center text-sm">
            <div className="text-muted-foreground">チーム</div>
            <div className="font-medium">{athlete.team ?? '-'}</div>
            <div className="h-4 w-px bg-border mx-2" />
            <div className="text-muted-foreground">投球側</div>
            <Badge variant="outline">{athlete.throwingSide}</Badge>
            <div className="text-muted-foreground">打席</div>
            <Badge variant="outline">{athlete.batting}</Badge>
          </div>

          <form action={updateAthleteAction} className="flex flex-wrap gap-3 items-end">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base">目標可動域</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base">Assessments</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/70">
                <TableHead className="text-left">日付</TableHead>
                <TableHead className="text-center">LBI</TableHead>
                <TableHead className="text-center">スイング</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assessments.map(a => (
                <TableRow key={a.id} className="hover:bg-accent/40">
                  <TableCell>{new Date(a.date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-center">{a.leanBodyIndex.toFixed(2)}</TableCell>
                  <TableCell className="text-center">{a.swingSpeed ?? '-'}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/assessments/${a.id}/fbs`} className="text-primary hover:underline">FBSを見る</Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}


