/**
 * QuizCard - Componente Principal del Cuestionario
 * Material 3 Expressive Design System
 * 
 * Componente interactivo con diseño audaz:
 * - Formas asimétricas y personalizadas
 * - Colores vibrantes y gradientes
 * - Microinteracciones fluidas
 * - Feedback visual instantáneo
 * - Animaciones expresivas con Framer Motion
 */

'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Typography, LinearProgress, Chip, Stack } from '@mui/material';
import {
  CheckCircleOutline as CheckIcon,
  CancelOutlined as WrongIcon,
  EmojiEvents as TrophyIcon,
  Replay as RestartIcon,
  ArrowForward as NextIcon,
  ArrowBack as PrevIcon,
  Timer as TimerIcon,
} from '@mui/icons-material';
import { useQuiz } from '@/hooks/useQuiz';
import { Quiz } from '@/types/quiz.types';
import '@/styles/quiz-expressive.css';

interface QuizCardProps {
  quiz: Quiz;
  onComplete?: (result: any) => void;
  onExit?: () => void;
}

/**
 * Formato de tiempo (segundos a mm:ss)
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Obtener mensaje según el porcentaje
 */
function getResultMessage(percentage: number): string {
  if (percentage === 100) return '¡Perfecto! 🎉 ¡Eres un experto!';
  if (percentage >= 80) return '¡Excelente! 🌟 Gran trabajo';
  if (percentage >= 60) return '¡Bien hecho! 👏 Sigue así';
  if (percentage >= 40) return '¡Buen intento! 💪 Puedes mejorar';
  return '¡Sigue practicando! 📚 Lo lograrás';
}

/**
 * Animaciones Material 3 Expressive
 */
const cardVariants = {
  initial: { opacity: 0, y: 40, scale: 0.95 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.05, 0.7, 0.1, 1.0] as const, // emphasized-decelerate
    }
  },
  exit: { 
    opacity: 0, 
    y: -40, 
    scale: 0.95,
    transition: {
      duration: 0.3,
      ease: [0.2, 0, 0, 1.0] as const, // emphasized
    }
  },
};

const questionVariants = {
  initial: { opacity: 0, x: 100 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.4,
      ease: [0.05, 0.7, 0.1, 1.0] as const,
    }
  },
  exit: { 
    opacity: 0, 
    x: -100,
    transition: {
      duration: 0.3,
      ease: [0.2, 0, 0, 1.0] as const,
    }
  },
};

const answerVariants = {
  initial: { opacity: 0, x: -20 },
  animate: (index: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      delay: index * 0.08,
      ease: [0.05, 0.7, 0.1, 1.0] as const,
    }
  }),
};

export default function QuizCard({ quiz, onComplete, onExit }: QuizCardProps) {
  const {
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    selectedAnswer,
    isAnswered,
    isCorrect,
    progress,
    selectAnswer,
    nextQuestion,
    previousQuestion,
    restartQuiz,
    result,
    isCompleted,
    canGoNext,
    canGoPrevious,
    timeElapsed,
  } = useQuiz(quiz, {
    autoNext: false,
    allowReview: false,
    shuffleAnswers: false,
  });

  // Llamar a onComplete cuando se complete el quiz
  useEffect(() => {
    if (isCompleted && result && onComplete) {
      onComplete(result);
    }
  }, [isCompleted, result, onComplete]);

  /**
   * Renderizar pantalla de resultados
   */
  if (isCompleted && result) {
    return (
      <motion.div
        className="quiz-container"
        variants={cardVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <div className="quiz-card">
          <div className="quiz-results">
            {/* Icono de trofeo */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                duration: 0.6, 
                ease: [0.68, -0.55, 0.265, 1.55] // bounce 
              }}
            >
              <TrophyIcon 
                sx={{ 
                  fontSize: '5rem', 
                  color: '#ffd740',
                  filter: 'drop-shadow(0 0 20px rgba(255, 215, 64, 0.6))',
                  mb: 2,
                }} 
              />
            </motion.div>

            {/* Puntuación */}
            <div className="quiz-results-score">
              {result.percentage}%
            </div>

            {/* Mensaje */}
            <Typography className="quiz-results-message">
              {getResultMessage(result.percentage)}
            </Typography>

            <Typography 
              variant="body1" 
              sx={{ 
                color: 'rgba(255,255,255,0.7)', 
                mb: 4,
                fontSize: '1.1rem',
              }}
            >
              Acertaste <strong>{result.correctAnswers}</strong> de{' '}
              <strong>{result.totalQuestions}</strong> preguntas
            </Typography>

            {/* Estadísticas */}
            <div className="quiz-results-stats">
              <motion.div 
                className="quiz-stat-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="quiz-stat-value">
                  {result.correctAnswers}
                </div>
                <div className="quiz-stat-label">Correctas</div>
              </motion.div>

              <motion.div 
                className="quiz-stat-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="quiz-stat-value">
                  {result.incorrectAnswers}
                </div>
                <div className="quiz-stat-label">Incorrectas</div>
              </motion.div>

              <motion.div 
                className="quiz-stat-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="quiz-stat-value">
                  {formatTime(result.timeSpent)}
                </div>
                <div className="quiz-stat-label">Tiempo</div>
              </motion.div>
            </div>

            {/* Botones de acción */}
            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 4 }}>
              <motion.button
                className="quiz-button"
                onClick={restartQuiz}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RestartIcon sx={{ mr: 1 }} />
                Reintentar
              </motion.button>

              {onExit && (
                <motion.button
                  className="quiz-button quiz-button-secondary"
                  onClick={onExit}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Salir
                </motion.button>
              )}
            </Stack>
          </div>
        </div>
      </motion.div>
    );
  }

  /**
   * Renderizar pantalla de pregunta
   */
  if (!currentQuestion) return null;

  return (
    <motion.div
      className="quiz-container"
      variants={cardVariants}
      initial="initial"
      animate="animate"
    >
      <div className="quiz-card">
        {/* Header con título y progreso */}
        <div className="quiz-header">
          <Typography className="quiz-title">
            {quiz.title}
          </Typography>

          {/* Info chips */}
          <Stack 
            direction="row" 
            spacing={1} 
            justifyContent="center" 
            sx={{ mb: 2 }}
          >
            <Chip 
              label={`${currentQuestionIndex + 1} / ${totalQuestions}`}
              size="small"
              sx={{ 
                bgcolor: 'rgba(124, 77, 255, 0.2)',
                color: '#b388ff',
                fontWeight: 600,
              }}
            />
            <Chip 
              icon={<TimerIcon />}
              label={formatTime(timeElapsed)}
              size="small"
              sx={{ 
                bgcolor: 'rgba(64, 196, 255, 0.2)',
                color: '#40c4ff',
                fontWeight: 600,
              }}
            />
          </Stack>

          {/* Barra de progreso */}
          <div className="quiz-progress-bar">
            <motion.div 
              className="quiz-progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: [0.2, 0, 0, 1.0] }}
            />
          </div>
        </div>

        {/* Pregunta con animación */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            variants={questionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className="quiz-question">
              <div className="quiz-question-number">
                Pregunta {currentQuestionIndex + 1}
              </div>
              <Typography className="quiz-question-text">
                {currentQuestion.question}
              </Typography>
            </div>

            {/* Opciones de respuesta */}
            <div className="quiz-answers">
              {currentQuestion.answers.map((answer, index) => {
                const isSelected = selectedAnswer === answer.id;
                const isThisCorrect = isAnswered && answer.isCorrect;
                const isThisIncorrect = isAnswered && isSelected && !answer.isCorrect;
                
                let className = 'quiz-answer-option';
                if (isSelected) className += ' selected';
                if (isThisCorrect) className += ' correct';
                if (isThisIncorrect) className += ' incorrect';
                if (isAnswered) className += ' disabled';

                return (
                  <motion.div
                    key={answer.id}
                    custom={index}
                    variants={answerVariants}
                    initial="initial"
                    animate="animate"
                    className={className}
                    onClick={() => !isAnswered && selectAnswer(answer.id)}
                    whileHover={!isAnswered ? { 
                      x: 8, 
                      scale: 1.02,
                      transition: { duration: 0.2 }
                    } : {}}
                    whileTap={!isAnswered ? { scale: 0.98 } : {}}
                  >
                    <Stack direction="row" alignItems="center" spacing={2}>
                      {/* Icono de estado */}
                      <Box sx={{ flexShrink: 0 }}>
                        {isThisCorrect && (
                          <CheckIcon sx={{ color: 'white', fontSize: '1.5rem' }} />
                        )}
                        {isThisIncorrect && (
                          <WrongIcon sx={{ color: 'white', fontSize: '1.5rem' }} />
                        )}
                      </Box>

                      {/* Texto de la respuesta */}
                      <Typography className="quiz-answer-text">
                        {answer.text}
                      </Typography>
                    </Stack>
                  </motion.div>
                );
              })}
            </div>

            {/* Explicación (aparece tras responder) */}
            <AnimatePresence>
              {isAnswered && currentQuestion.explanation && (
                <motion.div
                  className="quiz-explanation"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      fontWeight: 700, 
                      color: '#40c4ff',
                      mb: 1,
                    }}
                  >
                    💡 Explicación:
                  </Typography>
                  <Typography className="quiz-explanation-text">
                    {currentQuestion.explanation}
                  </Typography>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        {/* Navegación */}
        <div className="quiz-navigation">
          <motion.button
            className="quiz-button quiz-button-secondary"
            onClick={previousQuestion}
            disabled={!canGoPrevious}
            whileHover={canGoPrevious ? { y: -2 } : {}}
            whileTap={canGoPrevious ? { y: 0 } : {}}
          >
            <PrevIcon sx={{ mr: 1 }} />
            Anterior
          </motion.button>

          <motion.button
            className="quiz-button"
            onClick={nextQuestion}
            disabled={!canGoNext || !isAnswered}
            whileHover={canGoNext && isAnswered ? { y: -2 } : {}}
            whileTap={canGoNext && isAnswered ? { y: 0 } : {}}
          >
            Siguiente
            <NextIcon sx={{ ml: 1 }} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
