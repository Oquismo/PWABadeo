# 📚 Sistema de Cuestionarios Interactivos - Material 3 Expressive

Sistema completo de cuestionarios con diseño **Material 3 Expressive**, creado para proporcionar una experiencia de aprendizaje interactiva y visualmente impactante.

---

## 🎨 Características de Diseño

### Material 3 Expressive
- **Formas audaces**: Tarjetas con clip-path asimétrico
- **Colores vibrantes**: Gradientes expresivos y paleta energética
- **Microinteracciones**: Animaciones fluidas en hover y selección
- **Feedback instantáneo**: Respuestas visual inmediato (verde/rojo)
- **Tipografía con carácter**: Jerarquía visual clara

### Animaciones
- **Framer Motion**: Transiciones suaves con Material 3 timing
- **Entrada de tarjeta**: Fade + slide con bounce
- **Cambio de pregunta**: Slide horizontal expresivo
- **Opciones**: Aparición escalonada (staggered)
- **Resultados**: Celebración con escala y color

---

## 📁 Estructura del Sistema

```
src/
├── types/
│   └── quiz.types.ts              # Tipos TypeScript completos
├── hooks/
│   └── useQuiz.ts                 # Hook de gestión de estado
├── components/
│   └── quiz/
│       └── QuizCard.tsx           # Componente principal
├── data/
│   └── quizzes/
│       └── spanish-b1b2.ts        # Datos del cuestionario
├── styles/
│   └── quiz-expressive.css        # Estilos Material 3
└── app/
    └── cursos/
        └── espanol/
            └── page.tsx           # Página del cuestionario
```

---

## 🚀 Uso Rápido

### 1. Importar el componente

```tsx
import QuizCard from '@/components/quiz/QuizCard';
import { spanishQuizB1B2 } from '@/data/quizzes/spanish-b1b2';
```

### 2. Usar en tu página

```tsx
<QuizCard
  quiz={spanishQuizB1B2}
  onComplete={(result) => {
    console.log('Resultado:', result);
    // Guardar en DB o localStorage
  }}
  onExit={() => router.push('/perfil')}
/>
```

### 3. Acceder desde perfil

El botón **"Cursos 🇪🇸"** está integrado en la página de perfil:
- **Ubicación**: `/perfil`
- **Destino**: `/cursos/espanol`
- **Estilo**: Gradiente morado expresivo

---

## 🎯 API del Hook `useQuiz`

### Parámetros

```typescript
useQuiz(quiz: Quiz, options?: UseQuizOptions)
```

### Opciones disponibles

```typescript
interface UseQuizOptions {
  autoNext?: boolean;        // Auto-avanzar tras responder (default: false)
  autoNextDelay?: number;    // Delay antes de avanzar (default: 1500ms)
  shuffleQuestions?: boolean; // Mezclar preguntas (default: false)
  shuffleAnswers?: boolean;   // Mezclar respuestas (default: false)
  allowReview?: boolean;      // Permitir revisar anteriores (default: true)
}
```

### Retorno

```typescript
interface UseQuizReturn {
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
  timeElapsed: number; // en segundos
}
```

---

## 📝 Crear un Nuevo Cuestionario

### 1. Definir los datos

```typescript
// src/data/quizzes/mi-quiz.ts
import { Quiz } from '@/types/quiz.types';

export const miQuiz: Quiz = {
  id: 'mi-quiz-001',
  title: 'Mi Cuestionario',
  description: 'Descripción del quiz',
  language: 'Español',
  level: 'B1',
  passingScore: 70,
  estimatedTime: 10,
  category: 'grammar',
  
  questions: [
    {
      id: 'q1',
      question: '¿Cuál es la respuesta correcta?',
      explanation: 'Explicación de la respuesta correcta',
      difficulty: 'B1',
      topic: 'Gramática',
      answers: [
        { id: 'q1a1', text: 'Opción 1', isCorrect: false },
        { id: 'q1a2', text: 'Opción 2', isCorrect: true },
        { id: 'q1a3', text: 'Opción 3', isCorrect: false },
        { id: 'q1a4', text: 'Opción 4', isCorrect: false },
      ],
    },
    // ... más preguntas
  ],
};
```

### 2. Crear la página

```typescript
// src/app/cursos/mi-quiz/page.tsx
'use client';

import QuizCard from '@/components/quiz/QuizCard';
import { miQuiz } from '@/data/quizzes/mi-quiz';

export default function MiQuizPage() {
  return (
    <Container>
      <QuizCard
        quiz={miQuiz}
        onComplete={(result) => {
          // Manejar resultado
        }}
      />
    </Container>
  );
}
```

### 3. Añadir navegación

```tsx
<Link href="/cursos/mi-quiz">
  <M3Button>Mi Quiz</M3Button>
</Link>
```

---

## 🎨 Personalización de Estilos

### Variables CSS disponibles

Todas las variables están en `src/styles/quiz-expressive.css`:

```css
:root {
  /* Colores de estado */
  --quiz-correct: #00e676;
  --quiz-incorrect: #ff5252;
  --quiz-neutral: #7c4dff;
  
  /* Gradientes */
  --quiz-gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --quiz-gradient-success: linear-gradient(135deg, #00e676 0%, #00c853 100%);
  
  /* Animaciones */
  --quiz-duration-fast: 200ms;
  --quiz-duration-medium: 300ms;
  --quiz-easing-emphasized: cubic-bezier(0.2, 0, 0, 1.0);
}
```

### Clases CSS principales

```css
.quiz-container       /* Contenedor principal */
.quiz-card           /* Tarjeta del quiz */
.quiz-question       /* Sección de pregunta */
.quiz-answer-option  /* Opción de respuesta */
.quiz-results        /* Pantalla de resultados */
```

---

## 🔧 Características Técnicas

### Gestión de Estado
- **Hook personalizado**: `useQuiz` maneja toda la lógica
- **Sin useState innecesarios**: Todo encapsulado en el hook
- **Inmutable**: Gestión segura del estado

### Performance
- **Memoización**: useMemo para cálculos costosos
- **Callbacks optimizados**: useCallback para prevenir re-renders
- **Hardware acceleration**: CSS transforms con translateZ(0)
- **Lazy loading**: Componentes y rutas optimizadas

### Accesibilidad
- **Reduced motion**: Respeta preferencias del usuario
- **Keyboard navigation**: Navegación completa con teclado
- **Screen readers**: Labels y ARIA apropiados
- **Contraste**: Colores con ratio WCAG AA

### TypeScript
- **Strict typing**: Sin `any` types
- **Interfaces completas**: Todos los datos tipados
- **Type safety**: Validación en tiempo de compilación

---

## 📊 Estructura de Resultados

### QuizResult

```typescript
interface QuizResult {
  totalQuestions: number;      // 5
  correctAnswers: number;      // 4
  incorrectAnswers: number;    // 1
  skippedQuestions: number;    // 0
  percentage: number;          // 80
  timeSpent: number;           // 120 segundos
  answersHistory: QuizAnswerState[];
  completedAt: Date;
}
```

### Guardar Resultados

```typescript
// En localStorage
const handleQuizComplete = (result: QuizResult) => {
  const saved = localStorage.getItem('quiz-results') || '[]';
  const results = JSON.parse(saved);
  results.push({
    quizId: quiz.id,
    result,
    completedAt: new Date().toISOString(),
  });
  localStorage.setItem('quiz-results', JSON.stringify(results));
};

// En base de datos (ejemplo)
const handleQuizComplete = async (result: QuizResult) => {
  await fetch('/api/quiz/results', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: user.id,
      quizId: quiz.id,
      result,
    }),
  });
};
```

---

## 🎯 Ejemplos de Uso

### Quiz con auto-avance

```tsx
<QuizCard
  quiz={spanishQuizB1B2}
  onComplete={handleComplete}
/>
```

El hook usa estas opciones por defecto:
```typescript
{
  autoNext: false,
  allowReview: false,
  shuffleAnswers: false,
}
```

### Quiz con opciones personalizadas

Para personalizar, necesitarías usar el hook directamente:

```tsx
function CustomQuiz() {
  const quiz = useQuiz(spanishQuizB1B2, {
    autoNext: true,
    autoNextDelay: 2000,
    shuffleQuestions: true,
    allowReview: true,
  });
  
  // Renderizar tu UI personalizada
}
```

---

## 🌍 Internacionalización

Para añadir soporte multi-idioma:

```typescript
// src/data/quizzes/spanish-b1b2.en.ts
export const spanishQuizB1B2_EN: Quiz = {
  id: 'spanish-b1b2-001-en',
  title: 'Spanish B1/B2 - Grammar and Vocabulary',
  // ... traducción completa
};

// Uso
import { useLanguage } from '@/hooks/useLanguage';

const { language } = useLanguage();
const quiz = language === 'en' ? spanishQuizB1B2_EN : spanishQuizB1B2;
```

---

## 🔮 Futuras Mejoras

### Características planeadas
- [ ] Modo práctica (sin puntuación)
- [ ] Explicaciones expandibles
- [ ] Compartir resultados en redes sociales
- [ ] Estadísticas históricas
- [ ] Rankings y leaderboards
- [ ] Badges y logros
- [ ] Quiz personalizados por usuario
- [ ] Modo multijugador
- [ ] Integración con IA para feedback personalizado

### Nuevos cuestionarios
- [ ] Español A2 (Básico)
- [ ] Español C1 (Avanzado)
- [ ] Inglés B1-B2
- [ ] Francés B1-B2
- [ ] Matemáticas
- [ ] Ciencias

---

## 🐛 Solución de Problemas

### El quiz no carga
- Verificar que los datos del quiz están correctamente importados
- Revisar la consola para errores de TypeScript
- Asegurarse de que el CSS está importado en `layout.tsx`

### Animaciones lentas
- Verificar que el navegador soporta CSS transforms
- Desactivar animaciones complejas en dispositivos antiguos
- Revisar la preferencia `prefers-reduced-motion`

### Errores de TypeScript
- Usar `as const` en arrays de easing
- Verificar que todas las interfaces están importadas
- Actualizar `@types/react` y `framer-motion`

---

## 📄 Licencia

Este sistema de cuestionarios es parte del proyecto PWABadeo.

---

## 🤝 Contribuir

Para añadir nuevos cuestionarios o mejorar el sistema:

1. Crear datos en `src/data/quizzes/`
2. Seguir la estructura de tipos existente
3. Mantener el estilo Material 3 Expressive
4. Documentar los cambios
5. Probar en diferentes navegadores

---

## 📞 Contacto

Para preguntas o sugerencias sobre el sistema de cuestionarios, contactar al equipo de desarrollo.

---

**¡Disfruta creando cuestionarios interactivos y educativos! 🎓✨**
