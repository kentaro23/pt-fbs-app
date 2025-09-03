import { NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET() {
  const v = process.env.DATABASE_URL ?? "";
  const present = !!v;
  return NextResponse.json({
    present,
    length: present ? v.length : 0,
    note: "値そのものは返しません。Production/Preview それぞれで確認してください。",
  });
}
