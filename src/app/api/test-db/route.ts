import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Verificar que la variable de entorno existe
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        error: 'DATABASE_URL no configurada',
        env: Object.keys(process.env).filter(key => key.includes('DATABASE'))
      }, { status: 500 });
    }

    // Importación dinámica de Prisma
    const { PrismaClient } = await import('@prisma/client');
    
    const prisma = new PrismaClient({
      log: ['error', 'warn'],
    });
    
    try {
      // Test básico de conexión
      await prisma.$connect();
      
      // Test de query simple
      const userCount = await prisma.user.count();
      
      return NextResponse.json({
        status: 'connected',
        userCount,
        databaseUrl: process.env.DATABASE_URL?.substring(0, 50) + '...',
        message: 'Conexión a base de datos exitosa'
      });
      
    } finally {
      await prisma.$disconnect();
    }
    
  } catch (error) {
    console.error('Database connection error:', error);
    
    return NextResponse.json({
      error: 'Error de conexión a base de datos',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack',
      databaseUrl: process.env.DATABASE_URL?.substring(0, 50) + '...'
    }, { status: 500 });
  }
}
