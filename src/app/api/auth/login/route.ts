import { NextResponse } from 'next/server';
import { logActionServer } from '@/lib/logger';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const onlyAdmins = process.env.ONLY_ADMIN_LOGIN === 'true';

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
    
    // Importación dinámica de bcrypt solamente
    const bcrypt = await import('bcrypt').catch(err => {
      console.error('Failed to import bcrypt:', err);
      throw new Error('bcrypt import failed: ' + err.message);
    });
    
    console.log('✅ Imports successful');
    
    try {
      console.log('🔄 Connecting to database...');
      await prisma.$connect();
      console.log('✅ Database connected');
      
      console.log('🔍 Searching for user:', email);
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          school: true
        }
      });
      
      console.log('👤 User found:', !!user);

      if (!user) {
        return NextResponse.json(
          { error: 'Usuario no encontrado' }, 
          { status: 401 }
        );
      }

      // Restringir a administradores sólo si el flag está activo
      if (onlyAdmins && user.role !== 'admin') {
        return NextResponse.json(
          { error: 'Solo administradores pueden iniciar sesión.' },
          { status: 403 }
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


      // Construir objeto de usuario asegurando que todos los campos de perfil estén presentes
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

      console.log('🎉 Login successful for:', email);
      console.log('📍 Usuario con perfil completo:', userProfile);

      // Registrar log en DB (si migración aplicada)
      try {
        await logActionServer({ userId: user.id, action: 'login', meta: { email: user.email }, updateLastSeen: true });
      } catch (e) {
        console.warn('No se pudo registrar log de login', e);
      }
      return NextResponse.json({
        user: userProfile,
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
