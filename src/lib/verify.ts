import crypto from "crypto";
import { prisma } from "@/lib/db";

function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function toBase64Url(bytes: Buffer): string {
  return bytes.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function createVerificationToken(userId: string, ttlMinutes = 30) {
  const rawToken = toBase64Url(crypto.randomBytes(32));
  const tokenHash = sha256(rawToken);
  const expiresAt = new Date(Date.now() + ttlMinutes * 60_000);
  // クリーンアップ（期限切れ or 同一ユーザーの古いレコード）
  await prisma.verificationToken.deleteMany({ where: { OR: [{ userId }, { expiresAt: { lt: new Date() } }] } });
  await prisma.verificationToken.create({ data: { userId, tokenHash, expiresAt } });
  return { rawToken, expiresAt } as const;
}

export async function consumeVerificationToken(rawToken: string) {
  if (!rawToken) return null;
  const tokenHash = sha256(rawToken);
  const rec = await prisma.verificationToken.findUnique({ where: { tokenHash } });
  if (!rec) return null;
  if (rec.expiresAt < new Date()) {
    await prisma.verificationToken.delete({ where: { tokenHash } });
    return null;
  }
  await prisma.verificationToken.delete({ where: { tokenHash } });
  const user = await prisma.user.findUnique({ where: { id: rec.userId } });
  return user;
}
