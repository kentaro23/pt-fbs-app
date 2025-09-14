import type { NextConfig } from "next";
// Sentry wrapper: optional import
let withSentry: ((cfg: NextConfig) => NextConfig) | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  withSentry = require("@sentry/nextjs").withSentry as (cfg: NextConfig) => NextConfig;
} catch {}

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
const nextConfig: NextConfig = (withSentry && process.env.SENTRY_DSN)
  ? withSentry(baseConfig)
  : baseConfig;

export default nextConfig;
