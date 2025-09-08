import { AthleteForm, type AthleteFormValues } from "@/components/forms/AthleteForm";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import type { $Enums } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { assertAthleteCreateAllowed } from "@/lib/subscription";

async function createAthleteAction(values: AthleteFormValues) {
  "use server";
  const user = await requireUser();
  await assertAthleteCreateAllowed(user.id);
  const positionMap = { "投手": "PITCHER", "捕手": "CATCHER", "内野手": "INFIELDER", "外野手": "OUTFIELDER", "その他": "OTHER" } as const;
  const infieldMap = { "一塁手": "FIRST_BASE", "二塁手": "SECOND_BASE", "三塁手": "THIRD_BASE", "遊撃手": "SHORTSTOP" } as const;
  const sideMap = { "右": "RIGHT", "左": "LEFT" } as const;
  const battingMap = { "右": "RIGHT", "左": "LEFT", "両": "SWITCH" } as const;

  const athlete = await prisma.athlete.create({
    data: {
      name: values.name,
      team: values.team ?? null,
      position: positionMap[values.position],
      infieldPosition: values.infieldPosition ? infieldMap[values.infieldPosition] : null,
      throwingSide: sideMap[values.throwingSide],
      batting: battingMap[values.batting],
      heightCm: values.heightCm,
      weightKg: values.weightKg,
      bodyFatPercent: values.bodyFatPercent,
      userId: user.id,
    },
  });

  // 目標ROMを保存
  if (values.targets) {
    const entries = Object.entries(values.targets).filter(([, v]) => typeof v === "number") as Array<[string, number]>;
    if (entries.length) {
      await prisma.romTarget.createMany({
        data: entries.map(([movement, targetDeg]) => ({ athleteId: athlete.id, movement: movement as $Enums.Movement, targetDeg })),
        skipDuplicates: true,
      });
    }
  }

  // 保存後は初回Assessment入力へ
  redirect(`/assessments/new?athleteId=${athlete.id}`);
}

export default function NewAthletePage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">選手作成</h1>
      <AthleteForm onSubmit={createAthleteAction} />
    </main>
  );
}
