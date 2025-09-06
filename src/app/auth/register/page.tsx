"use client";

import { useSearchParams } from "next/navigation";
import { registerAction } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";

export default function RegisterPage() {
  const sp = useSearchParams();
  const e = sp.get("e");
  const [sub, setSub] = useState(false);
  return (
    <div className="container-app max-w-md mx-auto py-8">
      <Card className="card-surface">
        <CardHeader>
          <CardTitle>新規登録</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {e === "missing" && <div className="text-sm text-red-600">氏名・メール・パスワードは必須です。</div>}
          {e === "db" && <div className="text-sm text-red-600">登録時にエラーが発生しました。時間をおいてお試しください。</div>}
          {e === "exists" && <div className="text-sm text-red-600">このメールは既に登録されています。</div>}
          <form action={async (fd: FormData) => { setSub(true); await registerAction(fd); }} className="space-y-3">
            <div>
              <label className="block text-sm">メールアドレス</label>
              <Input name="email" type="email" required autoComplete="email" />
            </div>
            <div>
              <label className="block text-sm">氏名（任意）</label>
              <Input name="name" type="text" required autoComplete="name" />
            </div>
            <div>
              <label className="block text-sm">パスワード</label>
              <Input name="password" type="password" required autoComplete="new-password" />
            </div>
            <Button type="submit" disabled={sub} className="w-full text-black bg-black/0 border border-black hover:bg-black hover:text-white">
              {sub ? "登録中..." : "登録"}
            </Button>
          </form>
          <div className="text-sm">
            既にアカウントがある方は <Link href="/auth/login" className="underline">ログイン</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


