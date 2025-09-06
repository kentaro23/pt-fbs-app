import { isAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';

export default async function BillingPage() {
  if (!(await isAuthenticated())) {
    redirect("/");
  }
  return (
    <main className="p-6 space-y-4">
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base">サブスクリプション管理</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-muted-foreground">将来の課金・プラン管理UIのプレースホルダ</div>
          <Button disabled>プランを変更（準備中）</Button>
        </CardContent>
      </Card>
    </main>
  );
}


