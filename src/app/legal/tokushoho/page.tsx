export const metadata = { title: '特定商取引法に基づく表記 | FBS App' };

export default function Tokushoho() {
  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">特定商取引法に基づく表記</h2>
      <table className="w-full text-sm border border-gray-300">
        <tbody>
          <tr className="odd:bg-gray-50 border-b border-gray-200"><td className="w-40 font-semibold px-3 py-2 text-gray-800">販売業者</td><td className="px-3 py-2">株式会社 Mediforma</td></tr>
          <tr className="odd:bg-gray-50 border-b border-gray-200"><td className="w-40 font-semibold px-3 py-2 text-gray-800">運営責任者</td><td className="px-3 py-2">大原 健太郎</td></tr>
          <tr className="odd:bg-gray-50 border-b border-gray-200"><td className="w-40 font-semibold px-3 py-2 text-gray-800">所在地</td><td className="px-3 py-2">神奈川県 相模原市</td></tr>
          <tr className="odd:bg-gray-50 border-b border-gray-200"><td className="w-40 font-semibold px-3 py-2 text-gray-800">連絡先</td><td className="px-3 py-2">mediforma1@gmail.com（※お問い合わせはメールで承ります）</td></tr>
          <tr className="odd:bg-gray-50 border-b border-gray-200"><td className="w-40 font-semibold px-3 py-2 text-gray-800">販売価格</td><td className="px-3 py-2">各プランのページ・アプリ内に記載（消費税込）</td></tr>
          <tr className="odd:bg-gray-50 border-b border-gray-200"><td className="w-40 font-semibold px-3 py-2 text-gray-800">商品代金以外の必要料金</td><td className="px-3 py-2">インターネット接続に係る通信料等</td></tr>
          <tr className="odd:bg-gray-50 border-b border-gray-200"><td className="w-40 font-semibold px-3 py-2 text-gray-800">支払方法</td><td className="px-3 py-2">クレジットカード（Stripe 決済）</td></tr>
          <tr className="odd:bg-gray-50 border-b border-gray-200"><td className="w-40 font-semibold px-3 py-2 text-gray-800">支払時期</td><td className="px-3 py-2">申込時に決済／以降は更新日に自動決済</td></tr>
          <tr className="odd:bg-gray-50 border-b border-gray-200"><td className="w-40 font-semibold px-3 py-2 text-gray-800">役務の提供時期</td><td className="px-3 py-2">決済完了後、直ちに利用可能</td></tr>
          <tr className="odd:bg-gray-50 border-b border-gray-200"><td className="w-40 font-semibold px-3 py-2 text-gray-800">返品・キャンセル</td><td className="px-3 py-2">役務の性質上、提供後の返品は不可。解約は次回更新日前までに手続。</td></tr>
          <tr className="odd:bg-gray-50 border-b border-gray-200"><td className="w-40 font-semibold px-3 py-2 text-gray-800">解約条件</td><td className="px-3 py-2">期間途中の解約でも日割返金はありません（当社起因の障害等を除く）。</td></tr>
          <tr className="odd:bg-gray-50 border-b border-gray-200"><td className="w-40 font-semibold px-3 py-2 text-gray-800">動作環境</td><td className="px-3 py-2">最新の主要ブラウザ／安定したインターネット接続</td></tr>
          <tr className="odd:bg-gray-50"><td className="w-40 font-semibold px-3 py-2 text-gray-800">特別な販売条件</td><td className="px-3 py-2">サブスクリプションは自動更新。クーリング・オフは適用外。</td></tr>
        </tbody>
      </table>
    </>
  );
}


