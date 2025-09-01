import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
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
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token y contraseña son requeridos' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Importar dinámicamente si es necesario
    // const bcrypt = await import('bcrypt');

    try {
      // Buscar y validar el token usando SQL directo
      const resetToken = await prisma.$queryRaw<PasswordResetToken[]>`
        SELECT * FROM "PasswordResetToken" WHERE token = ${token} LIMIT 1
      `;

      if (!resetToken || resetToken.length === 0) {
        return NextResponse.json(
          { error: 'Token no encontrado' },
          { status: 404 }
        );
      }

      const tokenData = resetToken[0];

      // Verificar si el token ha expirado
      if (tokenData.expiresAt < new Date()) {
        return NextResponse.json(
          { error: 'Token expirado' },
          { status: 400 }
        );
      }

      // Verificar si el token ya fue usado
      if (tokenData.used) {
        return NextResponse.json(
          { error: 'Token ya utilizado' },
          { status: 400 }
        );
      }

      // Verificar que el usuario existe
      const user = await prisma.user.findUnique({
        where: { email: tokenData.email }
      });

      if (!user) {
        return NextResponse.json(
          { error: 'Usuario no encontrado' },
          { status: 404 }
        );
      }

      // Hashear la nueva contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Actualizar la contraseña del usuario y marcar el token como usado
      await prisma.$transaction([
        prisma.user.update({
          where: { email: tokenData.email },
          data: { password: hashedPassword }
        }),
        prisma.$executeRaw`
          UPDATE "PasswordResetToken" 
          SET used = true 
          WHERE token = ${token}
        `
      ]);

      console.log(`✅ Contraseña restablecida para: ${tokenData.email}`);

      return NextResponse.json({
        success: true,
        message: 'Contraseña restablecida exitosamente'
      });

    } catch (error) {
      console.error('❌ Error resetting password:', error);
      return NextResponse.json(
        { 
          error: 'Error interno del servidor',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
