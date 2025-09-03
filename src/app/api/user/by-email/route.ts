import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 });
    }
    const user = await prisma.user.findUnique({
      where: { email },
      include: { school: true }
    });
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
    // Construir objeto de usuario asegurando que todos los campos estén presentes
    const userProfile = {
      id: user.id,
      email: user.email,
      name: user.name ?? null,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      role: user.role,
      age: user.age ?? null,
      schoolId: user.schoolId ?? null,
      school: user.school ?? null,
      avatarUrl: user.avatarUrl ?? null,
      arrivalDate: user.arrivalDate ?? null,
      departureDate: user.departureDate ?? null,
      country: (user as any).country ?? null,
      city: (user as any).city ?? null,
      town: (user as any).town ?? null
    };
    return NextResponse.json({ user: userProfile });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno', details: error instanceof Error ? error.message : error }, { status: 500 });
  }
}
