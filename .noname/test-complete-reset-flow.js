const { PrismaClient } = require('@prisma/client');

async function testCompletePasswordResetFlow() {
  console.log('🧪 Iniciando test completo del flujo de reseteo de contraseña...');
  
  const testEmail = 'rovetta215@gmail.com';
  const baseUrl = 'http://localhost:3000';
  
  try {
    // 1. Solicitar reseteo de contraseña
    console.log(`\n1️⃣ Solicitando reseteo para: ${testEmail}`);
    
    const forgotResponse = await fetch(`${baseUrl}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    });
    
    const forgotResult = await forgotResponse.json();
    console.log('   Respuesta forgot-password:', {
      status: forgotResponse.status,
      success: forgotResult.success,
      message: forgotResult.message,
      error: forgotResult.error
    });
    
    // 2. Obtener el token generado de la base de datos
    console.log('\n2️⃣ Obteniendo token de la base de datos...');
    
    const prisma = new PrismaClient();
    const tokens = await prisma.$queryRaw`
      SELECT token, "expiresAt", used 
      FROM "PasswordResetToken" 
      WHERE email = ${testEmail} 
      ORDER BY "createdAt" DESC 
      LIMIT 1
    `;
    
    if (tokens.length === 0) {
      throw new Error('No se encontró token generado');
    }
    
    const token = tokens[0].token;
    console.log('   Token encontrado:', {
      token: token.substring(0, 8) + '...',
      expires: tokens[0].expiresAt,
      used: tokens[0].used
    });
    
    // 3. Validar el token
    console.log('\n3️⃣ Validando token...');
    
    const validateResponse = await fetch(`${baseUrl}/api/auth/validate-reset-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    
    const validateResult = await validateResponse.json();
    console.log('   Respuesta validación:', {
      status: validateResponse.status,
      valid: validateResult.valid,
      email: validateResult.email,
      error: validateResult.error
    });
    
    // 4. Resetear la contraseña
    if (validateResult.valid) {
      console.log('\n4️⃣ Reseteando contraseña...');
      
      const newPassword = 'nuevaPassword123';
      const resetResponse = await fetch(`${baseUrl}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: newPassword }),
      });
      
      const resetResult = await resetResponse.json();
      console.log('   Respuesta reset:', {
        status: resetResponse.status,
        success: resetResult.success,
        message: resetResult.message,
        error: resetResult.error
      });
      
      // 5. Verificar que el token se marcó como usado
      console.log('\n5️⃣ Verificando estado del token...');
      
      const usedTokens = await prisma.$queryRaw`
        SELECT used, "expiresAt"
        FROM "PasswordResetToken" 
        WHERE token = ${token}
      `;
      
      console.log('   Estado del token:', {
        used: usedTokens[0]?.used,
        expired: usedTokens[0]?.expiresAt < new Date()
      });
      
      // 6. Intentar usar el token nuevamente (debería fallar)
      console.log('\n6️⃣ Intentando reutilizar token (debería fallar)...');
      
      const reuseResponse = await fetch(`${baseUrl}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: 'otraPassword123' }),
      });
      
      const reuseResult = await reuseResponse.json();
      console.log('   Respuesta reutilización:', {
        status: reuseResponse.status,
        success: reuseResult.success,
        error: reuseResult.error
      });
      
      // 7. Probar login con nueva contraseña
      console.log('\n7️⃣ Probando login con nueva contraseña...');
      
      const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail, password: newPassword }),
      });
      
      const loginResult = await loginResponse.json();
      console.log('   Respuesta login:', {
        status: loginResponse.status,
        user: loginResult.user ? `${loginResult.user.email} (${loginResult.user.name})` : 'No user',
        error: loginResult.error
      });
    }
    
    await prisma.$disconnect();
    console.log('\n✅ Test completado exitosamente');
    
  } catch (error) {
    console.error('\n❌ Error en test:', error.message);
  }
}

testCompletePasswordResetFlow();
