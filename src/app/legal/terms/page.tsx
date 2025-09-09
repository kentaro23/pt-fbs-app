export const metadata = { title: '利用規約 | FBS App' };

export default function Terms() {
  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">利用規約</h2>
      <p>この利用規約（以下「本規約」）は、株式会社 Mediforma（以下「当社」）が提供する「FBS App」（以下「本サービス」）の利用条件を定めるものです。ユーザーは、本規約に同意のうえ本サービスを利用するものとします。</p>

      <h3 className="mt-8 text-xl font-semibold text-gray-900 pb-1 border-b border-gray-200">1. アカウント</h3>
      <ul>
        <li>ユーザーは、登録情報を正確かつ最新に保つものとします。</li>
        <li>ログイン情報の管理はユーザーの責任で行い、第三者に利用させてはなりません。</li>
      </ul>

      <h3 className="mt-8 text-xl font-semibold text-gray-900 pb-1 border-b border-gray-200">2. 料金・支払</h3>
      <ul>
        <li>有料プランの料金は本サービス上に表示する金額とします。税・通貨・請求間隔（月額）を含みます。</li>
        <li>決済は Stripe を利用します。請求・領収書・支払方法の変更は Stripe ポータルから行えます。</li>
        <li>サブスクリプションは<strong>自動更新</strong>です。次回更新日前までに解約手続を行わない限り、同一期間で更新されます。</li>
      </ul>

      <h3 className="mt-8 text-xl font-semibold text-gray-900 pb-1 border-b border-gray-200">3. 返金</h3>
      <p>返金可否・条件は <a href="/legal/refunds">返金・解約ポリシー</a> に従います。</p>

      <h3 className="mt-8 text-xl font-semibold text-gray-900 pb-1 border-b border-gray-200">4. 禁止事項</h3>
      <ul>
        <li>法令・公序良俗・第三者の権利を侵害する行為</li>
        <li>不正アクセス・過度な負荷・リバースエンジニアリング等</li>
      </ul>

      <h3 className="mt-8 text-xl font-semibold text-gray-900 pb-1 border-b border-gray-200">5. サービス提供の変更等</h3>
      <p>当社は、やむを得ない場合に限り、本サービスの内容変更・中断・終了を行うことがあります。</p>

      <h3 className="mt-8 text-xl font-semibold text-gray-900 pb-1 border-b border-gray-200">6. 免責</h3>
      <p>当社は、当社の故意または重過失による場合を除き、利用に伴う損害について責任を負いません。</p>

      <h3 className="mt-8 text-xl font-semibold text-gray-900 pb-1 border-b border-gray-200">7. 準拠法・裁判管轄</h3>
      <p>本規約は日本法に準拠し、紛争は東京地方裁判所を第一審の専属的合意管轄裁判所とします。</p>

      <p className="text-sm text-gray-500 mt-6">施行日：2025年09月09日</p>
    </>
  );
}


