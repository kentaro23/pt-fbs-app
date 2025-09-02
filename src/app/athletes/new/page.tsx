import { AthleteForm, type AthleteFormValues } from "@/components/forms/AthleteForm";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

async function createAthleteAction(values: AthleteFormValues) {
  "use server";
  const positionMap = { "投手": "PITCHER", "捕手": "CATCHER", "内野手": "INFIELDER", "外野手": "OUTFIELDER", "その他": "OTHER" } as const;
  const sideMap = { "右": "RIGHT", "左": "LEFT" } as const;
  const battingMap = { "右": "RIGHT", "左": "LEFT", "両": "SWITCH" } as const;

  const athlete = await prisma.athlete.create({
    data: {
      name: values.name,
      team: values.team ?? null,
      position: positionMap[values.position],
      throwingSide: sideMap[values.throwingSide],
      batting: battingMap[values.batting],
      heightCm: values.heightCm,
      weightKg: values.weightKg,
      bodyFatPercent: values.bodyFatPercent,
    },
  });
  redirect(`/athletes/${athlete.id}`);
}

export default function NewAthletePage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">選手作成</h1>
      <AthleteForm onSubmit={createAthleteAction} />
    </main>
  );
}
