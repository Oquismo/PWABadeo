/**
 * Sistema de Tipos para Niveles y Progresión
 * Sistema de aprendizaje gamificado con 10 niveles
 */

import { Quiz, QuizResult } from './quiz.types';

/**
 * Estado de un nivel individual
 */
export type LevelStatus = 'locked' | 'available' | 'completed';

/**
 * Información de un nivel
 */
export interface Level {
  id: number;
  title: string;
  description: string;
  difficulty: 'Fácil' | 'Medio' | 'Difícil' | 'Experto';
  requiredScore: number; // Puntuación mínima para desbloquear siguiente (%)
  questionsCount: number;
  estimatedTime: number; // en minutos
  icon: string; // Emoji o icono
  color: string; // Color temático del nivel
  quiz: Quiz;
}

/**
 * Progreso del usuario en un nivel específico
 */
export interface LevelProgress {
  status: LevelStatus;
  bestScore: number | null; // Mejor puntuación obtenida (%)
  attempts: number;
  lastAttemptAt: string | null;
  completedAt: string | null;
  timeSpent: number; // Tiempo total invertido en segundos
  perfectScore: boolean; // Si logró 100%
}

/**
 * Progreso global del usuario
 */
export interface UserProgress {
  currentLevel: number; // Nivel actual disponible
  levelsProgress: Record<number, LevelProgress>; // Mapa de ID de nivel a progreso
  totalScore: number; // Puntuación total acumulada
  completedLevels: number;
  perfectLevels: number;
  achievements: Achievement[];
  currentStreak: number; // Racha actual de buenos resultados
  bestStreak: number; // Mejor racha histórica
  lastActivityAt: string | null;
}

/**
 * Sistema de logros (Achievements)
 */
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
  progress: number; // 0-100
  category: 'completion' | 'score' | 'streak' | 'speed' | 'special';
}

/**
 * Estadísticas generales del usuario
 */
export interface UserStats {
  totalAttempts: number;
  accuracy: number; // Porcentaje de precisión global
  averageScore: number;
  perfectLevels: number; // Niveles con 100%
  currentStreak: number;
  bestStreak: number;
}

/**
 * Resultado de completar un nivel
 */
export interface LevelCompletionResult {
  passed: boolean;
  grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F'; // Calificación estilo gaming
  percentage: number;
  unlockedLevels: number[]; // IDs de niveles desbloqueados
  earnedAchievements: Achievement[];
  isNewBest: boolean;
  isPerfect: boolean;
}

/**
 * Props para LevelSelector
 */
export interface LevelSelectorProps {
  levels: Level[];
  userProgress: UserProgress;
  onLevelSelect: (levelId: number) => void;
}

/**
 * Props para LevelCard
 */
export interface LevelCardProps {
  level: Level;
  progress: LevelProgress;
  isLocked: boolean;
  onClick: () => void;
}

/**
 * Retorno del hook useProgression
 */
export interface UseProgressionReturn {
  // Estado
  progress: UserProgress;
  stats: UserStats;
  currentAvailableLevel: number | null;
  newAchievements: Achievement[];
  
  // Estados de persistencia (API)
  isLoading: boolean; // Cargando progreso inicial desde API
  isSaving: boolean; // Guardando progreso en API
  lastSaved: Date | null; // Timestamp del último guardado exitoso
  
  // Acciones
  completeLevel: (levelId: number, result: QuizResult) => LevelCompletionResult;
  resetProgress: () => void;
  clearNewAchievements: () => void;
  
  // Consultas
  getLevelStatus: (levelId: number) => LevelStatus;
  getLevelProgress: (levelId: number) => LevelProgress | null;
}

/**
 * Configuración del sistema de niveles
 */
export interface LevelSystemConfig {
  minScoreToUnlock: number; // 80% por defecto
  enableStreaks: boolean;
  enableAchievements: boolean;
  storageKey: string;
}
