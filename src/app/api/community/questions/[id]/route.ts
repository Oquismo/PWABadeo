import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';
import { authMiddleware } from '@/lib/auth';

// GET /api/community/questions/[id] - Obtener una pregunta con sus respuestas
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const questionId = parseInt(params.id);
    if (isNaN(questionId)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Incrementar vistas
    await prisma.communityQuestion.update({
      where: { id: questionId },
      data: { views: { increment: 1 } },
    });

    const question = await prisma.communityQuestion.findUnique({
      where: { id: questionId },
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
        answers: {
          orderBy: { createdAt: 'asc' },
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
        },
      },
    });

    if (!question) {
      return NextResponse.json(
        { error: 'Pregunta no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ question });
  } catch (error) {
    console.error('Error fetching question:', error);
    return NextResponse.json(
      { error: 'Error al cargar la pregunta' },
      { status: 500 }
    );
  }
}
