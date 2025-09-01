import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET: Obtener el anuncio global más reciente
export async function GET() {
  try {
    const announcement = await prisma.announcement.findFirst({
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });
    if (!announcement) {
      return NextResponse.json({ message: null });
    }
    return NextResponse.json({ message: announcement.message, createdAt: announcement.createdAt, createdBy: announcement.user?.name || null });
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener el anuncio global.' }, { status: 500 });
  }
}

// POST: Publicar un nuevo anuncio global
export async function POST(req: Request) {
  try {
    const { message, userId } = await req.json();
    if (!message || !userId) {
      return NextResponse.json({ error: 'Mensaje y userId son requeridos.' }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Solo los administradores pueden publicar anuncios.' }, { status: 403 });
    }
    const announcement = await prisma.announcement.create({
      data: { message, createdBy: userId },
    });
    return NextResponse.json({ success: true, announcement });
  } catch (error) {
    return NextResponse.json({ error: 'Error al publicar el anuncio.' }, { status: 500 });
  }
}

// DELETE: Eliminar el anuncio global más reciente
export async function DELETE(req: Request) {
  try {
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: 'userId es requerido.' }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Solo los administradores pueden eliminar anuncios.' }, { status: 403 });
    }
    const lastAnnouncement = await prisma.announcement.findFirst({ orderBy: { createdAt: 'desc' } });
    if (!lastAnnouncement) {
      return NextResponse.json({ error: 'No hay anuncio para eliminar.' }, { status: 404 });
    }
    await prisma.announcement.delete({ where: { id: lastAnnouncement.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar el anuncio.' }, { status: 500 });
  }
}
