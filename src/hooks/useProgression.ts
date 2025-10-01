/**
 * Hook para gestionar el sistema de progresión de 10 niveles
 * Incluye: unlock de niveles, grades, achievements, persistencia en BD
 * 
 * PERSISTENCIA CON API:
 * - GET /api/cursos/progreso: Cargar progreso del usuario
 * - POST /api/cursos/progreso: Guardar progreso automáticamente
 */

'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  UserProgress,
  LevelProgress,
  LevelCompletionResult,
  Achievement,
  UserStats,
  UseProgressionReturn,
  LevelStatus,
} from '@/types/progression.types';
import { QuizResult } from '@/types/quiz.types';
import { spanishLevels } from '@/data/quizzes/spanish-levels';
import loggerClient from '@/lib/loggerClient';

// FALLBACK: Solo para uso offline temporal
const STORAGE_KEY = 'badeo_spanish_progression_backup';

/**
 * Achievements predefinidos del sistema
 */
const PREDEFINED_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_steps',
    title: 'Primeros Pasos',
    description: 'Completa tu primer nivel',
    icon: '🎯',
    unlockedAt: null,
    progress: 0,
    category: 'completion',
  },
  {
    id: 'perfect_score',
    title: 'Perfección',
    description: 'Obtén 100% en cualquier nivel',
    icon: '💯',
    unlockedAt: null,
    progress: 0,
    category: 'score',
  },
  {
    id: 'halfway_there',
    title: 'A Medio Camino',
    description: 'Completa 5 niveles',
    icon: '🏆',
    unlockedAt: null,
    progress: 0,
    category: 'completion',
  },
  {
    id: 'master',
    title: 'Maestro del Español',
    description: 'Completa todos los niveles',
    icon: '👑',
    unlockedAt: null,
    progress: 0,
    category: 'completion',
  },
  {
    id: 'streak_3',
    title: 'Racha de Fuego',
    description: 'Completa 3 niveles seguidos con A o superior',
    icon: '🔥',
    unlockedAt: null,
    progress: 0,
    category: 'streak',
  },
  {
    id: 'speed_demon',
    title: 'Velocista',
    description: 'Completa un nivel en menos de 3 minutos',
    icon: '⚡',
    unlockedAt: null,
    progress: 0,
    category: 'speed',
  },
  {
    id: 'perfectionist',
    title: 'Perfeccionista',
    description: 'Obtén 100% en 3 niveles diferentes',
    icon: '🌟',
    unlockedAt: null,
    progress: 0,
    category: 'score',
  },
];

/**
 * Función para calcular la calificación basada en el porcentaje
 */
function calculateGrade(percentage: number): 'S' | 'A' | 'B' | 'C' | 'D' | 'F' {
  if (percentage === 100) return 'S';
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
}

/**
 * Función para obtener el progreso inicial
 */
function getInitialProgress(): UserProgress {
  // Intentar cargar desde localStorage
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as UserProgress;
        // Validar que tenga la estructura correcta
        if (parsed.currentLevel && Array.isArray(parsed.levelsProgress)) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('Error loading progression from localStorage:', error);
    }
  }

  // Si no hay datos o hay error, crear progreso inicial
  const initialLevelsProgress: Record<number, LevelProgress> = {};
  spanishLevels.forEach((level) => {
    initialLevelsProgress[level.id] = {
      status: level.id === 1 ? 'available' : 'locked',
      bestScore: null,
      attempts: 0,
      perfectScore: false,
      completedAt: null,
      lastAttemptAt: null,
      timeSpent: 0,
    };
  });

  return {
    currentLevel: 1,
    levelsProgress: initialLevelsProgress,
    achievements: PREDEFINED_ACHIEVEMENTS,
    totalScore: 0,
    completedLevels: 0,
    perfectLevels: 0,
    currentStreak: 0,
    bestStreak: 0,
    lastActivityAt: null,
  };
}

/**
 * Hook principal de progresión
 */
export function useProgression(): UseProgressionReturn {
  const [progress, setProgress] = useState<UserProgress>(getInitialProgress);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  
  // Estados para controlar la carga y guardado
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasLoadedRef = useRef(false);

  /**
   * CARGA INICIAL: Obtener progreso desde la API
   */
  useEffect(() => {
    if (hasLoadedRef.current) return; // Evitar cargas múltiples
    
    async function loadProgressFromAPI() {
      try {
        setIsLoading(true);
        loggerClient.info('📥 Cargando progreso desde API...');

        const response = await fetch('/api/cursos/progreso', {
          method: 'GET',
          credentials: 'include', // Incluir cookies de autenticación
        });

        if (!response.ok) {
          if (response.status === 401) {
            loggerClient.warn('⚠️ Usuario no autenticado, usando progreso inicial');
            return;
          }
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.exists && data.progress) {
          loggerClient.info('✅ Progreso cargado desde BD');
          
          // Convertir el formato de la API al formato del estado
          const apiProgress = data.progress;
          const loadedProgress: UserProgress = {
            currentLevel: apiProgress.currentLevel,
            levelsProgress: {},
            achievements: apiProgress.achievements || PREDEFINED_ACHIEVEMENTS,
            totalScore: 0,
            completedLevels: 0,
            perfectLevels: 0,
            currentStreak: apiProgress.stats?.currentStreak || 0,
            bestStreak: apiProgress.stats?.longestStreak || 0,
            lastActivityAt: apiProgress.updatedAt || null,
          };

          // Reconstruir levelsProgress desde levelScores
          const levelScores = apiProgress.levelScores || {};
          spanishLevels.forEach((level) => {
            const scoreData = levelScores[level.id];
            
            loadedProgress.levelsProgress[level.id] = {
              status: scoreData 
                ? 'completed' 
                : (level.id <= apiProgress.currentLevel ? 'available' : 'locked'),
              bestScore: scoreData?.score || null,
              attempts: scoreData?.attempts || 0,
              perfectScore: scoreData?.score === 100 || false,
              completedAt: scoreData?.completedAt || null,
              lastAttemptAt: scoreData?.lastAttemptAt || null,
              timeSpent: scoreData?.timeSpent || 0,
            };

            if (scoreData) {
              loadedProgress.totalScore += scoreData.score;
              loadedProgress.completedLevels++;
              if (scoreData.score === 100) {
                loadedProgress.perfectLevels++;
              }
            }
          });

          setProgress(loadedProgress);
          setLastSaved(new Date());
        } else {
          loggerClient.info('ℹ️ No hay progreso guardado, usando inicial');
        }

      } catch (error) {
        loggerClient.error('❌ Error cargando progreso:', error);
        
        // FALLBACK: Intentar cargar desde localStorage
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            const parsed = JSON.parse(stored) as UserProgress;
            setProgress(parsed);
            loggerClient.info('💾 Progreso cargado desde localStorage (backup)');
          }
        } catch (e) {
          loggerClient.error('Error en fallback localStorage:', e);
        }
      } finally {
        setIsLoading(false);
        hasLoadedRef.current = true;
      }
    }

    loadProgressFromAPI();
  }, []);

  /**
   * GUARDADO AUTOMÁTICO: Guardar progreso en la API con debounce
   */
  const saveProgressToAPI = useCallback(async (progressData: UserProgress) => {
    try {
      setIsSaving(true);
      loggerClient.debug('💾 Guardando progreso en API...');

      // Convertir formato del estado al formato de la API
      const levelScores: Record<string, any> = {};
      Object.entries(progressData.levelsProgress).forEach(([levelId, progress]) => {
        if (progress.status === 'completed' && progress.bestScore !== null) {
          levelScores[levelId] = {
            score: progress.bestScore,
            grade: calculateGrade(progress.bestScore),
            completedAt: progress.completedAt,
            lastAttemptAt: progress.lastAttemptAt,
            attempts: progress.attempts,
            timeSpent: progress.timeSpent,
          };
        }
      });

      const payload = {
        currentLevel: progressData.currentLevel,
        levelScores,
        achievements: progressData.achievements,
        stats: {
          totalQuestions: Object.keys(levelScores).length * 10, // Aproximado
          correctAnswers: Math.round((progressData.totalScore / 100) * 10),
          incorrectAnswers: 0, // Calcular si es necesario
          averageScore: progressData.completedLevels > 0 
            ? progressData.totalScore / progressData.completedLevels 
            : 0,
          totalTimeSpent: 0, // Sumar si es necesario
          completedLevels: progressData.completedLevels,
          perfectScores: progressData.perfectLevels,
          currentStreak: progressData.currentStreak,
          longestStreak: progressData.bestStreak,
        },
        lastQuestionSeen: null, // Implementar si es necesario
      };

      const response = await fetch('/api/cursos/progreso', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      loggerClient.info('✅ Progreso guardado en BD');
      setLastSaved(new Date());

      // También guardar en localStorage como backup
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progressData));
      } catch (e) {
        loggerClient.warn('No se pudo guardar en localStorage:', e);
      }

      return true;
    } catch (error) {
      loggerClient.error('❌ Error guardando progreso:', error);
      
      // FALLBACK: Guardar solo en localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progressData));
        loggerClient.info('💾 Progreso guardado en localStorage (fallback)');
      } catch (e) {
        loggerClient.error('Error en fallback localStorage:', e);
      }
      
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  /**
   * DEBOUNCE: Guardar progreso con delay para evitar muchas llamadas
   */
  useEffect(() => {
    // No guardar durante la carga inicial
    if (isLoading || !hasLoadedRef.current) {
      loggerClient.debug('⏸️ Guardado pausado (isLoading o no ha cargado)');
      return;
    }

    // Cancelar guardado previo pendiente
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      loggerClient.debug('⏱️ Guardado previo cancelado, reprogramando...');
    }

    // Programar nuevo guardado después de 2 segundos
    loggerClient.info('⏳ Guardado automático programado en 2 segundos...', {
      completedLevels: progress.completedLevels,
      currentLevel: progress.currentLevel,
    });
    
    saveTimeoutRef.current = setTimeout(() => {
      loggerClient.info('🚀 Ejecutando guardado automático ahora...');
      saveProgressToAPI(progress);
    }, 2000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [progress, isLoading, saveProgressToAPI]);

  /**
   * Verificar y desbloquear achievements
   */
  const checkAchievements = useCallback(
    (
      levelId: number,
      score: number,
      timeSpent: number,
      perfectScore: boolean
    ): Achievement[] => {
      const unlockedAchievements: Achievement[] = [];
      const { completedLevels, perfectLevels, currentStreak } = progress;

      setProgress((prev) => {
        const updatedAchievements = prev.achievements.map((achievement) => {
          // Si ya está desbloqueado, no hacer nada
          if (achievement.unlockedAt !== null) return achievement;

          let shouldUnlock = false;
          let newProgress = achievement.progress;

          switch (achievement.id) {
            case 'first_steps':
              if (completedLevels === 0) {
                shouldUnlock = true;
                newProgress = 100;
              }
              break;

            case 'perfect_score':
              if (perfectScore) {
                shouldUnlock = true;
                newProgress = 100;
              }
              break;

            case 'halfway_there':
              newProgress = Math.min((completedLevels / 5) * 100, 100);
              if (completedLevels >= 5) {
                shouldUnlock = true;
              }
              break;

            case 'master':
              newProgress = (completedLevels / spanishLevels.length) * 100;
              if (completedLevels >= spanishLevels.length) {
                shouldUnlock = true;
              }
              break;

            case 'streak_3':
              newProgress = Math.min((currentStreak / 3) * 100, 100);
              if (currentStreak >= 3) {
                shouldUnlock = true;
              }
              break;

            case 'speed_demon':
              if (timeSpent < 180) {
                // menos de 3 minutos (180 segundos)
                shouldUnlock = true;
                newProgress = 100;
              }
              break;

            case 'perfectionist':
              newProgress = Math.min((perfectLevels / 3) * 100, 100);
              if (perfectLevels >= 3) {
                shouldUnlock = true;
              }
              break;
          }

          if (shouldUnlock && achievement.unlockedAt === null) {
            const unlockedAchievement = {
              ...achievement,
              unlockedAt: new Date().toISOString(),
              progress: 100,
            };
            unlockedAchievements.push(unlockedAchievement);
            return unlockedAchievement;
          }

          return { ...achievement, progress: newProgress };
        });

        return {
          ...prev,
          achievements: updatedAchievements,
        };
      });

      return unlockedAchievements;
    },
    [progress]
  );

  /**
   * Completar un nivel
   */
  const completeLevel = useCallback(
    (levelId: number, result: QuizResult): LevelCompletionResult => {
      const level = spanishLevels.find((l) => l.id === levelId);
      if (!level) {
        throw new Error(`Level ${levelId} not found`);
      }

      const percentage = result.percentage;
      const grade = calculateGrade(percentage);
      const passed = percentage >= level.requiredScore;
      const perfectScore = percentage === 100;
      const timeSpent = result.timeSpent || 0;

      let updatedProgress: UserProgress;
      let unlockedLevels: number[] = [];
      let earnedAchievements: Achievement[] = [];

      setProgress((prev) => {
        const currentLevelProgress = prev.levelsProgress[levelId];
        const isFirstCompletion = currentLevelProgress.status !== 'completed';
        const isBetterScore =
          !currentLevelProgress.bestScore || percentage > currentLevelProgress.bestScore;

        // Actualizar progreso del nivel actual
        const updatedLevelProgress: LevelProgress = {
          ...currentLevelProgress,
          status: passed ? 'completed' : currentLevelProgress.status,
          bestScore: isBetterScore ? percentage : currentLevelProgress.bestScore,
          attempts: currentLevelProgress.attempts + 1,
          perfectScore: perfectScore || currentLevelProgress.perfectScore,
          completedAt: passed ? new Date().toISOString() : currentLevelProgress.completedAt,
          lastAttemptAt: new Date().toISOString(),
          timeSpent: currentLevelProgress.timeSpent + timeSpent,
        };

        // Calcular nuevos valores
        const newCompletedLevels = isFirstCompletion && passed
          ? prev.completedLevels + 1
          : prev.completedLevels;
        
        const newPerfectLevels = perfectScore && !currentLevelProgress.perfectScore
          ? prev.perfectLevels + 1
          : prev.perfectLevels;

        // Calcular streak
        const isGoodGrade = grade === 'S' || grade === 'A' || grade === 'B';
        const newStreak = isGoodGrade ? prev.currentStreak + 1 : 0;
        const newBestStreak = Math.max(newStreak, prev.bestStreak);

        // Desbloquear siguiente nivel si pasó
        const newLevelsProgress = { ...prev.levelsProgress };
        newLevelsProgress[levelId] = updatedLevelProgress;

        if (passed && levelId < spanishLevels.length) {
          const nextLevelId = levelId + 1;
          if (newLevelsProgress[nextLevelId].status === 'locked') {
            newLevelsProgress[nextLevelId] = {
              ...newLevelsProgress[nextLevelId],
              status: 'available',
            };
            unlockedLevels.push(nextLevelId);
          }
        }

        updatedProgress = {
          ...prev,
          currentLevel: passed ? Math.max(prev.currentLevel, levelId + 1) : prev.currentLevel,
          levelsProgress: newLevelsProgress,
          totalScore: prev.totalScore + percentage,
          completedLevels: newCompletedLevels,
          perfectLevels: newPerfectLevels,
          currentStreak: newStreak,
          bestStreak: newBestStreak,
          lastActivityAt: new Date().toISOString(),
        };

        return updatedProgress;
      });

      // Verificar achievements después de actualizar el progreso
      earnedAchievements = checkAchievements(levelId, percentage, timeSpent, perfectScore);
      setNewAchievements(earnedAchievements);

      return {
        passed,
        grade,
        percentage,
        unlockedLevels,
        earnedAchievements,
        isNewBest: percentage > (progress.levelsProgress[levelId].bestScore || 0),
        isPerfect: perfectScore,
      };
    },
    [checkAchievements, progress.levelsProgress]
  );

  /**
   * Resetear progreso (para testing o reinicio)
   */
  const resetProgress = useCallback(() => {
    const initialProgress = getInitialProgress();
    setProgress(initialProgress);
    setNewAchievements([]);
  }, []);

  /**
   * Obtener estado de un nivel específico
   */
  const getLevelStatus = useCallback(
    (levelId: number): LevelStatus => {
      return progress.levelsProgress[levelId]?.status || 'locked';
    },
    [progress.levelsProgress]
  );

  /**
   * Obtener progreso de un nivel específico
   */
  const getLevelProgress = useCallback(
    (levelId: number): LevelProgress | null => {
      return progress.levelsProgress[levelId] || null;
    },
    [progress.levelsProgress]
  );

  /**
   * Calcular estadísticas del usuario
   */
  const stats: UserStats = useMemo(() => {
    const completedLevelsArray = Object.entries(progress.levelsProgress)
      .filter(([, prog]) => prog.status === 'completed')
      .map(([id, prog]) => ({ id: Number(id), ...prog }));

    const totalAttempts = Object.values(progress.levelsProgress).reduce(
      (sum, prog) => sum + prog.attempts,
      0
    );

    const totalCorrectAnswers = completedLevelsArray.reduce((sum, prog) => {
      const level = spanishLevels.find((l) => l.id === prog.id);
      if (!level || !prog.bestScore) return sum;
      return sum + (level.questionsCount * prog.bestScore) / 100;
    }, 0);

    const totalQuestions = completedLevelsArray.reduce((sum, prog) => {
      const level = spanishLevels.find((l) => l.id === prog.id);
      return sum + (level?.questionsCount || 0);
    }, 0);

    const accuracy = totalQuestions > 0 ? (totalCorrectAnswers / totalQuestions) * 100 : 0;

    const averageScore =
      completedLevelsArray.length > 0
        ? completedLevelsArray.reduce((sum, prog) => sum + (prog.bestScore || 0), 0) /
          completedLevelsArray.length
        : 0;

    return {
      totalAttempts,
      accuracy,
      averageScore,
      perfectLevels: progress.perfectLevels,
      currentStreak: progress.currentStreak,
      bestStreak: progress.bestStreak,
    };
  }, [progress]);

  /**
   * Obtener nivel actual disponible más alto
   */
  const currentAvailableLevel = useMemo(() => {
    const availableLevels = spanishLevels.filter(
      (level) => progress.levelsProgress[level.id]?.status === 'available'
    );
    return availableLevels.length > 0 ? availableLevels[0].id : null;
  }, [progress.levelsProgress]);

  /**
   * Limpiar achievements mostrados
   */
  const clearNewAchievements = useCallback(() => {
    setNewAchievements([]);
  }, []);

  return {
    // Estado
    progress,
    stats,
    currentAvailableLevel,
    newAchievements,
    
    // Estados de persistencia API
    isLoading,
    isSaving,
    lastSaved,
    
    // Acciones
    completeLevel,
    resetProgress,
    getLevelStatus,
    getLevelProgress,
    clearNewAchievements,
  };
}

export default useProgression;
