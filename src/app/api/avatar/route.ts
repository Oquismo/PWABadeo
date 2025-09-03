import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Obtener avatar del usuario
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId requerido' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { avatarUrl: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      avatarUrl: user.avatarUrl || null
    });

  } catch (error) {
    console.error('Error al obtener avatar:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST - Actualizar avatar del usuario
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, avatarUrl } = body;

    if (!userId || !avatarUrl) {
      return NextResponse.json({ error: 'userId y avatarUrl requeridos' }, { status: 400 });
    }

    // Validar que sea una URL de imagen base64, una URL válida o una ruta local permitida
    if (!avatarUrl.startsWith('data:image/') && !avatarUrl.startsWith('http') && !avatarUrl.startsWith('/img/')) {
      return NextResponse.json({ error: 'Formato de avatar inválido' }, { status: 400 });
    }

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Actualizar el avatar en la base de datos
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { avatarUrl },
      select: { avatarUrl: true }
    });

    return NextResponse.json({
      success: true,
      avatarUrl: updatedUser.avatarUrl
    });

  } catch (error) {
    console.error('Error al actualizar avatar:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// DELETE - Eliminar avatar del usuario (restaurar a default)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId requerido' }, { status: 400 });
    }

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Eliminar el avatar (poner null)
    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { avatarUrl: null }
    });

    return NextResponse.json({
      success: true,
      message: 'Avatar eliminado'
    });

  } catch (error) {
    console.error('Error al eliminar avatar:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
