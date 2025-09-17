import { NextResponse } from 'next/server';
import { prisma, initPrisma } from '@/lib/db';
import loggerClient from '@/lib/loggerClient';

export async function POST(request: Request) {
  try {
  loggerClient.info('🔍 /api/user/by-email called');
    
    let email;
    try {
      const body = await request.json();
  email = body.email;
  loggerClient.debug('📧 Email from request:', email ? 'provided' : 'missing');
    } catch (jsonErr) {
  loggerClient.error('❌ JSON parse error:', jsonErr);
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    
    if (!email) {
  loggerClient.warn('❌ Email missing in request');
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 });
    }
    // Ensure Prisma is connected (helps with cold-starts / transient DB issues)
  loggerClient.info('🔄 Initializing Prisma connection...');
    try {
      await initPrisma(2);
  loggerClient.info('✅ Prisma initialized successfully');
    } catch (connErr) {
  loggerClient.error('DB init failed in /api/user/by-email:', connErr);
      return NextResponse.json({ error: 'Error de conexión a la base de datos (init failed)' }, { status: 503 });
    }

  loggerClient.debug('🔍 Querying user with email:', email);
    const user = await prisma.user.findUnique({
      where: { email },
      include: { school: true }
    });
  loggerClient.debug('👤 User query result:', user ? 'found' : 'not found');
    if (!user) {
  loggerClient.warn('❌ Usuario no encontrado para email:', email);
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
    // Construir objeto de usuario asegurando que todos los campos estén presentes
  loggerClient.debug('🔨 Building user profile object...');
    try {
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
  loggerClient.info('✅ User profile built successfully');
      return NextResponse.json({ user: userProfile });
    } catch (profileErr) {
  loggerClient.error('❌ Error building user profile:', profileErr);
      return NextResponse.json({ error: 'Error procesando datos de usuario' }, { status: 500 });
    }
  } catch (error) {
    // Loguear error completo en servidor para diagnóstico
    try {
      loggerClient.error('Error en /api/user/by-email:', error);
    } catch (logErr) {}

    const debugEnabled = process.env.ENABLE_API_DEBUG === 'true' || process.env.NODE_ENV !== 'production';
    const details = debugEnabled ? (error instanceof Error ? error.stack || error.message : String(error)) : 'Error interno';
    return NextResponse.json({ error: 'Error interno', details }, { status: 500 });
  }
}
