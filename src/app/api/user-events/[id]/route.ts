import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// DELETE - Eliminar evento específico
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    const eventId = params.id;
    
    if (!userId) {
      return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 });
    }

    if (!eventId) {
      return NextResponse.json({ error: 'ID de evento requerido' }, { status: 400 });
    }

    // Verificar que el evento pertenece al usuario antes de eliminarlo
    const event = await prisma.userEvent.findFirst({
      where: {
        id: parseInt(eventId),
        userId: parseInt(userId)
      }
    });

    if (!event) {
      return NextResponse.json({ 
        error: 'Evento no encontrado o no autorizado' 
      }, { status: 404 });
    }

    // Eliminar el evento
    await prisma.userEvent.delete({
      where: {
        id: parseInt(eventId)
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Evento eliminado correctamente' 
    });

  } catch (error) {
    console.error('Error eliminando evento:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}
