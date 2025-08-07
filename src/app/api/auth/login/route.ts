import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

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

    console.log('Login attempt for:', email);
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    
    // Usar importación dinámica con configuración manual para Vercel
    const [{ PrismaClient }, bcrypt] = await Promise.all([
      import('@prisma/client').catch(err => {
        console.error('Failed to import PrismaClient:', err);
        throw new Error('Prisma import failed: ' + err.message);
      }),
      import('bcrypt').catch(err => {
        console.error('Failed to import bcrypt:', err);
        throw new Error('bcrypt import failed: ' + err.message);
      })
    ]);
    
    console.log('✅ Imports successful');
    
    // Crear instancia con configuración manual
    const prisma = new PrismaClient({
      log: ['error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });
    
    try {
      console.log('🔄 Connecting to database...');
      await prisma.$connect();
      console.log('✅ Database connected');
      
      console.log('🔍 Searching for user:', email);
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
      
      console.log('👤 User found:', !!user);

      if (!user) {
        return NextResponse.json(
          { error: 'Usuario no encontrado' }, 
          { status: 401 }
        );
      }

      console.log('🔐 Comparing passwords...');
      const isValid = await bcrypt.compare(password, user.password);
      console.log('✅ Password valid:', isValid);
      
      if (!isValid) {
        return NextResponse.json(
          { error: 'Contraseña incorrecta' }, 
          { status: 401 }
        );
      }

      // No devolver la contraseña
      const { password: _, ...userWithoutPassword } = user;

      console.log('🎉 Login successful for:', email);
      return NextResponse.json({
        user: userWithoutPassword,
        message: 'Login exitoso'
      });

    } finally {
      console.log('🔌 Disconnecting from database...');
      await prisma.$disconnect();
    }

  } catch (error) {
    console.error('❌ Detailed login error:', error);
    
    // Si el error es específico de Prisma, intentamos una solución alternativa
    if (error instanceof Error && error.message.includes('Prisma Client')) {
      return NextResponse.json(
        { 
          error: 'Error de inicialización de Prisma',
          details: 'Vercel build cache issue. Intentando forzar regeneración...',
          suggestion: 'Intenta hacer otro deploy o contacta al administrador',
          prismaError: error.message
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Unknown',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
