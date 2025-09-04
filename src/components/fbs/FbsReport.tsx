"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RomRadar } from "@/components/charts/RomRadar";
import { TriangleBalance } from "@/components/charts/TriangleBalance";
import { MOVEMENT_LABEL_JP } from "@/lib/constants";
import { scoreTriangle, normalizeRom } from "@/lib/calc";
import type { Assessment, Athlete, Rom, Movement } from "@/lib/types";

export function FbsReport({ assessment, athlete, roms }: { assessment: Assessment; athlete: Athlete; roms: Rom[] }) {
  const romMap = roms.reduce((acc, r) => {
    if (!acc[r.movement]) acc[r.movement] = {} as Record<string, number>;
    acc[r.movement][r.side] = r.valueDeg;
    return acc;
  }, {} as Record<Movement, Record<string, number>>);

  const radarData = (Object.keys(MOVEMENT_LABEL_JP) as Movement[]).map((m) => {
    const r = romMap[m]?.RIGHT ?? 0;
    const l = romMap[m]?.LEFT ?? 0;
    return { movement: m, right: normalizeRom(r, m), left: normalizeRom(l, m) };
  });

  const tri = scoreTriangle({ swingSpeed: assessment.swingSpeed ?? undefined, romMap });

  // 目標値は将来のprops/DB取得を想定。簡易的に空（未設定）
  const targets: Partial<Record<Movement, number>> = {};

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
                </tr>
              </thead>
              <tbody>
                {(Object.keys(MOVEMENT_LABEL_JP) as Movement[]).map((mv) => {
                  const r = romMap[mv]?.RIGHT ?? 0;
                  const l = romMap[mv]?.LEFT ?? 0;
                  const t = targets[mv];
                  const below = typeof t === "number" && (r < t || l < t);
                  return (
                    <tr key={mv} className={below ? "bg-red-50" : undefined}>
                      <td className="border px-2 py-1 text-left whitespace-nowrap">{MOVEMENT_LABEL_JP[mv]}{typeof t === "number" ? `（目標 ${t}°）` : ""}</td>
                      <td className={`border px-2 py-1 text-center ${typeof t === "number" && r < t ? "text-red-600 font-semibold" : ""}`}>{r}</td>
                      <td className={`border px-2 py-1 text-center ${typeof t === "number" && l < t ? "text-red-600 font-semibold" : ""}`}>{l}</td>
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
