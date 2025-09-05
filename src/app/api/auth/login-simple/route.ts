import { NextResponse } from 'next/server';
import { logActionServer } from '@/lib/logger';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const onlyAdmins = process.env.ONLY_ADMIN_LOGIN === 'true';

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña requeridos' }, 
        { status: 400 }
      );
    }

    console.log('Attempting to find user:', email);
    
    // Query más simple usando la instancia global
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

    // Restringir sólo si el flag está activo
    if (onlyAdmins && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Solo administradores pueden iniciar sesión.' },
        { status: 403 }
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
    try {
      await logActionServer({ userId: user.id, action: 'login', meta: { email: user.email, simple: true }, updateLastSeen: true });
    } catch (e) {
      console.warn('No se pudo registrar log de login (simple)', e);
    }
    
    // Retornar sin la contraseña
    const { password: _, ...safeUser } = user;

    // Crear respuesta con cookies para autenticación
    const response = NextResponse.json({
      user: safeUser,
      message: 'Login exitoso'
    });

    // Establecer cookies para el middleware
    const authToken = Buffer.from(JSON.stringify({ userId: user.id, timestamp: Date.now() })).toString('base64');
    
    response.cookies.set('auth-token', authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 días
    });

    response.cookies.set('user', JSON.stringify(safeUser), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 días
    });

    return response;

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
