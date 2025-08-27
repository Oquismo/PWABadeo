import { NextResponse } from 'next/server';
import { debugUsers } from '@/lib/debug-auth';
import { verifyAdminAccess, SECURITY_CONFIG } from '@/lib/security';
import SecurityLogger from '@/lib/security-logger';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // VERIFICACIÓN DE SEGURIDAD CRÍTICA
    const isAdmin = await verifyAdminAccess(request);
    
    if (!isAdmin) {
      SecurityLogger.logAdminAccess('/api/debug/users', 'DENIED', request);
      console.warn('🚨 INTENTO DE ACCESO NO AUTORIZADO a /api/debug/users');
      console.warn('🚨 Headers:', {
        referer: request.headers.get('referer'),
        origin: request.headers.get('origin'),
        userAgent: request.headers.get('user-agent')?.substring(0, 100)
      });
      return NextResponse.json(
        { 
          error: SECURITY_CONFIG.ERROR_MESSAGES.ADMIN_REQUIRED,
          code: 'ADMIN_REQUIRED',
          timestamp: new Date().toISOString()
        },
        { status: 403 }
      );
    }

    console.log('✅ [API DEBUG] Acceso autorizado a /api/debug/users');
    SecurityLogger.logAdminAccess('/api/debug/users', 'SUCCESS', request);

    SecurityLogger.logAdminAccess('/api/debug/users', 'SUCCESS', request, 'admin');
    const users = await debugUsers();
    
    return NextResponse.json({
      success: true,
      userCount: users.length,
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        passwordIsHashed: user.password.startsWith('$2b$') || user.password.startsWith('$2a$'),
        passwordLength: user.password.length,
        createdAt: user.createdAt
      }))
    });
  } catch (error) {
    console.error('Debug auth error:', error);
    return NextResponse.json(
      { 
        error: 'Error checking users',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
