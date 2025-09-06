"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(_formData: FormData) {
  const c = cookies();
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
  const c = cookies();
  c.delete("session");
  redirect("/");
}

export function isAuthenticated(): boolean {
  const c = cookies();
  return Boolean(c.get("session")?.value);
}


