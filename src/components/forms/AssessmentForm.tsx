"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MOVEMENT_LABEL_JP, ROM_MAX } from "@/lib/constants";
import type { Movement } from "@/lib/types";

const movements = Object.keys(MOVEMENT_LABEL_JP) as Movement[];

const schema = z.object({
  swingSpeed: z.coerce.number().optional().nullable(),
  rom: z.record(
    z.enum(movements),
    z.object({ RIGHT: z.coerce.number().min(0).max(180).optional().nullable(), LEFT: z.coerce.number().min(0).max(180).optional().nullable() })
  ),
});

export type AssessmentFormValues = z.infer<typeof schema>;

export function AssessmentForm({ onSubmit, defaultValues }: { onSubmit: (v: AssessmentFormValues) => Promise<void> | void; defaultValues?: Partial<AssessmentFormValues>; }) {
  const form = useForm<AssessmentFormValues>({
    resolver: zodResolver(schema) as unknown as Resolver<AssessmentFormValues>,
    defaultValues: {
      swingSpeed: undefined,
      rom: Object.fromEntries(movements.map(m => [m, { RIGHT: undefined, LEFT: undefined }])) as AssessmentFormValues["rom"],
      ...defaultValues,
    },
  });

  const [submitting, setSubmitting] = useState(false);

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <div className="text-sm text-muted-foreground">スイングスピード</div>
          <Input id="swingSpeed" type="number" step="0.1" placeholder="例: m/s または km/h" className="w-full" {...form.register("swingSpeed", { valueAsNumber: true })} />
        </div>
      </div>

      <div className="pt-4 flex justify-center">
        <Button type="submit" disabled={submitting} className="w-full md:w-auto px-8 py-3 text-lg">
          {submitting ? "保存中..." : "保存"}
        </Button>
      </div>
    </form>
  );
}
