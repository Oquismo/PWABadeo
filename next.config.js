// next.config.js
import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: false,
  scope: '/',
  sw: 'sw.js',
  reloadOnOnline: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  fallbacks: {
    document: '/offline.html',
  },
  workboxOptions: {
    importScripts: ['/sw-push.js'],
    // Nunca cachear el service worker mismo
    cacheId: 'badeo-pwa',
  },
});

/** @type {import('next').NextConfig} */
const nextConfigBase = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcrypt'],
    // Optimizaciones experimentales
    optimizePackageImports: ['@mui/material', '@mui/icons-material', 'framer-motion'],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  // Configuración para App Router
  output: 'standalone',
  
  // Optimizaciones de webpack
  webpack: (config, { isServer, dev }) => {
    // Configuración específica para Prisma en builds
    if (isServer) {
      config.externals.push('@prisma/client');
    }

    // Optimizaciones de bundle splitting
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Chunk para MUI
            mui: {
              test: /[\\/]node_modules[\\/](@mui|@emotion)[\\/]/,
              name: 'mui',
              priority: 30,
              reuseExistingChunk: true,
            },
            // Chunk para Framer Motion
            framerMotion: {
              test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
              name: 'framer-motion',
              priority: 25,
              reuseExistingChunk: true,
            },
            // Chunk para React Leaflet y mapas
            maps: {
              test: /[\\/]node_modules[\\/](react-leaflet|leaflet|@vis\.gl)[\\/]/,
              name: 'maps',
              priority: 20,
              reuseExistingChunk: true,
            },
            // Chunk para otras librerías pesadas
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: 10,
              reuseExistingChunk: true,
            },
          },
        },
      };

      // Optimizaciones adicionales
      config.resolve.alias = {
        ...config.resolve.alias,
        // Reducir bundle size de moment.js si se usa
        moment: 'moment/min/moment-with-locales.min.js',
      };
    }

    // Optimizaciones para desarrollo
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['**/.git/**', '**/node_modules/**', '**/.next/**'],
      };
    }

    return config;
  },

  // Optimización de imágenes
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
    formats: ['image/avif', 'image/webp'], // AVIF primero para mejor compresión
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 días de cache
  },

  // Optimizaciones del compilador
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    // Optimizaciones de styled-components si se usan
    styledComponents: true,
  },

  // Headers de performance y seguridad
  async headers() {
    const cspHeader = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' blob: data: https:",
      "font-src 'self'",
      "connect-src 'self' https:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ');

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin'
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp'
          },
          {
            key: 'Content-Security-Policy',
            value: cspHeader
          }
        ]
      },
      // Nunca cachear el service worker
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate'
          }
        ]
      },
      {
        source: '/sw-push.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate'
          }
        ]
      },
      // Cache estático agresivo para assets
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      // Cache para imágenes
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, stale-while-revalidate=86400'
          }
        ]
      }
    ];
  },

  // Configuración de compresión
  compress: true,
  
  // Optimización de fuentes
  optimizeFonts: true,
  
  // Configuración de redirects para SEO
  async redirects() {
    return [
      // Redirigir trailing slashes
      {
        source: '/:path((?!.*\\..*$).*)',
        has: [
          {
            type: 'header',
            key: 'x-middleware-rewrite',
          },
        ],
        destination: '/:path/',
        permanent: true,
      },
    ];
  },
};

// ✅ Exportar con wrapper de PWA
export default withPWA(nextConfigBase);