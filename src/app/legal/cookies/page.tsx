export const metadata = { title: 'Cookieポリシー | FBS App' };

export default function Cookies() {
  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookieポリシー</h2>
      <p>本サービスは、ログイン状態の維持等のために Cookie を使用します。当社が発行する Cookie には個人を特定する機微情報は含まれません。</p>
      <h3 className="mt-8 text-xl font-semibold text-gray-900 pb-1 border-b border-gray-200">使用目的</h3>
      <ul>
        <li>セッション維持（認証）</li>
        <li>基本的な動作に必要な設定の保持</li>
      </ul>
      <h3 className="mt-8 text-xl font-semibold text-gray-900 pb-1 border-b border-gray-200">管理方法</h3>
      <p>ブラウザの設定で Cookie を無効化できますが、無効化するとサービスの一部機能が利用できません。</p>
    </>
  );
}


