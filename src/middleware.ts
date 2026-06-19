import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth-tokens';

const publicRoutes = [
  '/login', '/registro', '/forgot-password', '/reset-password',
  '/test-auth', '/test-login', '/test-email', '/unauthorized',
  '/create-school', '/politica-privacidad', '/privacy-policy',
  '/cuenta-eliminada',
];

const publicPaths = [
  '/api/auth/login', '/api/auth/login-retry', '/api/auth/register',
  '/api/auth/forgot-password', '/api/auth/reset-password',
  '/api/auth/validate-reset-token', '/api/auth/logout',
  '/api/auth/refresh',
  '/api/schools', '/api/health', '/api/tasks',
  '/api/telemetry',
];

const publicPathPrefixes = ['/api/user/', '/api/public/'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
