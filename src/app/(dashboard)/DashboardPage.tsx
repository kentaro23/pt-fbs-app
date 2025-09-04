export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';

import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ClientRefGuard from "@/components/ClientRefGuard";
import DashboardClient from "@/components/DashboardClient";
import { deleteAthleteAction } from "@/lib/actions";

function positionToJp(p: string): string {
  const map: Record<string,string> = {
    PITCHER: "投手",
    CATCHER: "捕手",
    INFIELDER: "内野手",
    OUTFIELDER: "外野手",
    OTHER: "その他",
  };
  return map[p] ?? p;
}

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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-3">
            <CardTitle className="text-base">選手</CardTitle>
            <div className="text-xs text-muted-foreground">{athletes.length}名</div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/70">
                  <TableHead className="text-left">氏名</TableHead>
                  <TableHead className="text-center">チーム</TableHead>
                  <TableHead className="text-center">ポジション</TableHead>
                  <TableHead className="text-center">投球側</TableHead>
                  <TableHead className="text-center">打席</TableHead>
                  <TableHead className="w-32 text-center">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {athletes.map(a => (
                  <TableRow key={a.id} className="hover:bg-accent/40">
                    <TableCell className="text-left">
                      <Link href={`/athletes/${a.id}`} className="text-primary font-medium hover:underline">
                        {a.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">{a.team ?? "-"}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{positionToJp(a.position)}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{a.throwingSide}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{a.batting}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <form action={async () => {
                        'use server';
                        try {
                          await deleteAthleteAction(a.id);
                        } catch (e) {
                          console.error('Delete failed', e);
                        }
                      }}>
                        <Button type="submit" variant="destructive" size="sm">削除</Button>
                      </form>
                    </TableCell>
                  </TableRow>
                ))}
                {athletes.length === 0 && (
                  <TableRow>
                    <TableCell className="py-8 text-center text-slate-500" colSpan={6}>データがありません</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </DashboardClient>
  );
}
