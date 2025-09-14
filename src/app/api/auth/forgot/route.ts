import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createPasswordResetToken } from "@/lib/tokens";
import { sendMail, resetEmailTemplate } from "@/lib/email";
import { captureExceptionSafe } from "@/lib/monitoring";
import { getClientIp, rateLimitCheck } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req.headers);
    const rl = rateLimitCheck(ip, 'send-mail');
    if (!rl.ok) {
      return NextResponse.json({ ok: false, error: 'rate_limited', retryAfterSec: rl.retryAfterSec }, { status: 429 });
    }

    const { email } = await req.json();
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const base = process.env.NEXT_PUBLIC_APP_URL || "";
      const { token } = await createPasswordResetToken(user.id);
      const url = `${base}/auth/reset-password?token=${token}`;
      await sendMail({ to: user.email, subject: "パスワード再設定", html: resetEmailTemplate(url) });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    captureExceptionSafe(e, { where: 'api/auth/forgot' });
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
