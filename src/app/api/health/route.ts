import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const n = await prisma.athlete.count();
    return NextResponse.json({ ok: true, athletes: n });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: "DB_ERROR", message }, { status: 500 });
  }
}
