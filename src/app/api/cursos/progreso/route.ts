/**
 * API para gestionar el progreso del cuestionario de español
 * 
 * GET: Cargar progreso del usuario autenticado
 * POST/PUT: Guardar/actualizar progreso del usuario autenticado
 * 
 * SEGURIDAD: Solo lectura y escritura del progreso del usuario autenticado
 * NO incluye operaciones de eliminación o reset de datos
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import loggerClient from '@/lib/loggerClient';

export const dynamic = 'force-dynamic';

/**
 * Obtener datos del usuario desde las cookies
 */
function getUserFromCookies(request: Request): { id: number; email: string; role: string } | null {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const userMatch = cookieHeader.match(/user=([^;]+)/);
    
    if (!userMatch) {
      return null;
    }

    const userData = decodeURIComponent(userMatch[1]);
    const user = JSON.parse(userData);
    
    if (!user.id || !user.email) {
      return null;
    }

    return user;
  } catch (error) {
    loggerClient.error('Error parsing user from cookies:', error);
    return null;
  }
}

/**
 * GET /api/cursos/progreso
 * Cargar el progreso guardado del usuario autenticado
 */
export async function GET(request: Request) {
  try {
    // Obtener usuario de las cookies
    const user = getUserFromCookies(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }

    loggerClient.info(`📚 Cargando progreso para usuario ${user.id} (${user.email})`);

    // Buscar progreso del usuario
    const progress = await prisma.courseProgress.findUnique({
      where: {
        userId: user.id
      }
    });

    // Si no existe progreso, retornar estado inicial
    if (!progress) {
      loggerClient.info(`ℹ️ No hay progreso guardado para usuario ${user.id}, retornando estado inicial`);
      return NextResponse.json({
        exists: false,
        progress: {
          currentLevel: 1,
          levelScores: {},
          achievements: [],
          stats: {
            totalQuestions: 0,
            correctAnswers: 0,
            incorrectAnswers: 0,
            averageScore: 0,
            totalTimeSpent: 0,
            completedLevels: 0,
            perfectScores: 0,
            currentStreak: 0,
            longestStreak: 0
          },
          lastQuestionSeen: null
        }
      });
    }

    // Retornar progreso existente
    loggerClient.info(`✅ Progreso cargado exitosamente para usuario ${user.id}`);
    return NextResponse.json({
      exists: true,
      progress: {
        currentLevel: progress.currentLevel,
        levelScores: progress.levelScores,
        achievements: progress.achievements,
        stats: progress.stats,
        lastQuestionSeen: progress.lastQuestionSeen,
        updatedAt: progress.updatedAt
      }
    });

  } catch (error) {
    loggerClient.error('Error cargando progreso:', error);
    return NextResponse.json(
      { 
        error: 'Error al cargar progreso',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cursos/progreso
 * Guardar o actualizar el progreso del usuario autenticado
 * 
 * Body: {
 *   currentLevel: number,
 *   levelScores: Record<number, { score: number, grade: string, completedAt: string }>,
 *   achievements: Achievement[],
 *   stats: UserStats,
 *   lastQuestionSeen?: number
 * }
 */
export async function POST(request: Request) {
  try {
    // Obtener usuario de las cookies
    const user = getUserFromCookies(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }

    // Parsear body
    const body = await request.json();
    const { currentLevel, levelScores, achievements, stats, lastQuestionSeen } = body;

    // Validaciones básicas
    if (typeof currentLevel !== 'number' || currentLevel < 1 || currentLevel > 10) {
      return NextResponse.json(
        { error: 'currentLevel debe ser un número entre 1 y 10' },
        { status: 400 }
      );
    }

    if (!levelScores || typeof levelScores !== 'object') {
      return NextResponse.json(
        { error: 'levelScores debe ser un objeto' },
        { status: 400 }
      );
    }

    loggerClient.info(`💾 Guardando progreso para usuario ${user.id} (${user.email})`);
    loggerClient.debug(`📊 Datos: nivel=${currentLevel}, niveles completados=${Object.keys(levelScores).length}`);

    // Usar upsert para crear o actualizar el progreso
    const savedProgress = await prisma.courseProgress.upsert({
      where: {
        userId: user.id
      },
      update: {
        currentLevel,
        levelScores,
        achievements,
        stats,
        lastQuestionSeen,
        updatedAt: new Date()
      },
      create: {
        userId: user.id,
        courseId: 'spanish',
        currentLevel,
        levelScores,
        achievements,
        stats,
        lastQuestionSeen
      }
    });

    loggerClient.info(`✅ Progreso guardado exitosamente para usuario ${user.id}`);

    return NextResponse.json({
      success: true,
      message: 'Progreso guardado correctamente',
      progress: {
        currentLevel: savedProgress.currentLevel,
        levelScores: savedProgress.levelScores,
        achievements: savedProgress.achievements,
        stats: savedProgress.stats,
        lastQuestionSeen: savedProgress.lastQuestionSeen,
        updatedAt: savedProgress.updatedAt
      }
    });

  } catch (error) {
    loggerClient.error('Error guardando progreso:', error);
    return NextResponse.json(
      { 
        error: 'Error al guardar progreso',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT es un alias de POST para mayor compatibilidad
 */
export async function PUT(request: Request) {
  return POST(request);
}
