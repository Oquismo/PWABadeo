# Sistema de Persistencia de Progreso - Cuestionario de Español

## 📋 Resumen

Se ha implementado un sistema completo de persistencia del progreso del cuestionario de español que guarda automáticamente el progreso del usuario en la base de datos. El usuario puede salir de la aplicación y al volver encontrará su progreso intacto.

## 🏗️ Arquitectura de la Solución

### 1. Base de Datos (Prisma Schema)

**Nueva tabla: `CourseProgress`**

```prisma
model CourseProgress {
  id               Int      @id @default(autoincrement())
  userId           Int      @unique
  courseId         String   @default("spanish")
  currentLevel     Int      @default(1)
  levelScores      Json     @default("{}")
  achievements     Json     @default("[]")
  stats            Json     @default("{}")
  lastQuestionSeen Int?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}
```

**Campos:**
- `userId`: Referencia al usuario (único por usuario)
- `courseId`: Identificador del curso ("spanish" por defecto)
- `currentLevel`: Último nivel desbloqueado
- `levelScores`: JSON con puntuaciones por nivel
- `achievements`: Array JSON de logros desbloqueados
- `stats`: Estadísticas generales del usuario
- `lastQuestionSeen`: Índice de la última pregunta vista
- `updatedAt`: Timestamp de última actualización

### 2. API Endpoints

**Archivo:** `src/app/api/cursos/progreso/route.ts`

#### GET /api/cursos/progreso
Carga el progreso guardado del usuario autenticado.

**Respuesta exitosa (200):**
```json
{
  "exists": true,
  "progress": {
    "currentLevel": 3,
    "levelScores": {
      "1": { "score": 90, "grade": "A", "completedAt": "..." },
      "2": { "score": 85, "grade": "B", "completedAt": "..." }
    },
    "achievements": [...],
    "stats": {...},
    "lastQuestionSeen": null,
    "updatedAt": "2025-01-10T..."
  }
}
```

**Si no hay progreso (200):**
```json
{
  "exists": false,
  "progress": {
    "currentLevel": 1,
    "levelScores": {},
    "achievements": [],
    "stats": {...}
  }
}
```

#### POST /api/cursos/progreso
Guarda o actualiza el progreso del usuario.

**Body:**
```json
{
  "currentLevel": 3,
  "levelScores": {...},
  "achievements": [...],
  "stats": {...},
  "lastQuestionSeen": 5
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Progreso guardado correctamente",
  "progress": {...}
}
```

### 3. Hook Modificado: `useProgression`

**Archivo:** `src/hooks/useProgression.ts`

**Nuevas funcionalidades:**

#### Estados de persistencia:
```typescript
{
  isLoading: boolean;     // Cargando progreso inicial
  isSaving: boolean;      // Guardando cambios
  lastSaved: Date | null; // Timestamp del último guardado
}
```

#### Carga inicial automática:
- Al montar el componente, hace GET a `/api/cursos/progreso`
- Reconstruye el estado local desde los datos de la API
- Muestra indicador de carga durante la operación
- Fallback a localStorage si falla la API

#### Guardado automático con debounce:
- Detecta cambios en el progreso
- Espera 2 segundos sin cambios
- Convierte el estado al formato de la API
- Hace POST a `/api/cursos/progreso`
- Actualiza indicador de "último guardado"
- Guarda también en localStorage como backup

### 4. Interfaz de Usuario

**Archivo:** `src/app/cursos/espanol/page.tsx`

#### Indicadores visuales añadidos:

**Durante carga inicial:**
```tsx
<CircularProgress />
<Typography>Cargando tu progreso...</Typography>
```

**Durante guardado:**
```tsx
<CloudQueueIcon />
<Typography>Guardando...</Typography>
```

**Después de guardar:**
```tsx
<CloudDoneIcon />
<Typography>Guardado Xs atrás</Typography>
```

## 🔒 Seguridad Implementada

### Autenticación por cookies
- Lee cookies `auth-token` y `user` del request
- Valida que el usuario esté autenticado
- Solo permite acceso al progreso del usuario autenticado

### Operaciones permitidas:
- ✅ GET: Leer progreso propio
- ✅ POST/PUT: Guardar/actualizar progreso propio
- ❌ DELETE: NO implementado (seguridad crítica)
- ❌ RESET: NO implementado (seguridad crítica)

### Validaciones:
- `currentLevel` debe estar entre 1 y 10
- `levelScores` debe ser un objeto válido
- Solo el usuario propietario puede modificar su progreso

## 📊 Flujo de Datos

### 1. Usuario inicia sesión → Carga progreso

```
Usuario → GET /api/cursos/progreso
       ↓
API verifica cookies de autenticación
       ↓
Consulta BD: SELECT * FROM CourseProgress WHERE userId = ?
       ↓
Si existe: Retorna progreso
Si no: Retorna estado inicial
       ↓
Hook reconstruye estado local
       ↓
UI muestra niveles desbloqueados
```

### 2. Usuario completa un nivel → Guarda progreso

```
Usuario completa nivel
       ↓
Hook actualiza estado local
       ↓
Debounce de 2 segundos
       ↓
POST /api/cursos/progreso con nuevo progreso
       ↓
API verifica autenticación
       ↓
BD: UPSERT en CourseProgress
       ↓
Respuesta exitosa
       ↓
UI muestra icono "Guardado"
```

## 🚀 Testing y Verificación

### Casos de prueba recomendados:

1. **Carga inicial:**
   - [ ] Usuario nuevo ve solo Nivel 1 desbloqueado
   - [ ] Usuario con progreso ve niveles correspondientes
   - [ ] Muestra spinner durante carga

2. **Guardado automático:**
   - [ ] Al completar nivel, progreso se guarda automáticamente
   - [ ] Indicador "Guardando..." aparece brevemente
   - [ ] Indicador "Guardado" confirma operación exitosa

3. **Persistencia:**
   - [ ] Usuario cierra navegador y vuelve: progreso intacto
   - [ ] Usuario cambia de dispositivo: progreso se mantiene
   - [ ] Cerrar sesión y volver a iniciar: progreso correcto

4. **Fallback:**
   - [ ] Si API falla, usa localStorage temporal
   - [ ] Cuando API vuelve, sincroniza progreso

5. **Seguridad:**
   - [ ] Usuario no autenticado recibe 401
   - [ ] Usuario no puede ver progreso de otros
   - [ ] No se pueden ejecutar operaciones de eliminación

## 📁 Archivos Modificados/Creados

### Nuevos:
- ✅ `src/app/api/cursos/progreso/route.ts` (242 líneas)
- ✅ `MIGRATION_COURSE_PROGRESS.md` (instrucciones de migración)
- ✅ `COURSE_PROGRESS_DOCUMENTATION.md` (este archivo)

### Modificados:
- ✅ `prisma/schema.prisma` (añadido modelo CourseProgress)
- ✅ `src/hooks/useProgression.ts` (integración con API)
- ✅ `src/types/progression.types.ts` (nuevos estados en UseProgressionReturn)
- ✅ `src/app/cursos/espanol/page.tsx` (indicadores visuales)

## 🔧 Instrucciones de Implementación

### 1. Aplicar migración de base de datos

```bash
npx prisma migrate dev --name add_course_progress
npx prisma generate
```

### 2. Verificar que compile sin errores

```bash
npm run build
```

### 3. Iniciar servidor de desarrollo

```bash
npm run dev
```

### 4. Probar funcionalidad

1. Iniciar sesión con un usuario
2. Ir a `/cursos/espanol`
3. Completar un nivel
4. Cerrar navegador
5. Volver a abrir y verificar que el progreso se mantiene

## 🎯 Ventajas del Sistema

1. **Persistencia confiable:** Progreso guardado en BD PostgreSQL
2. **Experiencia fluida:** Guardado automático sin intervención del usuario
3. **Feedback visual:** Usuario ve claramente cuando se guarda
4. **Recuperación rápida:** Carga inicial optimizada
5. **Fallback inteligente:** localStorage como respaldo
6. **Multi-dispositivo:** Progreso accesible desde cualquier lugar
7. **Seguro:** Solo el usuario puede ver/modificar su progreso
8. **Escalable:** Preparado para añadir más cursos (courseId)

## 🐛 Troubleshooting

### Problema: "Usuario no autenticado" (401)

**Causa:** Cookies de sesión no están presentes
**Solución:** Verificar que el usuario haya iniciado sesión correctamente

### Problema: Progreso no se guarda

**Causa:** Error en la API o base de datos
**Solución:** 
1. Verificar logs del servidor
2. Comprobar que la migración se aplicó correctamente
3. Verificar permisos de BD

### Problema: Spinner de carga infinito

**Causa:** Error en el GET inicial
**Solución:**
1. Abrir DevTools → Network
2. Ver respuesta del endpoint `/api/cursos/progreso`
3. Verificar error específico

## 📝 Notas Adicionales

- El sistema usa `upsert` de Prisma para crear o actualizar automáticamente
- El debounce de 2 segundos evita múltiples guardados innecesarios
- Los logros se recalculan en el cliente y se guardan en la BD
- El formato JSON permite flexibilidad para futuros cambios
- No se almacenan contraseñas ni datos sensibles en CourseProgress

## 🎓 Próximos Pasos Sugeridos

1. **Analytics:** Añadir métricas de uso del cuestionario
2. **Sincronización offline:** Service Worker para guardar cuando no hay conexión
3. **Compartir progreso:** Opción para compartir logros en redes sociales
4. **Exportar datos:** Permitir al usuario descargar su historial
5. **Ranking:** Tabla de clasificación entre usuarios (opcional)
