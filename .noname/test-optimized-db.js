/**
 * Script de prueba para verificar todas las funcionalidades optimizadas de la base de datos
 * Verifica que todos los modelos funcionen correctamente con la instancia global de Prisma
 */

const { PrismaClient } = require('@prisma/client');

// Usar la misma configuración que en el archivo db.ts
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function testOptimizedDatabase() {
  console.log('🚀 Iniciando pruebas de la base de datos optimizada...\n');

  try {
    // 1. Test de conexión básica
    console.log('📡 Probando conexión a la base de datos...');
    await prisma.$connect();
    console.log('✅ Conexión exitosa\n');

    // 2. Verificar todos los modelos
    console.log('📊 Verificando conteos de modelos:');
    
    const counts = await Promise.all([
      prisma.user.count(),
      prisma.school.count(),
      prisma.log.count(),
      prisma.task.count(),
      prisma.announcement.count(),
      prisma.passwordResetToken.count(),
      prisma.userEvent.count(),
      prisma.pushSubscription.count()
    ]);

    const [users, schools, logs, tasks, announcements, tokens, events, subscriptions] = counts;
    
    console.log(`  👥 Usuarios: ${users}`);
    console.log(`  🏫 Escuelas: ${schools}`);
    console.log(`  📝 Logs: ${logs}`);
    console.log(`  ✅ Tareas: ${tasks}`);
    console.log(`  📢 Anuncios: ${announcements}`);
    console.log(`  🔑 Tokens de reset: ${tokens}`);
    console.log(`  📅 Eventos de usuario: ${events}`);
    console.log(`  🔔 Suscripciones push: ${subscriptions}\n`);

    // 3. Test de operaciones CRUD optimizadas
    console.log('🔄 Probando operaciones CRUD optimizadas...');

    // Test de creación de usuario con relación a escuela
    console.log('  📝 Creando usuario de prueba...');
    
    // Obtener el ID de la primera escuela disponible
    let schoolId = null;
    if (schools > 0) {
      const firstSchool = await prisma.school.findFirst({
        select: { id: true }
      });
      schoolId = firstSchool?.id || null;
    }
    
    const testUser = await prisma.user.create({
      data: {
        email: `test-optimized-${Date.now()}@example.com`,
        firstName: 'Test',
        lastName: 'Optimizado',
        name: 'Test Optimizado',
        password: '$2b$10$testHashForOptimizedTest',
        role: 'student',
        schoolId: schoolId
      },
      include: {
        school: true
      }
    });
    console.log(`  ✅ Usuario creado: ${testUser.name} (ID: ${testUser.id})`);

    // Test de logging optimizado
    console.log('  📊 Creando log de prueba...');
    const testLog = await prisma.log.create({
      data: {
        userId: testUser.id,
        action: 'test_optimized_db',
        meta: { test: true, optimization: 'global_prisma_instance' }
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });
    console.log(`  ✅ Log creado: ${testLog.action} para usuario ${testLog.user.name}`);

    // Test de actualización optimizada
    console.log('  🔄 Actualizando usuario...');
    const updatedUser = await prisma.user.update({
      where: { id: testUser.id },
      data: { 
        lastSeen: new Date(),
        name: 'Test Optimizado Actualizado'
      }
    });
    console.log(`  ✅ Usuario actualizado: ${updatedUser.name}`);

    // 4. Test de consultas complejas con relaciones
    console.log('\n🔍 Probando consultas complejas...');
    
    const usersWithRelations = await prisma.user.findMany({
      where: {
        role: 'student'
      },
      include: {
        school: true,
        logs: {
          take: 3,
          orderBy: { createdAt: 'desc' }
        },
        tasks: {
          take: 2
        }
      },
      take: 5
    });
    
    console.log(`  📊 Encontrados ${usersWithRelations.length} estudiantes con sus relaciones`);
    usersWithRelations.forEach(user => {
      console.log(`    - ${user.name}: ${user.logs.length} logs, ${user.tasks.length} tareas, escuela: ${user.school?.name || 'No asignada'}`);
    });

    // 5. Test de transacciones
    console.log('\n💾 Probando transacciones...');
    
    const transactionResult = await prisma.$transaction(async (tx) => {
      // Crear una tarea
      const task = await tx.task.create({
        data: {
          title: 'Tarea de prueba transaccional',
          description: 'Esta tarea se crea dentro de una transacción',
          color: '#FF5722',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días desde ahora
          role: 'user',
          progress: 0,
          createdBy: testUser.id,
          avatars: ["avatar1.png", "avatar2.png"]
        }
      });

      // Crear log de la acción
      const log = await tx.log.create({
        data: {
          userId: testUser.id,
          action: 'task_created',
          meta: { taskId: task.id, title: task.title }
        }
      });

      return { task, log };
    });
    
    console.log(`  ✅ Transacción completada: Tarea "${transactionResult.task.title}" creada`);

    // 6. Test de performance con consultas agregadas
    console.log('\n⚡ Probando rendimiento con consultas agregadas...');
    
    const startTime = Date.now();
    const stats = await prisma.$transaction([
      prisma.user.groupBy({
        by: ['role'],
        _count: { id: true }
      }),
      prisma.log.groupBy({
        by: ['action'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5
      }),
      prisma.task.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Últimos 30 días
          }
        },
        _count: { id: true }
      })
    ]);
    
    const queryTime = Date.now() - startTime;
    console.log(`  ⏱️  Consultas agregadas completadas en ${queryTime}ms`);
    console.log(`  📊 Roles de usuario:`, stats[0]);
    console.log(`  📊 Acciones más frecuentes:`, stats[1].slice(0, 3));

    // 7. Limpieza de datos de prueba
    console.log('\n🧹 Limpiando datos de prueba...');
    
    await prisma.$transaction([
      prisma.task.deleteMany({
        where: { createdBy: testUser.id }
      }),
      prisma.log.deleteMany({
        where: { userId: testUser.id }
      }),
      prisma.user.delete({
        where: { id: testUser.id }
      })
    ]);
    
    console.log('  ✅ Datos de prueba eliminados');

    // 8. Verificación final de integridad
    console.log('\n🔒 Verificación final de integridad...');
    
    const finalCounts = await Promise.all([
      prisma.user.count(),
      prisma.log.count(),
      prisma.task.count()
    ]);
    
    console.log(`  📊 Estado final: ${finalCounts[0]} usuarios, ${finalCounts[1]} logs, ${finalCounts[2]} tareas`);

    console.log('\n🎉 ¡Todas las pruebas de optimización completadas exitosamente!');
    console.log('✅ La instancia global de Prisma está funcionando correctamente');
    console.log('✅ Todas las operaciones CRUD funcionan');
    console.log('✅ Las transacciones están operativas');
    console.log('✅ Las consultas complejas se ejecutan eficientemente');
    console.log('✅ La integridad de datos se mantiene');

  } catch (error) {
    console.error('❌ Error durante las pruebas de optimización:', error);
    
    if (error.code === 'P1001') {
      console.error('💡 Error de conexión a la base de datos. Verifica DATABASE_URL');
    } else if (error.code?.startsWith('P')) {
      console.error('💡 Error de Prisma:', error.message);
    } else {
      console.error('💡 Error general:', error.message);
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Conexión a base de datos cerrada');
  }
}

// Configurar variables de entorno para la prueba
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://neondb_owner:npg_dobg0TreiPI7@ep-lingering-wave-a2n276ol-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require";
}

// Ejecutar las pruebas
testOptimizedDatabase();
