import { NextResponse } from 'next/server';

// Tipo personalizado temporal para el token de reset
interface PasswordResetToken {
  id: number;
  email: string;
  token: string;
  createdAt: Date;
  expiresAt: Date;
  used: boolean;
}

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Verificación básica de seguridad
    const referer = request.headers.get('referer');
    const authHeader = request.headers.get('authorization');
    
    // Solo permitir acceso desde la página de email-config o con header de auth
    if (!referer?.includes('/email-config') && !authHeader) {
      return NextResponse.json({
        success: false,
        error: 'Acceso no autorizado',
        message: 'Esta API solo es accesible desde el panel de diagnóstico'
      }, { status: 403 });
    }

    console.log('🔍 Acceso autorizado a diagnóstico de tokens desde:', referer);

    // Importar dinámicamente Prisma
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      // Obtener todos los tokens recientes (últimos 10)
      const recentTokens = await prisma.$queryRaw<PasswordResetToken[]>`
        SELECT id, email, token, "createdAt", "expiresAt", used 
        FROM "PasswordResetToken" 
        ORDER BY "createdAt" DESC 
        LIMIT 10
      `;

      // Contar tokens por estado
      const stats = await prisma.$queryRaw<{status: string, count: bigint}[]>`
        SELECT 
          CASE 
            WHEN used = true THEN 'used'
            WHEN "expiresAt" < NOW() THEN 'expired'
            ELSE 'valid'
          END as status,
          COUNT(*) as count
        FROM "PasswordResetToken"
        GROUP BY status
      `;

      const formattedTokens = recentTokens.map(token => ({
        id: token.id,
        email: token.email,
        tokenPreview: token.token.substring(0, 8) + '...' + token.token.substring(-4),
        createdAt: token.createdAt,
        expiresAt: token.expiresAt,
        used: token.used,
        isExpired: token.expiresAt < new Date(),
        status: token.used ? 'USADO' : (token.expiresAt < new Date() ? 'EXPIRADO' : 'VÁLIDO'),
        minutesRemaining: token.expiresAt > new Date() ? 
          Math.round((token.expiresAt.getTime() - new Date().getTime()) / 1000 / 60) : 0
      }));

      const formattedStats = stats.reduce((acc, stat) => {
        acc[stat.status] = Number(stat.count);
        return acc;
      }, {} as Record<string, number>);

      return NextResponse.json({
        success: true,
        stats: formattedStats,
        recentTokens: formattedTokens,
        totalTokens: recentTokens.length,
        serverTime: new Date().toISOString()
      });

    } finally {
      await prisma.$disconnect();
    }

  } catch (error) {
    console.error('❌ Error obteniendo tokens:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      message: 'Error al obtener información de tokens'
    }, { status: 500 });
  }
}
