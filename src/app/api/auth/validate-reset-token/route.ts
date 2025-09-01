import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Tipo personalizado temporal para el token de reset
interface PasswordResetToken {
  id: number;
  email: string;
  token: string;
  createdAt: Date;
  expiresAt: Date;
  used: boolean;
}

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    console.log('🔍 Validating reset token:', {
      tokenReceived: !!token,
      tokenLength: token?.length,
      tokenStart: token?.substring(0, 8) + '...',
      timestamp: new Date().toISOString()
    });

    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'Token es requerido' },
        { status: 400 }
      );
    }

    // Usar instancia global de Prisma

    try {
      // Buscar el token usando SQL directo
      const resetTokens = await prisma.$queryRaw<PasswordResetToken[]>`
        SELECT * FROM "PasswordResetToken" WHERE token = ${token} LIMIT 1
      `;

      console.log('🔍 Token search result:', {
        found: resetTokens.length > 0,
        count: resetTokens.length,
        token: token.substring(0, 8) + '...'
      });

      if (!resetTokens || resetTokens.length === 0) {
        // Vamos a verificar si hay tokens en la base de datos
        const allTokens = await prisma.$queryRaw<PasswordResetToken[]>`
          SELECT token, email, "createdAt", "expiresAt", used 
          FROM "PasswordResetToken" 
          ORDER BY "createdAt" DESC 
          LIMIT 5
        `;
        
        console.log('🔍 Recent tokens in database:', allTokens.map(t => ({
          token: t.token.substring(0, 8) + '...',
          email: t.email,
          createdAt: t.createdAt,
          expired: t.expiresAt < new Date(),
          used: t.used
        })));
        
        return NextResponse.json(
          { valid: false, error: 'Token no encontrado' },
          { status: 404 }
        );
      }

      const resetToken = resetTokens[0];

      console.log('🔍 Token validation details:', {
        email: resetToken.email,
        createdAt: resetToken.createdAt,
        expiresAt: resetToken.expiresAt,
        used: resetToken.used,
        isExpired: resetToken.expiresAt < new Date(),
        timeRemaining: Math.round((resetToken.expiresAt.getTime() - new Date().getTime()) / 1000 / 60) + ' minutos'
      });

      // Verificar si el token ha expirado
      if (resetToken.expiresAt < new Date()) {
        return NextResponse.json(
          { valid: false, error: 'Token expirado' },
          { status: 400 }
        );
      }

      // Verificar si el token ya fue usado
      if (resetToken.used) {
        return NextResponse.json(
          { valid: false, error: 'Token ya utilizado' },
          { status: 400 }
        );
      }

      // Token válido
      return NextResponse.json({
        valid: true,
        email: resetToken.email
      });

    } catch (error) {
      console.error('❌ Error validating reset token:', error);
      return NextResponse.json(
        { 
          valid: false,
          error: 'Error interno del servidor'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error validating reset token:', error);
    return NextResponse.json(
      { 
        valid: false,
        error: 'Error interno del servidor'
      },
      { status: 500 }
    );
  }
}
