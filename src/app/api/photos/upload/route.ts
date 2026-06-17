import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authMiddleware } from '@/lib/auth';
import cloudinary from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 segundos para uploads grandes

const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/');
}

function uploadToCloudinaryStream(
  file: File,
  options: { resource_type?: 'image' | 'video'; folder: string; transformation?: any[] }
): Promise<any> {
  return new Promise((resolve, reject) => {
    console.log('🔄 Starting Cloudinary upload stream, resource_type:', options.resource_type);
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: options.resource_type || 'image',
        folder: options.folder,
        transformation: options.transformation,
      },
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary upload error:', error);
          reject(error);
        } else {
          console.log('✅ Cloudinary upload success:', result?.secure_url?.substring(0, 60));
          resolve(result);
        }
      }
    );

    file.arrayBuffer().then(buffer => {
      console.log('📦 File buffer size:', (buffer.byteLength / 1024 / 1024).toFixed(2), 'MB');
      uploadStream.end(Buffer.from(buffer));
    }).catch(err => {
      console.error('❌ Error reading file buffer:', err);
      reject(err);
    });
  });
}

async function uploadImageFile(file: File, caption: string | null, user: any) {
  const result = await uploadToCloudinaryStream(file, {
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
      type: 'image',
      publicId: result.public_id,
      userId: user.id,
      schoolId: user.role === 'admin' ? null : user.schoolId,
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

async function uploadVideoFile(file: File, caption: string | null, user: any) {
  if (file.size > MAX_VIDEO_SIZE) {
    throw new Error(`Video demasiado grande (máx ${MAX_VIDEO_SIZE / 1024 / 1024}MB)`);
  }

  console.log('🎬 Uploading video to Cloudinary via stream...');
  const result = await uploadToCloudinaryStream(file, {
    resource_type: 'video',
    folder: 'badeo/album',
    transformation: [
      { quality: 'auto:good', fetch_format: 'auto' },
    ],
  });
  console.log('☁️ Cloudinary video result:', result.public_id, 'duration:', result.duration);

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
    transformation: [
      { quality: 'auto:good', fetch_format: 'auto' },
    ],
  });

  const duration = result.duration ? Math.round(result.duration) : null;

  const photo = await prisma.photo.create({
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
    console.log('📤 Upload request received');
    const user = await authMiddleware(req);
    if (!user) {
      console.log('❌ No autorizado');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    console.log('👤 User:', user.email, 'role:', user.role);

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const captions = formData.getAll('captions') as string[];

    console.log('📁 Files received:', files.length);
    files.forEach((f, i) => console.log(`  [${i}] ${f.name} (${(f.size / 1024 / 1024).toFixed(1)}MB, ${f.type})`));

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No se proporcionó archivo' }, { status: 400 });
    }

    const photos = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const caption = captions[i] || null;
      console.log(`⬆️ Uploading file ${i + 1}/${files.length}: ${file.name}`);

      if (isVideoFile(file)) {
        const photo = await uploadVideoFile(file, caption, user);
        photos.push(photo);
        console.log('✅ Video uploaded:', photo.id);
      } else {
        const photo = await uploadImageFile(file, caption, user);
        photos.push(photo);
        console.log('✅ Image uploaded:', photo.id);
      }
    }

    return NextResponse.json({ photos }, { status: 201 });
  } catch (error) {
    console.error('❌ Error uploading photos:', error);
    const message = error instanceof Error ? error.message : 'Error al subir los archivos';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
