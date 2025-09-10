import crypto from "crypto";
import { prisma } from "@/lib/db";

export const genToken = () => crypto.randomBytes(32).toString("hex");

export async function createVerificationToken(userId: string, ttlMinutes = 60) {
  const token = genToken();
  const expiresAt = new Date(Date.now() + ttlMinutes * 60_000);
  await prisma.verificationToken.create({ data: { userId, token, expiresAt } });
  return { token, expiresAt } as const;
}

export async function createPasswordResetToken(userId: string, ttlMinutes = 60) {
  const token = genToken();
  const expiresAt = new Date(Date.now() + ttlMinutes * 60_000);
  await prisma.passwordResetToken.create({ data: { userId, token, expiresAt } });
  return { token, expiresAt } as const;
}
