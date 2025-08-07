import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 });
    }
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
    }
    
    // Construir respuesta de forma segura para evitar errores de campos faltantes
    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      school: (user as any).school || '',
      age: (user as any).age || 0,
      arrivalDate: (user as any).arrivalDate || '',
      departureDate: (user as any).departureDate || '',
      avatarUrl: (user as any).avatarUrl || '',
    };
    
    return NextResponse.json(userResponse);
  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
