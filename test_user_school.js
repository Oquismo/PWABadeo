const { PrismaClient } = require('@prisma/client');

async function testUserWithSchool() {
  const prisma = new PrismaClient();
  
  try {
    // Verificar usuario con escuela
    const users = await prisma.user.findMany({
      where: {
        schoolId: { not: null }
      },
      include: {
        school: true
      }
    });
    
    console.log('Usuarios con escuela asignada:');
    users.forEach(user => {
      console.log(`- ID: ${user.id}, Email: ${user.email}, Role: ${user.role}`);
      console.log(`  Ubicación usuario: ${user.country}, ${user.city}, ${user.town}`);
      if (user.school) {
        console.log(`  Escuela: ${user.school.name}`);
        console.log(`  Ubicación escuela: ${user.school.country}, ${user.school.city}, ${user.school.town}`);
      }
      console.log('---');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUserWithSchool();
