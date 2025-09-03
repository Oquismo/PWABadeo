import { NextResponse } from 'next/server';
// Validación de admin por cookie, igual que el middleware
import prisma from '@/lib/prisma';


export async function GET(request: Request) {
  const cookies = (request as any).cookies || {};
  const authToken = cookies.get ? cookies.get('auth-token')?.value : undefined;
  const userData = cookies.get ? cookies.get('user')?.value : undefined;
  if (!authToken || !userData) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 401 });
  }
  let user;
  try {
    user = JSON.parse(userData);
  } catch {
    return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });
  }
  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Se requieren permisos de administrador' }, { status: 403 });
  }

  // Obtener todos los usuarios
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      school: { select: { name: true } },
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(users);
}
