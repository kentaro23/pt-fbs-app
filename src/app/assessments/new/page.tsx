import { prisma } from "@/lib/db";
import AssessmentClient from "./AssessmentClient";

export default async function NewAssessmentPage({ searchParams }: { searchParams: { athleteId?: string } }) {
  const athleteId = searchParams.athleteId;
  let athleteName: string | undefined;
  if (athleteId) {
    try {
      const athlete = await prisma.athlete.findUnique({ where: { id: athleteId }, select: { name: true } });
      athleteName = athlete?.name ?? undefined;
    } catch {
      athleteName = undefined;
    }
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">測定データ入力</h1>
      <AssessmentClient athleteId={athleteId} athleteName={athleteName} />
    </main>
  );
}
