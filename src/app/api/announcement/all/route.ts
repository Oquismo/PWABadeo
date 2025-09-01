import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET: Obtener todos los anuncios globales
export async function GET() {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });
    return NextResponse.json({ announcements });
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener los anuncios.' }, { status: 500 });
  }
}
