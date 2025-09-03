export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";
export const fetchCache = "force-no-store";

type SP = Record<string, string | string[] | undefined>;

import { prisma } from "@/lib/db";
import AssessmentClient from "./AssessmentClient";

export default async function NewAssessmentPage(
  props: { searchParams?: Promise<SP> }
) {
  const sp = (await props.searchParams) ?? {};
  const raw = sp.athleteId;
  const athleteId = Array.isArray(raw) ? (raw[0] ?? undefined) : raw;

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
