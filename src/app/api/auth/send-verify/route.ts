import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createVerificationToken } from "@/lib/verify";
import { sendVerificationEmail } from "@/lib/mail";

export const runtime = "nodejs";

export async function POST() {
  const user = await requireUser();
  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { email: true } });
  if (!dbUser?.email) {
    return NextResponse.json({ ok: false, error: "email_not_found" }, { status: 400 });
  }
  const base = process.env.NEXT_PUBLIC_APP_URL || "";
  const { rawToken } = await createVerificationToken(user.id, 30);
  const url = `${base}/auth/verify?token=${encodeURIComponent(rawToken)}`;
  await sendVerificationEmail(dbUser.email, url);
  return NextResponse.json({ ok: true });
}
