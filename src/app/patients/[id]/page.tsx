export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';

import { prisma } from "@/lib/db";
import { getCurrentClinicId } from "@/lib/tenant";

export default async function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const clinicId = getCurrentClinicId();
  const patient = await prisma.patient.findFirst({ where: { id, clinicId } });
  if (!patient) return <main className="p-6">Not found</main>;
  return (
    <main className="p-6 space-y-2">
      <h1 className="text-2xl font-bold">{patient.fullName}</h1>
      <div className="text-sm text-muted-foreground">タグ: {(patient.tags ?? []).join(', ') || '-'}</div>
      <div className="text-sm">電話: {patient.phone ?? '-'}</div>
      <div className="text-sm">メール: {patient.email ?? '-'}</div>
    </main>
  );
}


