export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';

import { prisma } from "@/lib/db";
import { MOVEMENT_LABEL_JP } from "@/lib/constants";
import type { Movement } from "@/lib/types";
import Link from "next/link";

export default async function ComparePage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams?: Promise<Record<string,string|undefined>> }) {
  const { id } = await params;
  const sp = (await searchParams) ?? {};
  const aId = sp.a;
  const bId = sp.b;

  const athlete = await prisma.athlete.findUnique({ where: { id } });
  if (!athlete) return <main className="p-6">Not found</main>;

  const assessments = await prisma.assessment.findMany({ where: { athleteId: id }, orderBy: { date: "desc" } });
  const selA = assessments.find(x => x.id === aId) ?? assessments[0];
  const selB = assessments.find(x => x.id === bId) ?? assessments[1];

  const romA = selA ? await prisma.rom.findMany({ where: { assessmentId: selA.id } }) : [] as const;
  const romB = selB ? await prisma.rom.findMany({ where: { assessmentId: selB.id } }) : [] as const;

  type SideMap = { RIGHT?: number; LEFT?: number };
  type RomMap = Record<Movement, SideMap>;

  const mapRows = (rows: { movement: Movement; side: "RIGHT"|"LEFT"; valueDeg: number }[]): RomMap => {
    const acc: RomMap = {} as RomMap;
    rows.forEach(r => {
      const cur = acc[r.movement] ?? {};
      cur[r.side] = r.valueDeg;
      acc[r.movement] = cur;
    });
    return acc;
  };
  const aMap: RomMap = mapRows(romA as unknown as { movement: Movement; side: "RIGHT"|"LEFT"; valueDeg: number }[]);
  const bMap: RomMap = mapRows(romB as unknown as { movement: Movement; side: "RIGHT"|"LEFT"; valueDeg: number }[]);

  return (
    <main className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">比較: {athlete.name}</h1>
        <Link href={`/athletes/${athlete.id}`} className="text-blue-600 underline">戻る</Link>
      </div>

      <form className="flex gap-3 items-end">
        <div>
          <label className="block text-sm text-muted-foreground">測定A</label>
          <select name="a" defaultValue={selA?.id} className="border rounded px-2 py-1">
            {assessments.map(as => <option key={as.id} value={as.id}>{new Date(as.date).toLocaleDateString()}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-muted-foreground">測定B</label>
          <select name="b" defaultValue={selB?.id} className="border rounded px-2 py-1">
            {assessments.map(as => <option key={as.id} value={as.id}>{new Date(as.date).toLocaleDateString()}</option>)}
          </select>
        </div>
        <button className="px-3 py-2 border rounded" formMethod="GET">更新</button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border">
          <thead>
            <tr className="bg-slate-50">
              <th className="border px-2 py-1 text-left">種目</th>
              <th className="border px-2 py-1">A 右</th>
              <th className="border px-2 py-1">A 左</th>
              <th className="border px-2 py-1">B 右</th>
              <th className="border px-2 py-1">B 左</th>
              <th className="border px-2 py-1">差(右)</th>
              <th className="border px-2 py-1">差(左)</th>
            </tr>
          </thead>
          <tbody>
            {(Object.keys(MOVEMENT_LABEL_JP) as Movement[]).map((m) => {
              const ar = aMap[m]?.RIGHT ?? 0; const al = aMap[m]?.LEFT ?? 0;
              const br = bMap[m]?.RIGHT ?? 0; const bl = bMap[m]?.LEFT ?? 0;
              return (
                <tr key={m}>
                  <td className="border px-2 py-1 whitespace-nowrap">{MOVEMENT_LABEL_JP[m]}</td>
                  <td className="border px-2 py-1 text-center">{ar}</td>
                  <td className="border px-2 py-1 text-center">{al}</td>
                  <td className="border px-2 py-1 text-center">{br}</td>
                  <td className="border px-2 py-1 text-center">{bl}</td>
                  <td className="border px-2 py-1 text-center">{(ar - br).toFixed(1)}</td>
                  <td className="border px-2 py-1 text-center">{(al - bl).toFixed(1)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}


