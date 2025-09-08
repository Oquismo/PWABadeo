import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';
import webpush from 'web-push';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

webpush.setVapidDetails(
  'mailto:admin@badeo.com',
  VAPID_PUBLIC_KEY!,
  VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
  try {
    const { userId, title, body, url, image } = await req.json();
    if (!userId || !title || !body) {
      return NextResponse.json({ error: 'userId, title y body son requeridos' }, { status: 400 });
    }
    const pushSubscription = await prisma.pushSubscription.findUnique({
      where: { userId: parseInt(userId) }
    });
    if (!pushSubscription) {
      return NextResponse.json({ error: 'Suscripción no encontrada' }, { status: 404 });
    }
    const payload = JSON.stringify({
      title,
      body,
      url: url || '/',
      image: image || null
    });
    const subscriptionObj = typeof pushSubscription.subscription === 'string'
      ? JSON.parse(pushSubscription.subscription)
      : pushSubscription.subscription;
    await webpush.sendNotification(subscriptionObj, payload);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error enviando push:', error);
    return NextResponse.json({ error: 'Error enviando push' }, { status: 500 });
  }
}
