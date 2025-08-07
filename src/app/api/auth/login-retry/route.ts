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

    // Estrategia de reintentos para Prisma en Vercel
    let prismaAttempts = 0;
    const maxAttempts = 3;
    
    while (prismaAttempts < maxAttempts) {
      try {
        console.log(`🔄 Intento ${prismaAttempts + 1} de conexión Prisma`);
        
        // Importación dinámica
        const { PrismaClient } = await import('@prisma/client');
        const bcrypt = await import('bcrypt');
        
        // Crear cliente con configuración específica para cada intento
        const prisma = new PrismaClient({
          log: ['error'],
          datasources: {
            db: {
              url: process.env.DATABASE_URL
            }
          }
        });

        try {
          // Timeout de 10 segundos para la conexión
          const connectPromise = prisma.$connect();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Connection timeout')), 10000)
          );
          
          await Promise.race([connectPromise, timeoutPromise]);
          console.log('✅ Prisma conectado exitosamente');
          
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

          const { password: _, ...userWithoutPassword } = user;

          return NextResponse.json({
            user: userWithoutPassword,
            message: 'Login exitoso'
          });

        } finally {
          await prisma.$disconnect();
        }

      } catch (prismaError) {
        prismaAttempts++;
        console.error(`❌ Error en intento ${prismaAttempts}:`, prismaError);
        
        if (prismaAttempts >= maxAttempts) {
          // Si fallaron todos los intentos, devolver error específico
          return NextResponse.json(
            { 
              error: 'Error de conexión a base de datos',
              details: 'No se pudo conectar a la base de datos después de varios intentos',
              attempts: prismaAttempts,
              lastError: prismaError instanceof Error ? prismaError.message : 'Unknown error'
            },
            { status: 503 }
          );
        }
        
        // Esperar antes del siguiente intento
        await new Promise(resolve => setTimeout(resolve, 1000 * prismaAttempts));
      }
    }

  } catch (error) {
    console.error('❌ Error general en login:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
