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
let lastAnnouncementTime = 0;
const MIN_ANNOUNCEMENT_INTERVAL = 5000; // 5 segundos mínimo entre anuncios

export async function POST(req: Request) {
  try {
    const now = Date.now();
    
    // Throttling para evitar spam de anuncios
    if (now - lastAnnouncementTime < MIN_ANNOUNCEMENT_INTERVAL) {
      return NextResponse.json({ 
        error: 'Debes esperar al menos 5 segundos antes de crear otro anuncio.' 
      }, { status: 429 });
    }
    
    const { message, userId } = await req.json();
    if (!message || !userId) {
      return NextResponse.json({ error: 'Mensaje y userId son requeridos.' }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Solo los administradores pueden publicar anuncios.' }, { status: 403 });
    }
    
    // Actualizar tiempo del último anuncio
    lastAnnouncementTime = now;
    
    const announcement = await prisma.announcement.create({
      data: { message, createdBy: userId },
    });

    // Obtener todas las suscripciones push únicas (sin duplicados por userId)
    const pushSubscriptions = await prisma.pushSubscription.findMany({
      distinct: ['userId'], // Solo una suscripción por usuario
      orderBy: {
        updatedAt: 'desc' // La más reciente si hay varias
      }
    });
    
    console.log(`Enviando notificación push a ${pushSubscriptions.length} usuarios únicos`);
    
    // Importar web-push dinámicamente
    const webpush = (await import('web-push')).default;
    const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
    webpush.setVapidDetails(
      'mailto:admin@badeo.com',
      VAPID_PUBLIC_KEY!,
      VAPID_PRIVATE_KEY!
    );
    
    // Crear ID único para esta notificación
    const notificationId = `announcement-${announcement.id}-${Date.now()}`;
    
    // Enviar notificación a cada usuario suscrito
    const sendResults = [];
    for (const sub of pushSubscriptions) {
      const payload = JSON.stringify({
        title: 'Nuevo anuncio',
        body: message,
        url: '/',
        image: null,
        notificationId: notificationId,
        timestamp: Date.now()
      });
      try {
        const subscriptionObj = typeof sub.subscription === 'string' ? JSON.parse(sub.subscription) : sub.subscription;
        await webpush.sendNotification(subscriptionObj, payload);
        sendResults.push({ userId: sub.userId, success: true });
      } catch (err) {
        console.error(`Error enviando push a usuario ${sub.userId}:`, err);
        sendResults.push({ userId: sub.userId, success: false, error: String(err) });
      }
    }
    return NextResponse.json({ success: true, announcement, pushResults: sendResults });
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
