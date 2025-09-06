"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function loginAction(_formData: FormData) {
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
    if (existing) {
      redirect("/auth/register?e=exists");
    }
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({ data: { email, name, passwordHash } });
    redirect("/auth/login?registered=1");
  } catch (err) {
    redirect("/auth/register?e=db");
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
    redirect("/auth/login?e=db");
  }
}


