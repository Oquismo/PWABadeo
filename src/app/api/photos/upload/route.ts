import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';
import { authMiddleware } from '@/lib/auth';
import cloudinary from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  try {
    const user = await authMiddleware(req);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const caption = formData.get('caption') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó archivo' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const base64 = buffer.toString('base64');
    const dataUri = `data:${file.type};base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'badeo/album',
      transformation: [
        { quality: 'auto:good', fetch_format: 'auto' },
      ],
    });

    const thumbnailUrl = result.secure_url.replace(
      '/upload/',
      '/upload/c_fill,f_auto,h_400,q_auto:good,w_400/'
    );

    const photo = await prisma.photo.create({
      data: {
        url: result.secure_url,
        thumbnailUrl,
        caption: caption || null,
        userId: user.id,
        width: result.width,
        height: result.height,
      },
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

    return NextResponse.json({ photo }, { status: 201 });
  } catch (error) {
    console.error('Error uploading photo:', error);
    return NextResponse.json(
      { error: 'Error al subir la foto' },
      { status: 500 }
    );
  }
}
