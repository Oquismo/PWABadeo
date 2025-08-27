import { PrismaClient } from '@prisma/client';

// Evita múltiples instancias de PrismaClient en desarrollo
declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Forzar regeneración del tipo
prisma.$connect().catch(console.error);

export default prisma;
