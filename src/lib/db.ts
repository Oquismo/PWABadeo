import { PrismaClient } from '@prisma/client';

// Configuración específica para Vercel
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
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Función helper para inicializar Prisma de manera segura
export async function initPrisma() {
  try {
    await prisma.$connect();
    console.log('✅ Prisma connected successfully');
    return prisma;
  } catch (error) {
    console.error('❌ Prisma connection failed:', error);
    throw error;
  }
}

// Función para desconectar Prisma
export async function disconnectPrisma() {
  await prisma.$disconnect();
}
