export const metadata = { title: '特定商取引法に基づく表記 | FBS App' };

export default function Tokushoho() {
  return (
    <>
      <h2>特定商取引法に基づく表記</h2>
      <table>
        <tbody>
          <tr><td>販売業者</td><td>株式会社 Mediforma</td></tr>
          <tr><td>運営責任者</td><td>大原 健太郎</td></tr>
          <tr><td>所在地</td><td>神奈川県 相模原市</td></tr>
          <tr><td>連絡先</td><td>mediforma1@gmail.com（※お問い合わせはメールで承ります）</td></tr>
          <tr><td>販売価格</td><td>各プランのページ・アプリ内に記載（消費税込）</td></tr>
          <tr><td>商品代金以外の必要料金</td><td>インターネット接続に係る通信料等</td></tr>
          <tr><td>支払方法</td><td>クレジットカード（Stripe 決済）</td></tr>
          <tr><td>支払時期</td><td>申込時に決済／以降は更新日に自動決済</td></tr>
          <tr><td>役務の提供時期</td><td>決済完了後、直ちに利用可能</td></tr>
          <tr><td>返品・キャンセル</td><td>役務の性質上、提供後の返品は不可。解約は次回更新日前までに手続。</td></tr>
          <tr><td>解約条件</td><td>期間途中の解約でも日割返金はありません（当社起因の障害等を除く）。</td></tr>
          <tr><td>動作環境</td><td>最新の主要ブラウザ／安定したインターネット接続</td></tr>
          <tr><td>特別な販売条件</td><td>サブスクリプションは自動更新。クーリング・オフは適用外。</td></tr>
        </tbody>
      </table>
    </>
  );
}


