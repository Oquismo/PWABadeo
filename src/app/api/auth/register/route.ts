import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { 
      email, 
      password, 
      firstName,
      lastName,
      name,
      age,
      schoolId,
      arrivalDate,
      departureDate,
      country,
      city,
      town,
      isAdmin,
      adminCode
    } = await request.json();

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
    
    // Verificar si es registro de admin con código
    let assignedRole = 'user';
    if (isAdmin && adminCode === 'ADMIN2025') {
      assignedRole = 'admin';
      console.log('🔑 Código de admin válido, asignando rol admin');
    } else {
      // Si no existe ningún admin aún, el primer usuario será admin
      const existingAdmin = await prisma.user.findFirst({ where: { role: 'admin' } });
      assignedRole = existingAdmin ? 'user' : 'admin';
    }
    
    console.log('👤 Creating user with role:', assignedRole);
      let user;
      try {
        const userData: any = {
          email,
          password: hashedPassword,
          role: assignedRole,
        };

        // Agregar campos opcionales si están presentes
        if (firstName) userData.firstName = firstName;
        if (lastName) userData.lastName = lastName;
        if (name) userData.name = name;
        if (!name && (firstName || lastName)) {
          userData.name = `${firstName || ''} ${lastName || ''}`.trim();
        }
        if (!name && !firstName && !lastName) {
          userData.name = email.split('@')[0];
        }
        if (age) userData.age = parseInt(age, 10);
        // Solo asignar schoolId si no es admin o si se proporciona
        if (schoolId && assignedRole !== 'admin') userData.schoolId = parseInt(schoolId, 10);
        if (arrivalDate) userData.arrivalDate = arrivalDate;
        if (departureDate) userData.departureDate = departureDate;
        if (country) userData.country = country;
        if (city) userData.city = city;
        if (town) userData.town = town;

        user = await prisma.user.create({
          data: userData
        });
      } catch (dbErr: any) {
        console.error('❌ Error creando usuario en DB:', dbErr);
        return NextResponse.json({
          error: 'No se pudo crear el usuario',
          code: dbErr?.code,
            meta: dbErr?.meta,
            message: dbErr?.message,
            target: dbErr?.meta?.target,
          hint: 'Verifica migraciones y que la tabla User existe. Ejecuta prisma migrate dev.'
        }, { status: 500 });
      }

      console.log('🎉 User created successfully:', email);
  return NextResponse.json({ user, message: 'Usuario registrado exitosamente', firstAdmin: assignedRole === 'admin' });

    } finally {
      console.log('🔌 Disconnecting from database...');
      await prisma.$disconnect();
    }

  } catch (error) {
    console.error('❌ Detailed registration error (outer catch):', error);
    const isPrismaInit = error instanceof Error && /PrismaClientInitializationError|Schema/.test(error.message);
    return NextResponse.json({
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error',
      prismaInit: isPrismaInit,
      suggestion: isPrismaInit ? 'Ejecuta: npx prisma migrate dev && npx prisma generate' : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
