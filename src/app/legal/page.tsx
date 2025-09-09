import Link from 'next/link';

export const metadata = { title: '法務情報 | FBS App' };

export default function LegalIndex() {
  const items = [
    { href: '/legal/privacy', label: 'プライバシーポリシー' },
    { href: '/legal/terms', label: '利用規約' },
    { href: '/legal/refunds', label: '返金・解約ポリシー' },
    { href: '/legal/tokushoho', label: '特定商取引法に基づく表記' },
    { href: '/legal/cookies', label: 'Cookieポリシー' },
    { href: '/legal/security', label: 'セキュリティ' },
  ];
  return (
    <ul className="space-y-3">
      {items.map(i => (
        <li key={i.href}>
          <Link className="text-blue-600 underline" href={i.href}>{i.label}</Link>
        </li>
      ))}
    </ul>
  );
}


