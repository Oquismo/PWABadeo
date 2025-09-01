// Script para consultar las escuelas en la base de datos
const { PrismaClient } = require('@prisma/client');

async function listSchools() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Consultando escuelas en la base de datos...');
    
    const schools = await prisma.school.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`📊 Total de escuelas encontradas: ${schools.length}`);
    
    if (schools.length > 0) {
      console.log('\n📋 Lista de escuelas:');
      schools.forEach((school, index) => {
        console.log(`\n${index + 1}. ${school.name}`);
        console.log(`   📍 ${school.address}, ${school.city} (${school.province})`);
        console.log(`   📞 ${school.phoneNumber || 'No disponible'}`);
        console.log(`   📧 ${school.email || 'No disponible'}`);
        console.log(`   🏫 Tipo: ${school.type} | Nivel: ${school.level}`);
        console.log(`   ✅ Activa: ${school.isActive ? 'Sí' : 'No'}`);
        console.log(`   📅 Creada: ${school.createdAt.toLocaleDateString()}`);
      });
    } else {
      console.log('❌ No se encontraron escuelas en la base de datos');
    }
    
  } catch (error) {
    console.error('❌ Error al consultar las escuelas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la función
listSchools();
