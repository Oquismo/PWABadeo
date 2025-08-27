import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // PROTECCIÓN ESTRICTA: Bloquear TODAS las rutas de debug
  if (request.nextUrl.pathname.startsWith('/debug')) {
    
    // BLOQUEO TOTAL: Solo permitir acceso desde el panel de admin
    const referer = request.headers.get('referer');
    const userAgent = request.headers.get('user-agent');
    
    // Verificar que NO se accede directamente por URL
    if (!referer || !referer.includes('/admin')) {
      console.warn('🚨 ACCESO BLOQUEADO - Intento de acceso directo a debug:', request.nextUrl.pathname);
      console.warn('🚨 Referer:', referer);
      console.warn('🚨 User Agent:', userAgent);
      
      // Redirigir a página de acceso no autorizado
      const unauthorizedUrl = new URL('/unauthorized', request.url);
      return NextResponse.redirect(unauthorizedUrl);
    }
    
    // Verificar autenticación básica (esto se debería mejorar con JWT real)
    const authCookie = request.cookies.get('auth-token');
    const userRole = request.cookies.get('user-role');
    
    // Si no hay autenticación, bloquear
    if (!authCookie && process.env.NODE_ENV === 'production') {
      console.warn('🚨 ACCESO BLOQUEADO - Sin autenticación');
      const homeUrl = new URL('/', request.url);
      return NextResponse.redirect(homeUrl);
    }
    
    // DESARROLLO: Permitir solo desde localhost y con referer admin
    if (process.env.NODE_ENV === 'development') {
      const origin = request.headers.get('origin');
      const host = request.headers.get('host');
      
      if (!origin?.includes('localhost') && !host?.includes('localhost')) {
        console.warn('🚨 ACCESO BLOQUEADO - No es localhost en desarrollo');
        const unauthorizedUrl = new URL('/unauthorized', request.url);
        return NextResponse.redirect(unauthorizedUrl);
      }
    }
  }

  // PROTECCIÓN ESTRICTA: APIs de debug
  if (request.nextUrl.pathname.startsWith('/api/debug')) {
    
    // Verificar que viene del panel de admin
    const referer = request.headers.get('referer');
    const origin = request.headers.get('origin');
    
    if (!referer || (!referer.includes('/admin') && !referer.includes('/debug'))) {
      console.warn('🚨 API BLOQUEADA - Sin referer admin:', request.nextUrl.pathname);
      return NextResponse.json(
        { 
          error: 'Acceso denegado - Solo desde panel de administración',
          code: 'ADMIN_PANEL_REQUIRED',
          timestamp: new Date().toISOString()
        },
        { status: 403 }
      );
    }
    
    // En desarrollo, verificar localhost
    if (process.env.NODE_ENV === 'development') {
      if (!origin?.includes('localhost') && !referer?.includes('localhost')) {
        console.warn('🚨 API BLOQUEADA - No es localhost');
        return NextResponse.json(
          { error: 'Acceso denegado - Solo localhost en desarrollo' },
          { status: 403 }
        );
      }
    }
  }

  return NextResponse.next();
}

// Configurar qué rutas debe interceptar el middleware
export const config = {
  matcher: [
    '/debug/:path*',
    '/api/debug/:path*'
  ]
};
