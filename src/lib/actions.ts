"use server";

import { prisma } from "@/lib/db";
import { computeComposition } from "@/lib/calc";
import { redirect } from "next/navigation";
import type { AssessmentFormValues } from "@/components/forms/AssessmentForm";
import type { Movement } from "@/lib/types";
import type { Prisma, $Enums } from "@prisma/client";
import { revalidatePath } from "next/cache";

type Position = "PITCHER" | "CATCHER" | "INFIELDER" | "OUTFIELDER" | "OTHER";
type Side = "RIGHT" | "LEFT";
type Batting = "RIGHT" | "LEFT" | "SWITCH";

function mapPosition(p: string): Position {
  const positionMap: Record<string, Position> = {
    "投手": "PITCHER",
    "捕手": "CATCHER", 
    "内野手": "INFIELDER",
    "外野手": "OUTFIELDER",
    "その他": "OTHER"
  };
  return positionMap[p] || "OTHER";
}

function mapSide(s: string): Side { 
  return s === "右" ? "RIGHT" : "LEFT"; 
}

function mapBat(b: string): Batting { 
  const battingMap: Record<string, Batting> = {
    "右": "RIGHT",
    "左": "LEFT", 
    "両": "SWITCH"
  };
  return battingMap[b] || "RIGHT";
}

export async function createAssessmentAction(values: AssessmentFormValues, athleteId?: string) {
  const { fatMassKg, leanMassKg, leanBodyIndex } = computeComposition(values.heightCm, values.weightKg, values.bodyFatPercent);

  let athlete = athleteId ? await prisma.athlete.findUnique({ where: { id: athleteId } }) : null;
  if (!athlete) {
    athlete = await prisma.athlete.create({
      data: {
        name: values.name,
        team: values.team ?? null,
        position: mapPosition(values.position),
        throwingSide: mapSide(values.throwingSide),
        batting: mapBat(values.batting),
        heightCm: values.heightCm,
        weightKg: values.weightKg,
        bodyFatPercent: values.bodyFatPercent,
      },
    });
  }

  const assessment = await prisma.assessment.create({
    data: {
      athleteId: athlete.id,
      date: new Date(),
      fatMassKg,
      leanMassKg,
      leanBodyIndex,
      swingSpeed: values.swingSpeed ?? null,
      notes: null,
    },
  });

  const romRows: Prisma.RomCreateManyInput[] = Object.entries(values.rom).flatMap(([movementKey, sides]) => {
    const movement = movementKey as Movement;
    const right = sides.RIGHT;
    const left = sides.LEFT;
    const rows: Prisma.RomCreateManyInput[] = [];
    if (typeof right === "number") rows.push({ assessmentId: assessment.id, movement: movement as unknown as $Enums.Movement, side: "RIGHT" as $Enums.BodySide, valueDeg: right });
    if (typeof left === "number") rows.push({ assessmentId: assessment.id, movement: movement as unknown as $Enums.Movement, side: "LEFT" as $Enums.BodySide, valueDeg: left });
    return rows;
  });
  
  if (romRows.length) {
    await prisma.rom.createMany({ data: romRows });
  }

  redirect(`/assessments/${assessment.id}/fbs`);
}

// 選手と関連データ（Assessment/Rom）を削除
export async function deleteAthleteAction(athleteId: string) {
  if (!athleteId) return;
  await prisma.$transaction(async (tx) => {
    const assessments = await tx.assessment.findMany({ where: { athleteId }, select: { id: true } });
    const assessmentIds = assessments.map((a) => a.id);
    if (assessmentIds.length > 0) {
      await tx.rom.deleteMany({ where: { assessmentId: { in: assessmentIds } } });
      await tx.assessment.deleteMany({ where: { id: { in: assessmentIds } } });
    } else {
      await tx.assessment.deleteMany({ where: { athleteId } });
    }
    await tx.athlete.delete({ where: { id: athleteId } });
  });
  // 一覧を更新
  revalidatePath("/");
}
