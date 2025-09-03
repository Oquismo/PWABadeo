const { PrismaClient } = require('@prisma/client');

async function syncUserLocationsWithSchools() {
  const prisma = new PrismaClient();
  
  try {
    // Obtener todos los usuarios no-admin que tienen una escuela asignada
    const usersWithSchools = await prisma.user.findMany({
      where: {
        AND: [
          { role: { not: 'admin' } },
          { schoolId: { not: null } }
        ]
      },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            country: true,
            city: true,
            town: true
          }
        }
      }
    });
    
    console.log(`Encontrados ${usersWithSchools.length} usuarios no-admin con escuelas asignadas:`);
    
    let updatesCount = 0;
    
    for (const user of usersWithSchools) {
      if (user.school) {
        const needsUpdate = 
          user.country !== user.school.country ||
          user.city !== user.school.city ||
          user.town !== user.school.town;
        
        if (needsUpdate) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              country: user.school.country,
              city: user.school.city,
              town: user.school.town
            }
          });
          
          console.log(`✅ Usuario ${user.name || user.email} sincronizado con escuela ${user.school.name}`);
          console.log(`   Ubicación: ${user.school.town || 'N/A'}, ${user.school.city || 'N/A'}, ${user.school.country || 'N/A'}`);
          updatesCount++;
        } else {
          console.log(`ℹ️  Usuario ${user.name || user.email} ya tiene la ubicación correcta`);
        }
      }
    }
    
    console.log(`\n✅ Proceso completado. ${updatesCount} usuarios sincronizados.`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

syncUserLocationsWithSchools();
