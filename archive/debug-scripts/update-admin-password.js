const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function updateAdminPassword() {
  try {
    // Generar un nuevo hash para el password "admin123"
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    // Actualizar el usuario admin existente
    const updatedUser = await prisma.user.update({
      where: { email: 'admin@badeo.com' },
      data: { 
        password: hashedPassword,
        role: 'admin' // Asegurar que sea admin
      }
    });
    
    console.log('✅ Password actualizado exitosamente');
    console.log('📧 Email: admin@badeo.com');
    console.log('🔑 Password: admin123');
    console.log('🔐 Nuevo hash:', hashedPassword.substring(0, 30) + '...');
    
    // Verificar el hash
    const isValid = await bcrypt.compare('admin123', hashedPassword);
    console.log('✅ Verificación del hash:', isValid ? 'CORRECTO' : 'INCORRECTO');
    
  } catch (error) {
    console.error('❌ Error actualizando password:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminPassword();
