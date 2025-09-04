export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';

import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import ClientRefGuard from "@/components/ClientRefGuard";
import DashboardClient from "@/components/DashboardClient";
import { deleteAthleteAction } from "@/lib/actions";

export default async function DashboardPage() {
  let athletes: Array<{ id: string; name: string; team: string | null; position: string; throwingSide: string; batting: string }>; 
  try {
    athletes = await prisma.athlete.findMany({ orderBy: { createdAt: "desc" } });
  } catch (e) {
    // フォールバック: DB未設定や接続失敗でもレンダリングを継続
    console.error("DB error in / (athlete list):", e);
    athletes = [];
  }
  const hasDbError = athletes.length === 0;

  return (
    <DashboardClient>
      <main className="p-6 space-y-4">
        <ClientRefGuard />
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">選手一覧</h1>
          <Button asChild>
            <Link href="/athletes/new">新規作成</Link>
          </Button>
        </div>
        {hasDbError && (
          <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
            データベースに接続できませんでした。環境変数 DATABASE_URL を設定してください。
          </div>
        )}
        <div className="border rounded">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-3 py-2 text-left">氏名</th>
                <th className="px-3 py-2">チーム</th>
                <th className="px-3 py-2">ポジション</th>
                <th className="px-3 py-2">投球側</th>
                <th className="px-3 py-2">打席</th>
                <th className="px-3 py-2 w-32">操作</th>
              </tr>
            </thead>
            <tbody>
              {athletes.map(a => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="px-3 py-2 text-blue-600 underline"><Link href={`/athletes/${a.id}`}>{a.name}</Link></td>
                  <td className="px-3 py-2 text-center">{a.team ?? "-"}</td>
                  <td className="px-3 py-2 text-center">{a.position}</td>
                  <td className="px-3 py-2 text-center">{a.throwingSide}</td>
                  <td className="px-3 py-2 text-center">{a.batting}</td>
                  <td className="px-3 py-2 text-center">
                    <form action={async () => {
                      'use server';
                      // 二重送信・誤操作防止のため確認
                      // サーバーアクションでは confirm は使えないので、ここでは即削除。
                      await deleteAthleteAction(a.id);
                    }}>
                      <Button type="submit" variant="destructive" size="sm">削除</Button>
                    </form>
                  </td>
                </tr>
              ))}
              {athletes.length === 0 && (
                <tr>
                  <td className="px-3 py-6 text-center text-slate-500" colSpan={6}>データがありません</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </DashboardClient>
  );
}
