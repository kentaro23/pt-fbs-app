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
import type { Movement, ThrowingJp } from "@/lib/types";

const movements = Object.keys(MOVEMENT_LABEL_JP) as Movement[];

const schema = z.object({
  name: z.string().min(1, "必須"),
  team: z.string().optional(),
  position: z.enum(["投手", "捕手", "内野手", "外野手", "その他"]),
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
});

export type AssessmentFormValues = z.infer<typeof schema>;

export function AssessmentForm({
  onSubmit,
  defaultValues,
}: {
  onSubmit: (v: AssessmentFormValues) => Promise<void> | void;
  defaultValues?: Partial<AssessmentFormValues>;
}) {
  const form = useForm<AssessmentFormValues>({ resolver: zodResolver(schema) as unknown as Resolver<AssessmentFormValues>, defaultValues: {
    position: "投手",
    throwingSide: "右",
    batting: "右",
    rom: Object.fromEntries(movements.map(m => [m, { RIGHT: undefined, LEFT: undefined }])) as AssessmentFormValues["rom"],
    ...defaultValues,
  }});

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
            <Label htmlFor="name">氏名</Label>
            <Input id="name" {...form.register("name")} className="w-full" />
            {form.formState.errors.name && <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="team">チーム</Label>
            <Input id="team" {...form.register("team")} className="w-full" />
          </div>
          <div>
            <Label>ポジション</Label>
            <Select defaultValue={form.getValues("position")} onValueChange={(v) => form.setValue("position", v as AssessmentFormValues["position"])}>
              <SelectTrigger className="w-full"><SelectValue placeholder="選択" /></SelectTrigger>
              <SelectContent>
                {["投手","捕手","内野手","外野手","その他"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
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
            <Select defaultValue={form.getValues("batting")} onValueChange={(v) => form.setValue("batting", v as AssessmentFormValues["batting"])}>
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

      <div className="pt-4 flex justify-center">
        <Button type="submit" disabled={submitting} className="w-full md:w-auto px-8 py-3 text-lg">
          {submitting ? "保存中..." : "保存"}
        </Button>
      </div>
    </form>
  );
}
