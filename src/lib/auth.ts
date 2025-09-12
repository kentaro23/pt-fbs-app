"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { createVerificationToken } from "@/lib/verify";
import { sendVerificationEmail } from "@/lib/mail";

type RedirectLike = { digest?: unknown };
function hasDigest(err: unknown): err is RedirectLike {
  return typeof err === 'object' && err !== null && 'digest' in (err as Record<string, unknown>);
}
function isRedirectError(err: unknown): boolean {
  try {
    // Next.js redirect() throws an error object that has a digest
    return hasDigest(err);
  } catch {
    return false;
  }
}

function classifyDbError(err: unknown): string {
  if (err instanceof Error) {
    const m = err.message.toLowerCase();
    if (m.includes('permission') || m.includes('denied')) return 'perm';
    if (m.includes('authentication') || m.includes('password')) return 'auth';
    if (m.includes('relation') && m.includes('does not exist')) return 'notable';
    if (m.includes('timeout')) return 'timeout';
    if (m.includes('ecconn') || m.includes('econn') || m.includes('refused') || m.includes('host') || m.includes('enotfound')) return 'network';
  }
  return 'unknown';
}

export async function loginAction(_: FormData) {
  const c = await cookies();
  const sessionId = Math.random().toString(36).slice(2) + Date.now().toString(36);
  c.set("session", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  redirect("/");
}

export async function logoutAction() {
  const c = await cookies();
  c.delete("session");
  redirect("/");
}

export async function isAuthenticated(): Promise<boolean> {
  const c = await cookies();
  return Boolean(c.get("session")?.value);
}

// 最小限の現在ユーザー取得（Cookieに uid: を格納している前提）
export async function getCurrentUser(): Promise<{ id: string; email: string } | null> {
  const c = await cookies();
  const v = c.get("session")?.value || "";
  if (v.startsWith("uid:")) {
    return { id: v.slice(4), email: "" };
  }
  return null;
}

export async function requireUser() {
  const u = await getCurrentUser();
  if (!u) redirect("/auth/login");
  return u;
}

// 管理者だけに限定されたページ用のガード
export async function requireAdmin() {
  const u = await requireUser();
  const dbUser = await prisma.user.findUnique({ where: { id: u.id }, select: { email: true } });
  if (!dbUser || dbUser.email !== "kentaro20040623@gmail.com") redirect("/");
  return { id: u.id, email: dbUser.email };
}
// NOTE: スキーマ作成は本番で `prisma migrate deploy` もしくは `prisma db push` を実行してください。

// Username(email) + password registration
export async function registerAction(formData: FormData) {
  try {
    if (!process.env.DATABASE_URL) {
      redirect("/auth/register?e=noenv");
    }
    const email = (formData.get("email") ?? "").toString().trim();
    const name = (formData.get("name") ?? "").toString().trim();
    const password = (formData.get("password") ?? "").toString();
    if (!email || !password || !name) {
      redirect("/auth/register?e=missing");
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.passwordHash) {
      redirect("/auth/register?e=exists");
    }
    let passwordHash = "";
    try {
      passwordHash = await bcrypt.hash(password, 10);
    } catch {
      redirect("/auth/register?e=hash");
    }
    let userId = existing?.id;
    try {
      if (existing) {
        const u = await prisma.user.update({ where: { email }, data: { name, passwordHash } });
        userId = u.id;
      } else {
        const u = await prisma.user.create({ data: { email, name, passwordHash } });
        userId = u.id;
      }
    } catch {
      redirect("/auth/register?e=insert");
    }

    // 検証メール（安全失敗）
    try {
      if (userId) {
        const { rawToken } = await createVerificationToken(userId, 30);
        const base = process.env.NEXT_PUBLIC_APP_URL || "";
        const url = `${base}/auth/verify?token=${encodeURIComponent(rawToken)}`;
        await sendVerificationEmail(email, url);
      }
    } catch {
      // noop: 失敗しても登録は成功扱い
    }
    redirect("/auth/login?registered=1");
  } catch (err) {
    if (isRedirectError(err)) throw err;
    // 既存ルールに合わせてDBエラー分類があればそれに従う。ここでは簡略。
    redirect(`/auth/register?e=unknown`);
  }
}

// Username(email) + password login
export async function loginPasswordAction(formData: FormData) {
  try {
    if (!process.env.DATABASE_URL) {
      redirect("/auth/login?e=noenv");
    }
    const email = (formData.get("email") ?? "").toString().trim();
    const password = (formData.get("password") ?? "").toString();
    const c = await cookies();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      redirect("/auth/login?e=invalid");
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      redirect("/auth/login?e=invalid");
    }
    c.set("session", `uid:${user.id}` , {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    redirect("/");
  } catch (err) {
    if (isRedirectError(err)) throw err;
    redirect(`/auth/login?e=unknown`);
  }
}

export async function isEmailVerified(userId: string): Promise<boolean> {
  const u = await prisma.user.findUnique({ where: { id: userId }, select: { emailVerifiedAt: true } });
  return Boolean(u?.emailVerifiedAt);
}

export async function requireVerifiedUser() {
  const u = await getCurrentUser();
  if (!u) redirect("/auth/login");
  const verified = await isEmailVerified(u.id);
  if (!verified) redirect("/auth/verify?e=unverified");
  return u;
}


