import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { message, language } = await request.json();

    // Validar que el mensaje no esté vacío
    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'El mensaje no puede estar vacío' },
        { status: 400 }
      );
    }

    // Crear el feedback en la base de datos
    const feedback = await prisma.feedback.create({
      data: {
        message: message.trim(),
        language: language || 'es',
        isRead: false,
      },
    });

    return NextResponse.json({
      success: true,
      feedback: {
        id: feedback.id,
        message: feedback.message,
        language: feedback.language,
        createdAt: feedback.createdAt,
      },
    });

  } catch (error) {
    console.error('Error al guardar feedback:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const isRead = searchParams.get('isRead');

    const skip = (page - 1) * limit;

    const where: any = {};
    if (isRead !== null) {
      where.isRead = isRead === 'true';
    }

    const [feedbacks, total] = await Promise.all([
      prisma.feedback.findMany({
        where,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.feedback.count({ where }),
    ]);

    return NextResponse.json({
      feedbacks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Error al obtener feedbacks:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
