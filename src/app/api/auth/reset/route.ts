import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { token, password } = await req.json();
  const rec = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!rec || rec.expiresAt < new Date()) {
    return NextResponse.json({ ok:false, error:"invalid_or_expired" }, { status: 400 });
  }
  const hash = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { id: rec.userId }, data: { passwordHash: hash } });
  await prisma.passwordResetToken.delete({ where: { token } });
  return NextResponse.json({ ok: true });
}
