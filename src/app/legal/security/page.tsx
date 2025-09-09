export const metadata = { title: 'セキュリティ | FBS App' };

export default function Security() {
  return (
    <>
      <h2>セキュリティ</h2>
      <ul>
        <li>通信：TLS による暗号化</li>
        <li>決済情報：Stripe により保管・処理（当社はカード番号を保持しません）</li>
        <li>データベース：権限管理・ネットワーク制限・バックアップの実施</li>
        <li>アクセス制御：最小権限、監査ログ（必要に応じ実施）</li>
        <li>脆弱性対応：依存関係の定期更新・報告受付</li>
      </ul>
      <p>セキュリティ上の懸念や脆弱性のご報告は、＜mediforma1@gmail.com＞までお知らせください。</p>
    </>
  );
}


