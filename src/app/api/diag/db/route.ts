import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

function classify(err: unknown): string {
  if (err instanceof Error) {
    const m = err.message.toLowerCase();
    if (m.includes("permission") || m.includes("denied")) return "perm";
    if (m.includes("authentication") || m.includes("password")) return "auth";
    if (m.includes("relation") && m.includes("does not exist")) return "notable";
    if (m.includes("timeout")) return "timeout";
    if (m.includes("econn") || m.includes("refused") || m.includes("host") || m.includes("enotfound")) return "network";
  }
  return "unknown";
}

export async function GET() {
  const hasDb = !!process.env.DATABASE_URL;
  try {
    const r = await prisma.$queryRawUnsafe("select 1 as ok");
    return NextResponse.json({ ok: true, env: { db: hasDb }, note: "値は返しません" });
  } catch (e) {
    return NextResponse.json({ ok: false, env: { db: hasDb }, cls: classify(e) }, { status: 200 });
  }
}


