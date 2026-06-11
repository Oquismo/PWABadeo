import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';
import { authMiddleware } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await authMiddleware(req);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const photos = await prisma.photo.findMany({
      where: {
        OR: [
          { userId: user.id },
          { isPublic: true },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return NextResponse.json({ photos });
  } catch (error) {
    console.error('Error fetching photos:', error);
    return NextResponse.json(
      { error: 'Error al cargar las fotos' },
      { status: 500 }
    );
  }
}
