import { NextResponse } from 'next/server';
import { logActionServer } from '@/lib/logger';
import { prisma } from '@/lib/db';
import loggerClient from '@/lib/loggerClient';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
  loggerClient.info('🔐 /api/auth/login-retry called');
    
    let email, password;
    try {
      const body = await request.json();
      email = body.email;
      password = body.password;
  loggerClient.debug('📧 Login attempt for email:', email ? 'provided' : 'missing');
  loggerClient.debug('🔑 Password provided:', password ? 'yes' : 'no');
    } catch (jsonErr) {
      loggerClient.error('❌ JSON parse error in login-retry:', jsonErr);
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    
    const onlyAdmins = process.env.ONLY_ADMIN_LOGIN === 'true';
  loggerClient.debug('👮 Admin-only mode:', onlyAdmins);

    if (!email || !password) {
      loggerClient.warn('❌ Missing credentials', { hasEmail: !!email, hasPassword: !!password });
      return NextResponse.json(
        { error: 'Email y contraseña requeridos' }, 
        { status: 400 }
      );
    }

    // Estrategia de reintentos para consultas de base de datos
    let queryAttempts = 0;
    const maxAttempts = 3;
    
    while (queryAttempts < maxAttempts) {
      try {
  loggerClient.debug(`🔄 Intento ${queryAttempts + 1} de consulta a base de datos`);
        
        const bcrypt = await import('bcrypt');
        
        // Timeout de 10 segundos para la consulta
        const queryPromise = prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            role: true,
            schoolId: true, // Incluir schoolId para filtrar escuelas
          }
        });
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout')), 10000)
        );
        
        const user = await Promise.race([queryPromise, timeoutPromise]) as any;
  loggerClient.info('✅ Consulta ejecutada exitosamente');
  loggerClient.debug('👤 User found:', user ? 'yes' : 'no');

        if (!user) {
          loggerClient.warn('❌ Credenciales inválidas - usuario no encontrado');
          return NextResponse.json(
            { error: 'Credenciales inválidas' }, 
            { status: 401 }
          );
        }

  loggerClient.debug('🔍 Verifying password...');
  const isValid = await bcrypt.compare(password, user.password);
  loggerClient.debug('🔑 Password valid:', isValid);
        
        if (!isValid) {
          loggerClient.warn('❌ Credenciales inválidas - contraseña incorrecta');
          return NextResponse.json(
            { error: 'Credenciales inválidas' }, 
            { status: 401 }
          );
        }

        // Solo restringir si flag activo
        if (onlyAdmins && user.role !== 'admin') {
          loggerClient.warn('❌ Acceso denegado - usuario no es admin, role:', user.role);
          return NextResponse.json(
            { error: 'Solo administradores pueden iniciar sesión.' },
            { status: 403 }
          );
        }

        const { password: _, ...userWithoutPassword } = user;

        try {
          await logActionServer({ userId: user.id, action: 'login', meta: { email: user.email, retry: true }, updateLastSeen: true });
        } catch (e) {
    loggerClient.warn('No se pudo registrar log de login (retry)', e);
        }

        // Crear respuesta con cookies para autenticación
        const response = NextResponse.json({
          user: userWithoutPassword,
          message: 'Login exitoso'
        });

        // Establecer cookies para el middleware
        const authToken = Buffer.from(JSON.stringify({ userId: user.id, timestamp: Date.now() })).toString('base64');
        
  loggerClient.debug('🍪 [RETRY] Estableciendo cookies de autenticación:', {
          authToken: authToken.substring(0, 20) + '...',
          userRole: userWithoutPassword.role,
          userId: user.id
        });
        
        response.cookies.set('auth-token', authToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7 // 7 días
        });

        response.cookies.set('user', JSON.stringify(userWithoutPassword), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7 // 7 días
        });

  return response;

    } catch (queryError) {
    queryAttempts++;
  loggerClient.error(`❌ Error en intento ${queryAttempts}:`, queryError);
        
        if (queryAttempts >= maxAttempts) {
          // Si fallaron todos los intentos, devolver error específico
          return NextResponse.json(
            { 
              error: 'Error de conexión a base de datos',
              details: 'No se pudo conectar a la base de datos después de varios intentos',
              attempts: queryAttempts,
              lastError: queryError instanceof Error ? queryError.message : 'Unknown error'
            },
            { status: 503 }
          );
        }
        
        // Esperar antes del siguiente intento
        await new Promise(resolve => setTimeout(resolve, 1000 * queryAttempts));
      }
    }

  } catch (error) {
  loggerClient.error('❌ Error general en login:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
