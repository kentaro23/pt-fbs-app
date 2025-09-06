import { isAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardPage from "../(dashboard)/DashboardPage";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';

export default async function AthletesPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  if (!isAuthenticated()) {
    redirect("/");
  }
  const sp = (await searchParams) ?? {};
  return <DashboardPage searchParams={sp} />;
}


