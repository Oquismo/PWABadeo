import { NextRequest } from 'next/server';
import loggerClient from '@/lib/loggerClient';

/**
 * Verifica si el usuario actual tiene permisos de administrador
 * IMPORTANTE: Esta es una implementación básica para desarrollo
 * En producción, deberías usar un sistema de autenticación más robusto
 */
/**
 * Verifica si el usuario actual tiene permisos de administrador
 * IMPORTANTE: Solo permite acceso desde el panel de administración
 */
export async function verifyAdminAccess(request: NextRequest | Request): Promise<boolean> {
  try {
    // VERIFICACIÓN CRÍTICA: Solo permitir desde panel de admin
    const referer = request.headers.get('referer');
    const origin = request.headers.get('origin');
    const userAgent = request.headers.get('user-agent');
    
    // LOG de seguridad
      loggerClient.info('🔒 [SECURITY CHECK]', {
      referer,
      origin,
      userAgent: userAgent?.substring(0, 50),
      timestamp: new Date().toISOString()
    });
    
    // REGLA 1: DEBE venir del panel de admin
    if (!referer || (!referer.includes('/admin') && !referer.includes('/debug'))) {
        loggerClient.warn('🚨 ACCESO DENEGADO - No viene del panel de admin');
        loggerClient.warn('🚨 Referer recibido:', referer);
      return false;
    }
    
    // REGLA 2: En desarrollo, DEBE ser localhost
    if (process.env.NODE_ENV === 'development') {
      const isLocalhost = (referer && (referer.includes('localhost') || referer.includes('127.0.0.1'))) ||
                         (origin && (origin.includes('localhost') || origin.includes('127.0.0.1')));
      
      if (!isLocalhost) {
          loggerClient.warn('🚨 ACCESO DENEGADO - No es localhost en desarrollo');
        return false;
      }
    }
    
    // REGLA 3: Verificar headers específicos de admin
    const authHeader = request.headers.get('authorization');
    const adminAccess = request.headers.get('x-admin-access');
    
    // DEBE tener headers de autorización de admin
    if (!authHeader?.includes('admin') || adminAccess !== 'true') {
        loggerClient.warn('🚨 ACCESO DENEGADO - Headers de admin faltantes');
        loggerClient.warn('🚨 Auth header:', authHeader);
        loggerClient.warn('🚨 Admin access header:', adminAccess);
      return false;
    }
    
    // REGLA 4: En producción, verificaciones adicionales
    if (process.env.NODE_ENV === 'production') {
      // Aquí añadirías verificaciones JWT reales, etc.
      // Por ahora, solo verificar que tiene los headers correctos
      if (!referer.includes('/admin')) {
          loggerClient.warn('🚨 ACCESO DENEGADO - Producción requiere acceso desde /admin');
        return false;
      }
    }
    
      loggerClient.info('✅ [SECURITY] Acceso de admin verificado correctamente');
    return true;
    
  } catch (error) {
      loggerClient.error('❌ [SECURITY] Error verificando acceso de admin:', error);
    return false;
  }
}

/**
 * Middleware de verificación de admin para APIs
 */
export function createAdminMiddleware() {
  return async (request: Request) => {
    const isAdmin = await verifyAdminAccess(request);
    
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ 
          error: 'Acceso denegado - Solo administradores',
          code: 'ADMIN_REQUIRED',
          timestamp: new Date().toISOString()
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    return null; // Continuar con la ejecución
  };
}

/**
 * Hook personalizado para verificar permisos de admin en componentes
 */
export function useAdminGuard() {
  return {
    requireAdmin: (user: any, isAuthenticated: boolean) => {
      if (!isAuthenticated) {
        throw new Error('AUTHENTICATION_REQUIRED');
      }
      
      if (!user || user.role !== 'admin') {
        throw new Error('ADMIN_REQUIRED');
      }
      
      return true;
    }
  };
}

/**
 * Constantes de seguridad
 */
export const SECURITY_CONFIG = {
  ADMIN_REQUIRED_ROUTES: [
    '/debug',
    '/api/debug',
    '/admin'
  ],
  ERROR_MESSAGES: {
    ADMIN_REQUIRED: '🚫 Solo administradores pueden acceder a esta función',
    AUTHENTICATION_REQUIRED: '🔒 Debes iniciar sesión para continuar',
    ACCESS_DENIED: '❌ Acceso denegado'
  }
} as const;
