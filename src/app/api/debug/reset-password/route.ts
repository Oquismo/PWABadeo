import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';
import bcrypt from 'bcrypt';
import { verifyAdminAccess, SECURITY_CONFIG } from '@/lib/security';
import SecurityLogger from '@/lib/security-logger';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // VERIFICACIÓN DE SEGURIDAD CRÍTICA
    const isAdmin = await verifyAdminAccess(req);
    
    if (!isAdmin) {
      SecurityLogger.logAdminAccess('/api/debug/reset-password', 'DENIED', req);
      console.warn('🚨 INTENTO DE ACCESO NO AUTORIZADO a /api/debug/reset-password');
      return NextResponse.json(
        { 
          error: SECURITY_CONFIG.ERROR_MESSAGES.ADMIN_REQUIRED,
          code: 'ADMIN_REQUIRED',
          timestamp: new Date().toISOString()
        },
        { status: 403 }
      );
    }

    const { email, newPassword } = await req.json();

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: 'Email y nueva contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Buscar el usuario
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar la contraseña
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });

    SecurityLogger.logDebugAction(
      'PASSWORD_RESET', 
      'SUCCESS', 
      req, 
      'admin', 
      `Password reset for user: ${email}`
    );

    return NextResponse.json({
      success: true,
      message: `Contraseña actualizada para ${email}`,
      email: email
    });

  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { 
        error: 'Error al resetear contraseña',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
