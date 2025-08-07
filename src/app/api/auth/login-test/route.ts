import { NextResponse } from 'next/server';

// Endpoint simple para probar autenticación sin Prisma
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Validaciones básicas
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña requeridos' }, 
        { status: 400 }
      );
    }

    // Usuario de prueba hardcodeado
    if (email === 'admin@badeo.com' && password === 'admin123') {
      return NextResponse.json({
        user: {
          id: 1,
          email: 'admin@badeo.com',
          name: 'Admin',
          role: 'admin'
        },
        message: 'Login exitoso (modo test)'
      });
    }

    if (email === 'user@badeo.com' && password === 'user123') {
      return NextResponse.json({
        user: {
          id: 2,
          email: 'user@badeo.com',
          name: 'Usuario',
          role: 'user'
        },
        message: 'Login exitoso (modo test)'
      });
    }

    return NextResponse.json(
      { error: 'Credenciales inválidas. Usa admin@badeo.com/admin123 o user@badeo.com/user123' }, 
      { status: 401 }
    );

  } catch (error) {
    console.error('Error en login test:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
