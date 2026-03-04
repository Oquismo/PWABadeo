import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';
import { authMiddleware } from '@/lib/auth';

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
