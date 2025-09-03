import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Variables para gestión de cold starts
let isWarmingUp = false;
let lastWarmupTime = 0;
const WARMUP_INTERVAL = 5 * 60 * 1000; // 5 minutos

// Función para pre-calentar la conexión de base de datos
async function warmupDatabase() {
  if (isWarmingUp || Date.now() - lastWarmupTime < WARMUP_INTERVAL) {
    return;
  }
  
  isWarmingUp = true;
  lastWarmupTime = Date.now();
  
  try {
    // Ping rápido a la base de datos en background
    fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/health`, {
      method: 'GET',
      headers: { 'x-warmup': 'true' }
    }).catch(() => {}); // Silenciar errores del warmup
  } catch (error) {
    console.warn('Database warmup failed:', error);
  } finally {
    isWarmingUp = false;
  }
}

// Rutas públicas que no requieren autenticación
const publicRoutes = [
  '/login',
  '/login-simple',
  '/registro',
  '/forgot-password',
  '/reset-password',
  '/test-auth',
  '/test-login',
  '/test-email',
  '/unauthorized',
  '/create-school'
  // '/' // Página principal ahora protegida, solo con login
];

// Rutas públicas adicionales que pueden ser accedidas sin login
const publicPaths = [
  '/api/auth/login',
  '/api/auth/login-retry',
  '/api/auth/login-simple',
  '/api/auth/login-test',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/validate-reset-token',
  '/api/auth/logout',
  // '/api/schools', // Ahora requiere login
  // '/api/admin/schools', // Ahora requiere login
  // '/api/announcement/sse', // Ahora requiere login
  '/api/tasks' // API pública para tareas (si es necesario)
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Activar warmup en background para APIs críticas
  if (pathname.startsWith('/api/') && !pathname.includes('warmup')) {
    warmupDatabase();
  }

  // EXCEPCIÓN: Permitir acceso a rutas públicas
  if (publicRoutes.includes(pathname) || publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // EXCEPCIÓN: Permitir acceso a archivos estáticos y API públicas
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/public/') ||
    pathname.includes('.') // archivos con extensión
  ) {
    return NextResponse.next();
  }

  // EXCEPCIÓN: Permitir acceso a la página de diagnóstico de email (con auth interna)
  if (request.nextUrl.pathname === '/email-config') {
    console.log('✅ Permitiendo acceso a página de diagnóstico de email (requiere auth interna)');
    return NextResponse.next();
  }

  // EXCEPCIÓN: Permitir acceso a documentación de admin (solo lectura)
  if (request.nextUrl.pathname === '/admin-docs') {
    console.log('✅ Permitiendo acceso a documentación de admin');
    return NextResponse.next();
  }

  // ESTRATEGIA SIMPLIFICADA: Sistema actual usa localStorage
  // El middleware permitirá acceso a páginas y dejará verificación al frontend
  // Solo protegerá APIs críticas que necesiten verificación del lado servidor

  const authToken = request.cookies.get('auth-token')?.value;
  const userData = request.cookies.get('user')?.value;

  // PROTEGER SOLO APIs CRÍTICAS
  if (pathname.startsWith('/api/admin/')) {
    if (!authToken || !userData) {
      console.log('🚨 API ADMIN BLOQUEADA - Sin autenticación:', pathname);
      return NextResponse.json(
        { error: 'Acceso denegado - Autenticación requerida' },
        { status: 401 }
      );
    }

    try {
      const user = JSON.parse(userData);
      if (user.role !== 'admin') {
        console.log('🚨 API ADMIN BLOQUEADA - Usuario no admin');
        return NextResponse.json(
          { error: 'Acceso denegado - Se requieren permisos de administrador' },
          { status: 403 }
        );
      }
    } catch (error) {
      console.log('🚨 API ADMIN BLOQUEADA - Datos inválidos');
      return NextResponse.json(
        { error: 'Acceso denegado - Sesión inválida' },
        { status: 401 }
      );
    }
  }

  // PROTEGER APIs DE DEBUG (solo en producción)
  if (pathname.startsWith('/api/debug/')) {
    if (process.env.NODE_ENV === 'production') {
      if (!authToken || !userData) {
        console.log('🚨 API DEBUG BLOQUEADA - Producción sin auth');
        return NextResponse.json(
          { error: 'Acceso denegado - Ambiente de desarrollo requerido' },
          { status: 403 }
        );
      }
    }
  }

  // PERMITIR ACCESO A TODAS LAS DEMÁS RUTAS
  // El frontend (localStorage) manejará la autenticación de páginas
  return NextResponse.next();
}

// Configurar qué rutas debe interceptar el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - API routes (except specific ones we want to protect)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|api/).*)',
    '/api/admin/:path*',
    '/api/debug/:path*'
  ]
};
