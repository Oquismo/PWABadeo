/**
 * Sistema de Tipos para Cuestionarios Interactivos
 * Material 3 Expressive Design System
 */

/**
 * Respuesta individual de una pregunta
 */
export interface QuizAnswer {
  id: string;
  text: string;
  isCorrect: boolean;
}

/**
 * Pregunta del cuestionario
 */
export interface QuizQuestion {
  id: string;
  question: string;
  explanation?: string; // Explicación que aparece al responder
  answers: QuizAnswer[];
  difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  topic: string; // Ej: "Gramática", "Vocabulario", "Conjugación"
}

/**
 * Estado de una pregunta respondida
 */
export interface QuizAnswerState {
  questionId: string;
  selectedAnswerId: string | null;
  isCorrect: boolean | null;
  timestamp: number;
}

/**
 * Resultado final del cuestionario
 */
export interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skippedQuestions: number;
  percentage: number;
  timeSpent: number; // en segundos
  answersHistory: QuizAnswerState[];
  completedAt: Date;
}

/**
 * Datos completos del cuestionario
 */
export interface Quiz {
  id: string;
  title: string;
  description: string;
  language: string;
  level: string;
  questions: QuizQuestion[];
  passingScore: number; // Porcentaje mínimo para aprobar (ej: 70)
  estimatedTime: number; // Tiempo estimado en minutos
  category: 'grammar' | 'vocabulary' | 'comprehension' | 'mixed';
}

/**
 * Estado del progreso del usuario en el quiz
 */
export interface QuizProgress {
  quizId: string;
  currentQuestionIndex: number;
  answers: QuizAnswerState[];
  startTime: number;
  isCompleted: boolean;
}

/**
 * Props para el componente principal del Quiz
 */
export interface QuizComponentProps {
  quiz: Quiz;
  onComplete?: (result: QuizResult) => void;
  onExit?: () => void;
  showExplanations?: boolean;
  allowSkip?: boolean;
}

/**
 * Retorno del hook useQuiz
 */
export interface UseQuizReturn {
  // Estado
  currentQuestion: QuizQuestion | null;
  currentQuestionIndex: number;
  totalQuestions: number;
  selectedAnswer: string | null;
  isAnswered: boolean;
  isCorrect: boolean | null;
  progress: number; // 0-100
  
  // Acciones
  selectAnswer: (answerId: string) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  skipQuestion: () => void;
  restartQuiz: () => void;
  
  // Resultado
  result: QuizResult | null;
  isCompleted: boolean;
  
  // Utilidades
  canGoNext: boolean;
  canGoPrevious: boolean;
  timeElapsed: number;
}

/**
 * Opciones de configuración para useQuiz
 */
export interface UseQuizOptions {
  autoNext?: boolean; // Avanza automáticamente tras responder
  autoNextDelay?: number; // Delay en ms antes de avanzar (default: 1500)
  shuffleQuestions?: boolean;
  shuffleAnswers?: boolean;
  allowReview?: boolean; // Permitir revisar preguntas anteriores
}
