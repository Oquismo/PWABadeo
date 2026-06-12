import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authMiddleware } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await authMiddleware(req);
    const { searchParams } = new URL(req.url);
    const schoolIdParam = searchParams.get('schoolId');

    let where: any = { isPublic: true };

    if (user) {
      if (user.role === 'admin') {
        if (schoolIdParam) {
          where = { schoolId: parseInt(schoolIdParam) };
        }
      } else if (user.schoolId) {
        where = { schoolId: user.schoolId };
      } else if (schoolIdParam) {
        where = { schoolId: parseInt(schoolIdParam) };
      }
    }

    const photos = await prisma.photo.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
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

    return NextResponse.json({ photos });
  } catch (error) {
    console.error('Error fetching photos:', error);
    return NextResponse.json(
      { error: 'Error al cargar las fotos' },
      { status: 500 }
    );
  }
}
