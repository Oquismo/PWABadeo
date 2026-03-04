import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';

// GET /api/community/questions - Listar todas las preguntas
export async function GET(req: NextRequest) {
  try {
    const questions = await prisma.communityQuestion.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            school: {
              select: { id: true, name: true },
            },
          },
        },
        _count: { select: { answers: true } },
      },
    });

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json({ error: 'Error al cargar las preguntas' }, { status: 500 });
  }
}

// POST /api/community/questions - Crear nueva pregunta
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, content, userId } = body;

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: 'Título y contenido son obligatorios' }, { status: 400 });
    }

    // Obtener userId de la cookie o del body
    let resolvedUserId = userId;

    if (!resolvedUserId) {
      // Intentar desde cookie 'user'
      const userCookie = req.cookies.get('user')?.value;
      if (userCookie) {
        try {
          const userData = JSON.parse(userCookie);
          resolvedUserId = userData.id;
        } catch {}
      }
    }

    if (!resolvedUserId) {
      // Intentar desde auth-token
      const token = req.cookies.get('auth-token')?.value;
      if (token) {
        try {
          const tokenData = JSON.parse(Buffer.from(token, 'base64').toString());
          resolvedUserId = tokenData.userId;
        } catch {}
      }
    }

    if (!resolvedUserId) {
      return NextResponse.json({ error: 'No autorizado. Inicia sesión primero.' }, { status: 401 });
    }

    // Obtener el schoolId del usuario
    const user = await prisma.user.findUnique({
      where: { id: resolvedUserId },
      select: { schoolId: true },
    });

    const question = await prisma.communityQuestion.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        userId: resolvedUserId,
        schoolId: user?.schoolId ?? null,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            school: { select: { id: true, name: true } },
          },
        },
        _count: { select: { answers: true } },
      },
    });

    return NextResponse.json({ question }, { status: 201 });
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json({ error: 'Error al crear la pregunta' }, { status: 500 });
  }
}


// GET /api/community/questions - Listar todas las preguntas
export async function GET(req: NextRequest) {
  try {
    const questions = await prisma.communityQuestion.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            school: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            answers: true,
          },
        },
      },
    });

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Error al cargar las preguntas' },
      { status: 500 }
    );
  }
}

// POST /api/community/questions - Crear nueva pregunta
export async function POST(req: NextRequest) {
  try {
    const user = await authMiddleware(req);
    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { title, content } = await req.json();

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: 'Título y contenido son obligatorios' },
        { status: 400 }
      );
    }

    const question = await prisma.communityQuestion.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        userId: user.id,
        schoolId: user.schoolId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            school: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            answers: true,
          },
        },
      },
    });

    return NextResponse.json({ question }, { status: 201 });
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json(
      { error: 'Error al crear la pregunta' },
      { status: 500 }
    );
  }
}
