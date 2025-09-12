import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const MAIL_FROM = process.env.MAIL_FROM || "no-reply@example.com";

let resend: Resend | null = null;
if (RESEND_API_KEY) {
  resend = new Resend(RESEND_API_KEY);
}

type SendArgs = { to: string; subject: string; html: string };

export async function sendMail({ to, subject, html }: SendArgs) {
  if (!resend) {
    console.warn("[sendMail:dev-fallback]", { to, subject });
    return { ok: true } as const;
  }
  const res = await resend.emails.send({ from: MAIL_FROM, to, subject, html });
  if (res && typeof res === "object" && "error" in res && (res as { error?: unknown }).error) {
    console.error((res as { error?: unknown }).error);
    throw new Error("メール送信に失敗しました");
  }
  return { ok: true } as const;
}

export const verificationEmailTemplate = (url: string) => `
  <div><p>以下のリンクでメール確認を完了してください（60分有効）。</p>
  <p><a href="${url}">メールアドレスを確認</a></p></div>`;

export const resetEmailTemplate = (url: string) => `
  <div><p>以下のリンクからパスワード再設定を行ってください（60分有効）。</p>
  <p><a href="${url}">パスワードを再設定</a></p></div>`;
