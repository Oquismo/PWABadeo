// next.config.js
// import withPWAInit from '@ducanh2912/next-pwa';

// Temporalmente deshabilitado para debug
// const withPWA = withPWAInit({
//   dest: 'public',
//   register: true,
//   skipWaiting: true,
//   disable: process.env.NODE_ENV === 'development',
// });

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client']
  },
  // Configuración específica para evitar el error de build
  async generateBuildId() {
    return 'build-' + Date.now()
  },
  // Excluir rutas API del análisis estático
  async exportPathMap(defaultPathMap) {
    const pathMap = {}
    for (const [path, page] of Object.entries(defaultPathMap)) {
      if (!path.startsWith('/api/')) {
        pathMap[path] = page
      }
    }
    return pathMap
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

// Temporalmente sin PWA para debug
export default nextConfig;

// export default withPWA(nextConfig);