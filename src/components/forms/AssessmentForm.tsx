"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { computeComposition } from "@/lib/calc";
import { MOVEMENT_LABEL_JP, ROM_MAX } from "@/lib/constants";
import type { Movement, ThrowingJp, Mark3 } from "@/lib/types";

const movements = Object.keys(MOVEMENT_LABEL_JP) as Movement[];

const schema = z.object({
  // 基本情報のうち、氏名/チーム/ポジションは測定画面では非表示（optionalで型は維持）
  name: z.string().optional(),
  team: z.string().optional(),
  position: z.enum(["投手", "捕手", "内野手", "外野手", "その他"]).optional(),

  throwingSide: z.enum(["右", "左"]),
  batting: z.enum(["右", "左", "両"]),
  heightCm: z.coerce.number().min(120).max(220),
  weightKg: z.coerce.number().min(30).max(200),
  bodyFatPercent: z.coerce.number().min(3).max(45),
  swingSpeed: z.coerce.number().optional().nullable(),
  rom: z.record(
    z.enum(movements),
    z.object({ RIGHT: z.coerce.number().min(0).max(180).optional().nullable(), LEFT: z.coerce.number().min(0).max(180).optional().nullable() })
  ),
  // 球速関連 8項目（3マーク + 4数値、除脂肪は計算で反映）
  openHipMark: z.enum(["CIRCLE","TRIANGLE","CROSS"]).optional().nullable(),
  bridgeMark: z.enum(["CIRCLE","TRIANGLE","CROSS"]).optional().nullable(),
  forwardBendMark: z.enum(["CIRCLE","TRIANGLE","CROSS"]).optional().nullable(),
  medicineBallThrow: z.coerce.number().optional().nullable(),
  verticalJumpCm: z.coerce.number().optional().nullable(),
  tripleBroadJumpM: z.coerce.number().optional().nullable(),
  squatWeightKg: z.coerce.number().optional().nullable(),
  gripRightKg: z.coerce.number().optional().nullable(),
  gripLeftKg: z.coerce.number().optional().nullable(),
  // Power
  verticalJumpBothCm: z.coerce.number().optional().nullable(),
  verticalJumpRightCm: z.coerce.number().optional().nullable(),
  verticalJumpLeftCm: z.coerce.number().optional().nullable(),
  medicineBallThrowBackM: z.coerce.number().optional().nullable(),
  benchPressKg: z.coerce.number().optional().nullable(),
  sprint10mSec: z.coerce.number().optional().nullable(),
  sprint30mSec: z.coerce.number().optional().nullable(),
  ballVelocityKmh: z.coerce.number().optional().nullable(),
  // Strength (左右)
  strength2ndErRight: z.coerce.number().optional().nullable(),
  strength2ndErLeft: z.coerce.number().optional().nullable(),
  strength2ndIrRight: z.coerce.number().optional().nullable(),
  strength2ndIrLeft: z.coerce.number().optional().nullable(),
  strengthBellyPressRight: z.coerce.number().optional().nullable(),
  strengthBellyPressLeft: z.coerce.number().optional().nullable(),
  strengthSerratusAnteriorRight: z.coerce.number().optional().nullable(),
  strengthSerratusAnteriorLeft: z.coerce.number().optional().nullable(),
  strengthLowerTrapeziusRight: z.coerce.number().optional().nullable(),
  strengthLowerTrapeziusLeft: z.coerce.number().optional().nullable(),
  strengthHipFlexionRight: z.coerce.number().optional().nullable(),
  strengthHipFlexionLeft: z.coerce.number().optional().nullable(),
  strengthHipExtensionRight: z.coerce.number().optional().nullable(),
  strengthHipExtensionLeft: z.coerce.number().optional().nullable(),
  strengthHipAbductionRight: z.coerce.number().optional().nullable(),
  strengthHipAbductionLeft: z.coerce.number().optional().nullable(),
  strengthHipAdductionRight: z.coerce.number().optional().nullable(),
  strengthHipAdductionLeft: z.coerce.number().optional().nullable(),
  strengthHipErRight: z.coerce.number().optional().nullable(),
  strengthHipErLeft: z.coerce.number().optional().nullable(),
  strengthHipIrRight: z.coerce.number().optional().nullable(),
  strengthHipIrLeft: z.coerce.number().optional().nullable(),
});

export type AssessmentFormValues = z.infer<typeof schema>;

export function AssessmentForm({ onSubmit, defaultValues }: { onSubmit: (v: AssessmentFormValues) => Promise<void> | void; defaultValues?: Partial<AssessmentFormValues>; }) {
  const form = useForm<AssessmentFormValues>({
    resolver: zodResolver(schema) as unknown as Resolver<AssessmentFormValues>,
    defaultValues: {
      throwingSide: "右",
      batting: "右",
      rom: Object.fromEntries(movements.map(m => [m, { RIGHT: undefined, LEFT: undefined }])) as AssessmentFormValues["rom"],
      ...defaultValues,
    },
  });

  const [submitting, setSubmitting] = useState(false);

  const watch = form.watch();
  const comp = useMemo(() => computeComposition(watch.heightCm ?? 0, watch.weightKg ?? 0, watch.bodyFatPercent ?? 0), [watch.heightCm, watch.weightKg, watch.bodyFatPercent]);

  const handleSubmit = async (values: AssessmentFormValues) => {
    setSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="space-y-6 max-w-4xl mx-auto" onSubmit={form.handleSubmit(handleSubmit)}>
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">基本情報</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>投球側</Label>
            <Select defaultValue={form.getValues("throwingSide")} onValueChange={(v: ThrowingJp) => form.setValue("throwingSide", v)}>
              <SelectTrigger className="w-full"><SelectValue placeholder="選択" /></SelectTrigger>
              <SelectContent>
                {["右","左"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>打席</Label>
            <Select defaultValue={form.getValues("batting")} onValueChange={(v) => form.setValue("batting", v as AssessmentFormValues["batting"]) }>
              <SelectTrigger className="w-full"><SelectValue placeholder="選択" /></SelectTrigger>
              <SelectContent>
                {["右","左","両"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="heightCm">身長(cm)</Label>
            <Input id="heightCm" type="number" step="0.1" placeholder="cm" className="w-full" {...form.register("heightCm", { valueAsNumber: true })} />
          </div>
          <div>
            <Label htmlFor="weightKg">体重(kg)</Label>
            <Input id="weightKg" type="number" step="0.1" placeholder="kg" className="w-full" {...form.register("weightKg", { valueAsNumber: true })} />
          </div>
          <div>
            <Label htmlFor="bodyFatPercent">体脂肪率(%)</Label>
            <Input id="bodyFatPercent" type="number" step="0.1" placeholder="%" className="w-full" {...form.register("bodyFatPercent", { valueAsNumber: true })} />
          </div>
          <div>
            <Label htmlFor="swingSpeed">スイングスピード</Label>
            <Input id="swingSpeed" type="number" step="0.1" placeholder="例: m/s または km/h" className="w-full" {...form.register("swingSpeed", { valueAsNumber: true })} />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">体組成サマリー</h2>
        <Card className="mobile-card">
          <CardHeader>
            <CardTitle>リアルタイム計算</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">脂肪量(kg)</div>
                <div className="text-xl font-semibold">{comp.fatMassKg.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">除脂肪体重(kg)</div>
                <div className="text-xl font-semibold">{comp.leanMassKg.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">LBI</div>
                <div className="text-xl font-semibold">{comp.leanBodyIndex.toFixed(2)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      <section>
        <h2 className="text-lg font-semibold mb-2">可動域(°) 右/左</h2>
        <div className="overflow-x-auto mobile-table">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px]">種目</TableHead>
                <TableHead className="min-w-[80px]">右</TableHead>
                <TableHead className="min-w-[80px]">左</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.map((m) => (
                <TableRow key={m}>
                  <TableCell className="whitespace-nowrap font-medium">{MOVEMENT_LABEL_JP[m]}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="1"
                      placeholder={`0-${ROM_MAX[m]}`}
                      className="w-full text-center"
                      {...form.register(`rom.${m}.RIGHT` as const, { valueAsNumber: true })}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="1"
                      placeholder={`0-${ROM_MAX[m]}`}
                      className="w-full text-center"
                      {...form.register(`rom.${m}.LEFT` as const, { valueAsNumber: true })}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">筋力（左右）</h2>
        <div className="overflow-x-auto mobile-table">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[160px]">種目</TableHead>
                <TableHead className="min-w-[100px]">右</TableHead>
                <TableHead className="min-w-[100px]">左</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { keyR: "strength2ndErRight", keyL: "strength2ndErLeft", label: "2nd外旋" },
                { keyR: "strength2ndIrRight", keyL: "strength2ndIrLeft", label: "2nd内旋" },
                { keyR: "strengthBellyPressRight", keyL: "strengthBellyPressLeft", label: "Belly press" },
                { keyR: "strengthSerratusAnteriorRight", keyL: "strengthSerratusAnteriorLeft", label: "前鋸筋" },
                { keyR: "strengthLowerTrapeziusRight", keyL: "strengthLowerTrapeziusLeft", label: "僧帽筋下部" },
                { keyR: "strengthHipFlexionRight", keyL: "strengthHipFlexionLeft", label: "股関節屈曲" },
                { keyR: "strengthHipExtensionRight", keyL: "strengthHipExtensionLeft", label: "股関節伸展" },
                { keyR: "strengthHipAbductionRight", keyL: "strengthHipAbductionLeft", label: "股関節外転" },
                { keyR: "strengthHipAdductionRight", keyL: "strengthHipAdductionLeft", label: "股関節内転" },
                { keyR: "strengthHipErRight", keyL: "strengthHipErLeft", label: "股関節外旋" },
                { keyR: "strengthHipIrRight", keyL: "strengthHipIrLeft", label: "股関節内旋" },
              ].map((row) => (
                <TableRow key={row.label}>
                  <TableCell className="whitespace-nowrap font-medium">{row.label}</TableCell>
                  <TableCell>
                    <Input type="number" step="0.1" className="w-full text-center" {...form.register(row.keyR as any, { valueAsNumber: true })} />
                  </TableCell>
                  <TableCell>
                    <Input type="number" step="0.1" className="w-full text-center" {...form.register(row.keyL as any, { valueAsNumber: true })} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">パワー</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="gripRightKg">握力 右 (kg)</Label>
            <Input id="gripRightKg" type="number" step="0.1" className="w-full" {...form.register("gripRightKg", { valueAsNumber: true })} />
          </div>
          <div>
            <Label htmlFor="gripLeftKg">握力 左 (kg)</Label>
            <Input id="gripLeftKg" type="number" step="0.1" className="w-full" {...form.register("gripLeftKg", { valueAsNumber: true })} />
          </div>

          <div>
            <Label htmlFor="verticalJumpBothCm">ジャンプ 両 (cm)</Label>
            <Input id="verticalJumpBothCm" type="number" step="1" className="w-full" {...form.register("verticalJumpBothCm", { valueAsNumber: true })} />
          </div>
          <div>
            <Label htmlFor="verticalJumpRightCm">ジャンプ 右 (cm)</Label>
            <Input id="verticalJumpRightCm" type="number" step="1" className="w-full" {...form.register("verticalJumpRightCm", { valueAsNumber: true })} />
          </div>
          <div>
            <Label htmlFor="verticalJumpLeftCm">ジャンプ 左 (cm)</Label>
            <Input id="verticalJumpLeftCm" type="number" step="1" className="w-full" {...form.register("verticalJumpLeftCm", { valueAsNumber: true })} />
          </div>

          <div>
            <Label htmlFor="medicineBallThrowBackM">5kg MB投げ 後方 (m)</Label>
            <Input id="medicineBallThrowBackM" type="number" step="0.1" className="w-full" {...form.register("medicineBallThrowBackM", { valueAsNumber: true })} />
          </div>
          <div>
            <Label htmlFor="squatWeightKg">スクワット (kg)</Label>
            <Input id="squatWeightKg" type="number" step="1" className="w-full" {...form.register("squatWeightKg", { valueAsNumber: true })} />
          </div>
          <div>
            <Label htmlFor="benchPressKg">ベンチプレス (kg)</Label>
            <Input id="benchPressKg" type="number" step="1" className="w-full" {...form.register("benchPressKg", { valueAsNumber: true })} />
          </div>

          <div>
            <Label htmlFor="sprint10mSec">30m走 10m時点 (秒)</Label>
            <Input id="sprint10mSec" type="number" step="0.01" className="w-full" {...form.register("sprint10mSec", { valueAsNumber: true })} />
          </div>
          <div>
            <Label htmlFor="sprint30mSec">30m走 30m時点 (秒)</Label>
            <Input id="sprint30mSec" type="number" step="0.01" className="w-full" {...form.register("sprint30mSec", { valueAsNumber: true })} />
          </div>

          <div>
            <Label htmlFor="ballVelocityKmh">球速 (km/h)</Label>
            <Input id="ballVelocityKmh" type="number" step="0.1" className="w-full" {...form.register("ballVelocityKmh", { valueAsNumber: true })} />
          </div>
          <div>
            <Label htmlFor="swingSpeed">スイングスピード</Label>
            <Input id="swingSpeed" type="number" step="0.1" className="w-full" {...form.register("swingSpeed", { valueAsNumber: true })} />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">その他項目</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>開脚</Label>
            <Select onValueChange={(v: Mark3) => form.setValue("openHipMark", v)}>
              <SelectTrigger className="w-full"><SelectValue placeholder="選択 (○/△/×)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="CIRCLE">○</SelectItem>
                <SelectItem value="TRIANGLE">△</SelectItem>
                <SelectItem value="CROSS">×</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>ブリッジ</Label>
            <Select onValueChange={(v: Mark3) => form.setValue("bridgeMark", v)}>
              <SelectTrigger className="w-full"><SelectValue placeholder="選択 (○/△/×)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="CIRCLE">○</SelectItem>
                <SelectItem value="TRIANGLE">△</SelectItem>
                <SelectItem value="CROSS">×</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>前屈</Label>
            <Select onValueChange={(v: Mark3) => form.setValue("forwardBendMark", v)}>
              <SelectTrigger className="w-full"><SelectValue placeholder="選択 (○/△/×)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="CIRCLE">○</SelectItem>
                <SelectItem value="TRIANGLE">△</SelectItem>
                <SelectItem value="CROSS">×</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="medicineBallThrow">メディシンボール投げ (m)</Label>
            <Input id="medicineBallThrow" type="number" step="0.1" placeholder="m" className="w-full" {...form.register("medicineBallThrow", { valueAsNumber: true })} />
          </div>
          <div>
            <Label htmlFor="verticalJumpCm">垂直跳び (cm)</Label>
            <Input id="verticalJumpCm" type="number" step="1" placeholder="cm" className="w-full" {...form.register("verticalJumpCm", { valueAsNumber: true })} />
          </div>
          <div>
            <Label htmlFor="tripleBroadJumpM">3連続立ち幅跳び (m)</Label>
            <Input id="tripleBroadJumpM" type="number" step="0.1" placeholder="m" className="w-full" {...form.register("tripleBroadJumpM", { valueAsNumber: true })} />
          </div>
          <div>
            <Label htmlFor="squatWeightKg">スクワット重量 (kg)</Label>
            <Input id="squatWeightKg" type="number" step="1" placeholder="kg" className="w-full" {...form.register("squatWeightKg", { valueAsNumber: true })} />
          </div>
          <div>
            <Label htmlFor="gripRightKg">握力 右 (kg)</Label>
            <Input id="gripRightKg" type="number" step="0.1" placeholder="kg" className="w-full" {...form.register("gripRightKg", { valueAsNumber: true })} />
          </div>
          <div>
            <Label htmlFor="gripLeftKg">握力 左 (kg)</Label>
            <Input id="gripLeftKg" type="number" step="0.1" placeholder="kg" className="w-full" {...form.register("gripLeftKg", { valueAsNumber: true })} />
          </div>
        </div>
      </section>

      <div className="pt-4 flex justify-center">
        <Button type="submit" disabled={submitting} aria-busy={submitting} aria-live="polite" className="w-full md:w-auto px-8 py-3 text-lg">
          {submitting ? "保存中..." : "保存"}
        </Button>
      </div>
    </form>
  );
}
