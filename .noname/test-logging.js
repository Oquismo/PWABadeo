const { PrismaClient } = require('@prisma/client');

async function testLogging() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Conectando a la base de datos...');
    
    // Probar crear un log
    const testLog = await prisma.log.create({
      data: {
        action: 'test_log',
        meta: { test: true, timestamp: new Date().toISOString() },
        userId: 1 // Usar el primer usuario disponible
      }
    });
    
    console.log('✅ Log de prueba creado:', testLog);
    
    // Obtener los últimos logs
    const recentLogs = await prisma.log.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    });
    
    console.log('📋 Últimos logs:');
    recentLogs.forEach(log => {
      console.log(`  - ${log.action} por ${log.user?.name || log.user?.email || 'usuario desconocido'} (${log.createdAt})`);
    });
    
    // Probar actualización de lastSeen
    const user = await prisma.user.findFirst();
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { lastSeen: new Date() }
      });
      console.log(`✅ LastSeen actualizado para ${user.name || user.email}`);
    }
    
    console.log('🎉 Pruebas de logging completadas exitosamente');
    
  } catch (error) {
    console.error('❌ Error en pruebas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogging();
