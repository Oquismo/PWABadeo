/**
 * LevelSelector Component
 * Muestra grid de 10 niveles con estados: locked, available, completed
 * Diseño Material 3 Expressive con animaciones
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Level } from '@/types/progression.types';
import { UserProgress } from '@/types/progression.types';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import SchoolIcon from '@mui/icons-material/School';
import BookIcon from '@mui/icons-material/Book';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import ExploreIcon from '@mui/icons-material/Explore';
import PublicIcon from '@mui/icons-material/Public';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import DiamondIcon from '@mui/icons-material/Diamond';
import CastleIcon from '@mui/icons-material/Castle';
import '@/styles/levels-expressive.css';

interface LevelSelectorProps {
  levels: Level[];
  userProgress: UserProgress;
  onLevelSelect: (levelId: number) => void;
}

/**
 * Badge de calificación para niveles completados
 */
const GradeBadge: React.FC<{ grade: string; score: number }> = ({ grade, score }) => {
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'S': return '#ffd700'; // Dorado
      case 'A': return '#00e676'; // Verde brillante
      case 'B': return '#00bcd4'; // Cyan
      case 'C': return '#ff9800'; // Naranja
      case 'D': return '#ff5722'; // Rojo-naranja
      case 'F': return '#f44336'; // Rojo
      default: return '#757575';
    }
  };

  return (
    <motion.div 
      className="level-grade-badge"
      style={{ backgroundColor: getGradeColor(grade) }}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ 
        type: 'spring' as const,
        stiffness: 200,
        damping: 15,
        delay: 0.2
      }}
    >
      <span className="grade-letter">{grade}</span>
      <span className="grade-score">{score}%</span>
    </motion.div>
  );
};

/**
 * Card individual de nivel
 */
const LevelCard: React.FC<{
  level: Level;
  status: 'locked' | 'available' | 'completed';
  bestScore: number | null;
  perfectScore: boolean;
  attempts: number;
  onClick: () => void;
  index: number;
}> = ({ level, status, bestScore, perfectScore, attempts, onClick, index }) => {
  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';
  const isAvailable = status === 'available';

  // Calcular calificación
  const getGrade = (score: number): string => {
    if (score === 100) return 'S';
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  // Variantes de animación para entrada escalonada
  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 15,
        delay: index * 0.08, // Escalonamiento de 80ms
      },
    },
    hover: isLocked
      ? {} // Sin hover si está bloqueado
      : {
          scale: 1.05,
          y: -8,
          transition: {
            type: 'spring' as const,
            stiffness: 400,
            damping: 10,
          },
        },
    tap: isLocked
      ? {} // Sin tap si está bloqueado
      : {
          scale: 0.95,
        },
  };

  // Efecto de brillo para niveles disponibles
  const glowAnimation = isAvailable && !isCompleted
    ? {
        boxShadow: [
          `0 0 20px ${level.color}40`,
          `0 0 40px ${level.color}60`,
          `0 0 20px ${level.color}40`,
        ],
      }
    : {};

  return (
    <motion.div
      className={`level-card ${status}`}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
      onClick={isLocked ? undefined : onClick}
      style={{
        cursor: isLocked ? 'not-allowed' : 'pointer',
        borderColor: level.color,
        opacity: isLocked ? 0.5 : 1,
      }}
    >
      {/* Animación de brillo de fondo */}
      <motion.div
        className="level-card-glow"
        style={{ backgroundColor: level.color }}
        animate={glowAnimation}
        transition={{
          duration: 2,
          repeat: isAvailable && !isCompleted ? Infinity : 0,
          ease: 'easeInOut',
        }}
      />

      {/* Indicador de estado: Lock, Check o Star */}
      <div className="level-status-indicator">
        {isLocked && <LockIcon className="status-icon locked-icon" />}
        {isCompleted && !perfectScore && (
          <CheckCircleIcon className="status-icon completed-icon" />
        )}
        {perfectScore && (
          <motion.div
            initial={{ rotate: -180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: 'spring' as const, stiffness: 200, damping: 10 }}
          >
            <StarIcon className="status-icon perfect-icon" />
          </motion.div>
        )}
      </div>

      {/* Icono del nivel: usar SVG MUI cuando haya mapping, sino fallback emoji */}
      <div className="level-icon" style={{ fontSize: '3rem' }}>
        {(() => {
          const mapIcon = (id: number) => {
            switch (id) {
              case 1: return <BookIcon fontSize="inherit" />; // Fundamentos
              case 2: return <ExploreIcon fontSize="inherit" />; // Rutinas
              case 3: return <HistoryEduIcon fontSize="inherit" />; // Pasado
              case 4: return <PublicIcon fontSize="inherit" />; // Futuro
              case 5: return <CastleIcon fontSize="inherit" />; // Subjuntivo (montaña/alturas)
              case 6: return <WhatshotIcon fontSize="inherit" />; // Condicional (energía)
              case 7: return <EmojiObjectsIcon fontSize="inherit" />; // Expresiones (ideas)
              case 8: return <WhatshotIcon fontSize="inherit" />; // Subjuntivo II - mantener fuego
              case 9: return <DiamondIcon fontSize="inherit" />; // Preposiciones (precisión)
              case 10: return <CastleIcon fontSize="inherit" />; // Maestría (corona / logro)
              default: return null;
            }
          };

          const svg = mapIcon(level.id);
          return svg ? svg : <span>{level.icon}</span>;
        })()}
      </div>

      {/* Contenido */}
      <div className="level-content">
        <h3 className="level-title">{level.title}</h3>
        <p className="level-description">{level.description}</p>

        {/* Metadata */}
        <div className="level-metadata">
          <span className="level-difficulty" style={{ color: level.color }}>
            {level.difficulty}
          </span>
          <span className="level-questions">
            {level.questionsCount} preguntas
          </span>
          <span className="level-time">
            ⏱️ {level.estimatedTime} min
          </span>
        </div>

        {/* Badge de mejor puntuación si está completado */}
        {isCompleted && bestScore !== null && (
          <div className="level-score-display">
            <GradeBadge grade={getGrade(bestScore)} score={bestScore} />
            {attempts > 1 && (
              <span className="level-attempts">{attempts} intentos</span>
            )}
          </div>
        )}

        {/* Indicador de progreso para niveles disponibles */}
        {isAvailable && !isCompleted && (
          <motion.div
            className="level-start-prompt"
            animate={{
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            ¡Comienza ahora! →
          </motion.div>
        )}
      </div>

      {/* Badge de perfección */}
      {perfectScore && (
        <motion.div
          className="perfect-badge"
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: 'spring' as const, stiffness: 200 }}
        >
          💯 ¡PERFECTO!
        </motion.div>
      )}
    </motion.div>
  );
};

/**
 * Componente principal: Selector de Niveles
 */
export const LevelSelector: React.FC<LevelSelectorProps> = ({
  levels,
  userProgress,
  onLevelSelect,
}) => {
  const [rankInfo, setRankInfo] = React.useState<{ rank?: number; totalUsers?: number; averageScore?: number } | null>(null);

  // Cargar comparativa (puesto, totalUsers, avg) en mount
  React.useEffect(() => {
    let mounted = true;
    async function loadCompare() {
      try {
        const res = await fetch('/api/cursos/progreso/compare');
        if (!res.ok) return;
        const json = await res.json();
        if (mounted && json && json.data) {
          setRankInfo({ rank: json.data.user.rank, totalUsers: json.data.totalUsers, averageScore: json.data.averageScore });
        }
      } catch (e) {
        console.warn('No se pudo cargar comparativa', e);
      }
    }
    loadCompare();
    return () => { mounted = false; };
  }, []);

  // Calcular estadísticas de progreso global
  const completedCount = Object.values(userProgress.levelsProgress).filter(
    (p) => p.status === 'completed'
  ).length;
  const totalLevels = levels.length;
  const progressPercentage = (completedCount / totalLevels) * 100;

  return (
    <div className="level-selector-container">
      {/* Header con estadísticas */}
      <motion.div
        className="level-selector-header"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.2, 0, 0, 1.0] as const }}
      >
        <h1 className="selector-title">
          {/* Usar icono SVG de MUI para mejor control visual */}
          <SchoolIcon className="title-icon" fontSize="inherit" />
        </h1>

        {/* Comparativa: puesto y promedio global */}
        {rankInfo && (
          <div className="ranking-summary" aria-live="polite">
            <strong>Estás en el puesto {rankInfo.rank}</strong>
            {rankInfo.totalUsers ? (
              <span> de {rankInfo.totalUsers} usuarios</span>
            ) : null}
            {typeof rankInfo.averageScore === 'number' && (
              <div className="ranking-average">Media global: {Math.round(rankInfo.averageScore)}</div>
            )}
          </div>
        )}

        {/* Barra de progreso global */}
        <div className="global-progress-container">
          <div className="progress-info">
            <span className="progress-label">Progreso Total</span>
            <span className="progress-numbers">
              {completedCount} / {totalLevels} niveles
            </span>
          </div>
          
          <div className="progress-bar-track">
            <motion.div
              className="progress-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
            />
          </div>
          
          <span className="progress-percentage">{Math.round(progressPercentage)}%</span>
        </div>

        {/* Estadísticas adicionales eliminadas por petición del diseño */}
      </motion.div>

      {/* Grid de niveles */}
      <motion.div
        className="levels-grid"
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence>
          {levels.map((level, index) => {
            const progress = userProgress.levelsProgress[level.id];
            return (
              <LevelCard
                key={level.id}
                level={level}
                status={progress?.status || 'locked'}
                bestScore={progress?.bestScore || null}
                perfectScore={progress?.perfectScore || false}
                attempts={progress?.attempts || 0}
                onClick={() => onLevelSelect(level.id)}
                index={index}
              />
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Mensaje de motivación */}
      {completedCount === totalLevels && (
        <motion.div
          className="completion-message"
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring' as const, stiffness: 100, delay: 0.5 }}
        >
          <span className="completion-icon">👑</span>
          <h2>¡Felicitaciones, Maestro del Español!</h2>
          <p>Has completado todos los niveles. ¡Increíble trabajo!</p>
        </motion.div>
      )}
    </div>
  );
};

export default LevelSelector;
