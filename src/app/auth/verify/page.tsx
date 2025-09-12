import { redirect } from "next/navigation";
import { consumeVerificationToken } from "@/lib/verify";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function VerifyPage({ searchParams }: { searchParams?: Promise<Record<string,string|string[]|undefined>> }){
  const sp = (await searchParams) ?? {};
  const raw = sp.token;
  const token = Array.isArray(raw) ? raw[0] : raw;
  if (!token) {
    return (
      <div className="p-8 max-w-xl">
        <h1 className="text-xl font-bold mb-2">リンクが無効です</h1>
        <p className="text-gray-600">メール内の最新のリンクをお試しください。</p>
      </div>
    );
  }
  const user = await consumeVerificationToken(token);
  if (!user) {
    return (
      <div className="p-8 max-w-xl">
        <h1 className="text-xl font-bold mb-2">リンクが無効または期限切れです</h1>
        <p className="text-gray-600">確認メールの再送をお試しください。</p>
      </div>
    );
  }
  await prisma.user.update({ where: { id: user.id }, data: { emailVerifiedAt: new Date() } });
  // 既存のCookieセッションを維持/設定する仕様に合わせるならここでセットも可
  redirect("/");
}
