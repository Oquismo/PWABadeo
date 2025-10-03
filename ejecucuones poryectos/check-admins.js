const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAdmins() {
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'admin' },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        role: true,
        password: true
      }
    });
    
    console.log('👥 Usuarios admin encontrados:', admins.length);
    admins.forEach((admin, index) => {
      console.log(`${index + 1}. Email: ${admin.email}`);
      console.log(`   Nombre: ${admin.firstName} ${admin.lastName}`);
      console.log(`   Password hash: ${admin.password.substring(0, 20)}...`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmins();
