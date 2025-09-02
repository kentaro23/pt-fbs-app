"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RomRadar } from "@/components/charts/RomRadar";
import { TriangleBalance } from "@/components/charts/TriangleBalance";
import { ASYM_THRESHOLD, MOVEMENT_LABEL_JP } from "@/lib/constants";
import { asymPercent, scoreTriangle, normalizeRom } from "@/lib/calc";
import type { Assessment, Athlete, Rom, Movement } from "@/lib/types";

export function FbsReport({ assessment, athlete, roms }: { assessment: Assessment; athlete: Athlete; roms: Rom[] }) {
  const romMap = roms.reduce((acc, r) => {
    if (!acc[r.movement]) acc[r.movement] = {};
    acc[r.movement][r.side] = r.valueDeg;
    return acc;
  }, {} as Record<Movement, Record<string, number>>);

  const asymList = (Object.keys(MOVEMENT_LABEL_JP) as Movement[])
    .map((m) => {
      const r = romMap[m]?.RIGHT ?? 0;
      const l = romMap[m]?.LEFT ?? 0;
      const dom = athlete.throwingSide === "右" ? r : l;
      const non = athlete.throwingSide === "右" ? l : r;
      return { movement: m, percent: asymPercent(dom, non) };
    })
    .filter((a) => Math.abs(a.percent) > ASYM_THRESHOLD)
    .sort((a, b) => Math.abs(b.percent) - Math.abs(a.percent));

  const radarData = (Object.keys(MOVEMENT_LABEL_JP) as Movement[]).map((m) => {
    const r = romMap[m]?.RIGHT ?? 0;
    const l = romMap[m]?.LEFT ?? 0;
    return { movement: m, right: normalizeRom(r, m), left: normalizeRom(l, m) };
  });

  const tri = scoreTriangle({ swingSpeed: assessment.swingSpeed ?? undefined, romMap });

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white">
      <div className="space-y-4">
        <header className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">FBS Report</h1>
            <div className="text-sm text-muted-foreground">
              測定日: {new Date(assessment.date).toLocaleDateString()}
            </div>
          </div>
          <div className="text-sm text-right space-y-1">
            <div><span className="font-semibold">選手名:</span> {athlete.name}</div>
            <div><span className="font-semibold">チーム:</span> {athlete.team ?? "-"}</div>
            <div><span className="font-semibold">ポジション:</span> {athlete.position}</div>
            <div><span className="font-semibold">投球側/打席:</span> {athlete.throwingSide}/{athlete.batting}</div>
          </div>
        </header>
        <Separator className="my-2" />

        <section>
          <Card>
            <CardHeader><CardTitle>体組成</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                <div>身長: <span className="font-semibold">{athlete.heightCm} cm</span></div>
                <div>体重: <span className="font-semibold">{athlete.weightKg} kg</span></div>
                <div>体脂肪率: <span className="font-semibold">{athlete.bodyFatPercent}%</span></div>
                <div>脂肪量: <span className="font-semibold">{assessment.fatMassKg.toFixed(2)} kg</span></div>
                <div>除脂肪体重: <span className="font-semibold">{assessment.leanMassKg.toFixed(2)} kg</span></div>
                <div>LBI: <span className="font-semibold">{assessment.leanBodyIndex.toFixed(2)}</span></div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-3">
          <div className="text-base font-semibold mb-1">左右差% 上位</div>
          <div className="flex flex-wrap gap-2">
            {asymList.slice(0, 3).map((a) => (
              <Badge key={a.movement} variant={Math.abs(a.percent) > ASYM_THRESHOLD ? "destructive" : "default"}>
                {MOVEMENT_LABEL_JP[a.movement]} {a.percent.toFixed(1)}%
              </Badge>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          <Card>
            <CardHeader><CardTitle>可動域レーダー</CardTitle></CardHeader>
            <CardContent>
              <RomRadar data={radarData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>三角チャート</CardTitle></CardHeader>
            <CardContent>
              <TriangleBalance score={tri} />
            </CardContent>
          </Card>
        </section>

        <section className="mt-3">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border px-2 py-1 text-left">種目</th>
                  <th className="border px-2 py-1">右(°)</th>
                  <th className="border px-2 py-1">左(°)</th>
                  <th className="border px-2 py-1">左右差%</th>
                </tr>
              </thead>
              <tbody>
                {(Object.keys(MOVEMENT_LABEL_JP) as Movement[]).map((mv) => {
                  const r = romMap[mv]?.RIGHT ?? 0;
                  const l = romMap[mv]?.LEFT ?? 0;
                  const dom = athlete.throwingSide === "右" ? r : l;
                  const non = athlete.throwingSide === "右" ? l : r;
                  const pct = asymPercent(dom, non);
                  const warn = Math.abs(pct) > ASYM_THRESHOLD;
                  return (
                    <tr key={mv} className={warn ? "bg-red-50" : undefined}>
                      <td className="border px-2 py-1 text-left whitespace-nowrap">{MOVEMENT_LABEL_JP[mv]}</td>
                      <td className="border px-2 py-1 text-center">{r}</td>
                      <td className="border px-2 py-1 text-center">{l}</td>
                      <td className={`border px-2 py-1 text-center ${warn ? "text-red-600 font-semibold" : ""}`}>{isFinite(pct) ? pct.toFixed(1) : "-"}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {assessment.notes && (
          <section className="mt-3">
            <Card>
              <CardHeader><CardTitle>備考</CardTitle></CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-sm">{assessment.notes}</div>
              </CardContent>
            </Card>
          </section>
        )}
      </div>
    </div>
  );
}
