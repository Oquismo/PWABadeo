import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import loggerClient from '@/lib/loggerClient';

export const dynamic = 'force-dynamic';

function getUserFromCookies(request: Request): { id: number; email: string } | null {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const userMatch = cookieHeader.match(/user=([^;]+)/);
    if (!userMatch) return null;
    const user = JSON.parse(decodeURIComponent(userMatch[1]));
    return user;
  } catch (e) {
    loggerClient.error('Error parsing user cookie for compare route', e);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const user = getUserFromCookies(request);
    if (!user) return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 });

    const url = new URL(request.url);
    const topN = Math.min(100, parseInt(url.searchParams.get('top') || '10', 10));
    const courseId = url.searchParams.get('courseId') || 'spanish';

    loggerClient.info(`📈 Generando comparativa para usuario ${user.id} (top ${topN})`);

    // Obtener promedio global (totalScore promedio)
    const avgResult: any = await prisma.$queryRaw`
      SELECT AVG(COALESCE("totalScore",0))::float as avg_score
      FROM "public"."CourseProgress"
      WHERE "courseId" = ${courseId}
    `;

    const avgScore = avgResult && avgResult[0] ? Number(avgResult[0].avg_score) : 0;

    // Obtener rank y percentil del usuario
    const userScoreRow: any = await prisma.courseProgress.findUnique({
      where: { userId: user.id, },
      select: { totalScore: true }
    });

    const userScore = userScoreRow ? (userScoreRow.totalScore || 0) : 0;

    // Count users with score greater than user (for rank) and total count
    const counts: any = await prisma.$queryRaw`
      SELECT
        COUNT(*) FILTER (WHERE COALESCE("totalScore",0) > ${userScore}) AS higher_count,
        COUNT(*) AS total_count
      FROM "public"."CourseProgress"
      WHERE "courseId" = ${courseId}
    `;

    const higherCount = counts && counts[0] ? Number(counts[0].higher_count) : 0;
    const totalCount = counts && counts[0] ? Number(counts[0].total_count) : 0;

    const rank = totalCount - higherCount; // 1-based rank where higher score => better rank
    const percentil = totalCount > 0 ? Math.round((1 - higherCount / totalCount) * 100) : 0;

    // Top N leaderboard
    const topRows: any = await prisma.$queryRaw`
      SELECT u.id as "userId", u.name as name, cp."totalScore"
      FROM "public"."CourseProgress" cp
      LEFT JOIN "public"."User" u ON u.id = cp."userId"
      WHERE cp."courseId" = ${courseId}
      ORDER BY COALESCE(cp."totalScore",0) DESC
      LIMIT ${topN}
    `;

    return NextResponse.json({
      success: true,
      data: {
        user: { id: user.id, score: userScore, rank, percentil },
        averageScore: avgScore,
        totalUsers: totalCount,
        top: topRows || []
      }
    });

  } catch (error) {
    loggerClient.error('Error en /api/cursos/progreso/compare', error);
    return NextResponse.json({ error: 'Error generando comparativa' }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
