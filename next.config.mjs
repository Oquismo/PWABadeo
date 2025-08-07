// next.config.js
import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true, // Usar SWC para minificación más rápida
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client']
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
    ],
    formats: ['image/webp', 'image/avif'], // Formatos modernos para mejores imágenes
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production', // Remover console.log en producción
  },
};

export default withPWA(nextConfig);