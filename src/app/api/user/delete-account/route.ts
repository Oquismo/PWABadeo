import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(request: NextRequest) {
  try {
    // Verificar autenticación mediante cookies
    const authToken = request.cookies.get('auth-token')?.value;
    const userData = request.cookies.get('user')?.value;
    
    if (!authToken || !userData) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Obtener datos del usuario desde la cookie
    let user: any;
    try {
      user = JSON.parse(userData);
    } catch (error) {
      return NextResponse.json(
        { error: 'Datos de usuario inválidos' },
        { status: 401 }
      );
    }

    const userId = user.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 400 }
      );
    }

    // Opcional: Obtener contraseña del body para confirmación adicional
    const body = await request.json();
    const { password } = body;

    if (password) {
      const bcrypt = await import('bcrypt');
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { password: true }
      });

      if (!user) {
        return NextResponse.json(
          { error: 'Usuario no encontrado' },
          { status: 404 }
        );
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Contraseña incorrecta' },
          { status: 403 }
        );
      }
    }

    // Eliminar el usuario y todos sus datos relacionados
    // Gracias al onDelete: Cascade en PushSubscription y UserEvent, se eliminarán automáticamente
    // Para otras relaciones sin CASCADE, las eliminamos manualmente:
    
    await prisma.$transaction(async (tx) => {
      // 1. Eliminar anuncios creados por el usuario
      await tx.announcement.deleteMany({
        where: { createdBy: userId }
      });

      // 2. Eliminar logs del usuario
      await tx.log.deleteMany({
        where: { userId }
      });

      // 3. Eliminar tareas creadas por el usuario
      await tx.task.deleteMany({
        where: { createdBy: userId }
      });

      // 4. Eliminar feedbacks del usuario
      await tx.feedback.deleteMany({
        where: { userId }
      });

      // 5. Eliminar progreso del curso
      await tx.courseProgress.deleteMany({
        where: { userId }
      });

      // 6. Eliminar eventos del usuario (UserEvent) - CASCADE automático
      // 7. Eliminar suscripción push (PushSubscription) - CASCADE automático

      // 8. Finalmente, eliminar el usuario
      await tx.user.delete({
        where: { id: userId }
      });
    });

    // Crear respuesta sin cookie (logout)
    const response = NextResponse.json(
      { 
        success: true,
        message: 'Cuenta eliminada correctamente. Todos tus datos han sido borrados permanentemente.' 
      },
      { status: 200 }
    );

    // Eliminar cookie de autenticación
    response.cookies.delete('auth-token');

    return response;

  } catch (error) {
    console.error('Error al eliminar cuenta:', error);
    return NextResponse.json(
      { 
        error: 'Error al eliminar la cuenta',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
