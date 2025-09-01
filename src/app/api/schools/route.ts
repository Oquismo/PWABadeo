import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const city = url.searchParams.get('city') || '';
    const type = url.searchParams.get('type') || '';
    const level = url.searchParams.get('level') || '';
    
    try {
      // Construir filtros
      const where: any = {
        isActive: true
      };

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } },
          { province: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (city) {
        where.city = { contains: city, mode: 'insensitive' };
      }

      if (type && type !== 'all') {
        where.type = type;
      }

      if (level && level !== 'all') {
        where.level = level;
      }

      // Obtener escuelas
      const schools = await prisma.school.findMany({
        where,
        orderBy: [
          { city: 'asc' },
          { name: 'asc' }
        ],
        take: 50 // Limitar resultados
      });

      // Obtener estadísticas
      const stats = await prisma.school.groupBy({
        by: ['city', 'type', 'level'],
        where: { isActive: true },
        _count: true
      });

      return NextResponse.json({
        success: true,
        schools,
        stats: {
          total: schools.length,
          byCity: stats.reduce((acc, stat) => {
            acc[stat.city || 'Sin ciudad'] = (acc[stat.city || 'Sin ciudad'] || 0) + stat._count;
            return acc;
          }, {} as Record<string, number>),
          byType: stats.reduce((acc, stat) => {
            acc[stat.type] = (acc[stat.type] || 0) + stat._count;
            return acc;
          }, {} as Record<string, number>),
          byLevel: stats.reduce((acc, stat) => {
            acc[stat.level] = (acc[stat.level] || 0) + stat._count;
            return acc;
          }, {} as Record<string, number>)
        }
      });

    } catch (dbError) {
      console.error('❌ Error de base de datos:', dbError);
      throw dbError;
    }

  } catch (error) {
    console.error('❌ Error obteniendo escuelas:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      message: 'Error al obtener las escuelas'
    }, { status: 500 });
  }
}
