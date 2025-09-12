import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const MAIL_FROM = process.env.MAIL_FROM || "no-reply@example.com";

let resend: Resend | null = null;
if (RESEND_API_KEY) {
  try {
    resend = new Resend(RESEND_API_KEY);
  } catch {
    resend = null;
  }
}

export async function sendVerificationEmail(to: string, url: string): Promise<void> {
  const subject = "メールアドレスの確認 | FBS App";
  const html = `
  <div style="font-family:system-ui,Segoe UI,Helvetica,Arial,sans-serif;line-height:1.6;color:#111">
    <p>FBS App のご登録ありがとうございます。以下のボタンからメール確認を完了してください（30分有効）。</p>
    <p style="margin:24px 0">
      <a href="${url}" style="display:inline-block;background:#000;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px">メールを確認する</a>
    </p>
    <p>もしボタンが開けない場合は、次のURLをブラウザに貼り付けてください。</p>
    <p><a href="${url}">${url}</a></p>
  </div>`;

  if (!resend) {
    console.warn("[mail] resend not configured. fallback log:", { to, subject, url });
    return;
  }
  const from = MAIL_FROM;
  const res = await resend.emails.send({ from, to, subject, html });
  if ((res as any)?.error) {
    console.warn("[mail] resend error (safe-fail):", (res as any).error);
  }
}
