import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  // 前段チェック: DATABASE_URL 未設定ならDBに触らず返す
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: false, error: "ENV_MISSING", message: "DATABASE_URL is not set" }, { status: 200 });
  }
  try {
    const n = await prisma.athlete.count();
    return NextResponse.json({ ok: true, athletes: n });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: "DB_ERROR", message }, { status: 500 });
  }
}
