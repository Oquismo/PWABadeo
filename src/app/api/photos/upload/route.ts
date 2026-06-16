import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authMiddleware } from '@/lib/auth';
import cloudinary from '@/lib/cloudinary';

async function uploadSingleFile(file: File, caption: string | null, user: any) {
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
      schoolId: user.schoolId,
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

  return photo;
}

export async function POST(req: NextRequest) {
  try {
    const user = await authMiddleware(req);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const captions = formData.getAll('captions') as string[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No se proporcionó archivo' }, { status: 400 });
    }

    const photos = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const caption = captions[i] || null;
      const photo = await uploadSingleFile(file, caption, user);
      photos.push(photo);
    }

    return NextResponse.json({ photos }, { status: 201 });
  } catch (error) {
    console.error('Error uploading photos:', error);
    return NextResponse.json(
      { error: 'Error al subir las fotos' },
      { status: 500 }
    );
  }
}
