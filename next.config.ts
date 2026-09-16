import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,

  // NOTE: `/api/app/*`, `/api/admin/*` and `/api/v1/*` are served by same-origin
  // route handlers (src/app/api/**/[...path]/route.ts) which forward to the backend
  // origin resolved by `getBackendOrigin()`. They deliberately replace the previous
  // rewrites, which double-prefixed the path whenever the configured env var already
  // carried an `/api/v1` suffix (as `.env.example` documents).

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-toast',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-slot',
      '@radix-ui/react-tabs',
      'clsx',
      'tailwind-merge',
    ],
  },

  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico|woff|woff2|ttf|eot)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'assets.aceternity.com',
      },
      {
        protocol: 'https',
        hostname: 'api.ariesxpert.com',
      },
      {
        protocol: 'https',
        hostname: 'ariesphysiocare.com',
      },
      {
        protocol: 'https',
        hostname: 'app.ariesphysiocare.com',
      },
      {
        protocol: 'https',
        hostname: '*.s3.ap-south-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
      },
    ],
  },
};

export default nextConfig;
