import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    unoptimized: true,
  },
  // クライアント参照の生成を強制
  experimental: {
    serverComponentsExternalPackages: [],
  },
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

export default nextConfig;
