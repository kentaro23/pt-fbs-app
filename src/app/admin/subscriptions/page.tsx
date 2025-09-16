export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";
export const fetchCache = "force-no-store";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { limitByPlan } from "@/lib/subscription";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function AdminSubscriptionsPage() {
  await requireAdmin();

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      subscription: true,
      _count: { select: { athletes: true } },
    },
    orderBy: { email: "asc" },
  });

  const rows = users.map((u) => {
    const plan = (u.subscription?.plan as ("FREE"|"SOLO"|"CLINIC"|"TEAM") | undefined) ?? "FREE";
    const limit = limitByPlan(plan);
    const used = u._count.athletes;
    const remaining = Math.max(0, limit - used);
    return {
      email: u.email,
      name: u.name ?? "",
      plan,
      status: u.subscription?.status ?? "inactive",
      used,
      limit,
      remaining,
      stripeCustomerId: u.subscription?.stripeCustomerId ?? "",
      createdAt: u.subscription?.createdAt ?? null,
      updatedAt: u.subscription?.updatedAt ?? null,
    } as const;
  });

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">管理者: サブスクリプション一覧</h1>
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base">全ユーザーの契約状況</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="border border-black/40 rounded-md">
              <TableHeader>
                <TableRow className="bg-slate-50/70 border-b border-black/10">
                  <TableHead className="text-left">メール</TableHead>
                  <TableHead className="text-left">氏名</TableHead>
                  <TableHead className="text-center">プラン</TableHead>
                  <TableHead className="text-center">ステータス</TableHead>
                  <TableHead className="text-center">使用数</TableHead>
                  <TableHead className="text-center">上限</TableHead>
                  <TableHead className="text-center">残り</TableHead>
                  <TableHead className="text-left">Stripe Customer</TableHead>
                  <TableHead className="text-left">作成</TableHead>
                  <TableHead className="text-left">更新</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.email} className="hover:bg-accent/40 odd:bg-muted/30 border-b border-black/10">
                    <TableCell className="text-left font-medium">{r.email}</TableCell>
                    <TableCell className="text-left">{r.name || '-'}</TableCell>
                    <TableCell className="text-center">{r.plan}</TableCell>
                    <TableCell className="text-center">{String(r.status)}</TableCell>
                    <TableCell className={`text-center ${r.used >= r.limit ? 'text-red-600 font-semibold' : ''}`}>{r.used}</TableCell>
                    <TableCell className="text-center">{r.limit}</TableCell>
                    <TableCell className={`text-center ${r.remaining <= 0 ? 'text-red-600 font-semibold' : ''}`}>{r.remaining}</TableCell>
                    <TableCell className="text-left text-xs text-muted-foreground">{r.stripeCustomerId || '-'}</TableCell>
                    <TableCell className="text-left text-xs">{r.createdAt ? new Date(r.createdAt).toLocaleString() : '-'}</TableCell>
                    <TableCell className="text-left text-xs">{r.updatedAt ? new Date(r.updatedAt).toLocaleString() : '-'}</TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell className="py-8 text-center text-slate-500" colSpan={10}>データがありません</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}


