import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

async function verifyAdmin(userId: number): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    return user?.role === 'admin' || user?.role === 'ADMIN';
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    const announcement = await prisma.announcement.findFirst({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } } },
    });
    if (!announcement) {
      return NextResponse.json({ message: null });
    }
    return NextResponse.json({
      message: announcement.message,
      id: announcement.id,
      createdAt: announcement.createdAt,
      createdBy: announcement.user?.name || null,
    });
  } catch {
    return NextResponse.json({ error: 'Error al obtener el anuncio.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { message, userId } = await req.json();
    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'El mensaje es obligatorio.' }, { status: 400 });
    }
    if (!userId) {
      return NextResponse.json({ error: 'userId requerido.' }, { status: 400 });
    }

    const isAdmin = await verifyAdmin(userId);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Solo administradores pueden publicar anuncios.' }, { status: 403 });
    }

    const announcement = await prisma.announcement.create({
      data: { message: message.trim(), createdBy: userId },
    });

    // Fire-and-forget: enviar push en segundo plano sin bloquear la respuesta
    prisma.pushSubscription
      .findMany({ distinct: ['userId'], orderBy: { updatedAt: 'desc' } })
      .then(async (subscriptions) => {
        try {
          const webpush = (await import('web-push')).default;
          const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
          const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
          if (vapidPublic && vapidPrivate) {
            webpush.setVapidDetails('mailto:admin@badeo.com', vapidPublic, vapidPrivate);
            const notificationId = `announcement-${announcement.id}-${Date.now()}`;
            const payload = JSON.stringify({
              title: 'Nuevo anuncio',
              body: message.trim(),
              url: '/',
              notificationId,
              tag: 'announcement',
              timestamp: Date.now(),
            });
            await Promise.allSettled(
              subscriptions.map(async (sub) => {
                try {
                  const subscriptionObj =
                    typeof sub.subscription === 'string'
                      ? JSON.parse(sub.subscription)
                      : sub.subscription;
                  await webpush.sendNotification(subscriptionObj, payload);
                } catch {
                  // ignore individual push failures
                }
              })
            );
          }
        } catch {
          // ignore push setup failures
        }
      });

    return NextResponse.json({ success: true, announcement });
  } catch {
    return NextResponse.json({ error: 'Error al publicar el anuncio.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: 'userId requerido.' }, { status: 400 });
    }

    const isAdmin = await verifyAdmin(userId);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Solo administradores pueden eliminar anuncios.' }, { status: 403 });
    }

    const last = await prisma.announcement.findFirst({ orderBy: { createdAt: 'desc' } });
    if (!last) {
      return NextResponse.json({ error: 'No hay anuncio para eliminar.' }, { status: 404 });
    }

    await prisma.announcement.delete({ where: { id: last.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Error al eliminar el anuncio.' }, { status: 500 });
  }
}
