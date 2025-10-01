/**
 * Datos de Cuestionario de Español - Nivel B1/B2
 * Material 3 Expressive Design System
 * 
 * Cuestionario de práctica con 5 preguntas de gramática y vocabulario
 */

import { Quiz } from '@/types/quiz.types';

export const spanishQuizB1B2: Quiz = {
  id: 'spanish-b1b2-001',
  title: 'Español B1/B2 - Gramática y Vocabulario',
  description: 'Pon a prueba tus conocimientos de español con este cuestionario de nivel intermedio-avanzado.',
  language: 'Español',
  level: 'B1-B2',
  passingScore: 60,
  estimatedTime: 5,
  category: 'mixed',
  
  questions: [
    {
      id: 'q1',
      question: '¿Cuál es la forma correcta del subjuntivo presente del verbo "ser" en primera persona del plural?',
      explanation: 'El subjuntivo presente de "ser" es irregular: yo sea, tú seas, él/ella sea, nosotros seamos, vosotros seáis, ellos/ellas sean.',
      difficulty: 'B1',
      topic: 'Gramática - Subjuntivo',
      answers: [
        { id: 'q1a1', text: 'somos', isCorrect: false },
        { id: 'q1a2', text: 'seamos', isCorrect: true },
        { id: 'q1a3', text: 'seríamos', isCorrect: false },
        { id: 'q1a4', text: 'fuéramos', isCorrect: false },
      ],
    },
    
    {
      id: 'q2',
      question: 'Completa la frase: "Si _____ tiempo, iría al cine contigo."',
      explanation: 'Para expresar una condición hipotética en el presente, usamos el imperfecto de subjuntivo (tuviera) en la cláusula "si" y el condicional simple (iría) en la cláusula principal.',
      difficulty: 'B2',
      topic: 'Gramática - Condicionales',
      answers: [
        { id: 'q2a1', text: 'tengo', isCorrect: false },
        { id: 'q2a2', text: 'tendría', isCorrect: false },
        { id: 'q2a3', text: 'tuviera', isCorrect: true },
        { id: 'q2a4', text: 'tenga', isCorrect: false },
      ],
    },
    
    {
      id: 'q3',
      question: '¿Qué significa la expresión "estar en las nubes"?',
      explanation: '"Estar en las nubes" es una expresión idiomática que significa estar distraído o no prestar atención a lo que sucede alrededor.',
      difficulty: 'B1',
      topic: 'Vocabulario - Expresiones',
      answers: [
        { id: 'q3a1', text: 'Estar muy alto', isCorrect: false },
        { id: 'q3a2', text: 'Estar distraído', isCorrect: true },
        { id: 'q3a3', text: 'Estar feliz', isCorrect: false },
        { id: 'q3a4', text: 'Estar volando', isCorrect: false },
      ],
    },
    
    {
      id: 'q4',
      question: 'Elige la preposición correcta: "Confío _____ ti para este proyecto."',
      explanation: 'El verbo "confiar" se usa con la preposición "en". Otros ejemplos: pensar en, creer en, insistir en.',
      difficulty: 'B1',
      topic: 'Gramática - Preposiciones',
      answers: [
        { id: 'q4a1', text: 'con', isCorrect: false },
        { id: 'q4a2', text: 'en', isCorrect: true },
        { id: 'q4a3', text: 'de', isCorrect: false },
        { id: 'q4a4', text: 'por', isCorrect: false },
      ],
    },
    
    {
      id: 'q5',
      question: '¿Cuál es el antónimo de "ampliar"?',
      explanation: '"Ampliar" significa hacer algo más grande o extenso. Su antónimo directo es "reducir", que significa hacer algo más pequeño o limitado.',
      difficulty: 'B2',
      topic: 'Vocabulario - Antónimos',
      answers: [
        { id: 'q5a1', text: 'expandir', isCorrect: false },
        { id: 'q5a2', text: 'aumentar', isCorrect: false },
        { id: 'q5a3', text: 'reducir', isCorrect: true },
        { id: 'q5a4', text: 'extender', isCorrect: false },
      ],
    },
  ],
};

/**
 * Datos adicionales de cuestionarios (para futuras expansiones)
 */
export const availableQuizzes = [
  {
    id: 'spanish-b1b2-001',
    title: 'Español B1/B2',
    description: 'Gramática y vocabulario intermedio-avanzado',
    level: 'B1-B2',
    questionsCount: 5,
    estimatedTime: 5,
    thumbnail: '🇪🇸',
  },
  // Placeholder para futuros cuestionarios
  {
    id: 'spanish-a2-001',
    title: 'Español A2',
    description: 'Básico - Gramática esencial',
    level: 'A2',
    questionsCount: 5,
    estimatedTime: 5,
    thumbnail: '📚',
    comingSoon: true,
  },
  {
    id: 'spanish-c1-001',
    title: 'Español C1',
    description: 'Avanzado - Expresiones y matices',
    level: 'C1',
    questionsCount: 10,
    estimatedTime: 10,
    thumbnail: '🎓',
    comingSoon: true,
  },
];

export default spanishQuizB1B2;
