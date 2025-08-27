// Archivo temporal para verificar que Prisma funciona correctamente
import { prisma } from '@/lib/prisma-client';

async function testPrismaConnection() {
  try {
    // Verificar que el modelo PushSubscription existe
    const count = await prisma.pushSubscription.count();
    console.log('✅ PushSubscription model is working, count:', count);
    
    // Verificar otros modelos
    const userCount = await prisma.user.count();
    console.log('✅ User model is working, count:', userCount);
    
    return true;
  } catch (error) {
    console.error('❌ Error testing Prisma:', error);
    return false;
  }
}

export { testPrismaConnection };
