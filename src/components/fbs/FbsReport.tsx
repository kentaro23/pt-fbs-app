"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TriangleBalance } from "@/components/charts/TriangleBalance";
import { MetricRadar, type MetricRadarDatum } from "@/components/charts/MetricRadar";
import { MOVEMENT_LABEL_JP } from "@/lib/constants";
import { scoreTriangle } from "@/lib/calc";
import type { Assessment, Athlete, Rom, Movement, Mark3 } from "@/lib/types";

function mark3ToScore(m?: Mark3 | null): number | undefined {
  if (!m) return undefined;
  if (m === "CIRCLE") return 3;
  if (m === "TRIANGLE") return 2;
  if (m === "CROSS") return 1;
  return undefined;
}

function norm(v: number | null | undefined, max: number): number {
  if (typeof v !== "number" || !isFinite(v) || max <= 0) return 0;
  return Math.max(0, Math.min(1, v / max));
}

function normMark3(m?: Mark3 | null): number {
  const s = mark3ToScore(m);
  return typeof s === "number" ? s / 3 : 0;
}

export function FbsReport({ assessment, athlete, roms, targets }: { assessment: Assessment; athlete: Athlete; roms: Rom[]; targets?: Partial<Record<Movement, number>> }) {
  const romMap = roms.reduce((acc, r) => {
    if (!acc[r.movement]) acc[r.movement] = {} as Record<string, number>;
    acc[r.movement][r.side] = r.valueDeg;
    return acc;
  }, {} as Record<Movement, Record<string, number>>);

  // ROMレーダーは非表示。その他の機能は保持。

  const tri = scoreTriangle({ swingSpeed: assessment.swingSpeed ?? undefined, romMap });

  // 球速関連（8軸）: 開脚, ブリッジ, 前屈, メディシンボール, 垂直跳び, 3連幅跳び, スクワット, LBI
  const speedRelatedData: MetricRadarDatum[] = [
    { name: "開脚", value: normMark3(assessment.openHipMark) },
    { name: "ブリッジ", value: normMark3(assessment.bridgeMark) },
    { name: "前屈", value: normMark3(assessment.forwardBendMark) },
    { name: "MB投げ", value: norm(assessment.medicineBallThrow, 20) },
    { name: "垂直跳び", value: norm(assessment.verticalJumpCm, 70) },
    { name: "3連幅跳び", value: norm(assessment.tripleBroadJumpM, 9) },
    { name: "スクワット", value: norm(assessment.squatWeightKg, 200) },
    { name: "LBI", value: norm(assessment.leanBodyIndex, 25) },
  ];

  // スイング関連（3軸）: LBI, 垂直跳び, 握力平均（上限70）
  const gripAvg = ((): number | undefined => {
    const gl = assessment.gripLeftKg;
    const gr = assessment.gripRightKg;
    if (typeof gl === "number" || typeof gr === "number") {
      const n = (Number(!!gl) + Number(!!gr)) || 1;
      return ((gl ?? 0) + (gr ?? 0)) / n;
    }
    return undefined;
  })();

  const swingRelatedData: MetricRadarDatum[] = [
    { name: "LBI", value: norm(assessment.leanBodyIndex, 25) },
    { name: "垂直跳び", value: norm(assessment.verticalJumpCm, 70) },
    { name: "握力平均", value: norm(gripAvg ?? null, 70) },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white">
      <div className="space-y-4">
        <header className="space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">FBS Report</h1>
              <div className="text-sm text-muted-foreground">記録日: {new Date(assessment.date).toLocaleDateString()}</div>
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
            <CardHeader><CardTitle>三角チャート</CardTitle></CardHeader>
            <CardContent>
              <TriangleBalance score={tri} />
            </CardContent>
          </Card>
        </section>

        {/* 追加のレーダー: 球速関連（8軸）とスイング関連（3軸） */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Card>
            <CardHeader><CardTitle>球速関連 レーダー</CardTitle></CardHeader>
            <CardContent>
              <MetricRadar data={speedRelatedData} title="球速関連" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>スイング関連 レーダー</CardTitle></CardHeader>
            <CardContent>
              <MetricRadar data={swingRelatedData} title="スイング関連" />
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

        {/* 追加: パワー */}
        <section className="mt-3">
          <Card>
            <CardHeader><CardTitle>パワー</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { label: "握力(右)", value: assessment.gripRightKg, unit: "kg" },
                  { label: "握力(左)", value: assessment.gripLeftKg, unit: "kg" },
                  { label: "ジャンプ(両)", value: assessment.verticalJumpBothCm, unit: "cm" },
                  { label: "ジャンプ(右)", value: assessment.verticalJumpRightCm, unit: "cm" },
                  { label: "ジャンプ(左)", value: assessment.verticalJumpLeftCm, unit: "cm" },
                  { label: "5kgMB投げ 後方", value: assessment.medicineBallThrowBackM, unit: "m" },
                  { label: "スクワット", value: assessment.squatWeightKg, unit: "kg" },
                  { label: "ベンチプレス", value: assessment.benchPressKg, unit: "kg" },
                  { label: "30m走(10m)", value: assessment.sprint10mSec, unit: "s" },
                  { label: "30m走(30m)", value: assessment.sprint30mSec, unit: "s" },
                  { label: "球速", value: assessment.ballVelocityKmh, unit: "km/h" },
                  { label: "スイングスピード", value: assessment.swingSpeed, unit: "" },
                ].map((r) => (
                  <div key={r.label} className="space-y-1">
                    <div className="text-sm text-muted-foreground">{r.label}</div>
                    <div className="text-lg font-semibold">{typeof r.value === 'number' ? `${r.value}${r.unit ? ` ${r.unit}` : ''}` : '-'}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 追加: 筋力（左右） */}
        <section className="mt-3">
          <Card>
            <CardHeader><CardTitle>筋力（左右）</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-black">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="border border-black px-2 py-1 text-left">種目</th>
                      <th className="border border-black px-2 py-1">右</th>
                      <th className="border border-black px-2 py-1">左</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: "2nd外旋", r: assessment.strength2ndErRight, l: assessment.strength2ndErLeft },
                      { label: "2nd内旋", r: assessment.strength2ndIrRight, l: assessment.strength2ndIrLeft },
                      { label: "Belly press", r: assessment.strengthBellyPressRight, l: assessment.strengthBellyPressLeft },
                      { label: "前鋸筋", r: assessment.strengthSerratusAnteriorRight, l: assessment.strengthSerratusAnteriorLeft },
                      { label: "僧帽筋下部", r: assessment.strengthLowerTrapeziusRight, l: assessment.strengthLowerTrapeziusLeft },
                      { label: "股関節屈曲", r: assessment.strengthHipFlexionRight, l: assessment.strengthHipFlexionLeft },
                      { label: "股関節伸展", r: assessment.strengthHipExtensionRight, l: assessment.strengthHipExtensionLeft },
                      { label: "股関節外転", r: assessment.strengthHipAbductionRight, l: assessment.strengthHipAbductionLeft },
                      { label: "股関節内転", r: assessment.strengthHipAdductionRight, l: assessment.strengthHipAdductionLeft },
                      { label: "股関節外旋", r: assessment.strengthHipErRight, l: assessment.strengthHipErLeft },
                      { label: "股関節内旋", r: assessment.strengthHipIrRight, l: assessment.strengthHipIrLeft },
                    ].map((row) => (
                      <tr key={row.label}>
                        <td className="border border-black px-2 py-1 text-left whitespace-nowrap">{row.label}</td>
                        <td className="border border-black px-2 py-1 text-center">{typeof row.r === 'number' ? row.r : '-'}</td>
                        <td className="border border-black px-2 py-1 text-center">{typeof row.l === 'number' ? row.l : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-3">
          <Card>
            <CardHeader><CardTitle>スイングスピード関連 指標</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex items-center justify-between">
                  <div className="text-muted-foreground">LBI</div>
                  <div className="font-semibold">{assessment.leanBodyIndex.toFixed(2)}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-muted-foreground">垂直跳び</div>
                  <div className="font-semibold">{typeof assessment.verticalJumpCm === 'number' ? `${assessment.verticalJumpCm} cm` : '-'}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-muted-foreground">握力(平均)</div>
                  <div className="font-semibold">{
                    typeof assessment.gripLeftKg === 'number' || typeof assessment.gripRightKg === 'number'
                      ? `${(((assessment.gripLeftKg ?? 0) + (assessment.gripRightKg ?? 0)) / (Number(!!assessment.gripLeftKg) + Number(!!assessment.gripRightKg) || 1)).toFixed(1)} kg`
                      : '-'
                  }</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
