import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authMiddleware } from '@/lib/auth';
import cloudinary from '@/lib/cloudinary';
import busboy from 'busboy';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

function isVideoFile(mimeType: string): boolean {
  return mimeType.startsWith('video/');
}

function uploadToCloudinaryStream(
  buffer: Buffer,
  mimeType: string,
  options: { resource_type?: 'image' | 'video'; folder: string; transformation?: any[] }
): Promise<any> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: options.resource_type || 'image',
        folder: options.folder,
        transformation: options.transformation,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
}

async function uploadImageFile(buffer: Buffer, mimeType: string, caption: string | null, user: any) {
  const result = await uploadToCloudinaryStream(buffer, mimeType, {
    folder: 'badeo/album',
    transformation: [{ quality: 'auto:good', fetch_format: 'auto' }],
  });

  const thumbnailUrl = result.secure_url.replace('/upload/', '/upload/c_fill,f_auto,h_400,q_auto:good,w_400/');

  return prisma.photo.create({
    data: {
      url: result.secure_url,
      thumbnailUrl,
      caption: caption || null,
      type: 'image',
      publicId: result.public_id,
      userId: user.id,
      schoolId: user.role === 'admin' ? null : user.schoolId,
      width: result.width,
      height: result.height,
    },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
    },
  });
}

async function uploadVideoFile(buffer: Buffer, mimeType: string, caption: string | null, user: any) {
  if (buffer.length > MAX_VIDEO_SIZE) {
    throw new Error(`Video demasiado grande (máx ${MAX_VIDEO_SIZE / 1024 / 1024}MB)`);
  }

  const result = await uploadToCloudinaryStream(buffer, mimeType, {
    resource_type: 'video',
    folder: 'badeo/album',
    transformation: [{ quality: 'auto:good', fetch_format: 'auto' }],
  });

  const thumbnailUrl = cloudinary.url(result.public_id, {
    resource_type: 'video',
    transformation: [
      { width: 400, height: 400, crop: 'fill' },
      { quality: 'auto:good' },
      { fetch_format: 'auto' },
    ],
  });

  const videoUrl = cloudinary.url(result.public_id, {
    resource_type: 'video',
    transformation: [{ quality: 'auto:good', fetch_format: 'auto' }],
  });

  const duration = result.duration ? Math.round(result.duration) : null;

  return prisma.photo.create({
    data: {
      url: videoUrl,
      thumbnailUrl,
      caption: caption || null,
      type: 'video',
      publicId: result.public_id,
      duration,
      userId: user.id,
      schoolId: user.role === 'admin' ? null : user.schoolId,
      width: result.width,
      height: result.height,
    },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const user = await authMiddleware(req);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/')) {
      return NextResponse.json({ error: 'Content-Type debe ser multipart/form-data' }, { status: 400 });
    }

    const bb = busboy({ headers: { 'content-type': contentType } });
    const files: { buffer: Buffer; filename: string; mimeType: string }[] = [];
    const captions: string[] = [];

    bb.on('file', (name, file, info) => {
      const chunks: Buffer[] = [];
      file.on('data', (d: Buffer) => chunks.push(d));
      file.on('end', () => {
        files.push({
          buffer: Buffer.concat(chunks),
          filename: info.filename || 'unknown',
          mimeType: info.mimeType,
        });
      });
    });

    bb.on('field', (name, value) => {
      if (name === 'captions') {
        captions.push(value);
      }
    });

    const uploadPromise = new Promise<void>((resolve, reject) => {
      bb.on('finish', () => resolve());
      bb.on('error', reject);
    });

    // Pipe the request body to busboy
    const bodyStream = req.body;
    if (!bodyStream) {
      return NextResponse.json({ error: 'No body' }, { status: 400 });
    }

    const reader = bodyStream.getReader();
    const pump = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          bb.end();
          break;
        }
        bb.write(value);
      }
    };

    await Promise.all([pump(), uploadPromise]);

    console.log(`📁 Files parsed: ${files.length}`);
    files.forEach((f, i) => console.log(`  [${i}] ${f.filename} (${(f.buffer.length / 1024 / 1024).toFixed(1)}MB, ${f.mimeType})`));

    if (files.length === 0) {
      return NextResponse.json({ error: 'No se proporcionó archivo' }, { status: 400 });
    }

    const photos = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const caption = captions[i] || null;
      console.log(`⬆️ Uploading ${i + 1}/${files.length}: ${file.filename}`);

      if (isVideoFile(file.mimeType)) {
        const photo = await uploadVideoFile(file.buffer, file.mimeType, caption, user);
        photos.push(photo);
        console.log('✅ Video uploaded:', photo.id);
      } else {
        const photo = await uploadImageFile(file.buffer, file.mimeType, caption, user);
        photos.push(photo);
        console.log('✅ Image uploaded:', photo.id);
      }
    }

    return NextResponse.json({ photos }, { status: 201 });
  } catch (error) {
    console.error('❌ Error uploading photos:', error);
    const message = error instanceof Error ? error.message : 'Error al subir los archivos';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
