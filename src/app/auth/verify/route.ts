import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token") || "";
  const rec = await prisma.verificationToken.findUnique({ where: { token } });
  if (!rec || rec.expiresAt < new Date()) return NextResponse.redirect("/auth/verify/failure");
  await prisma.user.update({ where: { id: rec.userId }, data: { emailVerified: new Date() } });
  await prisma.verificationToken.delete({ where: { token } });
  return NextResponse.redirect("/auth/verify/success");
}
