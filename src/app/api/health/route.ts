import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import pkg from "../../../../package.json";
import { getStripeSafe } from "@/lib/stripe-helpers";

export async function GET() {
  const version = (pkg as { version?: string }).version ?? '0.0.0';

  // DB check
  let db = 'ng' as 'ok' | 'ng';
  if (process.env.DATABASE_URL) {
    try {
      await prisma.athlete.count();
      db = 'ok';
    } catch {
      db = 'ng';
    }
  } else {
    db = 'ng';
  }

  // Stripe check
  let stripe: 'ok' | 'ng' = 'ng';
  try {
    const s = getStripeSafe();
    stripe = s ? 'ok' : 'ng';
  } catch {
    stripe = 'ng';
  }

  // Email check
  const email: 'ok' | 'ng' = process.env.RESEND_API_KEY ? 'ok' : 'ng';

  return NextResponse.json({ ok: true, db, stripe, email, version });
}
