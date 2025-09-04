import { prisma } from "@/lib/db";
import { FbsReport } from "@/components/fbs/FbsReport";
import type { Rom, Athlete as ReportAthlete, Assessment as ReportAssessment, ThrowingJp, BattingJp } from "@/lib/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function FbsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const a = await prisma.assessment.findUnique({ where: { id }, include: { athlete: true } });
  if (!a) return <div className="p-6">Not found</div>;
  const rom = await prisma.rom.findMany({ where: { assessmentId: a.id } });

  const throwingSide: ThrowingJp = a.athlete.throwingSide === "RIGHT" ? "右" : "左";
  const batting: BattingJp = a.athlete.batting === "SWITCH" ? "両" : a.athlete.batting === "RIGHT" ? "右" : "左";

  const athlete: ReportAthlete = {
    name: a.athlete.name,
    team: a.athlete.team,
    position: a.athlete.position,
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
  };

  return (
    <main className="p-4">
      <FbsReport athlete={athlete} assessment={assessment} roms={rom as Rom[]} />
      <div className="mt-6 flex justify-center print:hidden">
        <Button asChild>
          <Link href="/">ホームに戻る</Link>
        </Button>
      </div>
    </main>
  );
}
