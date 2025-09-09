import type { ReactNode } from 'react';

export const metadata = {
  title: '法務情報 | FBS App',
  robots: { index: true, follow: true },
};

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-8 pb-3 border-b border-gray-300 text-gray-900">法務情報</h1>
      <div className="prose max-w-none">{children}</div>
    </div>
  );
}


