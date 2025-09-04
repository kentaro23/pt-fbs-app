"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RomRadar } from "@/components/charts/RomRadar";
import { TriangleBalance } from "@/components/charts/TriangleBalance";
import { MOVEMENT_LABEL_JP } from "@/lib/constants";
import { scoreTriangle, normalizeRom } from "@/lib/calc";
import type { Assessment, Athlete, Rom, Movement, Mark3 } from "@/lib/types";

function mark3ToScore(m?: Mark3 | null): number | undefined {
  if (!m) return undefined;
  if (m === "CIRCLE") return 3;
  if (m === "TRIANGLE") return 2;
  if (m === "CROSS") return 1;
  return undefined;
}

export function FbsReport({ assessment, athlete, roms, targets }: { assessment: Assessment; athlete: Athlete; roms: Rom[]; targets?: Partial<Record<Movement, number>> }) {
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

  const perfRows: Array<{ label: string; value?: number | string; score?: number; unit?: string }> = [
    { label: "開脚", score: mark3ToScore(assessment.openHipMark) },
    { label: "ブリッジ", score: mark3ToScore(assessment.bridgeMark) },
    { label: "前屈", score: mark3ToScore(assessment.forwardBendMark) },
    { label: "メディシンボール投げ", value: assessment.medicineBallThrow, unit: "m" },
    { label: "垂直跳び", value: assessment.verticalJumpCm, unit: "cm" },
    { label: "3連続立ち幅跳び", value: assessment.tripleBroadJumpM, unit: "m" },
    { label: "スクワット重量", value: assessment.squatWeightKg, unit: "kg" },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white">
      <div className="space-y-4">
        <header className="space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">FBS Report</h1>
              <div className="text-sm text-muted-foreground">測定日: {new Date(assessment.date).toLocaleDateString()}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            <div><span className="font-semibold">氏名:</span> {athlete.name}</div>
            <div><span className="font-semibold">チーム:</span> {athlete.team ?? "-"}</div>
            <div><span className="font-semibold">ポジション:</span> {athlete.position}</div>
            <div><span className="font-semibold">投球側/打席:</span> {athlete.throwingSide}/{athlete.batting}</div>
            <div><span className="font-semibold">身長:</span> {athlete.heightCm} cm</div>
            <div><span className="font-semibold">体重:</span> {athlete.weightKg} kg</div>
            <div><span className="font-semibold">体脂肪率:</span> {athlete.bodyFatPercent}%</div>
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
            <table className="w-full text-sm border border-black">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border border-black px-2 py-1 text-left">種目</th>
                  <th className="border border-black px-2 py-1">右(°)</th>
                  <th className="border border-black px-2 py-1">左(°)</th>
                  <th className="border border-black px-2 py-1">目標(°)</th>
                  <th className="border border-black px-2 py-1">差(右)</th>
                  <th className="border border-black px-2 py-1">差(左)</th>
                </tr>
              </thead>
              <tbody>
                {(Object.keys(MOVEMENT_LABEL_JP) as Movement[]).map((mv) => {
                  const r = romMap[mv]?.RIGHT ?? 0;
                  const l = romMap[mv]?.LEFT ?? 0;
                  const t = targets?.[mv];
                  const dr = typeof t === "number" ? r - t : undefined;
                  const dl = typeof t === "number" ? l - t : undefined;
                  const below = typeof t === "number" && (r < t || l < t);
                  return (
                    <tr key={mv} className={below ? "bg-red-50" : undefined}>
                      <td className="border border-black px-2 py-1 text-left whitespace-nowrap">{MOVEMENT_LABEL_JP[mv]}</td>
                      <td className={`border border-black px-2 py-1 text-center ${typeof t === "number" && r < t ? "text-red-600 font-semibold" : ""}`}>{r}</td>
                      <td className={`border border-black px-2 py-1 text-center ${typeof t === "number" && l < t ? "text-red-600 font-semibold" : ""}`}>{l}</td>
                      <td className="border border-black px-2 py-1 text-center">{typeof t === "number" ? t : "-"}</td>
                      <td className={`border border-black px-2 py-1 text-center ${typeof dr === "number" && dr < 0 ? "text-red-600" : ""}`}>{typeof dr === "number" ? dr.toFixed(1) : "-"}</td>
                      <td className={`border border-black px-2 py-1 text-center ${typeof dl === "number" && dl < 0 ? "text-red-600" : ""}`}>{typeof dl === "number" ? dl.toFixed(1) : "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-3">
          <Card>
            <CardHeader><CardTitle>球速関連 指標</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* 三値マーク（○/△/×）はスコア3,2,1でバー表示 */}
                {[
                  { label: "開脚", score: mark3ToScore(assessment.openHipMark) },
                  { label: "ブリッジ", score: mark3ToScore(assessment.bridgeMark) },
                  { label: "前屈", score: mark3ToScore(assessment.forwardBendMark) },
                ].map((r) => (
                  <div key={r.label} className="space-y-1">
                    <div className="text-sm text-muted-foreground">{r.label}</div>
                    <div className="h-3 bg-slate-200 rounded">
                      <div className="h-3 bg-emerald-500 rounded" style={{ width: `${((r.score ?? 0) / 3) * 100}%` }} />
                    </div>
                    <div className="text-xs text-slate-500">{r.score ?? "-"} / 3</div>
                  </div>
                ))}

                {/* 数値系 */}
                {[
                  { label: "メディシンボール投げ", value: assessment.medicineBallThrow, unit: "m" },
                  { label: "垂直跳び", value: assessment.verticalJumpCm, unit: "cm" },
                  { label: "3連続立ち幅跳び", value: assessment.tripleBroadJumpM, unit: "m" },
                  { label: "スクワット重量", value: assessment.squatWeightKg, unit: "kg" },
                ].map((r) => (
                  <div key={r.label} className="space-y-1">
                    <div className="text-sm text-muted-foreground">{r.label}</div>
                    <div className="text-lg font-semibold">{typeof r.value === 'number' ? `${r.value} ${r.unit}` : '-'}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
