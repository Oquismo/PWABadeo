import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { signAccessToken, generateRefreshToken, REFRESH_TOKEN_EXPIRY } from '@/lib/auth-tokens';
import { ensureDemoData, isDemoEnabled } from '@/lib/demo';

export const dynamic = 'force-dynamic';

/** Inicia sesión con la cuenta demo (solo lectura). */
export async function POST() {
  if (!isDemoEnabled()) {
    return NextResponse.json({ error: 'El modo demo no está disponible' }, { status: 404 });
  }

  try {
    const user = await ensureDemoData();

    const accessToken = await signAccessToken(user.id, user.role);
    const refreshTokenStr = generateRefreshToken();
    await prisma.refreshToken.create({
      data: {
        token: refreshTokenStr,
        userId: user.id,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY),
      },
    });

    const response = NextResponse.json({ user, message: 'Sesión demo iniciada' });
    response.cookies.set('auth-token', accessToken, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', path: '/', maxAge: 15 * 60,
    });
    response.cookies.set('refresh-token', refreshTokenStr, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', path: '/api/auth/refresh', maxAge: 24 * 60 * 60,
    });
    return response;
  } catch (error) {
    console.error('[demo] Error iniciando la demo:', error);
    return NextResponse.json({ error: 'No se pudo iniciar la demo' }, { status: 500 });
  }
}
