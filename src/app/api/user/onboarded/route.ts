import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId requerido' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { onboarded: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking onboarded:', error);
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 });
  }
}
