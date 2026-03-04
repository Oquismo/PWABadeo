import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';

// POST /api/community/questions/[id]/answers - Responder a una pregunta
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const questionId = parseInt(params.id);
    if (isNaN(questionId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const body = await req.json();
    const { content, userId } = body;

    if (!content?.trim()) {
      return NextResponse.json({ error: 'El contenido es obligatorio' }, { status: 400 });
    }

    // Resolver userId desde body o cookies
    let resolvedUserId = userId;
    if (!resolvedUserId) {
      const userCookie = req.cookies.get('user')?.value;
      if (userCookie) {
        try { resolvedUserId = JSON.parse(userCookie).id; } catch {}
      }
    }
    if (!resolvedUserId) {
      const token = req.cookies.get('auth-token')?.value;
      if (token) {
        try { resolvedUserId = JSON.parse(Buffer.from(token, 'base64').toString()).userId; } catch {}
      }
    }
    if (!resolvedUserId) {
      return NextResponse.json({ error: 'No autorizado. Inicia sesión primero.' }, { status: 401 });
    }

    const question = await prisma.communityQuestion.findUnique({ where: { id: questionId } });
    if (!question) {
      return NextResponse.json({ error: 'Pregunta no encontrada' }, { status: 404 });
    }

    const answer = await prisma.communityAnswer.create({
      data: {
        content: content.trim(),
        userId: resolvedUserId,
        questionId,
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
      },
    });

    return NextResponse.json({ answer }, { status: 201 });
  } catch (error) {
    console.error('Error creating answer:', error);
    return NextResponse.json({ error: 'Error al crear la respuesta' }, { status: 500 });
  }
}


// POST /api/community/questions/[id]/answers - Responder a una pregunta
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authMiddleware(req);
    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const questionId = parseInt(params.id);
    if (isNaN(questionId)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const { content } = await req.json();

    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'El contenido es obligatorio' },
        { status: 400 }
      );
    }

    // Verificar que la pregunta existe
    const question = await prisma.communityQuestion.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json(
        { error: 'Pregunta no encontrada' },
        { status: 404 }
      );
    }

    const answer = await prisma.communityAnswer.create({
      data: {
        content: content.trim(),
        userId: user.id,
        questionId: questionId,
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
      },
    });

    return NextResponse.json({ answer }, { status: 201 });
  } catch (error) {
    console.error('Error creating answer:', error);
    return NextResponse.json(
      { error: 'Error al crear la respuesta' },
      { status: 500 }
    );
  }
}
