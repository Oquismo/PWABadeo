/**
 * Ejemplo de Integración del Sistema de Cuestionarios
 * 
 * Este archivo muestra diferentes formas de integrar y personalizar
 * el sistema de cuestionarios en tu aplicación.
 */

import React from 'react';
import QuizCard from '@/components/quiz/QuizCard';
import { useQuiz } from '@/hooks/useQuiz';
import { spanishQuizB1B2 } from '@/data/quizzes/spanish-b1b2';
import type { Quiz, QuizResult } from '@/types/quiz.types';

// ============================================
// EJEMPLO 1: Integración Básica
// ============================================

export function BasicQuizExample() {
  const handleComplete = (result: QuizResult) => {
    console.log(`¡Quiz completado! Puntuación: ${result.percentage}%`);
  };

  return (
    <QuizCard
      quiz={spanishQuizB1B2}
      onComplete={handleComplete}
      onExit={() => console.log('Usuario salió del quiz')}
    />
  );
}

// ============================================
// EJEMPLO 2: Quiz con Persistencia en localStorage
// ============================================

export function PersistentQuizExample() {
  const handleComplete = (result: QuizResult) => {
    // Guardar resultado en localStorage
    const savedResults = JSON.parse(
      localStorage.getItem('quiz-results') || '[]'
    );
    
    savedResults.push({
      quizId: spanishQuizB1B2.id,
      result,
      timestamp: Date.now(),
    });
    
    localStorage.setItem('quiz-results', JSON.stringify(savedResults));
    
    // Mostrar notificación
    alert(`¡Felicitaciones! Tu puntuación: ${result.percentage}%`);
  };

  return (
    <QuizCard
      quiz={spanishQuizB1B2}
      onComplete={handleComplete}
    />
  );
}

// ============================================
// EJEMPLO 3: Quiz con Integración a API
// ============================================

export function ApiIntegratedQuizExample() {
  const handleComplete = async (result: QuizResult) => {
    try {
      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizId: spanishQuizB1B2.id,
          result,
          userId: 'user-123', // Obtener del contexto de auth
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Resultado guardado en DB:', data);
        
        // Actualizar ranking, badges, etc.
        updateUserProgress(data);
      }
    } catch (error) {
      console.error('Error al guardar resultado:', error);
    }
  };

  const updateUserProgress = (data: any) => {
    // Actualizar progreso del usuario
    console.log('Progreso actualizado:', data);
  };

  return (
    <QuizCard
      quiz={spanishQuizB1B2}
      onComplete={handleComplete}
    />
  );
}

// ============================================
// EJEMPLO 4: UI Personalizada con useQuiz Hook
// ============================================

export function CustomUIQuizExample() {
  const {
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    selectAnswer,
    nextQuestion,
    progress,
    result,
    isCompleted,
  } = useQuiz(spanishQuizB1B2, {
    autoNext: false,
    allowReview: false,
    shuffleAnswers: true,
  });

  if (isCompleted && result) {
    return (
      <div>
        <h1>¡Quiz Completado!</h1>
        <p>Puntuación: {result.percentage}%</p>
        <p>Correctas: {result.correctAnswers}/{result.totalQuestions}</p>
        <p>Tiempo: {result.timeSpent}s</p>
      </div>
    );
  }

  return (
    <div>
      {/* Progress bar personalizado */}
      <div style={{ width: '100%', height: 8, background: '#ddd' }}>
        <div 
          style={{ 
            width: `${progress}%`, 
            height: '100%', 
            background: '#667eea',
            transition: 'width 0.3s'
          }} 
        />
      </div>

      {/* Pregunta personalizada */}
      <div style={{ padding: 20 }}>
        <p>Pregunta {currentQuestionIndex + 1} de {totalQuestions}</p>
        <h2>{currentQuestion?.question}</h2>
        
        {/* Respuestas personalizadas */}
        <div>
          {currentQuestion?.answers.map((answer) => (
            <button
              key={answer.id}
              onClick={() => selectAnswer(answer.id)}
              style={{
                display: 'block',
                width: '100%',
                padding: 16,
                margin: '8px 0',
                border: '2px solid #667eea',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              {answer.text}
            </button>
          ))}
        </div>

        {/* Botón siguiente personalizado */}
        <button 
          onClick={nextQuestion}
          style={{
            marginTop: 20,
            padding: '12px 24px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: 8,
          }}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}

// ============================================
// EJEMPLO 5: Selector de Quiz
// ============================================

import { availableQuizzes } from '@/data/quizzes/spanish-b1b2';

export function QuizSelectorExample() {
  const [selectedQuiz, setSelectedQuiz] = React.useState<Quiz | null>(null);

  if (selectedQuiz) {
    return (
      <QuizCard
        quiz={selectedQuiz}
        onComplete={(result) => {
          console.log('Resultado:', result);
          setSelectedQuiz(null); // Volver al selector
        }}
        onExit={() => setSelectedQuiz(null)}
      />
    );
  }

  return (
    <div>
      <h1>Selecciona un Cuestionario</h1>
      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
        {availableQuizzes.map((quizInfo) => (
          <div
            key={quizInfo.id}
            style={{
              padding: 24,
              border: '2px solid #667eea',
              borderRadius: 16,
              cursor: quizInfo.comingSoon ? 'not-allowed' : 'pointer',
              opacity: quizInfo.comingSoon ? 0.5 : 1,
            }}
            onClick={() => {
              if (!quizInfo.comingSoon) {
                // Cargar el quiz correspondiente
                setSelectedQuiz(spanishQuizB1B2); // Aquí deberías cargar dinámicamente
              }
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: 8 }}>
              {quizInfo.thumbnail}
            </div>
            <h3>{quizInfo.title}</h3>
            <p>{quizInfo.description}</p>
            <div style={{ marginTop: 8, fontSize: '0.875rem', color: '#666' }}>
              <div>📝 {quizInfo.questionsCount} preguntas</div>
              <div>⏱️ {quizInfo.estimatedTime} minutos</div>
              <div>🎯 Nivel: {quizInfo.level}</div>
            </div>
            {quizInfo.comingSoon && (
              <div style={{ 
                marginTop: 12, 
                padding: '4px 12px', 
                background: '#ffd740', 
                borderRadius: 8,
                display: 'inline-block',
                fontWeight: 600,
              }}>
                Próximamente
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// EJEMPLO 6: Quiz con Estadísticas Históricas
// ============================================

export function QuizWithStatsExample() {
  const [stats, setStats] = React.useState<any>(null);

  React.useEffect(() => {
    // Cargar estadísticas del usuario
    const savedResults = JSON.parse(
      localStorage.getItem('quiz-results') || '[]'
    );
    
    const quizStats = savedResults.filter(
      (r: any) => r.quizId === spanishQuizB1B2.id
    );

    if (quizStats.length > 0) {
      const avgScore = quizStats.reduce(
        (acc: number, r: any) => acc + r.result.percentage, 
        0
      ) / quizStats.length;

      const bestScore = Math.max(
        ...quizStats.map((r: any) => r.result.percentage)
      );

      setStats({
        attempts: quizStats.length,
        avgScore: Math.round(avgScore),
        bestScore,
        lastAttempt: new Date(quizStats[quizStats.length - 1].timestamp),
      });
    }
  }, []);

  return (
    <div>
      {/* Mostrar estadísticas */}
      {stats && (
        <div style={{ 
          padding: 24, 
          marginBottom: 24, 
          background: '#f5f5f5', 
          borderRadius: 16 
        }}>
          <h3>📊 Tus Estadísticas</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>
                {stats.attempts}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#666' }}>
                Intentos
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>
                {stats.avgScore}%
              </div>
              <div style={{ fontSize: '0.875rem', color: '#666' }}>
                Promedio
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>
                {stats.bestScore}%
              </div>
              <div style={{ fontSize: '0.875rem', color: '#666' }}>
                Mejor Puntuación
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quiz */}
      <QuizCard
        quiz={spanishQuizB1B2}
        onComplete={(result) => {
          // Actualizar estadísticas
          const savedResults = JSON.parse(
            localStorage.getItem('quiz-results') || '[]'
          );
          savedResults.push({
            quizId: spanishQuizB1B2.id,
            result,
            timestamp: Date.now(),
          });
          localStorage.setItem('quiz-results', JSON.stringify(savedResults));
          
          // Recargar estadísticas
          window.location.reload();
        }}
      />
    </div>
  );
}

// ============================================
// EJEMPLO 7: Quiz con Temporizador Límite
// ============================================

export function TimedQuizExample() {
  const [timeLimit] = React.useState(300); // 5 minutos en segundos
  const [timeUp, setTimeUp] = React.useState(false);

  const quiz = useQuiz(spanishQuizB1B2, {
    shuffleAnswers: true,
  });

  React.useEffect(() => {
    if (quiz.timeElapsed >= timeLimit && !quiz.isCompleted) {
      setTimeUp(true);
      // Forzar finalización del quiz
      console.log('¡Tiempo agotado!');
    }
  }, [quiz.timeElapsed, timeLimit, quiz.isCompleted]);

  if (timeUp) {
    return (
      <div>
        <h1>⏰ ¡Tiempo Agotado!</h1>
        <p>El tiempo límite ha sido alcanzado.</p>
        <p>Preguntas respondidas: {quiz.progress}%</p>
      </div>
    );
  }

  const timeRemaining = timeLimit - quiz.timeElapsed;
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <div>
      {/* Temporizador prominente */}
      <div style={{
        position: 'fixed',
        top: 20,
        right: 20,
        padding: 16,
        background: timeRemaining < 60 ? '#ff5252' : '#667eea',
        color: 'white',
        borderRadius: 12,
        fontWeight: 700,
        fontSize: '1.25rem',
        zIndex: 1000,
      }}>
        ⏱️ {minutes}:{seconds.toString().padStart(2, '0')}
      </div>

      {/* Quiz normal */}
      <QuizCard quiz={spanishQuizB1B2} />
    </div>
  );
}

// ============================================
// Exportar todos los ejemplos
// ============================================

export default {
  BasicQuizExample,
  PersistentQuizExample,
  ApiIntegratedQuizExample,
  CustomUIQuizExample,
  QuizSelectorExample,
  QuizWithStatsExample,
  TimedQuizExample,
};
