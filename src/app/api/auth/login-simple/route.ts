import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña requeridos' }, 
        { status: 400 }
      );
    }

    // Usar una conexión más simple sin Prisma client global
    const { PrismaClient } = await import('@prisma/client');
    
    // Crear una instancia específica con configuración mínima
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });

    try {
      console.log('Attempting to find user:', email);
      
      // Query más simple
      const user = await prisma.user.findFirst({
        where: { email: email },
        select: {
          id: true,
          email: true,
          name: true,
          password: true,
          role: true
        }
      });

      if (!user) {
        console.log('User not found');
        return NextResponse.json(
          { error: 'Credenciales inválidas' }, 
          { status: 401 }
        );
      }

      console.log('User found, checking password');
      
      // Importar bcrypt solo cuando lo necesitemos
      const bcrypt = await import('bcrypt');
      const isValid = await bcrypt.compare(password, user.password);
      
      if (!isValid) {
        console.log('Password invalid');
        return NextResponse.json(
          { error: 'Credenciales inválidas' }, 
          { status: 401 }
        );
      }

      console.log('Login successful');
      
      // Retornar sin la contraseña
      const { password: _, ...safeUser } = user;

      return NextResponse.json({
        user: safeUser,
        message: 'Login exitoso'
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    } finally {
      await prisma.$disconnect();
    }

  } catch (error) {
    console.error('Login error:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : 'Internal error'
      },
      { status: 500 }
    );
  }
}
