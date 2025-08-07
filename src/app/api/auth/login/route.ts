import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Verificación básica
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña requeridos' }, 
        { status: 400 }
      );
    }

    // Verificar variable de entorno
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'DATABASE_URL no configurada' },
        { status: 500 }
      );
    }

    // Test paso a paso
    console.log('Login attempt for:', email);
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    
    // Importación dinámica
    const [{ PrismaClient }, bcrypt] = await Promise.all([
      import('@prisma/client'),
      import('bcrypt')
    ]);
    
    console.log('Imports successful');
    
    const prisma = new PrismaClient({
      log: ['error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });
    
    try {
      console.log('Connecting to database...');
      await prisma.$connect();
      console.log('Database connected');
      
      console.log('Searching for user:', email);
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          password: true,
          role: true,
        }
      });
      
      console.log('User found:', !!user);

      if (!user) {
        return NextResponse.json(
          { error: 'Usuario no encontrado' }, 
          { status: 401 }
        );
      }

      console.log('Comparing passwords...');
      const isValid = await bcrypt.compare(password, user.password);
      console.log('Password valid:', isValid);
      
      if (!isValid) {
        return NextResponse.json(
          { error: 'Contraseña incorrecta' }, 
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
      console.log('Disconnecting from database...');
      await prisma.$disconnect();
    }

  } catch (error) {
    console.error('Detailed login error:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Unknown',
        cause: error instanceof Error && 'cause' in error ? error.cause : null
      },
      { status: 500 }
    );
  }
}
