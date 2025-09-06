import { isAuthenticated, logoutAction, loginAction } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardGate() {
  const authed = await isAuthenticated();

  return (
    <main className="p-6 space-y-4">
      <Card className="border-black/40">
        <CardHeader className="py-3">
          <CardTitle className="text-base">ダッシュボード</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!authed ? (
            <div className="flex items-center gap-3">
              <Button asChild className="min-w-28 text-black bg-black/0 border border-black hover:bg-black hover:text-white"><Link href="/auth/login">ログイン</Link></Button>
              <Button asChild variant="outline" className="min-w-28 text-black border-black hover:bg-black hover:text-white"><Link href="/auth/register">新規登録</Link></Button>
              <Link href="/">またはゲスト閲覧</Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="text-sm text-muted-foreground">ログイン済み</div>
              <div className="flex flex-wrap gap-2">
                <Button asChild className="min-w-32 text-black bg-black/0 border border-black hover:bg-black hover:text-white"><Link href="/athletes">選手一覧へ</Link></Button>
                <Button asChild variant="outline" className="min-w-32 text-black border-black hover:bg-black hover:text-white"><Link href="/billing">サブスク管理へ</Link></Button>
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


