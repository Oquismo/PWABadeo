import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';
import webpush from 'web-push';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // Configurar VAPID dentro de la función
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    
    if (!publicKey || !privateKey) {
      console.error('VAPID keys not configured');
      return NextResponse.json(
        { error: 'Claves VAPID no configuradas' },
        { status: 500 }
      );
    }

    // Validar que las claves no estén vacías y tengan el formato correcto
    if (publicKey.length < 10 || privateKey.length < 10) {
      console.error('VAPID keys appear to be invalid');
      return NextResponse.json(
        { error: 'Claves VAPID inválidas' },
        { status: 500 }
      );
    }

    webpush.setVapidDetails(
      'mailto:contact@badeo.com',
      publicKey,
      privateKey
    );

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
