import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth-tokens';

const publicRoutes = [
  '/login', '/registro', '/forgot-password', '/reset-password',
  '/test-auth', '/test-login', '/test-email', '/unauthorized',
  '/create-school', '/politica-privacidad', '/privacy-policy',
  '/cuenta-eliminada', '/demo',
];

const publicPaths = [
  '/api/auth/login', '/api/auth/login-retry', '/api/auth/register',
  '/api/auth/forgot-password', '/api/auth/reset-password',
  '/api/auth/validate-reset-token', '/api/auth/logout',
  '/api/auth/refresh',
  '/api/schools', '/api/health', '/api/tasks',
  '/api/telemetry', '/api/auth/demo',
];

// Modo demo: el rol "demo" solo puede leer. Estas escrituras sí se permiten
// porque no modifican datos de la app (sesión, telemetría o lecturas vía POST).
const DEMO_ROLE = 'demo';
const demoAllowedWrites = [
  '/api/auth/refresh', '/api/auth/logout', '/api/auth/demo',
  '/api/user/by-email', '/api/telemetry', '/api/telemetry/events',
];
const READ_METHODS = ['GET', 'HEAD', 'OPTIONS'];

// Despliegue "solo demo" (rama modo-demo en Vercel, o DEMO_ONLY=true):
// quien abra el enlace entra directamente en la demo, sin login ni registro.
const DEMO_BRANCH = 'modo-demo';
const isDemoOnlyDeployment =
  process.env.DEMO_ONLY === 'true' || process.env.VERCEL_GIT_COMMIT_REF === DEMO_BRANCH;
const demoOnlyRedirects = ['/login', '/registro', '/forgot-password', '/reset-password'];

const publicPathPrefixes = ['/api/user/', '/api/public/'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bloqueo de escrituras para la cuenta demo (antes de cualquier ruta pública)
  if (pathname.startsWith('/api/') && !READ_METHODS.includes(request.method) && !demoAllowedWrites.includes(pathname)) {
    const token = request.cookies.get('auth-token')?.value;
    const payload = token ? await verifyAccessToken(token) : null;
    if (payload?.role === DEMO_ROLE) {
      return NextResponse.json(
        { error: 'Estás en modo demo: los cambios no se guardan.', demo: true },
        { status: 403, headers: { 'x-demo-readonly': '1' } }
      );
    }
  }

  if (isDemoOnlyDeployment && !pathname.startsWith('/api/') && !pathname.startsWith('/_next/') && !pathname.includes('.') && pathname !== '/demo') {
    const token = request.cookies.get('auth-token')?.value;
    const payload = token ? await verifyAccessToken(token) : null;
    if (!payload || demoOnlyRedirects.includes(pathname)) {
      return NextResponse.redirect(new URL('/demo', request.url));
    }
  }

  if (publicRoutes.includes(pathname) || publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  if (publicPathPrefixes.some(prefix => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/icons/') || pathname === '/manifest.json' ||
    pathname === '/robots.txt' || pathname === '/sitemap.xml' ||
    pathname === '/offline.html' || pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const authToken = request.cookies.get('auth-token')?.value;

  if (!authToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const payload = await verifyAccessToken(authToken);
  if (!payload) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 401 });
    }
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith('/api/admin/') && payload.role !== 'admin') {
    return NextResponse.json({ error: 'Se requieren permisos de administrador' }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons/|manifest.json|robots.txt|sitemap.xml|offline.html).*)',
  ],
};
