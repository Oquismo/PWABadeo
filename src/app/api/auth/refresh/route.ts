import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { signAccessToken, generateRefreshToken, REFRESH_TOKEN_EXPIRY } from '@/lib/auth-tokens';

export async function POST(request: NextRequest) {
  try {
    const refreshTokenStr = request.cookies.get('refresh-token')?.value;
    if (!refreshTokenStr) {
      return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
    }

    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshTokenStr } });
    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Refresh token inválido o expirado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: stored.userId }, select: { id: true, role: true } });
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 401 });
    }

    // Rotar refresh token: revocar el viejo, crear uno nuevo
    await prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });

    const newRefreshTokenStr = generateRefreshToken();
    await prisma.refreshToken.create({
      data: {
        token: newRefreshTokenStr,
        userId: user.id,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY),
      },
    });

    const accessToken = await signAccessToken(user.id, user.role);

    const response = NextResponse.json({ accessToken });

    response.cookies.set('auth-token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60,
    });

    response.cookies.set('refresh-token', newRefreshTokenStr, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/auth/refresh',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Error al refrescar sesión' }, { status: 500 });
  }
}
