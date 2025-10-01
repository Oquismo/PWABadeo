# 🎓 Sistema de Niveles - Documentación Completa

## 📖 Descripción General

Sistema de aprendizaje gamificado con **10 niveles progresivos** de español, desde fundamentos básicos (A1) hasta maestría (C1). Incluye:

- ✅ **10 niveles** con 34 preguntas totales (3-4 por nivel)
- ✅ **Sistema de desbloqueo**: Requiere 80% para avanzar
- ✅ **Calificaciones gaming**: S, A, B, C, D, F
- ✅ **7 achievements** predefinidos con tracking automático
- ✅ **Persistencia**: localStorage automático
- ✅ **Material 3 Expressive**: Animaciones y diseño moderno
- ✅ **Estadísticas**: Accuracy, streaks, promedio, perfectos
- ✅ **Responsive**: Diseño adaptativo mobile-first

---

## 📁 Estructura de Archivos

### **Archivos Creados/Modificados**

```
PWABadeo/
├── src/
│   ├── types/
│   │   └── progression.types.ts          ✨ NUEVO - Interfaces del sistema
│   ├── data/
│   │   └── quizzes/
│   │       └── spanish-levels.ts          ✨ NUEVO - 10 niveles con preguntas
│   ├── hooks/
│   │   └── useProgression.ts             ✨ NUEVO - Hook de progresión
│   ├── components/
│   │   └── levels/
│   │       └── LevelSelector.tsx         ✨ NUEVO - Selector de niveles
│   ├── styles/
│   │   └── levels-expressive.css         ✨ NUEVO - Estilos Material 3
│   └── app/
│       └── cursos/
│           └── espanol/
│               └── page.tsx              🔄 MODIFICADO - Integración completa
```

---

## 🎯 Funcionalidades Implementadas

### 1. **Sistema de Niveles (10 totales)**

#### **Niveles y Dificultad**

| Nivel | Título | Dificultad | Preguntas | Tema |
|-------|--------|-----------|-----------|------|
| 1 | Fundamentos | Fácil | 3 | Presente simple, artículos |
| 2 | Rutinas | Fácil | 4 | Verbos reflexivos, rutinas |
| 3 | Pasado | Medio | 3 | Pretérito perfecto simple |
| 4 | Futuro | Medio | 3 | Futuro simple |
| 5 | Subjuntivo | Medio | 4 | Subjuntivo presente |
| 6 | Condicional | Difícil | 3 | Situaciones hipotéticas |
| 7 | Expresiones | Difícil | 3 | Modismos, frases hechas |
| 8 | Subjuntivo II | Difícil | 3 | Subjuntivo imperfecto |
| 9 | Preposiciones | Experto | 3 | Preposiciones avanzadas |
| 10 | Maestría | Experto | 4 | Mix de todos los temas |

**Total: 34 preguntas**

#### **Características de cada nivel:**
- 🎨 **Color único**: Identificación visual
- 🎭 **Icono emoji**: 🌱🌿🍀🌳🏔️⚡🎭🔥💎👑
- ⏱️ **Tiempo estimado**: 3-7 minutos por nivel
- 📊 **Requiere 80%**: Para desbloquear siguiente

---

### 2. **Sistema de Calificaciones**

```typescript
S = 100%     // Perfecto (dorado)
A = 90-99%   // Excelente (verde)
B = 80-89%   // Bien (cyan)
C = 70-79%   // Regular (naranja)
D = 60-69%   // Insuficiente (rojo-naranja)
F = 0-59%    // Reprobado (rojo)
```

**Visualización:**
- Badge circular con color correspondiente
- Animación de entrada con spring
- Glow effect alrededor del badge

---

### 3. **Sistema de Achievements**

#### **7 Logros Predefinidos:**

| ID | Título | Descripción | Icono | Categoría |
|----|--------|-------------|-------|-----------|
| `first_steps` | Primeros Pasos | Completa tu primer nivel | 🎯 | completion |
| `perfect_score` | Perfección | Obtén 100% en cualquier nivel | 💯 | score |
| `halfway_there` | A Medio Camino | Completa 5 niveles | 🏆 | completion |
| `master` | Maestro del Español | Completa todos los niveles | 👑 | completion |
| `streak_3` | Racha de Fuego | 3 niveles seguidos con A+ | 🔥 | streak |
| `speed_demon` | Velocista | Completa en menos de 3 min | ⚡ | speed |
| `perfectionist` | Perfeccionista | 100% en 3 niveles | 🌟 | score |

**Tracking Automático:**
- Se verifican en cada completación de nivel
- Barra de progreso (0-100%)
- Fecha de desbloqueo registrada
- Notificación en modal de completación

---

### 4. **Progresión y Estadísticas**

#### **UserProgress (localStorage)**

```typescript
{
  currentLevel: number,              // Nivel más alto disponible
  levelsProgress: {
    [levelId]: {
      status: 'locked' | 'available' | 'completed',
      bestScore: number | null,      // Mejor puntuación (%)
      attempts: number,              // Intentos realizados
      perfectScore: boolean,         // Si logró 100%
      completedAt: string | null,    // Fecha ISO
      lastAttemptAt: string | null,  // Última fecha de intento
      timeSpent: number,             // Segundos totales
    }
  },
  achievements: Achievement[],
  totalScore: number,                // Suma de puntuaciones
  completedLevels: number,           // Conteo de completados
  perfectLevels: number,             // Conteo de perfectos
  currentStreak: number,             // Racha actual (A+)
  bestStreak: number,                // Mejor racha histórica
  lastActivityAt: string | null,    // Última actividad
}
```

#### **Estadísticas Calculadas**

```typescript
{
  totalAttempts: number,      // Total de intentos
  accuracy: number,           // Precisión global (%)
  averageScore: number,       // Promedio de puntuaciones
  perfectLevels: number,      // Niveles con 100%
  currentStreak: number,      // Racha actual
  bestStreak: number,         // Mejor racha
}
```

**Visualización en Header:**
- Barra de progreso global (0-100%)
- Cards de estadísticas: Perfectos 🏆, Racha 🔥, Promedio 🎯
- Animaciones de contador con gradientes

---

### 5. **Estados Visuales de Niveles**

#### **🔒 Locked (Bloqueado)**
- Opacidad: 50%
- Filtro: grayscale(0.8)
- Icono: 🔒 Lock gris
- No interactivo (cursor: not-allowed)

#### **✨ Available (Disponible)**
- Brillo: Glow animation con color del nivel
- Pulso suave infinito (2s)
- Prompt: "¡Comienza ahora! →" con fade
- Hover: Scale 1.05 + translateY(-8px)

#### **✅ Completed (Completado)**
- Badge de calificación visible (S/A/B/C/D/F)
- Icono: ✅ Check verde o ⭐ Star dorada (si perfecto)
- Número de intentos mostrado
- Hover: Efecto de elevación suave

---

### 6. **Animaciones Material 3 Expressive**

#### **Entrada Escalonada**
```typescript
delay: index * 0.08  // 80ms entre cards
type: 'spring'
stiffness: 100
damping: 15
```

#### **Hover Effects**
```typescript
scale: 1.05
y: -8
transition: { type: 'spring', stiffness: 400, damping: 10 }
```

#### **Unlock Animation**
```typescript
// Badge de grado
initial: { scale: 0, rotate: -180 }
animate: { scale: 1, rotate: 0 }

// Perfect badge
initial: { scale: 0, rotate: -45 }
animate: { scale: 1, rotate: 0 }
```

#### **Progress Bar**
```typescript
// Fill animation
initial: { width: 0 }
animate: { width: `${percentage}%` }
duration: 1s

// Shimmer effect
animation: progress-shimmer 2s infinite
gradient: translateX(-100%) → translateX(100%)
```

---

## 🎨 Diseño y Estilos

### **Variables CSS**

```css
:root {
  /* Colores */
  --level-locked-bg: rgba(189, 189, 189, 0.1);
  --level-available-bg: rgba(255, 255, 255, 0.05);
  --level-completed-bg: rgba(0, 230, 118, 0.08);
  
  /* Sombras */
  --level-shadow-small: 0 2px 8px rgba(0, 0, 0, 0.15);
  --level-shadow-medium: 0 8px 24px rgba(0, 0, 0, 0.2);
  --level-shadow-large: 0 16px 48px rgba(0, 0, 0, 0.25);
  
  /* Transiciones */
  --level-transition-fast: 150ms cubic-bezier(0.2, 0, 0, 1.0);
  --level-transition-medium: 250ms cubic-bezier(0.2, 0, 0, 1.0);
}
```

### **Grid Responsivo**

```css
/* Desktop */
.levels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

/* Mobile */
@media (max-width: 768px) {
  .levels-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}
```

---

## 🔧 API del Hook useProgression

### **Importación**

```typescript
import { useProgression } from '@/hooks/useProgression';
```

### **Uso**

```typescript
const {
  progress,                    // Estado completo del usuario
  stats,                       // Estadísticas calculadas
  currentAvailableLevel,       // Siguiente nivel disponible
  newAchievements,            // Achievements recién desbloqueados
  completeLevel,              // (levelId, result) => LevelCompletionResult
  resetProgress,              // () => void - Resetear todo
  getLevelStatus,             // (levelId) => 'locked'|'available'|'completed'
  getLevelProgress,           // (levelId) => LevelProgress | null
  clearNewAchievements,       // () => void - Limpiar notificaciones
} = useProgression();
```

### **Completar un Nivel**

```typescript
const handleQuizComplete = (result: QuizResult) => {
  const levelResult = completeLevel(selectedLevelId, result);
  
  console.log({
    passed: levelResult.passed,           // true/false
    grade: levelResult.grade,             // 'S'|'A'|'B'|'C'|'D'|'F'
    percentage: levelResult.percentage,   // 0-100
    unlockedLevels: levelResult.unlockedLevels, // [nextLevelId]
    earnedAchievements: levelResult.earnedAchievements, // Achievement[]
    isNewBest: levelResult.isNewBest,     // true si mejoró récord
    isPerfect: levelResult.isPerfect,     // true si 100%
  });
};
```

---

## 🚀 Flujo de Usuario

### **1. Entrada a /cursos/espanol**

1. Se carga `useProgression()` desde localStorage
2. Si no hay datos previos → Inicializa con Nivel 1 disponible
3. Renderiza `<LevelSelector>` con grid de 10 cards

### **2. Selección de Nivel**

1. Usuario hace clic en card `available` o `completed`
2. Se valida que no esté `locked`
3. Se renderiza `<QuizCard>` con el quiz del nivel
4. Header muestra: icono + título + descripción del nivel

### **3. Completación del Quiz**

1. `onComplete` → llama a `completeLevel(levelId, result)`
2. Se calcula:
   - Calificación (S/A/B/C/D/F)
   - Si pasó (>=80%)
   - Si es nuevo récord
   - Si es perfecto (100%)
3. Se actualiza `levelsProgress[levelId]`
4. Si pasó → desbloquea siguiente nivel
5. Se verifican achievements
6. Se muestra modal de completación

### **4. Modal de Completación**

Muestra:
- 🏆 Badge de calificación con color
- Porcentaje obtenido
- Mensajes especiales:
  - 💯 Perfecto (100%)
  - ⭐ Nuevo récord personal
  - 🔓 Nivel X desbloqueado
  - 🏆 Logros obtenidos

Opciones:
- **Reintentar**: Vuelve al mismo quiz
- **Siguiente Nivel**: Si desbloqueó nuevo nivel
- **Volver**: Regresa al selector

### **5. Persistencia**

Todo se guarda automáticamente en:
```
localStorage['badeo_spanish_progression']
```

---

## 📊 Ejemplo de Progreso Completo

```json
{
  "currentLevel": 5,
  "levelsProgress": {
    "1": {
      "status": "completed",
      "bestScore": 100,
      "attempts": 2,
      "perfectScore": true,
      "completedAt": "2025-01-15T10:30:00Z",
      "lastAttemptAt": "2025-01-15T11:00:00Z",
      "timeSpent": 240
    },
    "2": {
      "status": "completed",
      "bestScore": 90,
      "attempts": 1,
      "perfectScore": false,
      "completedAt": "2025-01-15T11:15:00Z",
      "lastAttemptAt": "2025-01-15T11:15:00Z",
      "timeSpent": 180
    },
    "3": {
      "status": "completed",
      "bestScore": 95,
      "attempts": 1,
      "perfectScore": false,
      "completedAt": "2025-01-15T11:30:00Z",
      "lastAttemptAt": "2025-01-15T11:30:00Z",
      "timeSpent": 200
    },
    "4": {
      "status": "completed",
      "bestScore": 85,
      "attempts": 2,
      "perfectScore": false,
      "completedAt": "2025-01-15T12:00:00Z",
      "lastAttemptAt": "2025-01-15T12:30:00Z",
      "timeSpent": 350
    },
    "5": {
      "status": "available",
      "bestScore": null,
      "attempts": 0,
      "perfectScore": false,
      "completedAt": null,
      "lastAttemptAt": null,
      "timeSpent": 0
    },
    "6": { "status": "locked", ... },
    ...
  },
  "achievements": [
    {
      "id": "first_steps",
      "title": "Primeros Pasos",
      "unlockedAt": "2025-01-15T10:30:00Z",
      "progress": 100
    },
    {
      "id": "perfect_score",
      "title": "Perfección",
      "unlockedAt": "2025-01-15T10:30:00Z",
      "progress": 100
    },
    {
      "id": "streak_3",
      "title": "Racha de Fuego",
      "unlockedAt": "2025-01-15T11:30:00Z",
      "progress": 100
    }
  ],
  "totalScore": 370,
  "completedLevels": 4,
  "perfectLevels": 1,
  "currentStreak": 3,
  "bestStreak": 3,
  "lastActivityAt": "2025-01-15T12:30:00Z"
}
```

---

## 🎯 Próximas Mejoras (Futuro)

### **Sistema de Achievements Expandido**
- Modal visual con animación de desbloqueo
- Lista completa de achievements en /perfil
- Achievements especiales por velocidad
- Achievements por días consecutivos

### **Leaderboard**
- Tabla de mejores puntuaciones
- Comparar con otros usuarios
- Rankings por nivel

### **Integración Backend**
- Guardar progreso en base de datos
- Sincronización multi-dispositivo
- Analítica de aprendizaje

### **Más Niveles**
- Niveles adicionales (11-20)
- Categorías: Vocabulario, Gramática, Conversación
- Niveles de práctica libre

---

## ✅ Testing

### **Verificación Manual**

1. **Nivel 1 Desbloqueado**: ✅
   - Abrir /cursos/espanol
   - Ver Nivel 1 con estado "available"
   - Niveles 2-10 bloqueados

2. **Completar Nivel 1**: ✅
   - Jugar Nivel 1
   - Obtener >=80%
   - Ver modal con calificación
   - Nivel 2 desbloqueado

3. **Achievement "Primeros Pasos"**: ✅
   - Se desbloquea al completar Nivel 1
   - Se muestra en modal

4. **Persistencia**: ✅
   - Recargar página
   - Progreso se mantiene
   - localStorage actualizado

5. **Estadísticas**: ✅
   - Header muestra progreso correcto
   - Barra de progreso actualizada
   - Stats calculadas correctamente

---

## 📝 Notas Técnicas

### **Performance**
- `useMemo` para cálculos de stats
- `useCallback` para handlers
- Animaciones optimizadas con Framer Motion
- CSS con `will-change` donde necesario

### **Accesibilidad**
- `prefers-reduced-motion` support
- Focus states visibles
- ARIA labels en botones
- Contraste de colores adecuado

### **Responsive**
- Mobile-first approach
- Breakpoint: 768px
- Grid adaptativo
- Touch-friendly (48px min)

---

## 🎉 Resumen de Implementación

### **✅ Completado (100%)**

- [x] 10 niveles con 34 preguntas
- [x] Sistema de desbloqueo (80%)
- [x] Calificaciones S/A/B/C/D/F
- [x] 7 achievements con tracking
- [x] Hook useProgression completo
- [x] Componente LevelSelector
- [x] Estilos Material 3 Expressive
- [x] Integración en /cursos/espanol
- [x] Modal de completación
- [x] Persistencia localStorage
- [x] Estadísticas calculadas
- [x] 0 errores TypeScript

### **Archivos Totales: 6**
1. `progression.types.ts` (151 líneas)
2. `spanish-levels.ts` (600+ líneas)
3. `useProgression.ts` (440 líneas)
4. `LevelSelector.tsx` (380 líneas)
5. `levels-expressive.css` (600+ líneas)
6. `page.tsx` modificado (370 líneas)

**Total: ~2,500 líneas de código**

---

## 🚀 Cómo Usar

### **Para el Usuario**

1. Ir a `/perfil`
2. Click en botón "Cursos 🇪🇸"
3. Seleccionar nivel disponible
4. Completar quiz
5. Ver calificación y desbloqueos
6. Continuar al siguiente nivel

### **Para el Desarrollador**

```typescript
// Importar hook
import { useProgression } from '@/hooks/useProgression';

// Usar en componente
const { progress, completeLevel } = useProgression();

// Completar nivel
completeLevel(levelId, quizResult);

// Obtener estado
const status = getLevelStatus(levelId);

// Resetear (para testing)
resetProgress();
```

---

**¡Sistema de Niveles Completo y Funcional! 🎊**
