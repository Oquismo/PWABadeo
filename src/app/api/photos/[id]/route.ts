import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authMiddleware } from '@/lib/auth';
import cloudinary from '@/lib/cloudinary';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authMiddleware(req);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const photoId = parseInt(params.id);
    if (isNaN(photoId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
    });

    if (!photo) {
      return NextResponse.json({ error: 'Foto no encontrada' }, { status: 404 });
    }

    if (photo.userId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'No tienes permiso' }, { status: 403 });
    }

    const publicId = photo.url.split('/').pop()?.split('.')[0];
    if (publicId) {
      await cloudinary.uploader.destroy(`badeo/album/${publicId}`);
    }

    await prisma.photo.delete({
      where: { id: photoId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting photo:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la foto' },
      { status: 500 }
    );
  }
}
