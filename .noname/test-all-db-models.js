const { PrismaClient } = require('@prisma/client');

async function testAllDatabaseModels() {
  console.log('🧪 Iniciando pruebas completas de la base de datos...\n');
  
  const prisma = new PrismaClient();
  
  try {
    // 1. Probar conexión
    console.log('1️⃣ Probando conexión a la base de datos...');
    await prisma.$connect();
    console.log('✅ Conexión exitosa\n');

    // 2. Probar modelo User
    console.log('2️⃣ Probando modelo User...');
    const userCount = await prisma.user.count();
    const users = await prisma.user.findMany({
      take: 3,
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        role: true,
        schoolId: true,
        createdAt: true,
        lastSeen: true
      }
    });
    console.log(`   Total usuarios: ${userCount}`);
    console.log('   Usuarios de ejemplo:', users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      school: u.schoolId || 'Sin escuela'
    })));
    console.log('✅ Modelo User funcionando\n');

    // 3. Probar modelo School
    console.log('3️⃣ Probando modelo School...');
    const schoolCount = await prisma.school.count();
    const schools = await prisma.school.findMany({
      take: 3,
      select: {
        id: true,
        name: true,
        city: true,
        type: true,
        level: true,
        isActive: true,
        _count: {
          select: { users: true }
        }
      }
    });
    console.log(`   Total escuelas: ${schoolCount}`);
    console.log('   Escuelas de ejemplo:', schools.map(s => ({
      id: s.id,
      name: s.name,
      city: s.city,
      type: s.type,
      usuarios: s._count.users
    })));
    console.log('✅ Modelo School funcionando\n');

    // 4. Probar modelo Log
    console.log('4️⃣ Probando modelo Log...');
    const logCount = await prisma.log.count();
    const recentLogs = await prisma.log.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { email: true, name: true }
        }
      }
    });
    console.log(`   Total logs: ${logCount}`);
    console.log('   Logs recientes:', recentLogs.map(l => ({
      action: l.action,
      user: l.user?.name || l.user?.email || 'Sistema',
      date: l.createdAt.toISOString()
    })));
    console.log('✅ Modelo Log funcionando\n');

    // 5. Probar modelo Task
    console.log('5️⃣ Probando modelo Task...');
    const taskCount = await prisma.task.count();
    const tasks = await prisma.task.findMany({
      take: 3,
      include: {
        user: {
          select: { email: true, name: true }
        }
      }
    });
    console.log(`   Total tareas: ${taskCount}`);
    console.log('   Tareas de ejemplo:', tasks.map(t => ({
      id: t.id,
      title: t.title,
      role: t.role,
      progress: t.progress,
      createdBy: t.user?.name || t.user?.email || 'Sistema'
    })));
    console.log('✅ Modelo Task funcionando\n');

    // 6. Probar modelo Announcement
    console.log('6️⃣ Probando modelo Announcement...');
    const announcementCount = await prisma.announcement.count();
    const announcements = await prisma.announcement.findMany({
      take: 3,
      include: {
        user: {
          select: { email: true, name: true }
        }
      }
    });
    console.log(`   Total anuncios: ${announcementCount}`);
    console.log('   Anuncios de ejemplo:', announcements.map(a => ({
      id: a.id,
      message: a.message.substring(0, 50) + '...',
      createdBy: a.user?.name || a.user?.email || 'Sistema',
      date: a.createdAt.toISOString()
    })));
    console.log('✅ Modelo Announcement funcionando\n');

    // 7. Probar modelo PasswordResetToken
    console.log('7️⃣ Probando modelo PasswordResetToken...');
    const tokenCount = await prisma.passwordResetToken.count();
    const tokens = await prisma.passwordResetToken.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        used: true,
        expiresAt: true,
        createdAt: true
      }
    });
    console.log(`   Total tokens: ${tokenCount}`);
    console.log('   Tokens recientes:', tokens.map(t => ({
      email: t.email,
      used: t.used,
      expired: t.expiresAt < new Date(),
      created: t.createdAt.toISOString()
    })));
    console.log('✅ Modelo PasswordResetToken funcionando\n');

    // 8. Probar modelo UserEvent
    console.log('8️⃣ Probando modelo UserEvent...');
    const eventCount = await prisma.userEvent.count();
    const events = await prisma.userEvent.findMany({
      take: 3,
      include: {
        user: {
          select: { email: true, name: true }
        }
      }
    });
    console.log(`   Total eventos: ${eventCount}`);
    console.log('   Eventos de ejemplo:', events.map(e => ({
      id: e.id,
      title: e.title,
      type: e.type,
      date: e.date.toISOString(),
      user: e.user?.name || e.user?.email
    })));
    console.log('✅ Modelo UserEvent funcionando\n');

    // 9. Probar modelo PushSubscription
    console.log('9️⃣ Probando modelo PushSubscription...');
    const pushCount = await prisma.pushSubscription.count();
    const pushSubs = await prisma.pushSubscription.findMany({
      take: 3,
      include: {
        user: {
          select: { email: true, name: true }
        }
      }
    });
    console.log(`   Total suscripciones push: ${pushCount}`);
    console.log('   Suscripciones de ejemplo:', pushSubs.map(p => ({
      id: p.id,
      user: p.user?.name || p.user?.email,
      created: p.createdAt.toISOString()
    })));
    console.log('✅ Modelo PushSubscription funcionando\n');

    // 10. Probar relaciones
    console.log('🔗 Probando relaciones entre modelos...');
    
    // User -> School
    const userWithSchool = await prisma.user.findFirst({
      where: { schoolId: { not: null } },
      include: { school: true }
    });
    
    // User -> Tasks
    const userWithTasks = await prisma.user.findFirst({
      include: { 
        tasks: { take: 2 },
        logs: { take: 2 },
        userEvents: { take: 2 }
      }
    });

    console.log('   Usuario con escuela:', userWithSchool ? {
      name: userWithSchool.name,
      school: userWithSchool.school?.name || 'No encontrada'
    } : 'No encontrado');

    console.log('   Usuario con relaciones:', userWithTasks ? {
      name: userWithTasks.name,
      tasks: userWithTasks.tasks.length,
      logs: userWithTasks.logs.length,
      events: userWithTasks.userEvents.length
    } : 'No encontrado');

    console.log('✅ Relaciones funcionando correctamente\n');

    // 11. Probar operaciones CRUD básicas
    console.log('🔧 Probando operaciones CRUD...');
    
    // Crear un log de prueba
    const testLog = await prisma.log.create({
      data: {
        action: 'database_test',
        meta: { 
          test: true, 
          timestamp: new Date().toISOString(),
          models_tested: ['User', 'School', 'Log', 'Task', 'Announcement', 'PasswordResetToken', 'UserEvent', 'PushSubscription']
        }
      }
    });
    console.log('   ✅ Creación de log exitosa:', testLog.id);

    // Actualizar el log
    const updatedLog = await prisma.log.update({
      where: { id: testLog.id },
      data: { 
        meta: { 
          ...testLog.meta,
          updated: true 
        }
      }
    });
    console.log('   ✅ Actualización de log exitosa');

    // Verificar que el log existe
    const foundLog = await prisma.log.findUnique({
      where: { id: testLog.id }
    });
    console.log('   ✅ Lectura de log exitosa:', !!foundLog);

    // Eliminar el log de prueba
    await prisma.log.delete({
      where: { id: testLog.id }
    });
    console.log('   ✅ Eliminación de log exitosa\n');

    console.log('🎉 Todas las pruebas de base de datos completadas exitosamente!');
    console.log('\n📊 Resumen:');
    console.log(`   - Usuarios: ${userCount}`);
    console.log(`   - Escuelas: ${schoolCount}`);
    console.log(`   - Logs: ${logCount}`);
    console.log(`   - Tareas: ${taskCount}`);
    console.log(`   - Anuncios: ${announcementCount}`);
    console.log(`   - Tokens reset: ${tokenCount}`);
    console.log(`   - Eventos usuario: ${eventCount}`);
    console.log(`   - Suscripciones push: ${pushCount}`);

  } catch (error) {
    console.error('❌ Error en pruebas de base de datos:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testAllDatabaseModels();
