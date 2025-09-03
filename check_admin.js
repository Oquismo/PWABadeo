const { PrismaClient } = require('@prisma/client');

async function checkAdminLocation() {
  const prisma = new PrismaClient();
  
  try {
    // Buscar usuarios admin
    const admins = await prisma.user.findMany({
      where: {
        role: 'admin'
      }
    });
    
    console.log('Usuarios administradores encontrados:');
    admins.forEach(admin => {
      console.log(`- ID: ${admin.id}, Email: ${admin.email}`);
      console.log(`  Nombre: ${admin.name || 'No especificado'}`);
      console.log(`  Ubicación: ${admin.country || 'No'}, ${admin.city || 'No'}, ${admin.town || 'No'}`);
      console.log('---');
    });
    
    if (admins.length === 0) {
      console.log('No hay usuarios admin. Creando uno de prueba...');
      
      const newAdmin = await prisma.user.create({
        data: {
          email: 'admin-test@badeo.com',
          password: '$2b$10$example.hash', // Hash ejemplo
          name: 'Admin Test',
          role: 'admin',
          country: 'España',
          city: 'Madrid',
          town: 'Getafe'
        }
      });
      
      console.log('✅ Admin de prueba creado:');
      console.log(`- Email: ${newAdmin.email}`);
      console.log(`- Ubicación: ${newAdmin.country}, ${newAdmin.city}, ${newAdmin.town}`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminLocation();
