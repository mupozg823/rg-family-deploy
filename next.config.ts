import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Disable Turbopack for production build due to Korean folder name issue
  experimental: {
    // Use webpack for build instead of Turbopack
  },
  // Route redirects for RG Info consolidation
  async redirects() {
    return [
      // Legacy route redirects
      {
        source: '/organization',
        destination: '/rg/org',
        permanent: true,
      },
      {
        source: '/signature',
        destination: '/rg/sig',
        permanent: true,
      },
      {
        source: '/timeline',
        destination: '/rg/history',
        permanent: true,
      },
      // /info/* -> /rg/* redirects (문서 참조 호환)
      {
        source: '/info/org',
        destination: '/rg/org',
        permanent: true,
      },
      {
        source: '/info/sig',
        destination: '/rg/sig',
        permanent: true,
      },
      {
        source: '/info/timeline',
        destination: '/rg/history',
        permanent: true,
      },
      {
        source: '/info/live',
        destination: '/rg/live',
        permanent: true,
      },
      // Ranking redirects
      {
        source: '/ranking/total',
        destination: '/ranking',
        permanent: true,
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
