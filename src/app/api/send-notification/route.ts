import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';
import webpush from 'web-push';

// Configurar VAPID
webpush.setVapidDetails(
  'mailto:tu-email@example.com', // Cambia esto por tu email
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
  try {
    const { title, body, icon, userId } = await req.json();

    if (!title || !body) {
      return NextResponse.json(
        { error: 'Título y cuerpo son requeridos' },
        { status: 400 }
      );
    }

    let subscriptions;

    if (userId) {
      // Enviar a un usuario específico
      const pushSubscription = await prisma.pushSubscription.findUnique({
        where: { userId: userId }
      });

      if (!pushSubscription) {
        return NextResponse.json(
          { error: 'Usuario no tiene suscripción push' },
          { status: 404 }
        );
      }

      subscriptions = [pushSubscription];
    } else {
      // Enviar a todos los usuarios suscritos
      subscriptions = await prisma.pushSubscription.findMany();
    }

    const results = [];

    for (const subscription of subscriptions) {
      try {
        await webpush.sendNotification(
          subscription.subscription as any,
          JSON.stringify({
            title,
            body,
            icon: icon || '/icons/icon_192x192.png',
            timestamp: Date.now()
          })
        );
        results.push({ userId: subscription.userId, success: true });
      } catch (error) {
        console.error(`Error sending push to user ${subscription.userId}:`, error);
        results.push({ userId: subscription.userId, success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      sent: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    });

  } catch (error) {
    console.error('Error sending push notifications:', error);
    return NextResponse.json(
      { error: 'Error al enviar notificaciones' },
      { status: 500 }
    );
  }
}
