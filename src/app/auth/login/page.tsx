"use client";

import { useSearchParams } from "next/navigation";
import { loginPasswordAction } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const sp = useSearchParams();
  const e = sp.get("e");
  const registered = sp.get("registered");
  const [sub, setSub] = useState(false);
  return (
    <div className="container-app max-w-md mx-auto py-8">
      <Card className="card-surface">
        <CardHeader>
          <CardTitle>ログイン</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {registered && <div className="text-sm text-emerald-600">登録が完了しました。ログインしてください。</div>}
          {e === "invalid" && <div className="text-sm text-red-600">メールまたはパスワードが違います。</div>}
          {e === "noenv" && <div className="text-sm text-red-600">環境変数 DATABASE_URL / PRISMA_DATABASE_URL が未設定です。管理者に連絡してください。</div>}
          {e === "db" && <div className="text-sm text-red-600">ログイン時にエラーが発生しました。時間をおいてお試しください。</div>}
          <form action={async (fd: FormData) => { setSub(true); await loginPasswordAction(fd); }} className="space-y-3">
            <div>
              <label className="block text-sm">メールアドレス</label>
              <Input name="email" type="email" required autoComplete="email" />
            </div>
            <div>
              <label className="block text-sm">パスワード</label>
              <Input name="password" type="password" required autoComplete="current-password" />
            </div>
            <Button type="submit" disabled={sub} aria-busy={sub} aria-live="polite" className="w-full text-black bg-black/0 border border-black hover:bg-black hover:text-white">
              {sub ? "送信中..." : "ログイン"}
            </Button>
          </form>
          <div className="text-sm">
            アカウントが無い方は <Link href="/auth/register" className="underline">新規登録</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


