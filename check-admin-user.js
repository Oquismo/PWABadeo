const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAdminUser() {
  try {
    console.log('🔍 Verificando datos del usuario admin...');
    
    const user = await prisma.user.findUnique({
      where: { email: 'rovetta215@gmail.com' },
      include: {
        school: true
      }
    });
    
    if (user) {
      console.log('👤 Usuario encontrado:');
      console.log('ID:', user.id);
      console.log('Email:', user.email);
      console.log('Name:', user.name);
      console.log('Role:', user.role);
      console.log('Country:', user.country);
      console.log('City:', user.city);
      console.log('Town:', user.town);
      console.log('School:', user.school ? {
        id: user.school.id,
        name: user.school.name,
        country: user.school.country,
        city: user.school.city,
        town: user.school.town
      } : 'No school');
      
      if (!user.country && !user.city && !user.town) {
        console.log('⚠️  El usuario admin no tiene ubicación configurada');
        console.log('💡 Necesita configurar su ubicación en el perfil');
      }
    } else {
      console.log('❌ Usuario no encontrado');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminUser();
