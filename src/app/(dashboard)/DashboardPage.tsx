export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';

import Link from "next/link";
import LandingHero from "@/components/landing/LandingHero";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ClientRefGuard from "@/components/ClientRefGuard";
import DashboardClient from "@/components/DashboardClient";
import { deleteAthleteAction } from "@/lib/actions";
import type { $Enums, Prisma } from "@prisma/client";

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

type SP = Record<string, string | string[] | undefined>;

export default async function DashboardPage(props?: { searchParams?: SP }) {
  const sp: SP = props?.searchParams ?? {};
  const pick = (k: string): string => {
    const v = sp[k];
    return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
  };

  const q = pick("q").trim();
  const posSp = pick("pos");
  const sideSp = pick("side");
  const batSp = pick("bat");
  const sort = pick("sort") || "createdAt_desc";
  const page = Math.max(1, Number.parseInt(pick("page") || "1", 10) || 1);
  const limit = Math.min(50, Math.max(5, Number.parseInt(pick("limit") || "10", 10) || 10));

  const normalizeAll = (v: string) => (v === "__all" ? "" : v);
  const posJp = normalizeAll(posSp);
  const sideJp = normalizeAll(sideSp);
  const batJp = normalizeAll(batSp);

  const positionMap: Record<string, $Enums.Position> = {
    "投手": "PITCHER",
    "捕手": "CATCHER",
    "内野手": "INFIELDER",
    "外野手": "OUTFIELDER",
    "その他": "OTHER",
  };
  const sideMap: Record<string, $Enums.ThrowingSide> = { "右": "RIGHT", "左": "LEFT" };
  const batMap: Record<string, $Enums.Batting> = { "右": "RIGHT", "左": "LEFT", "両": "SWITCH" };

  const where: Prisma.AthleteWhereInput = {
    AND: [
      q
        ? {
            OR: [
              { name: { contains: q } },
              { team: { contains: q } },
            ],
          }
        : {},
      posJp ? { position: positionMap[posJp] } : {},
      sideJp ? { throwingSide: sideMap[sideJp] } : {},
      batJp ? { batting: batMap[batJp] } : {},
    ],
  };

  const orderBy: Prisma.AthleteOrderByWithRelationInput =
    sort === "name_asc"
      ? { name: "asc" }
      : sort === "name_desc"
      ? { name: "desc" }
      : sort === "createdAt_asc"
      ? { createdAt: "asc" }
      : { createdAt: "desc" };

  let athletes: Array<{ id: string; name: string; team: string | null; position: string; throwingSide: string; batting: string }> = [];
  let total = 0;
  let hasDbError = false;
  try {
    [total, athletes] = await prisma.$transaction([
      prisma.athlete.count({ where }),
      prisma.athlete.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit }),
    ]);
  } catch (e) {
    console.error("DB error in / (athlete list):", e);
    hasDbError = true;
  }
  const totalPages = Math.max(1, Math.ceil(total / limit));

  // クエリ文字列生成（undefinedや空文字/__all は除外）
  const buildQS = (base: SP, overrides: Record<string, string>) => {
    const usp = new URLSearchParams();
    Object.entries(base).forEach(([k, v]) => {
      const val = Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
      if (val.length && val !== "__all") usp.set(k, val);
    });
    Object.entries(overrides).forEach(([k, v]) => usp.set(k, v));
    return usp.toString();
  };

  return (
    <DashboardClient>
      <main className="p-6 space-y-6">
        <LandingHero />
        <ClientRefGuard />
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">選手一覧</h1>
          <Button asChild>
            <Link href="/athletes/new">新規作成</Link>
          </Button>
        </div>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base">検索/フィルタ</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid grid-cols-1 md:grid-cols-5 gap-3" method="GET">
              <Input name="q" placeholder="氏名 / チーム" defaultValue={q} className="md:col-span-2 border-black/40" />
              <Select name="pos" defaultValue={posSp || undefined}>
                <SelectTrigger className="border-black/40"><SelectValue placeholder="ポジション" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">すべて</SelectItem>
                  <SelectItem value="投手">投手</SelectItem>
                  <SelectItem value="捕手">捕手</SelectItem>
                  <SelectItem value="内野手">内野手</SelectItem>
                  <SelectItem value="外野手">外野手</SelectItem>
                  <SelectItem value="その他">その他</SelectItem>
                </SelectContent>
              </Select>
              <Select name="side" defaultValue={sideSp || undefined}>
                <SelectTrigger className="border-black/40"><SelectValue placeholder="投球側" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">すべて</SelectItem>
                  <SelectItem value="右">右</SelectItem>
                  <SelectItem value="左">左</SelectItem>
                </SelectContent>
              </Select>
              <Select name="bat" defaultValue={batSp || undefined}>
                <SelectTrigger className="border-black/40"><SelectValue placeholder="打席" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">すべて</SelectItem>
                  <SelectItem value="右">右</SelectItem>
                  <SelectItem value="左">左</SelectItem>
                  <SelectItem value="両">両</SelectItem>
                </SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-2">
                <Select name="sort" defaultValue={sort}>
                  <SelectTrigger className="border-black/40"><SelectValue placeholder="並べ替え" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt_desc">新しい順</SelectItem>
                    <SelectItem value="createdAt_asc">古い順</SelectItem>
                    <SelectItem value="name_asc">氏名昇順</SelectItem>
                    <SelectItem value="name_desc">氏名降順</SelectItem>
                  </SelectContent>
                </Select>
                <Select name="limit" defaultValue={String(limit)}>
                  <SelectTrigger className="border-black/40"><SelectValue placeholder="件数/頁" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10件</SelectItem>
                    <SelectItem value="20">20件</SelectItem>
                    <SelectItem value="50">50件</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <input type="hidden" name="page" value="1" />
              <div className="md:col-span-5 flex gap-2">
                <Button type="submit" className="text-black bg-black/0 border border-black hover:bg-black hover:text-white">適用</Button>
                <Button type="reset" asChild variant="outline" className="text-black border-black hover:bg-black hover:text-white">
                  <Link href="/">リセット</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        {hasDbError && (
          <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
            データベースに接続できませんでした。環境変数 DATABASE_URL を設定してください。
          </div>
        )}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-3">
            <CardTitle className="text-base">選手</CardTitle>
            <div className="text-xs text-muted-foreground">{hasDbError ? 0 : total}名</div>
          </CardHeader>
          <CardContent className="p-0">
            <Table className="border border-black/40 rounded-md overflow-hidden">
              <TableHeader>
                <TableRow className="bg-slate-50/70 border-b border-black">
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
                  <TableRow key={a.id} className="hover:bg-accent/40 odd:bg-muted/30 border-b border-black/10">
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
                {(!athletes || athletes.length === 0) && (
                  <TableRow>
                    <TableCell className="py-8 text-center text-slate-500" colSpan={6}>データがありません</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        {!hasDbError && totalPages > 1 && (
          <div className="flex items-center justify-between text-sm">
            <div className="text-muted-foreground">
              {(total === 0)
                ? "0件"
                : `${(page - 1) * limit + 1}–${Math.min(page * limit, total)} / ${total}件`}
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" disabled={page <= 1}>
                <Link href={`/?${buildQS(sp, { page: String(page - 1) })}`}>前へ</Link>
              </Button>
              <Button asChild variant="outline" disabled={page >= totalPages}>
                <Link href={`/?${buildQS(sp, { page: String(page + 1) })}`}>次へ</Link>
              </Button>
            </div>
          </div>
        )}
      </main>
    </DashboardClient>
  );
}
