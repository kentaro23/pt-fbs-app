export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';

import ClientRefGuard from "@/components/ClientRefGuard";
import DashboardGate from "./(dashboard)/DashboardGate";
import LandingHero from "@/components/landing/LandingHero";

export default async function Page({ searchParams }: { searchParams?: Promise<Record<string, string | undefined>> }) {
  await searchParams;
  return (
    <>
      <ClientRefGuard />
      <LandingHero />
      <DashboardGate />
    </>
  );
}
