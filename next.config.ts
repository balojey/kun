import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '1gb',
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
    dirs: ['supabase']
  },
  images: {
    remotePatterns: [new URL('https://lh3.googleusercontent.com/a/**')],
  },
  // webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
  //   config.module.rules.push({
  //     test: /\\lib\\/,
  //     loader: 'ignore-loader',
  //   });
  //   return config;
  // },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
