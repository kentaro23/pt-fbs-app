export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FBS 自動生成アプリ",
  description: "理学療法士向けのFunctional Movement Screen自動生成アプリ",
  manifest: "/manifest.json",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
  themeColor: "#000000",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FBS App",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="FBS App" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <header className="border-b bg-white/70 backdrop-blur sticky top-0 z-40">
          <div className="container-app h-14 flex items-center justify-between">
            <div className="font-semibold">FBS App</div>
            <nav className="flex items-center gap-3 text-sm">
              <a href="/" className="hover:underline">ホーム</a>
              <a href="/athletes" className="hover:underline">選手一覧</a>
              <a href="/billing" className="hover:underline">サブスク</a>
            </nav>
          </div>
        </header>
        <main className="container-app py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
