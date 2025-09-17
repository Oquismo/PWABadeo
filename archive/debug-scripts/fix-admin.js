const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function fixAdmin() {
  try {
    // Hash correcto para "admin123"
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    // Actualizar el password del admin
    const updatedUser = await prisma.user.update({
      where: { email: 'admin@badeo.com' },
      data: { 
        password: hashedPassword,
        role: 'admin'
      }
    });
    
    console.log('✅ Password de admin actualizado correctamente');
    console.log('📧 Email: admin@badeo.com');
    console.log('🔑 Password: admin123');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdmin();
