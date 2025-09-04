import { prisma } from "@/lib/db";
import { FbsReport } from "@/components/fbs/FbsReport";
import type { Rom, Athlete as ReportAthlete, Assessment as ReportAssessment, ThrowingJp, BattingJp, Movement, Mark3 } from "@/lib/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { $Enums } from "@prisma/client";

function positionToJp(p: string): string {
  const map: Record<string,string> = {
    PITCHER: "投手",
    CATCHER: "捕手",
    INFIELDER: "内野手",
    OUTFIELDER: "外野手",
    OTHER: "その他",
  };
  return map[p] ?? p;
}

function toMark3(m: $Enums.Mark3 | null): Mark3 | undefined {
  return (m ?? undefined) as unknown as Mark3 | undefined;
}

export default async function FbsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const a = await prisma.assessment.findUnique({ where: { id }, include: { athlete: true } });
  if (!a) return <div className="p-6">Not found</div>;
  const rom = await prisma.rom.findMany({ where: { assessmentId: a.id } });
  const targetRows = await prisma.romTarget.findMany({ where: { athleteId: a.athlete.id } });
  const targets = Object.fromEntries(targetRows.map(t => [t.movement as unknown as Movement, t.targetDeg])) as Partial<Record<Movement, number>>;

  const throwingSide: ThrowingJp = a.athlete.throwingSide === "RIGHT" ? "右" : "左";
  const batting: BattingJp = a.athlete.batting === "SWITCH" ? "両" : a.athlete.batting === "RIGHT" ? "右" : "左";

  const athlete: ReportAthlete = {
    name: a.athlete.name,
    team: a.athlete.team,
    position: positionToJp(a.athlete.position),
    throwingSide,
    batting,
    heightCm: a.athlete.heightCm,
    weightKg: a.athlete.weightKg,
    bodyFatPercent: a.athlete.bodyFatPercent,
  };

  const assessment: ReportAssessment = {
    id: a.id,
    date: a.date.toISOString(),
    fatMassKg: a.fatMassKg,
    leanMassKg: a.leanMassKg,
    leanBodyIndex: a.leanBodyIndex,
    swingSpeed: a.swingSpeed,
    notes: a.notes ?? undefined,
    openHipMark: toMark3(a.openHipMark),
    bridgeMark: toMark3(a.bridgeMark),
    forwardBendMark: toMark3(a.forwardBendMark),
    medicineBallThrow: a.medicineBallThrow ?? undefined,
    verticalJumpCm: a.verticalJumpCm ?? undefined,
    tripleBroadJumpM: a.tripleBroadJumpM ?? undefined,
    squatWeightKg: a.squatWeightKg ?? undefined,
  };

  return (
    <main className="p-4">
      <FbsReport athlete={athlete} assessment={assessment} roms={rom as Rom[]} targets={targets} />
      <div className="mt-6 flex justify-center print:hidden">
        <Button asChild>
          <Link href="/">ホームに戻る</Link>
        </Button>
      </div>
    </main>
  );
}
