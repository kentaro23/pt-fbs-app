"use server";

import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { computeComposition } from "@/lib/calc";
import { redirect } from "next/navigation";
import type { AssessmentFormValues } from "@/components/forms/AssessmentForm";
import type { Movement } from "@/lib/types";
import type { Prisma, $Enums } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { createVerificationToken } from "@/lib/verify";
import { sendVerificationEmail } from "@/lib/mail";

export async function createAssessmentAction(values: AssessmentFormValues, athleteId?: string) {
  const user = await requireUser();
  const { fatMassKg, leanMassKg, leanBodyIndex } = computeComposition(values.heightCm, values.weightKg, values.bodyFatPercent);

  if (!athleteId) {
    throw new Error("athleteId is required to create assessment");
  }
  const athlete = await prisma.athlete.findFirst({ where: { id: athleteId, userId: user.id } });
  if (!athlete) {
    throw new Error("athlete not found");
  }

  const assessment = await prisma.assessment.create({
    data: {
      athleteId: athlete.id,
      date: new Date(values.measurementDate),
      fatMassKg,
      leanMassKg,
      leanBodyIndex,
      swingSpeed: values.swingSpeed ?? null,
      notes: null,
      // 球速関連 8項目
      openHipMark: values.openHipMark as $Enums.Mark3 | null | undefined,
      bridgeMark: values.bridgeMark as $Enums.Mark3 | null | undefined,
      forwardBendMark: values.forwardBendMark as $Enums.Mark3 | null | undefined,
      medicineBallThrow: values.medicineBallThrow ?? null,
      verticalJumpCm: values.verticalJumpCm ?? null,
      tripleBroadJumpM: values.tripleBroadJumpM ?? null,
      squatWeightKg: values.squatWeightKg ?? null,
      gripRightKg: values.gripRightKg ?? null,
      gripLeftKg: values.gripLeftKg ?? null,
      // Power
      verticalJumpBothCm: values.verticalJumpBothCm ?? null,
      verticalJumpRightCm: values.verticalJumpRightCm ?? null,
      verticalJumpLeftCm: values.verticalJumpLeftCm ?? null,
      medicineBallThrowBackM: values.medicineBallThrowBackM ?? null,
      benchPressKg: values.benchPressKg ?? null,
      sprint10mSec: values.sprint10mSec ?? null,
      sprint30mSec: values.sprint30mSec ?? null,
      ballVelocityKmh: values.ballVelocityKmh ?? null,
      // Strength (左右)
      strength2ndErRight: values.strength2ndErRight ?? null,
      strength2ndErLeft: values.strength2ndErLeft ?? null,
      strength2ndIrRight: values.strength2ndIrRight ?? null,
      strength2ndIrLeft: values.strength2ndIrLeft ?? null,
      strengthBellyPressRight: values.strengthBellyPressRight ?? null,
      strengthBellyPressLeft: values.strengthBellyPressLeft ?? null,
      strengthSerratusAnteriorRight: values.strengthSerratusAnteriorRight ?? null,
      strengthSerratusAnteriorLeft: values.strengthSerratusAnteriorLeft ?? null,
      strengthLowerTrapeziusRight: values.strengthLowerTrapeziusRight ?? null,
      strengthLowerTrapeziusLeft: values.strengthLowerTrapeziusLeft ?? null,
      strengthHipFlexionRight: values.strengthHipFlexionRight ?? null,
      strengthHipFlexionLeft: values.strengthHipFlexionLeft ?? null,
      strengthHipExtensionRight: values.strengthHipExtensionRight ?? null,
      strengthHipExtensionLeft: values.strengthHipExtensionLeft ?? null,
      strengthHipAbductionRight: values.strengthHipAbductionRight ?? null,
      strengthHipAbductionLeft: values.strengthHipAbductionLeft ?? null,
      strengthHipAdductionRight: values.strengthHipAdductionRight ?? null,
      strengthHipAdductionLeft: values.strengthHipAdductionLeft ?? null,
      strengthHipErRight: values.strengthHipErRight ?? null,
      strengthHipErLeft: values.strengthHipErLeft ?? null,
      strengthHipIrRight: values.strengthHipIrRight ?? null,
      strengthHipIrLeft: values.strengthHipIrLeft ?? null,
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

// 選手と関連データ（Assessment/Rom/RomTarget）を削除
export async function deleteAthleteAction(athleteId: string) {
  if (!athleteId) return;
  try {
    await prisma.$transaction(async (tx) => {
      // 目標ROM
      await tx.romTarget.deleteMany({ where: { athleteId } });
      // Assessment と Rom
      const assessments = await tx.assessment.findMany({ where: { athleteId }, select: { id: true } });
      const assessmentIds = assessments.map((a) => a.id);
      if (assessmentIds.length > 0) {
        await tx.rom.deleteMany({ where: { assessmentId: { in: assessmentIds } } });
        await tx.assessment.deleteMany({ where: { id: { in: assessmentIds } } });
      } else {
        await tx.assessment.deleteMany({ where: { athleteId } });
      }
      // Athlete
      await tx.athlete.delete({ where: { id: athleteId } });
    });
  } catch (e) {
    console.error("deleteAthleteAction failed:", e);
    throw e;
  } finally {
    revalidatePath("/");
  }
}
