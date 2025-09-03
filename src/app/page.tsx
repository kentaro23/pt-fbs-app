export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';

import ClientRefGuard from "@/components/ClientRefGuard";
import DashboardPage from "./(dashboard)/page";

export default async function Page() {
  return (
    <>
      <ClientRefGuard />
      {/* ラップして (dashboard)/page をそのまま表示 */}
      {/* ここはサーバーコンポーネントのまま */}
      <DashboardPage />
    </>
  );
}
