/**
 * Sistema de 10 Niveles de Español - Dificultad Progresiva
 * Desde básico (A1) hasta avanzado (C1)
 */

import { Quiz } from '@/types/quiz.types';
import { Level } from '@/types/progression.types';

/**
 * NIVEL 1: Fundamentos Básicos (A1)
 * Presente simple, vocabulario básico
 */
const level1Quiz: Quiz = {
  id: 'spanish-level-1',
  title: 'Nivel 1: Fundamentos',
  description: 'Presente simple y vocabulario básico',
  language: 'Español',
  level: 'A1',
  passingScore: 80,
  estimatedTime: 3,
  category: 'grammar',
  questions: [
    {
      id: 'l1q1',
      question: '¿Cómo se dice "I eat" en español?',
      explanation: 'En presente simple, la primera persona del singular de "comer" es "como".',
      difficulty: 'A1',
      topic: 'Presente Simple',
      answers: [
        { id: 'l1q1a1', text: 'como', isCorrect: true },
        { id: 'l1q1a2', text: 'comes', isCorrect: false },
        { id: 'l1q1a3', text: 'comemos', isCorrect: false },
        { id: 'l1q1a4', text: 'comen', isCorrect: false },
      ],
    },
    {
      id: 'l1q2',
      question: 'Completa: "Yo _____ estudiante"',
      explanation: 'El verbo "ser" en primera persona del singular es "soy".',
      difficulty: 'A1',
      topic: 'Verbo Ser',
      answers: [
        { id: 'l1q2a1', text: 'soy', isCorrect: true },
        { id: 'l1q2a2', text: 'eres', isCorrect: false },
        { id: 'l1q2a3', text: 'es', isCorrect: false },
        { id: 'l1q2a4', text: 'son', isCorrect: false },
      ],
    },
    {
      id: 'l1q3',
      question: '¿Cuál es el artículo correcto? "_____ casa"',
      explanation: 'Casa es femenino singular, por lo tanto usa "la".',
      difficulty: 'A1',
      topic: 'Artículos',
      answers: [
        { id: 'l1q3a1', text: 'la', isCorrect: true },
        { id: 'l1q3a2', text: 'el', isCorrect: false },
        { id: 'l1q3a3', text: 'los', isCorrect: false },
        { id: 'l1q3a4', text: 'las', isCorrect: false },
      ],
    },
  ],
};

/**
 * NIVEL 2: Presente y Rutinas (A1-A2)
 * Verbos reflexivos, rutinas diarias
 */
const level2Quiz: Quiz = {
  id: 'spanish-level-2',
  title: 'Nivel 2: Rutinas Diarias',
  description: 'Verbos reflexivos y rutinas',
  language: 'Español',
  level: 'A2',
  passingScore: 80,
  estimatedTime: 4,
  category: 'grammar',
  questions: [
    {
      id: 'l2q1',
      question: 'Completa: "Yo _____ levanto a las 7"',
      explanation: 'El pronombre reflexivo para "yo" es "me". Levantarse es un verbo reflexivo.',
      difficulty: 'A2',
      topic: 'Verbos Reflexivos',
      answers: [
        { id: 'l2q1a1', text: 'me', isCorrect: true },
        { id: 'l2q1a2', text: 'te', isCorrect: false },
        { id: 'l2q1a3', text: 'se', isCorrect: false },
        { id: 'l2q1a4', text: 'nos', isCorrect: false },
      ],
    },
    {
      id: 'l2q2',
      question: '¿Cuál es correcto? "Ellos _____ todos los días"',
      explanation: '"Trabajar" en tercera persona plural es "trabajan".',
      difficulty: 'A2',
      topic: 'Conjugación',
      answers: [
        { id: 'l2q2a1', text: 'trabajan', isCorrect: true },
        { id: 'l2q2a2', text: 'trabaja', isCorrect: false },
        { id: 'l2q2a3', text: 'trabajamos', isCorrect: false },
        { id: 'l2q2a4', text: 'trabajas', isCorrect: false },
      ],
    },
    {
      id: 'l2q3',
      question: '¿Qué significa "ducharse"?',
      explanation: '"Ducharse" significa tomar una ducha (to shower).',
      difficulty: 'A2',
      topic: 'Vocabulario',
      answers: [
        { id: 'l2q3a1', text: 'Tomar una ducha', isCorrect: true },
        { id: 'l2q3a2', text: 'Dormir', isCorrect: false },
        { id: 'l2q3a3', text: 'Comer', isCorrect: false },
        { id: 'l2q3a4', text: 'Estudiar', isCorrect: false },
      ],
    },
    {
      id: 'l2q4',
      question: 'Ordena la rutina: "Primero desayuno, luego _____ los dientes"',
      explanation: '"Cepillarse los dientes" es parte de la rutina matutina después del desayuno.',
      difficulty: 'A2',
      topic: 'Vocabulario',
      answers: [
        { id: 'l2q4a1', text: 'me cepillo', isCorrect: true },
        { id: 'l2q4a2', text: 'me duermo', isCorrect: false },
        { id: 'l2q4a3', text: 'me despierto', isCorrect: false },
        { id: 'l2q4a4', text: 'me acuesto', isCorrect: false },
      ],
    },
  ],
};

/**
 * NIVEL 3: Pasado Simple (A2)
 * Pretérito perfecto simple
 */
const level3Quiz: Quiz = {
  id: 'spanish-level-3',
  title: 'Nivel 3: Pasado Simple',
  description: 'Pretérito perfecto simple - acciones pasadas',
  language: 'Español',
  level: 'A2',
  passingScore: 80,
  estimatedTime: 4,
  category: 'grammar',
  questions: [
    {
      id: 'l3q1',
      question: 'Ayer yo _____ al cine',
      explanation: 'El verbo "ir" en pretérito perfecto simple, primera persona: "fui".',
      difficulty: 'A2',
      topic: 'Pretérito',
      answers: [
        { id: 'l3q1a1', text: 'fui', isCorrect: true },
        { id: 'l3q1a2', text: 'voy', isCorrect: false },
        { id: 'l3q1a3', text: 'iba', isCorrect: false },
        { id: 'l3q1a4', text: 'iré', isCorrect: false },
      ],
    },
    {
      id: 'l3q2',
      question: 'Ellos _____ la tarea anoche',
      explanation: '"Hacer" en tercera persona plural del pretérito: "hicieron".',
      difficulty: 'A2',
      topic: 'Pretérito',
      answers: [
        { id: 'l3q2a1', text: 'hicieron', isCorrect: true },
        { id: 'l3q2a2', text: 'hacen', isCorrect: false },
        { id: 'l3q2a3', text: 'hacían', isCorrect: false },
        { id: 'l3q2a4', text: 'harán', isCorrect: false },
      ],
    },
    {
      id: 'l3q3',
      question: '¿Cuál es el pasado de "comer" (yo)?',
      explanation: '"Comer" en primera persona del pretérito es "comí".',
      difficulty: 'A2',
      topic: 'Pretérito',
      answers: [
        { id: 'l3q3a1', text: 'comí', isCorrect: true },
        { id: 'l3q3a2', text: 'como', isCorrect: false },
        { id: 'l3q3a3', text: 'comía', isCorrect: false },
        { id: 'l3q3a4', text: 'comeré', isCorrect: false },
      ],
    },
  ],
};

/**
 * NIVEL 4: Futuro Simple (A2-B1)
 */
const level4Quiz: Quiz = {
  id: 'spanish-level-4',
  title: 'Nivel 4: Futuro Simple',
  description: 'Hablar sobre el futuro',
  language: 'Español',
  level: 'B1',
  passingScore: 80,
  estimatedTime: 4,
  category: 'grammar',
  questions: [
    {
      id: 'l4q1',
      question: 'Mañana yo _____ a Madrid',
      explanation: '"Viajar" en futuro simple, primera persona: "viajaré".',
      difficulty: 'B1',
      topic: 'Futuro',
      answers: [
        { id: 'l4q1a1', text: 'viajaré', isCorrect: true },
        { id: 'l4q1a2', text: 'viajo', isCorrect: false },
        { id: 'l4q1a3', text: 'viajé', isCorrect: false },
        { id: 'l4q1a4', text: 'viajaba', isCorrect: false },
      ],
    },
    {
      id: 'l4q2',
      question: 'Ellos _____ el examen la próxima semana',
      explanation: '"Tener" en futuro, tercera persona plural: "tendrán".',
      difficulty: 'B1',
      topic: 'Futuro',
      answers: [
        { id: 'l4q2a1', text: 'tendrán', isCorrect: true },
        { id: 'l4q2a2', text: 'tienen', isCorrect: false },
        { id: 'l4q2a3', text: 'tuvieron', isCorrect: false },
        { id: 'l4q2a4', text: 'tenían', isCorrect: false },
      ],
    },
    {
      id: 'l4q3',
      question: '¿Cuál es correcto? "Nosotros _____ pronto"',
      explanation: '"Volver" en futuro, primera persona plural: "volveremos".',
      difficulty: 'B1',
      topic: 'Futuro',
      answers: [
        { id: 'l4q3a1', text: 'volveremos', isCorrect: true },
        { id: 'l4q3a2', text: 'volvemos', isCorrect: false },
        { id: 'l4q3a3', text: 'volvimos', isCorrect: false },
        { id: 'l4q3a4', text: 'volvíamos', isCorrect: false },
      ],
    },
  ],
};

/**
 * NIVEL 5: Subjuntivo Presente (B1)
 */
const level5Quiz: Quiz = {
  id: 'spanish-level-5',
  title: 'Nivel 5: Subjuntivo Presente',
  description: 'Modo subjuntivo - deseos y dudas',
  language: 'Español',
  level: 'B1',
  passingScore: 80,
  estimatedTime: 5,
  category: 'grammar',
  questions: [
    {
      id: 'l5q1',
      question: 'Espero que tú _____ feliz',
      explanation: 'Después de "espero que" usamos subjuntivo. "Ser" → "seas".',
      difficulty: 'B1',
      topic: 'Subjuntivo',
      answers: [
        { id: 'l5q1a1', text: 'seas', isCorrect: true },
        { id: 'l5q1a2', text: 'eres', isCorrect: false },
        { id: 'l5q1a3', text: 'serás', isCorrect: false },
        { id: 'l5q1a4', text: 'eras', isCorrect: false },
      ],
    },
    {
      id: 'l5q2',
      question: 'Es importante que nosotros _____ temprano',
      explanation: '"Llegar" en subjuntivo, primera persona plural: "lleguemos".',
      difficulty: 'B1',
      topic: 'Subjuntivo',
      answers: [
        { id: 'l5q2a1', text: 'lleguemos', isCorrect: true },
        { id: 'l5q2a2', text: 'llegamos', isCorrect: false },
        { id: 'l5q2a3', text: 'llegaremos', isCorrect: false },
        { id: 'l5q2a4', text: 'llegábamos', isCorrect: false },
      ],
    },
    {
      id: 'l5q3',
      question: 'Dudo que ellos _____ la verdad',
      explanation: 'Con "dudo que" usamos subjuntivo. "Saber" → "sepan".',
      difficulty: 'B1',
      topic: 'Subjuntivo',
      answers: [
        { id: 'l5q3a1', text: 'sepan', isCorrect: true },
        { id: 'l5q3a2', text: 'saben', isCorrect: false },
        { id: 'l5q3a3', text: 'sabían', isCorrect: false },
        { id: 'l5q3a4', text: 'sabrán', isCorrect: false },
      ],
    },
    {
      id: 'l5q4',
      question: 'Quiero que tú _____ conmigo',
      explanation: '"Venir" en subjuntivo, segunda persona singular: "vengas".',
      difficulty: 'B1',
      topic: 'Subjuntivo',
      answers: [
        { id: 'l5q4a1', text: 'vengas', isCorrect: true },
        { id: 'l5q4a2', text: 'vienes', isCorrect: false },
        { id: 'l5q4a3', text: 'vendrás', isCorrect: false },
        { id: 'l5q4a4', text: 'viniste', isCorrect: false },
      ],
    },
  ],
};

/**
 * NIVEL 6: Condicional (B1-B2)
 */
const level6Quiz: Quiz = {
  id: 'spanish-level-6',
  title: 'Nivel 6: Condicional',
  description: 'Situaciones hipotéticas',
  language: 'Español',
  level: 'B2',
  passingScore: 80,
  estimatedTime: 5,
  category: 'grammar',
  questions: [
    {
      id: 'l6q1',
      question: 'Si tuviera dinero, _____ un coche',
      explanation: 'Condicional con "si" en imperfecto subjuntivo: "compraría".',
      difficulty: 'B2',
      topic: 'Condicional',
      answers: [
        { id: 'l6q1a1', text: 'compraría', isCorrect: true },
        { id: 'l6q1a2', text: 'compro', isCorrect: false },
        { id: 'l6q1a3', text: 'compré', isCorrect: false },
        { id: 'l6q1a4', text: 'compraré', isCorrect: false },
      ],
    },
    {
      id: 'l6q2',
      question: '¿Qué _____ tú en mi lugar?',
      explanation: '"Hacer" en condicional, segunda persona: "harías".',
      difficulty: 'B2',
      topic: 'Condicional',
      answers: [
        { id: 'l6q2a1', text: 'harías', isCorrect: true },
        { id: 'l6q2a2', text: 'haces', isCorrect: false },
        { id: 'l6q2a3', text: 'hiciste', isCorrect: false },
        { id: 'l6q2a4', text: 'harás', isCorrect: false },
      ],
    },
    {
      id: 'l6q3',
      question: 'Nosotros _____ más felices si viviéramos cerca',
      explanation: '"Ser" en condicional, primera persona plural: "seríamos".',
      difficulty: 'B2',
      topic: 'Condicional',
      answers: [
        { id: 'l6q3a1', text: 'seríamos', isCorrect: true },
        { id: 'l6q3a2', text: 'somos', isCorrect: false },
        { id: 'l6q3a3', text: 'fuimos', isCorrect: false },
        { id: 'l6q3a4', text: 'seremos', isCorrect: false },
      ],
    },
  ],
};

/**
 * NIVEL 7: Expresiones Idiomáticas (B2)
 */
const level7Quiz: Quiz = {
  id: 'spanish-level-7',
  title: 'Nivel 7: Expresiones',
  description: 'Modismos y frases hechas',
  language: 'Español',
  level: 'B2',
  passingScore: 80,
  estimatedTime: 5,
  category: 'vocabulary',
  questions: [
    {
      id: 'l7q1',
      question: '¿Qué significa "costar un ojo de la cara"?',
      explanation: 'Esta expresión significa que algo es muy caro.',
      difficulty: 'B2',
      topic: 'Modismos',
      answers: [
        { id: 'l7q1a1', text: 'Ser muy caro', isCorrect: true },
        { id: 'l7q1a2', text: 'Ser gratis', isCorrect: false },
        { id: 'l7q1a3', text: 'Ser feo', isCorrect: false },
        { id: 'l7q1a4', text: 'Ser bonito', isCorrect: false },
      ],
    },
    {
      id: 'l7q2',
      question: 'Si alguien "mete la pata", significa que...',
      explanation: '"Meter la pata" significa cometer un error o equivocarse.',
      difficulty: 'B2',
      topic: 'Modismos',
      answers: [
        { id: 'l7q2a1', text: 'Comete un error', isCorrect: true },
        { id: 'l7q2a2', text: 'Tiene éxito', isCorrect: false },
        { id: 'l7q2a3', text: 'Está cansado', isCorrect: false },
        { id: 'l7q2a4', text: 'Está feliz', isCorrect: false },
      ],
    },
    {
      id: 'l7q3',
      question: '"Tomar el pelo" significa...',
      explanation: '"Tomar el pelo" significa burlarse o engañar de forma bromista.',
      difficulty: 'B2',
      topic: 'Modismos',
      answers: [
        { id: 'l7q3a1', text: 'Burlarse de alguien', isCorrect: true },
        { id: 'l7q3a2', text: 'Cortarse el cabello', isCorrect: false },
        { id: 'l7q3a3', text: 'Estar enfadado', isCorrect: false },
        { id: 'l7q3a4', text: 'Estar triste', isCorrect: false },
      ],
    },
  ],
};

/**
 * NIVEL 8: Subjuntivo Imperfecto (B2-C1)
 */
const level8Quiz: Quiz = {
  id: 'spanish-level-8',
  title: 'Nivel 8: Subjuntivo Imperfecto',
  description: 'Subjuntivo en pasado',
  language: 'Español',
  level: 'B2',
  passingScore: 80,
  estimatedTime: 6,
  category: 'grammar',
  questions: [
    {
      id: 'l8q1',
      question: 'Le pedí que _____ más temprano',
      explanation: 'Imperfecto de subjuntivo de "venir": "viniera" o "viniese".',
      difficulty: 'B2',
      topic: 'Subjuntivo Imperfecto',
      answers: [
        { id: 'l8q1a1', text: 'viniera', isCorrect: true },
        { id: 'l8q1a2', text: 'viene', isCorrect: false },
        { id: 'l8q1a3', text: 'vino', isCorrect: false },
        { id: 'l8q1a4', text: 'vendrá', isCorrect: false },
      ],
    },
    {
      id: 'l8q2',
      question: 'Ojalá _____ buen tiempo ayer',
      explanation: 'Con "ojalá" + pasado usamos imperfecto de subjuntivo: "hiciera".',
      difficulty: 'B2',
      topic: 'Subjuntivo Imperfecto',
      answers: [
        { id: 'l8q2a1', text: 'hiciera', isCorrect: true },
        { id: 'l8q2a2', text: 'hace', isCorrect: false },
        { id: 'l8q2a3', text: 'hizo', isCorrect: false },
        { id: 'l8q2a4', text: 'hará', isCorrect: false },
      ],
    },
    {
      id: 'l8q3',
      question: 'No creía que ellos _____ tan rápido',
      explanation: '"Llegar" en imperfecto de subjuntivo: "llegaran".',
      difficulty: 'B2',
      topic: 'Subjuntivo Imperfecto',
      answers: [
        { id: 'l8q3a1', text: 'llegaran', isCorrect: true },
        { id: 'l8q3a2', text: 'llegan', isCorrect: false },
        { id: 'l8q3a3', text: 'llegaron', isCorrect: false },
        { id: 'l8q3a4', text: 'llegarán', isCorrect: false },
      ],
    },
  ],
};

/**
 * NIVEL 9: Uso Avanzado de Preposiciones (C1)
 */
const level9Quiz: Quiz = {
  id: 'spanish-level-9',
  title: 'Nivel 9: Preposiciones Avanzadas',
  description: 'Dominio de preposiciones complejas',
  language: 'Español',
  level: 'C1',
  passingScore: 80,
  estimatedTime: 6,
  category: 'grammar',
  questions: [
    {
      id: 'l9q1',
      question: 'El libro trata _____ la historia de España',
      explanation: '"Tratar de" cuando el tema es un sustantivo.',
      difficulty: 'C1',
      topic: 'Preposiciones',
      answers: [
        { id: 'l9q1a1', text: 'de', isCorrect: true },
        { id: 'l9q1a2', text: 'en', isCorrect: false },
        { id: 'l9q1a3', text: 'por', isCorrect: false },
        { id: 'l9q1a4', text: 'con', isCorrect: false },
      ],
    },
    {
      id: 'l9q2',
      question: 'Insistió _____ pagar la cuenta',
      explanation: '"Insistir en" + infinitivo es la construcción correcta.',
      difficulty: 'C1',
      topic: 'Preposiciones',
      answers: [
        { id: 'l9q2a1', text: 'en', isCorrect: true },
        { id: 'l9q2a2', text: 'de', isCorrect: false },
        { id: 'l9q2a3', text: 'a', isCorrect: false },
        { id: 'l9q2a4', text: 'por', isCorrect: false },
      ],
    },
    {
      id: 'l9q3',
      question: 'Se acordó _____ cerrar la puerta',
      explanation: '"Acordarse de" es la preposición correcta con este verbo.',
      difficulty: 'C1',
      topic: 'Preposiciones',
      answers: [
        { id: 'l9q3a1', text: 'de', isCorrect: true },
        { id: 'l9q3a2', text: 'en', isCorrect: false },
        { id: 'l9q3a3', text: 'a', isCorrect: false },
        { id: 'l9q3a4', text: 'con', isCorrect: false },
      ],
    },
  ],
};

/**
 * NIVEL 10: Maestría - Mix Avanzado (C1)
 */
const level10Quiz: Quiz = {
  id: 'spanish-level-10',
  title: 'Nivel 10: Maestría',
  description: 'Desafío final - todos los temas',
  language: 'Español',
  level: 'C1',
  passingScore: 80,
  estimatedTime: 7,
  category: 'mixed',
  questions: [
    {
      id: 'l10q1',
      question: 'Si hubiera sabido la verdad, no _____ venido',
      explanation: 'Condicional compuesto con pluscuamperfecto de subjuntivo: "habría".',
      difficulty: 'C1',
      topic: 'Condicional Compuesto',
      answers: [
        { id: 'l10q1a1', text: 'habría', isCorrect: true },
        { id: 'l10q1a2', text: 'había', isCorrect: false },
        { id: 'l10q1a3', text: 'he', isCorrect: false },
        { id: 'l10q1a4', text: 'habré', isCorrect: false },
      ],
    },
    {
      id: 'l10q2',
      question: '¿Cuál es el sinónimo más preciso de "perspicaz"?',
      explanation: '"Perspicaz" significa que tiene agudeza mental para comprender.',
      difficulty: 'C1',
      topic: 'Vocabulario Avanzado',
      answers: [
        { id: 'l10q2a1', text: 'Agudo', isCorrect: true },
        { id: 'l10q2a2', text: 'Lento', isCorrect: false },
        { id: 'l10q2a3', text: 'Confuso', isCorrect: false },
        { id: 'l10q2a4', text: 'Simple', isCorrect: false },
      ],
    },
    {
      id: 'l10q3',
      question: 'Completa: "_____ que estudies más, no aprobarás"',
      explanation: '"A menos que" + subjuntivo expresa condición negativa.',
      difficulty: 'C1',
      topic: 'Conectores',
      answers: [
        { id: 'l10q3a1', text: 'A menos que', isCorrect: true },
        { id: 'l10q3a2', text: 'Porque', isCorrect: false },
        { id: 'l10q3a3', text: 'Cuando', isCorrect: false },
        { id: 'l10q3a4', text: 'Si', isCorrect: false },
      ],
    },
    {
      id: 'l10q4',
      question: '¿Qué significa "estar hecho polvo"?',
      explanation: '"Estar hecho polvo" es una expresión que significa estar muy cansado.',
      difficulty: 'C1',
      topic: 'Modismos',
      answers: [
        { id: 'l10q4a1', text: 'Estar muy cansado', isCorrect: true },
        { id: 'l10q4a2', text: 'Estar sucio', isCorrect: false },
        { id: 'l10q4a3', text: 'Estar feliz', isCorrect: false },
        { id: 'l10q4a4', text: 'Estar enfermo', isCorrect: false },
      ],
    },
  ],
};

/**
 * Exportar todos los niveles configurados
 */
export const spanishLevels: Level[] = [
  {
    id: 1,
    title: 'Nivel 1: Fundamentos',
    description: 'Presente simple y vocabulario básico',
    difficulty: 'Fácil',
    requiredScore: 80,
    questionsCount: 3,
    estimatedTime: 3,
    icon: '🌱',
    color: '#4caf50',
    quiz: level1Quiz,
  },
  {
    id: 2,
    title: 'Nivel 2: Rutinas',
    description: 'Verbos reflexivos y rutinas diarias',
    difficulty: 'Fácil',
    requiredScore: 80,
    questionsCount: 4,
    estimatedTime: 4,
    icon: '🌿',
    color: '#66bb6a',
    quiz: level2Quiz,
  },
  {
    id: 3,
    title: 'Nivel 3: Pasado',
    description: 'Pretérito perfecto simple',
    difficulty: 'Medio',
    requiredScore: 80,
    questionsCount: 3,
    estimatedTime: 4,
    icon: '🍀',
    color: '#81c784',
    quiz: level3Quiz,
  },
  {
    id: 4,
    title: 'Nivel 4: Futuro',
    description: 'Futuro simple y planes',
    difficulty: 'Medio',
    requiredScore: 80,
    questionsCount: 3,
    estimatedTime: 4,
    icon: '🌳',
    color: '#26a69a',
    quiz: level4Quiz,
  },
  {
    id: 5,
    title: 'Nivel 5: Subjuntivo',
    description: 'Modo subjuntivo presente',
    difficulty: 'Medio',
    requiredScore: 80,
    questionsCount: 4,
    estimatedTime: 5,
    icon: '🏔️',
    color: '#42a5f5',
    quiz: level5Quiz,
  },
  {
    id: 6,
    title: 'Nivel 6: Condicional',
    description: 'Situaciones hipotéticas',
    difficulty: 'Difícil',
    requiredScore: 80,
    questionsCount: 3,
    estimatedTime: 5,
    icon: '⚡',
    color: '#5c6bc0',
    quiz: level6Quiz,
  },
  {
    id: 7,
    title: 'Nivel 7: Expresiones',
    description: 'Modismos y frases hechas',
    difficulty: 'Difícil',
    requiredScore: 80,
    questionsCount: 3,
    estimatedTime: 5,
    icon: '🎭',
    color: '#7e57c2',
    quiz: level7Quiz,
  },
  {
    id: 8,
    title: 'Nivel 8: Subjuntivo II',
    description: 'Subjuntivo imperfecto',
    difficulty: 'Difícil',
    requiredScore: 80,
    questionsCount: 3,
    estimatedTime: 6,
    icon: '🔥',
    color: '#ab47bc',
    quiz: level8Quiz,
  },
  {
    id: 9,
    title: 'Nivel 9: Preposiciones',
    description: 'Dominio de preposiciones',
    difficulty: 'Experto',
    requiredScore: 80,
    questionsCount: 3,
    estimatedTime: 6,
    icon: '💎',
    color: '#ec407a',
    quiz: level9Quiz,
  },
  {
    id: 10,
    title: 'Nivel 10: Maestría',
    description: 'Desafío final completo',
    difficulty: 'Experto',
    requiredScore: 80,
    questionsCount: 4,
    estimatedTime: 7,
    icon: '👑',
    color: '#ff5722',
    quiz: level10Quiz,
  },
];

export default spanishLevels;
