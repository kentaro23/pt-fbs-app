"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PositionJp, ThrowingJp, BattingJp, Movement } from "@/lib/types";
import { MOVEMENT_LABEL_JP } from "@/lib/constants";

const movements = Object.keys(MOVEMENT_LABEL_JP) as Movement[];

type InfieldJp = "一塁手" | "二塁手" | "三塁手" | "遊撃手";

const schema = z.object({
  name: z.string().min(1, "必須"),
  team: z.string().optional(),
  position: z.enum(["投手", "捕手", "内野手", "外野手", "その他"]),
  infieldPosition: z.enum(["一塁手","二塁手","三塁手","遊撃手"]).optional(),
  throwingSide: z.enum(["右", "左"]),
  batting: z.enum(["右", "左", "両"]),
  heightCm: z.coerce.number().min(120, "120以上").max(220, "220以下"),
  weightKg: z.coerce.number().min(30, "30以上").max(200, "200以下"),
  bodyFatPercent: z.coerce.number().min(3, "3以上").max(45, "45以下"),
  targets: z.record(z.enum(movements), z.coerce.number().min(0).max(180)).optional(),
}).refine((v) => v.position !== "内野手" || !!v.infieldPosition, { message: "内野手の場合は詳細を選択", path: ["infieldPosition"] });

export type AthleteFormValues = z.infer<typeof schema>;

export function AthleteForm({ onSubmit }: { onSubmit: (v: AthleteFormValues) => Promise<void> | void }) {
  const form = useForm<AthleteFormValues>({ resolver: zodResolver(schema) as unknown as Resolver<AthleteFormValues>, defaultValues: {
    position: "投手",
    throwingSide: "右",
    batting: "右",
  }});

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: AthleteFormValues) => {
    if (submitting) return; // 二重送信防止
    setSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setSubmitting(false);
    }
  };

  const pos = form.watch("position");

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">氏名</Label>
          <Input id="name" placeholder="山田 太郎" {...form.register("name")} />
          {form.formState.errors.name && <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>}
        </div>
        <div>
          <Label htmlFor="team">チーム</Label>
          <Input id="team" placeholder="所属チーム名" {...form.register("team")} />
        </div>
        <div>
          <Label>ポジション</Label>
          <Select defaultValue={form.getValues("position")} onValueChange={(v: PositionJp) => form.setValue("position", v)}>
            <SelectTrigger><SelectValue placeholder="選択" /></SelectTrigger>
            <SelectContent>
              {(["投手","捕手","内野手","外野手","その他"] as PositionJp[]).map(p => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {pos === "内野手" && (
          <div>
            <Label>内野手（詳細）</Label>
            <Select onValueChange={(v: InfieldJp) => form.setValue("infieldPosition", v)}>
              <SelectTrigger><SelectValue placeholder="選択" /></SelectTrigger>
              <SelectContent>
                {(["一塁手","二塁手","三塁手","遊撃手"]).map(p => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.infieldPosition && <p className="text-red-500 text-sm mt-1">{form.formState.errors.infieldPosition.message as string}</p>}
          </div>
        )}
        <div>
          <Label>投球側</Label>
          <Select defaultValue={form.getValues("throwingSide")} onValueChange={(v: ThrowingJp) => form.setValue("throwingSide", v)}>
            <SelectTrigger><SelectValue placeholder="選択" /></SelectTrigger>
            <SelectContent>
              {["右","左"].map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>打席</Label>
          <Select defaultValue={form.getValues("batting")} onValueChange={(v: BattingJp) => form.setValue("batting", v)}>
            <SelectTrigger><SelectValue placeholder="選択" /></SelectTrigger>
            <SelectContent>
              {["右","左","両"].map(b => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="heightCm">身長(cm)</Label>
          <Input id="heightCm" type="number" step="0.1" placeholder="cm" {...form.register("heightCm", { valueAsNumber: true })} />
          {form.formState.errors.heightCm && <p className="text-red-500 text-sm mt-1">{form.formState.errors.heightCm.message}</p>}
        </div>
        <div>
          <Label htmlFor="weightKg">体重(kg)</Label>
          <Input id="weightKg" type="number" step="0.1" placeholder="kg" {...form.register("weightKg", { valueAsNumber: true })} />
          {form.formState.errors.weightKg && <p className="text-red-500 text-sm mt-1">{form.formState.errors.weightKg.message}</p>}
        </div>
        <div>
          <Label htmlFor="bodyFatPercent">体脂肪率(%)</Label>
          <Input id="bodyFatPercent" type="number" step="0.1" placeholder="%" {...form.register("bodyFatPercent", { valueAsNumber: true })} />
          {form.formState.errors.bodyFatPercent && <p className="text-red-500 text-sm mt-1">{form.formState.errors.bodyFatPercent.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label>目標可動域(°) — 入力した項目のみ保存</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {movements.map((m) => (
            <div key={m} className="space-y-1">
              <div className="text-sm text-muted-foreground">{MOVEMENT_LABEL_JP[m]}</div>
              <Input type="number" step="1" placeholder="目標値(°)" {...form.register(`targets.${m}` as const, { valueAsNumber: true })} />
            </div>
          ))}
        </div>
      </div>

      <Button type="submit" disabled={submitting}>
        {submitting ? "保存中..." : "保存"}
      </Button>
    </form>
  );
}
