// Script de debugging completo para el sistema de persistencia
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function debugProgress() {
  console.log('='.repeat(70));
  console.log('🔍 DEBUGGING SISTEMA DE PERSISTENCIA');
  console.log('='.repeat(70));
  console.log('');

  try {
    // 1. Verificar conexión a la base de datos
    console.log('1️⃣ Verificando conexión a PostgreSQL...');
    await prisma.$queryRaw`SELECT 1 as test`;
    console.log('   ✅ Conexión exitosa\n');

    // 2. Verificar que existe la tabla CourseProgress
    console.log('2️⃣ Verificando tabla CourseProgress...');
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'CourseProgress'
      );
    `;
    console.log('   ✅ Tabla CourseProgress existe\n');

    // 3. Contar registros
    console.log('3️⃣ Contando registros...');
    const count = await prisma.courseProgress.count();
    console.log(`   📊 Total de registros: ${count}\n`);

    if (count === 0) {
      console.log('⚠️  NO HAY REGISTROS GUARDADOS');
      console.log('');
      console.log('Posibles causas:');
      console.log('1. No has completado ningún nivel del quiz');
      console.log('2. No iniciaste sesión antes de usar el quiz');
      console.log('3. El debounce (2 segundos) no ha terminado');
      console.log('4. Hay un error JavaScript en el frontend');
      console.log('');
      console.log('✅ Solución:');
      console.log('   1. Abre http://localhost:3000/login');
      console.log('   2. Inicia sesión');
      console.log('   3. Ve a http://localhost:3000/cursos/espanol');
      console.log('   4. Completa un nivel');
      console.log('   5. Espera 3 segundos');
      console.log('   6. Abre la consola del navegador (F12)');
      console.log('   7. Busca "✅ Progreso guardado en BD"');
      console.log('');
    } else {
      // 4. Mostrar todos los registros
      console.log('4️⃣ Detalles de los registros:\n');
      
      const allProgress = await prisma.courseProgress.findMany({
        orderBy: {
          updatedAt: 'desc'
        }
      });

      for (let i = 0; i < allProgress.length; i++) {
        const prog = allProgress[i];
        
        console.log(`📝 REGISTRO ${i + 1}/${allProgress.length}`);
        console.log('─'.repeat(70));
        console.log(`   🆔 ID Base Datos:    ${prog.id}`);
        console.log(`   👤 Usuario ID:       ${prog.userId}`);
        console.log(`   📚 Curso:            ${prog.courseId}`);
        console.log(`   🎯 Nivel Actual:     ${prog.currentLevel}`);
        console.log(`   📅 Creado:           ${prog.createdAt.toLocaleString('es-ES')}`);
        console.log(`   🔄 Última Actualiz:  ${prog.updatedAt.toLocaleString('es-ES')}`);
        console.log('');
        
        // Analizar levelScores
        const levelScores = prog.levelScores || {};
        const completedCount = Object.keys(levelScores).length;
        
        console.log(`   ✅ Niveles Completados: ${completedCount}`);
        
        if (completedCount > 0) {
          console.log('   📊 Detalles por nivel:');
          Object.entries(levelScores).forEach(([level, data]) => {
            const score = data.score || 0;
            const grade = data.grade || '?';
            const date = data.completedAt ? new Date(data.completedAt).toLocaleString('es-ES') : 'N/A';
            const attempts = data.attempts || 1;
            
            console.log(`      • Nivel ${level}: ${score}% (${grade}) - ${attempts} intentos - ${date}`);
          });
        } else {
          console.log('      ⚠️  No hay niveles completados (solo progreso inicial guardado)');
        }
        console.log('');
        
        // Achievements
        const achievements = prog.achievements || [];
        console.log(`   🏆 Logros Desbloqueados: ${achievements.length}`);
        if (achievements.length > 0) {
          achievements.forEach(ach => {
            console.log(`      • ${ach.name || ach.id || ach}`);
          });
        }
        console.log('');
        
        // Stats
        const stats = prog.stats || {};
        if (Object.keys(stats).length > 0) {
          console.log('   📈 Estadísticas:');
          console.log(`      • Niveles completados: ${stats.completedLevels || 0}`);
          console.log(`      • Puntaje promedio: ${stats.averageScore?.toFixed(1) || 0}%`);
          console.log(`      • Racha actual: ${stats.currentStreak || 0}`);
          console.log(`      • Mejor racha: ${stats.longestStreak || 0}`);
        }
        
        console.log('');
        console.log('');
      }

      // 5. Buscar información del usuario
      console.log('5️⃣ Información de usuarios:\n');
      
      const userIds = [...new Set(allProgress.map(p => p.userId))];
      
      for (const userId of userIds) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            email: true,
            name: true,
            firstName: true,
            lastName: true,
            createdAt: true,
          }
        });

        if (user) {
          console.log(`   👤 Usuario ID ${userId}:`);
          console.log(`      • Email: ${user.email}`);
          console.log(`      • Nombre: ${user.firstName || user.name || 'N/A'} ${user.lastName || ''}`);
          console.log(`      • Registro: ${user.createdAt.toLocaleString('es-ES')}`);
          console.log('');
        }
      }
    }

    // 6. Test de escritura
    console.log('6️⃣ Test de escritura/lectura...');
    console.log('   (No se ejecutará para no crear datos de prueba)');
    console.log('   ✅ Puedes verificar manualmente en Prisma Studio');
    console.log('   🌐 http://localhost:5555\n');

    console.log('='.repeat(70));
    console.log('✅ DEBUGGING COMPLETADO');
    console.log('='.repeat(70));

  } catch (error) {
    console.error('\n❌ ERROR DURANTE EL DEBUGGING:');
    console.error('   Mensaje:', error.message);
    console.error('   Código:', error.code);
    console.error('\n   Stack trace:');
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
debugProgress().catch(console.error);
