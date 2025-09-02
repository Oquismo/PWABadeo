const { PrismaClient } = require('@prisma/client');

async function testPasswordReset() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Iniciando pruebas de reseteo de contraseña...');
    
    // 1. Verificar que existe la tabla PasswordResetToken
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'PasswordResetToken'
      )
    `;
    console.log('📋 Tabla PasswordResetToken existe:', tableExists[0].exists);
    
    // 2. Verificar usuarios existentes
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true }
    });
    console.log(`👥 Usuarios encontrados: ${users.length}`);
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.name || 'sin nombre'})`);
    });
    
    // 3. Verificar tokens existentes
    const tokens = await prisma.$queryRaw`
      SELECT email, token, "createdAt", "expiresAt", used 
      FROM "PasswordResetToken" 
      ORDER BY "createdAt" DESC
    `;
    console.log(`🔑 Tokens de reset encontrados: ${tokens.length}`);
    tokens.forEach(token => {
      const isExpired = new Date(token.expiresAt) < new Date();
      console.log(`  - ${token.email}: ${token.token.substring(0, 8)}... (${isExpired ? 'EXPIRADO' : 'VÁLIDO'}, usado: ${token.used})`);
    });
    
    // 4. Crear un token de prueba para el primer usuario
    if (users.length > 0) {
      const testUser = users[0];
      const crypto = require('crypto');
      const testToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);
      
      // Limpiar tokens anteriores
      await prisma.$executeRaw`
        DELETE FROM "PasswordResetToken" 
        WHERE email = ${testUser.email}
      `;
      
      // Crear nuevo token
      await prisma.$executeRaw`
        INSERT INTO "PasswordResetToken" (email, token, "expiresAt", used, "createdAt")
        VALUES (${testUser.email}, ${testToken}, ${expiresAt}, false, NOW())
      `;
      
      console.log(`✅ Token de prueba creado para ${testUser.email}`);
      console.log(`🔗 URL de prueba: http://localhost:3000/reset-password?token=${testToken}`);
      console.log(`⏰ Expira en: ${expiresAt.toLocaleString()}`);
    }
    
    console.log('🎉 Pruebas completadas exitosamente');
    
  } catch (error) {
    console.error('❌ Error en pruebas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPasswordReset();
