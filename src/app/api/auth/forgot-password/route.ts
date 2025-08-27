import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      );
    }

    // Importar dinámicamente Prisma
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      // Verificar si el usuario existe
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        // Por seguridad, devolvemos la misma respuesta aunque el usuario no exista
        return NextResponse.json({
          success: true,
          message: 'Si el email existe en nuestro sistema, recibirás un enlace de recuperación'
        });
      }

      // Generar token seguro
      const resetToken = crypto.randomBytes(32).toString('hex');

      // Establecer expiración a 1 hora
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      console.log('🔑 Generando token de reset:', {
        email,
        tokenLength: resetToken.length,
        tokenStart: resetToken.substring(0, 8) + '...',
        expiresAt: expiresAt.toISOString(),
        minutesValid: 60
      });

      // Limpiar tokens anteriores expirados para este email
      await prisma.$executeRaw`
        DELETE FROM "PasswordResetToken" 
        WHERE email = ${email} AND ("expiresAt" < NOW() OR used = true)
      `;

      // Crear nuevo token usando SQL directo
      await prisma.$executeRaw`
        INSERT INTO "PasswordResetToken" (email, token, "expiresAt", used, "createdAt")
        VALUES (${email}, ${resetToken}, ${expiresAt}, false, NOW())
      `;

      console.log('✅ Token guardado en base de datos para:', email);

      // En desarrollo, mostramos el token en consola
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔑 Token de reset para ${email}: ${resetToken}`);
        console.log(`🔗 URL de reset: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`);
      }

      // Enviar email de recuperación
      try {
        await sendPasswordResetEmail(email, resetToken);
        console.log(`📧 Email de recuperación enviado a: ${email}`);
      } catch (emailError) {
        console.error('❌ Error enviando email:', emailError);
        
        // En desarrollo, continuamos aunque falle el email
        if (process.env.NODE_ENV === 'development') {
          console.log('⚠️ [DESARROLLO] Continuando sin envío de email');
        } else {
          // En producción, devolvemos error si no se puede enviar el email
          return NextResponse.json(
            { error: 'Error enviando email de recuperación. Inténtalo más tarde.' },
            { status: 500 }
          );
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Si el email existe en nuestro sistema, recibirás un enlace de recuperación'
      });

    } finally {
      await prisma.$disconnect();
    }

  } catch (error) {
    console.error('Error en forgot-password:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
