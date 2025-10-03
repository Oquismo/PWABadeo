const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Crear usuario admin con password simple para prueba
    const admin = await prisma.user.create({
      data: {
        email: 'admin@badeo.com',
        name: 'Admin Badeo',
        firstName: 'Admin',
        lastName: 'Badeo',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.zM2YY2', // "admin123"
        role: 'admin',
        country: 'España',
        city: 'Sevilla'
      }
    });
    
    console.log('✅ Usuario admin creado exitosamente');
    console.log('📧 Email: admin@badeo.com');
    console.log('🔑 Password: admin123');
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('⚠️ El usuario admin ya existe');
      
      // Actualizar a admin si no lo es
      const user = await prisma.user.update({
        where: { email: 'admin@badeo.com' },
        data: { role: 'admin' }
      });
      console.log('✅ Usuario actualizado a admin');
    } else {
      console.error('❌ Error creando admin:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
