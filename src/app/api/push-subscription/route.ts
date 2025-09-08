import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';

export const dynamic = 'force-dynamic';

// Guardar suscripción push del usuario
export async function POST(req: Request) {
  try {
    const { userId, subscription } = await req.json();

    if (!userId || !subscription) {
      return NextResponse.json(
        { error: 'userId y subscription son requeridos' },
        { status: 400 }
      );
    }

    const userIdNum = parseInt(userId);
    if (isNaN(userIdNum)) {
      return NextResponse.json(
        { error: 'userId debe ser un número válido' },
        { status: 400 }
      );
    }

    // Guardar o actualizar la suscripción (eliminar duplicados primero)
    await prisma.pushSubscription.deleteMany({
      where: {
        userId: parseInt(userId)
      }
    });
    
    // Crear nueva suscripción única
    const pushSubscription = await prisma.pushSubscription.create({
      data: {
        userId: parseInt(userId),
        subscription: subscription
      }
    });

    return NextResponse.json({
      success: true,
      subscription: pushSubscription
    });
  } catch (error) {
    console.error('Error saving push subscription:', error);
    return NextResponse.json(
      { error: 'Error al guardar la suscripción' },
      { status: 500 }
    );
  }
}

// Obtener suscripción push del usuario
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId es requerido' },
        { status: 400 }
      );
    }

    const pushSubscription = await prisma.pushSubscription.findUnique({
      where: { userId: parseInt(userId) }
    });

    if (!pushSubscription) {
      return NextResponse.json(
        { error: 'Suscripción no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      subscription: pushSubscription
    });
  } catch (error) {
    console.error('Error getting push subscription:', error);
    return NextResponse.json(
      { error: 'Error al obtener la suscripción' },
      { status: 500 }
    );
  }
}

// Eliminar suscripción push del usuario
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId es requerido' },
        { status: 400 }
      );
    }

    const userIdNum = parseInt(userId);
    if (isNaN(userIdNum)) {
      return NextResponse.json(
        { error: 'userId debe ser un número válido' },
        { status: 400 }
      );
    }

    await prisma.pushSubscription.delete({
      where: { userId: userIdNum }
    });

    return NextResponse.json({
      success: true,
      message: 'Suscripción eliminada correctamente'
    });
  } catch (error) {
    console.error('Error deleting push subscription:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la suscripción' },
      { status: 500 }
    );
  }
}
