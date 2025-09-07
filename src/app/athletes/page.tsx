import { isAuthenticated, requireUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardPage from "../(dashboard)/DashboardPage";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';

export default async function AthletesPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await requireUser();
  const sp = (await searchParams) ?? {};
  // DashboardPage 側は全件取得しているため、ここで userId 絞り込みのために環境を用意するなら
  // 既存のUIを保持するためにDashboardPageのクエリには手を入れず、当面はアクセスゲートのみ。
  // 本来は findMany の where に { userId: user.id } を適用するのが理想。
  return <DashboardPage searchParams={sp} />;
}


