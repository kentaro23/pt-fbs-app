export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';

import ClientRefGuard from "@/components/ClientRefGuard";
import DashboardGate from "./(dashboard)/DashboardGate";

export default async function Page({ searchParams }: { searchParams?: Promise<Record<string, string | undefined>> }) {
  const sp = (await searchParams) ?? {};
  return (
    <>
      <ClientRefGuard />
      <DashboardGate />
    </>
  );
}
