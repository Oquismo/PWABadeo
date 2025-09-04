import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Obtener eventos del usuario
export async function GET(request: NextRequest) {
  try {
    // Obtener userId del header o de la sesión
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 });
    }

    // Si el usuario es admin, ver todos. Si no, solo los suyos o públicos
    const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
    const isAdmin = user?.role === 'admin';
    const events = await prisma.userEvent.findMany({
      where: isAdmin
        ? undefined
        : {
            OR: [
              { userId: parseInt(userId) },
              { isPublic: true as any }
            ]
          },
      orderBy: { date: 'asc' }
    });
    return NextResponse.json({
      success: true,
      events: events.map((event: any) => ({
        id: event.id.toString(),
        title: event.title,
        date: event.date.toISOString(),
        type: event.type,
        createdAt: event.createdAt.toISOString(),
        isPublic: event.isPublic
      }))
    });

  } catch (error) {
    console.error('Error obteniendo eventos:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}

// POST - Crear nuevo evento
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 });
    }

    const { title, date, type = 'personal', isPublic = false } = await request.json();

    if (!title || !date) {
      return NextResponse.json({
        error: 'Título y fecha son requeridos'
      }, { status: 400 });
    }

    // Solo admin puede crear eventos públicos
    let makePublic = false;
    if (isPublic) {
      const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
      if (user?.role === 'admin') {
        makePublic = true;
      }
    }

    const newEvent = await prisma.userEvent.create({
      data: {
        title,
        date: new Date(date),
        type,
        userId: parseInt(userId),
        isPublic: makePublic as any
      }
    });

    return NextResponse.json({
      success: true,
      event: {
        id: newEvent.id.toString(),
        title: newEvent.title,
        date: newEvent.date.toISOString(),
        type: newEvent.type,
        createdAt: newEvent.createdAt.toISOString(),
        isPublic: (newEvent as any).isPublic
      }
    });

  } catch (error) {
    console.error('Error creando evento:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}
