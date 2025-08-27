import { NextResponse } from 'next/server';
import { testEmailConnection } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Verificación básica de seguridad
    const url = new URL(request.url);
    const authHeader = request.headers.get('authorization');
    const referer = request.headers.get('referer');
    
    // Solo permitir acceso desde la página de email-config o con header de auth
    if (!referer?.includes('/email-config') && !authHeader) {
      return NextResponse.json({
        success: false,
        error: 'Acceso no autorizado',
        message: 'Esta API solo es accesible desde el panel de diagnóstico'
      }, { status: 403 });
    }

    console.log('🔍 Acceso autorizado a diagnóstico de email desde:', referer);

    // Verificar variables de entorno
    const envVars = {
      EMAIL_PROVIDER: process.env.EMAIL_PROVIDER || 'not set',
      EMAIL_USER: process.env.EMAIL_USER ? '***@gmail.com' : 'not set',
      EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? '***hidden***' : 'not set',
      EMAIL_HOST: process.env.EMAIL_HOST || 'not set',
      EMAIL_PORT: process.env.EMAIL_PORT || 'not set',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'not set',
      NODE_ENV: process.env.NODE_ENV || 'not set'
    };

    console.log('🔍 Diagnóstico de Email - Variables de entorno:', envVars);

    // Verificar que las variables críticas estén configuradas
    const missingVars = [];
    if (!process.env.EMAIL_USER) missingVars.push('EMAIL_USER');
    if (!process.env.EMAIL_PASSWORD) missingVars.push('EMAIL_PASSWORD');

    if (missingVars.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Variables de entorno faltantes',
        missingVars,
        envVars,
        message: 'Configura las variables de entorno en tu proveedor de hosting'
      }, { status: 500 });
    }

    // Probar conexión de email
    const emailTest = await testEmailConnection();

    return NextResponse.json({
      success: emailTest.success,
      envVars,
      emailTest,
      message: emailTest.success 
        ? 'Configuración de email correcta' 
        : 'Error en configuración de email',
      instructions: {
        required_env_vars: [
          'EMAIL_PROVIDER=gmail',
          'EMAIL_USER=badeoapp@gmail.com',
          'EMAIL_PASSWORD=fqbp odjq dvwz meoy',
          'NEXTAUTH_URL=https://tu-dominio.vercel.app'
        ]
      }
    });

  } catch (error) {
    console.error('❌ Error en diagnóstico de email:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      message: 'Error al verificar configuración de email'
    }, { status: 500 });
  }
}
