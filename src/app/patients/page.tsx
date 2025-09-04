export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';

import { prisma } from "@/lib/db";
import { getCurrentClinicId } from "@/lib/tenant";

export default async function PatientsPage() {
  const clinicId = getCurrentClinicId();
  const patients = await prisma.patient.findMany({ where: { clinicId }, orderBy: { createdAt: "desc" } });
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">患者一覧</h1>
      <div className="border rounded">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-3 py-2 text-left">氏名</th>
              <th className="px-3 py-2">タグ</th>
              <th className="px-3 py-2">連絡先</th>
            </tr>
          </thead>
          <tbody>
            {patients.map(p => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-3 py-2">{p.fullName}</td>
                <td className="px-3 py-2 text-center">{(p.tags ?? []).join(', ')}</td>
                <td className="px-3 py-2 text-center">{p.phone ?? p.email ?? '-'}</td>
              </tr>
            ))}
            {patients.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-center text-slate-500" colSpan={3}>データがありません</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}


