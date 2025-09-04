export function getCurrentClinicId(): string {
  // 今は暫定: 環境変数か固定値でフォールバック
  // 後で Auth セッションから取得する
  if (process.env.DEFAULT_CLINIC_ID && process.env.DEFAULT_CLINIC_ID.trim() !== "") {
    return process.env.DEFAULT_CLINIC_ID.trim();
  }
  return "default-clinic";
}
