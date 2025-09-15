import type { NextConfig } from "next";
// Sentry disabled: do not import

let baseConfig: NextConfig = {
  /* config options here */
  images: {
    unoptimized: true,
  },
  // クライアント参照の生成を強制
  serverExternalPackages: [],
  // 静的エクスポートを無効化（SSRを強制）
  output: undefined,
  // PWA対応
  headers: async () => {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
    ];
  },
};
const nextConfig: NextConfig = baseConfig;

export default nextConfig;
