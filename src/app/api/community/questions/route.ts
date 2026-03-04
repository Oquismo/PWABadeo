import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authMiddleware } from '@/lib/auth';

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
