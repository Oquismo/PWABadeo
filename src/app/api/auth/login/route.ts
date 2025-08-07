import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña requeridos' }, 
        { status: 400 }
      );
    }

    // Importación dinámica para evitar ejecución durante build
    const { PrismaClient } = await import('@prisma/client');
    const bcrypt = await import('bcrypt');
    
    const prisma = new PrismaClient();
    
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          password: true,
          role: true,
          school: true,
          age: true,
          arrivalDate: true,
          departureDate: true,
          avatarUrl: true
        }
      });

      if (!user) {
        return NextResponse.json(
          { error: 'Credenciales inválidas' }, 
          { status: 401 }
        );
      }

      const isValid = await bcrypt.compare(password, user.password);
      
      if (!isValid) {
        return NextResponse.json(
          { error: 'Credenciales inválidas' }, 
          { status: 401 }
        );
      }

      // No devolver la contraseña
      const { password: _, ...userWithoutPassword } = user;

      return NextResponse.json({
        user: userWithoutPassword,
        message: 'Login exitoso'
      });

    } finally {
      await prisma.$disconnect();
    }

  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
