import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';
import { authMiddleware } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await authMiddleware(req);
    console.log('[GET /api/photos] user:', user?.id || 'anonymous');

    const where = user
      ? {
          OR: [
            { userId: user.id },
            { isPublic: true },
          ],
        }
      : { isPublic: true };

    const photos = await prisma.photo.findMany({
      where,
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

    console.log('[GET /api/photos] returning', photos.length, 'photos');
    return NextResponse.json({ photos });
  } catch (error) {
    console.error('Error fetching photos:', error);
    return NextResponse.json(
      { error: 'Error al cargar las fotos' },
      { status: 500 }
    );
  }
}
