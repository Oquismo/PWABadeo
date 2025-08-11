import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

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

    console.log('📝 Registro attempt for:', email);
    
    // Importación dinámica
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
      
      console.log('🔍 Checking if user exists:', email);
      const userExists = await prisma.user.findUnique({ 
        where: { email } 
      });
      
      if (userExists) {
        console.log('❌ User already exists');
        return NextResponse.json(
          { error: 'El usuario ya existe' }, 
          { status: 409 }
        );
      }

    console.log('🔐 Hashing password...');
      const hashedPassword = await bcrypt.hash(password, 10);
      
    console.log('👤 Determinando rol inicial...');
    // Si no existe ningún admin aún, el primer usuario será admin
    const existingAdmin = await prisma.user.findFirst({ where: { role: 'admin' } });
    const assignedRole = existingAdmin ? 'user' : 'admin';
    console.log('👤 Creating user with role:', assignedRole);
      const user = await prisma.user.create({
        data: {
          email,
          name: name || email.split('@')[0], // Usar parte del email si no hay name
          password: hashedPassword,
      role: assignedRole,
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

      console.log('🎉 User created successfully:', email);
  return NextResponse.json({ user, message: 'Usuario registrado exitosamente', firstAdmin: assignedRole === 'admin' });

    } finally {
      console.log('🔌 Disconnecting from database...');
      await prisma.$disconnect();
    }

  } catch (error) {
    console.error('❌ Detailed registration error:', error);
    
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
