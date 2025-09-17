import { PrismaClient } from '@prisma/client';
import loggerClient from '@/lib/loggerClient';

// Configuración específica para Vercel con optimizaciones para cold starts
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Configuraciones para reducir cold starts
    errorFormat: 'minimal',
    transactionOptions: {
      timeout: 10000, // 10 segundos timeout para transacciones
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Función helper para inicializar Prisma de manera segura con reintentos
export async function initPrisma(retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      await prisma.$connect();
      loggerClient.info('✅ Prisma connected successfully');
      return prisma;
    } catch (error) {
      loggerClient.error(`❌ Prisma connection attempt ${i + 1} failed:`, error);
      if (i === retries - 1) throw error;
      
      // Esperar antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

// Función para mantener la conexión viva
export async function keepAlive() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    loggerClient.warn('Keep-alive ping failed:', error);
    return false;
  }
}

// Función para desconectar Prisma
export async function disconnectPrisma() {
  await prisma.$disconnect();
}
