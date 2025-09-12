import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAuthenticated } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET(req: Request) {
  const c = await cookies();
  const session = c.get("session")?.value ?? "";
  const url = new URL(req.url);
  const authed = await isAuthenticated();

  return NextResponse.json({
    ok: true,
    url: url.toString(),
    session: {
      present: !!session,
      length: session.length,
      preview: session ? session.slice(0, 12) + (session.length > 12 ? "…" : "") : null,
    },
    authed,
  });
}


