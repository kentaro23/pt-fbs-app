"use client";

import { useSearchParams } from "next/navigation";
import { registerAction } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
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
          {e === "tb" && <div className="text-sm text-red-600">ユーザーテーブルの初期化に失敗しました。</div>}
          {e === "user_table_missing" && <div className="text-sm text-red-600">ユーザーテーブルが見つかりません。管理者に連絡してください。</div>}
          {e === "col" && <div className="text-sm text-red-600">パスワード保存欄の準備に失敗しました。</div>}
          {e === "hash" && <div className="text-sm text-red-600">パスワードの暗号化に失敗しました。</div>}
          {e === "insert" && <div className="text-sm text-red-600">ユーザー作成に失敗しました。別のメールでお試しください。</div>}
          {e === "noenv" && <div className="text-sm text-red-600">環境変数 DATABASE_URL が未設定です。管理者に連絡してください。</div>}
          {e?.startsWith("db_") && <div className="text-sm text-red-600">登録時にエラーが発生しました（{e.replace("db_","") }）。管理者に連絡してください。</div>}
          {e === "exists" && <div className="text-sm text-red-600">このメールは既に登録されています。</div>}
          <form action={registerAction} className="space-y-3">
            <div>
              <label className="block text-sm">メールアドレス</label>
              <Input name="email" type="email" required autoComplete="email" />
            </div>
            <div>
              <label className="block text-sm">氏名</label>
              <Input name="name" type="text" required autoComplete="name" />
            </div>
            <div>
              <label className="block text-sm">パスワード</label>
              <Input name="password" type="password" required autoComplete="new-password" />
            </div>
            <SubmitButton submittingText="登録中..." className="w-full text-black bg-black/0 border border-black hover:bg-black hover:text-white">
              登録
            </SubmitButton>
          </form>
          <div className="text-sm">
            既にアカウントがある方は <Link href="/auth/login" className="underline">ログイン</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


