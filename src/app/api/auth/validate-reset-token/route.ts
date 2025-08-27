import { NextResponse } from 'next/server';

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

    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'Token es requerido' },
        { status: 400 }
      );
    }

    // Importar dinámicamente Prisma
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      // Buscar el token usando SQL directo
      const resetTokens = await prisma.$queryRaw<PasswordResetToken[]>`
        SELECT * FROM "PasswordResetToken" WHERE token = ${token} LIMIT 1
      `;

      if (!resetTokens || resetTokens.length === 0) {
        return NextResponse.json(
          { valid: false, error: 'Token no encontrado' },
          { status: 404 }
        );
      }

      const resetToken = resetTokens[0];

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

    } finally {
      await prisma.$disconnect();
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
