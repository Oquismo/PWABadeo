/**
 * Hook useQuiz - Gestión completa de estado para cuestionarios
 * Material 3 Expressive Design System
 * 
 * Maneja toda la lógica del cuestionario:
 * - Navegación entre preguntas
 * - Selección y validación de respuestas
 * - Cálculo de puntuación
 * - Gestión de tiempo
 * - Generación de resultados
 */

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Quiz,
  QuizQuestion,
  QuizAnswerState,
  QuizResult,
  UseQuizReturn,
  UseQuizOptions,
} from '@/types/quiz.types';

/**
 * Función auxiliar para mezclar un array (Fisher-Yates shuffle)
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Hook principal para gestión de cuestionarios
 */
export function useQuiz(
  quiz: Quiz,
  options: UseQuizOptions = {}
): UseQuizReturn {
  const {
    autoNext = false,
    autoNextDelay = 1500,
    shuffleQuestions = false,
    shuffleAnswers = false,
    allowReview = true,
  } = options;

  // Estado del quiz
  const [questions] = useState<QuizQuestion[]>(() => {
    const q = shuffleQuestions ? shuffleArray(quiz.questions) : quiz.questions;
    
    if (shuffleAnswers) {
      return q.map(question => ({
        ...question,
        answers: shuffleArray(question.answers),
      }));
    }
    
    return q;
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswerState[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [startTime] = useState<number>(Date.now());
  const [isCompleted, setIsCompleted] = useState(false);
  const autoNextTimerRef = useRef<NodeJS.Timeout>();

  // Pregunta actual
  const currentQuestion = useMemo(
    () => questions[currentQuestionIndex] || null,
    [questions, currentQuestionIndex]
  );

  // Estado de la respuesta actual
  const currentAnswerState = useMemo(
    () => answers.find(a => a.questionId === currentQuestion?.id),
    [answers, currentQuestion]
  );

  const isAnswered = !!currentAnswerState;
  const isCorrect = currentAnswerState?.isCorrect ?? null;

  // Progreso (0-100)
  const progress = useMemo(
    () => Math.round((answers.length / questions.length) * 100),
    [answers.length, questions.length]
  );

  // Tiempo transcurrido
  const [timeElapsed, setTimeElapsed] = useState(0);
  
  useEffect(() => {
    if (isCompleted) return;
    
    const interval = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [startTime, isCompleted]);

  // Limpiar timer de auto-next al desmontar
  useEffect(() => {
    return () => {
      if (autoNextTimerRef.current) {
        clearTimeout(autoNextTimerRef.current);
      }
    };
  }, []);

  /**
   * Seleccionar una respuesta
   */
  const selectAnswer = useCallback(
    (answerId: string) => {
      if (!currentQuestion || isAnswered) return;

      const answer = currentQuestion.answers.find(a => a.id === answerId);
      if (!answer) return;

      const answerState: QuizAnswerState = {
        questionId: currentQuestion.id,
        selectedAnswerId: answerId,
        isCorrect: answer.isCorrect,
        timestamp: Date.now(),
      };

      setAnswers(prev => [...prev, answerState]);
      setSelectedAnswer(answerId);

      // Auto-avanzar si está habilitado
      if (autoNext && currentQuestionIndex < questions.length - 1) {
        autoNextTimerRef.current = setTimeout(() => {
          nextQuestion();
        }, autoNextDelay);
      }

      // Si es la última pregunta, completar el quiz
      if (currentQuestionIndex === questions.length - 1) {
        setTimeout(() => {
          setIsCompleted(true);
        }, 1000);
      }
    },
    [currentQuestion, isAnswered, autoNext, autoNextDelay, currentQuestionIndex, questions.length]
  );

  /**
   * Siguiente pregunta
   */
  const nextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      
      // Limpiar el auto-next timer
      if (autoNextTimerRef.current) {
        clearTimeout(autoNextTimerRef.current);
      }
    }
  }, [currentQuestionIndex, questions.length]);

  /**
   * Pregunta anterior
   */
  const previousQuestion = useCallback(() => {
    if (allowReview && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedAnswer(null);
    }
  }, [allowReview, currentQuestionIndex]);

  /**
   * Saltar pregunta (sin responder)
   */
  const skipQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      nextQuestion();
    }
  }, [currentQuestionIndex, questions.length, nextQuestion]);

  /**
   * Reiniciar el quiz
   */
  const restartQuiz = useCallback(() => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setIsCompleted(false);
    setTimeElapsed(0);
  }, []);

  // Calcular resultado final
  const result = useMemo((): QuizResult | null => {
    if (!isCompleted) return null;

    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const incorrectAnswers = answers.filter(a => !a.isCorrect).length;
    const skippedQuestions = questions.length - answers.length;
    const percentage = Math.round((correctAnswers / questions.length) * 100);

    return {
      totalQuestions: questions.length,
      correctAnswers,
      incorrectAnswers,
      skippedQuestions,
      percentage,
      timeSpent: timeElapsed,
      answersHistory: answers,
      completedAt: new Date(),
    };
  }, [isCompleted, answers, questions.length, timeElapsed]);

  // Validaciones de navegación
  const canGoNext = currentQuestionIndex < questions.length - 1;
  const canGoPrevious = allowReview && currentQuestionIndex > 0;

  return {
    // Estado
    currentQuestion,
    currentQuestionIndex,
    totalQuestions: questions.length,
    selectedAnswer,
    isAnswered,
    isCorrect,
    progress,
    
    // Acciones
    selectAnswer,
    nextQuestion,
    previousQuestion,
    skipQuestion,
    restartQuiz,
    
    // Resultado
    result,
    isCompleted,
    
    // Utilidades
    canGoNext,
    canGoPrevious,
    timeElapsed,
  };
}

export default useQuiz;
