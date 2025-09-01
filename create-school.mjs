import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    
    // Verificar conexión
    await prisma.$connect();
    console.log('✅ Conexión exitosa');
    
    // Crear escuela de ejemplo
    console.log('🏫 Creando escuela de ejemplo...');
    
    const school = await prisma.school.create({
      data: {
        name: "CEIP Miguel de Cervantes",
        address: "Calle de la Educación, 123",
        city: "Madrid",
        province: "Madrid", 
        country: "España",
        phoneNumber: "+34 91 123 45 67",
        email: "secretaria@ceip-cervantes.edu.es",
        website: "https://ceip-cervantes.educamadrid.org",
        type: "pública",
        level: "primaria",
        description: "Centro educativo público de educación infantil y primaria ubicado en el distrito centro de Madrid.",
        isActive: true
      }
    });
    
    console.log('✅ Escuela creada exitosamente:');
    console.log(`   📋 ID: ${school.id}`);
    console.log(`   🏫 Nombre: ${school.name}`);
    console.log(`   📍 Ubicación: ${school.city}, ${school.province}`);
    
    // Listar todas las escuelas
    const allSchools = await prisma.school.findMany();
    console.log(`\n📊 Total de escuelas en la base de datos: ${allSchools.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
