import { isAuthenticated, logoutAction, loginAction } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardGate() {
  const authed = isAuthenticated();

  return (
    <main className="p-6 space-y-4">
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base">ダッシュボード</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!authed ? (
            <form action={loginAction} className="flex gap-3">
              <Button type="submit">ログイン</Button>
              <Link href="/">またはゲスト閲覧</Link>
            </form>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="text-sm text-muted-foreground">ログイン済み</div>
              <div className="flex flex-wrap gap-2">
                <Button asChild><Link href="/athletes">選手一覧へ</Link></Button>
                <Button asChild variant="outline"><Link href="/billing">サブスク管理へ</Link></Button>
                <form action={logoutAction}>
                  <Button type="submit" variant="ghost">ログアウト</Button>
                </form>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}


