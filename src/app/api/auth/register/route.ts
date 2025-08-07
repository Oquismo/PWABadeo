import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña requeridos' }, 
        { status: 400 }
      );
    }

    // Importación dinámica para evitar ejecución durante build
    const [{ PrismaClient }, bcrypt] = await Promise.all([
      import('@prisma/client'),
      import('bcrypt')
    ]);
    
    const prisma = new PrismaClient({
      log: ['error'],
    });
    
    try {
      // Verificar conexión a base de datos
      await prisma.$connect();
      
      const userExists = await prisma.user.findUnique({ 
        where: { email } 
      });
      
      if (userExists) {
        return NextResponse.json(
          { error: 'El usuario ya existe' }, 
          { status: 409 }
        );
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      
      const user = await prisma.user.create({
        data: {
          email,
          name: name || email.split('@')[0], // Usar parte del email si no hay name
          password: hashedPassword,
          role: 'user', // Los usuarios siempre se registran como 'user'
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          school: true,
          age: true,
          arrivalDate: true,
          departureDate: true,
          avatarUrl: true
        }
      });

      return NextResponse.json({
        user,
        message: 'Usuario registrado exitosamente'
      });

    } finally {
      await prisma.$disconnect();
    }

  } catch (error) {
    console.error('Error en registro:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
