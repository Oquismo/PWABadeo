const path = require('path');

// Simular diferentes entornos
function testEmailUrlGeneration() {
  console.log('🧪 Probando generación de URLs para reseteo de contraseña...\n');
  
  const scenarios = [
    {
      name: 'Desarrollo Local',
      NODE_ENV: 'development',
      NEXTAUTH_URL: 'http://localhost:3001',
      NEXT_PUBLIC_APP_URL: 'https://pwa-badeo.vercel.app',
      expectedUrl: 'http://localhost:3001'
    },
    {
      name: 'Producción Vercel',
      NODE_ENV: 'production',
      NEXTAUTH_URL: 'https://pwa-badeo.vercel.app',
      NEXT_PUBLIC_APP_URL: 'https://pwa-badeo.vercel.app',
      expectedUrl: 'https://pwa-badeo.vercel.app'
    },
    {
      name: 'Producción sin NEXTAUTH_URL',
      NODE_ENV: 'production',
      NEXTAUTH_URL: undefined,
      NEXT_PUBLIC_APP_URL: 'https://pwa-badeo.vercel.app',
      expectedUrl: 'https://pwa-badeo.vercel.app'
    },
    {
      name: 'Desarrollo sin variables',
      NODE_ENV: 'development',
      NEXTAUTH_URL: undefined,
      NEXT_PUBLIC_APP_URL: undefined,
      expectedUrl: 'http://localhost:3000'
    }
  ];
  
  scenarios.forEach((scenario, index) => {
    console.log(`${index + 1}. ${scenario.name}:`);
    
    // Simular variables de entorno
    const originalEnv = process.env.NODE_ENV;
    const originalNextAuth = process.env.NEXTAUTH_URL;
    const originalPublicUrl = process.env.NEXT_PUBLIC_APP_URL;
    
    process.env.NODE_ENV = scenario.NODE_ENV;
    if (scenario.NEXTAUTH_URL === undefined) {
      delete process.env.NEXTAUTH_URL;
    } else {
      process.env.NEXTAUTH_URL = scenario.NEXTAUTH_URL;
    }
    if (scenario.NEXT_PUBLIC_APP_URL === undefined) {
      delete process.env.NEXT_PUBLIC_APP_URL;
    } else {
      process.env.NEXT_PUBLIC_APP_URL = scenario.NEXT_PUBLIC_APP_URL;
    }
    
    // Lógica de determinación de URL (copiada de email.ts actualizada)
    let baseUrl;
    if (process.env.NODE_ENV === 'production') {
      baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'https://pwa-badeo.vercel.app';
    } else {
      baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    }
    
    const testToken = 'abc123token';
    const resetUrl = `${baseUrl}/reset-password?token=${testToken}`;
    
    console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`   NEXTAUTH_URL: ${process.env.NEXTAUTH_URL || 'undefined'}`);
    console.log(`   NEXT_PUBLIC_APP_URL: ${process.env.NEXT_PUBLIC_APP_URL || 'undefined'}`);
    console.log(`   Base URL generada: ${baseUrl}`);
    console.log(`   URL completa: ${resetUrl}`);
    console.log(`   ✅ Esperado: ${scenario.expectedUrl}/reset-password?token=${testToken}`);
    console.log(`   ${baseUrl === scenario.expectedUrl ? '✅' : '❌'} ${baseUrl === scenario.expectedUrl ? 'CORRECTO' : 'INCORRECTO'}\n`);
    
    // Restaurar entorno original
    process.env.NODE_ENV = originalEnv;
    if (originalNextAuth !== undefined) {
      process.env.NEXTAUTH_URL = originalNextAuth;
    }
    if (originalPublicUrl !== undefined) {
      process.env.NEXT_PUBLIC_APP_URL = originalPublicUrl;
    }
  });
  
  console.log('🎉 Prueba completada');
}

testEmailUrlGeneration();
