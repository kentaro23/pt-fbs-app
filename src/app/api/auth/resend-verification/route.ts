import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { createVerificationToken } from "@/lib/verify";
import { sendVerificationEmail } from "@/lib/mail";

export const runtime = "nodejs";

// 簡易レート制限: ユーザーごと10分以上経過していれば再送
export async function POST() {
  const sessionUser = await requireUser();
  const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });
  if (!user) return NextResponse.json({ ok: true });
  if (user.emailVerifiedAt) return NextResponse.json({ ok: true, already: true });

  const recent = await prisma.verificationToken.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" }
  });
  if (recent && Date.now() - recent.createdAt.getTime() < 10 * 60_000) {
    return NextResponse.json({ ok: true, rateLimited: true });
  }

  const { rawToken } = await createVerificationToken(user.id, 30);
  const base = process.env.NEXT_PUBLIC_APP_URL || "";
  const url = `${base}/auth/verify?token=${encodeURIComponent(rawToken)}`;
  if (user.email) {
    await sendVerificationEmail(user.email, url);
  }
  return NextResponse.json({ ok: true });
}
