export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';

import ClientRefGuard from "@/components/ClientRefGuard";
import ClientReferenceMarker from "@/components/ClientReferenceMarker";
import DashboardPage from "./(dashboard)/DashboardPage";

export default async function Page() {
  return (
    <>
      <ClientRefGuard />
      <ClientReferenceMarker />
      <DashboardPage />
    </>
  );
}
