// Script para verificar el progreso guardado en la base de datos
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyProgress() {
  try {
    console.log('🔍 Verificando progreso en la base de datos...\n');

    // Obtener todos los registros de CourseProgress
    const allProgress = await prisma.courseProgress.findMany({
      orderBy: {
        updatedAt: 'desc'
      }
    });

    if (allProgress.length === 0) {
      console.log('❌ No hay registros de progreso en la base de datos');
      console.log('\nPosibles razones:');
      console.log('1. No has completado ningún nivel del quiz');
      console.log('2. El guardado no se está ejecutando');
      console.log('3. Hay un error en la autenticación\n');
    } else {
      console.log(`✅ Se encontraron ${allProgress.length} registros de progreso:\n`);

      allProgress.forEach((progress, index) => {
        console.log(`📝 Registro ${index + 1}:`);
        console.log(`   • ID: ${progress.id}`);
        console.log(`   • Usuario ID: ${progress.userId}`);
        console.log(`   • Curso: ${progress.courseId}`);
        console.log(`   • Nivel actual: ${progress.currentLevel}`);
        console.log(`   • Niveles completados: ${Object.keys(progress.levelScores || {}).length}`);
        console.log(`   • Logros: ${(progress.achievements || []).length}`);
        console.log(`   • Última actualización: ${progress.updatedAt.toLocaleString()}`);
        console.log(`   • Puntajes por nivel:`);
        
        const levelScores = progress.levelScores || {};
        if (Object.keys(levelScores).length === 0) {
          console.log(`     (Ningún nivel completado aún)`);
        } else {
          Object.entries(levelScores).forEach(([level, data]) => {
            console.log(`     - Nivel ${level}: ${data.score}% (${data.grade}) - ${new Date(data.completedAt).toLocaleString()}`);
          });
        }
        
        console.log('\n---\n');
      });
    }

    // Obtener información del usuario
    if (allProgress.length > 0) {
      const userId = allProgress[0].userId;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true, firstName: true, lastName: true }
      });

      if (user) {
        console.log(`👤 Usuario asociado: ${user.email} (${user.firstName || ''} ${user.lastName || user.name || ''})`);
      }
    }

  } catch (error) {
    console.error('❌ Error al verificar progreso:', error.message);
    console.error('\nDetalles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyProgress();
