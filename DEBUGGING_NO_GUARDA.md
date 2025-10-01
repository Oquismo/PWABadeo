# 🐛 DEBUGGING: Progreso No Se Guarda

## 🔍 Diagnóstico Actual

### ✅ **Lo que SÍ funciona:**
- ✅ Conexión a PostgreSQL
- ✅ Tabla `CourseProgress` existe
- ✅ Guardado inicial (cuando cargas `/cursos/espanol`)
- ✅ Usuario 50 tiene 1 registro en BD

### ❌ **El Problema:**
```
Registro en BD:
  • Niveles Completados: 0
  • Puntaje promedio: 0.0%
  • Solo tiene progreso INICIAL
```

**Conclusión:** El guardado automático después de completar un nivel **NO se está ejecutando**.

---

## 🧪 **Pasos para Verificar**

### 1️⃣ **Preparación:**
```cmd
# Asegúrate de que el servidor esté corriendo
npm run dev
```

### 2️⃣ **Test en el Navegador:**

1. **Abre el navegador en modo desarrollador:**
   - Chrome/Edge: Presiona `F12` o `Ctrl+Shift+I`
   - Firefox: Presiona `F12`

2. **Ve a la pestaña Console**

3. **Navega a:**
   ```
   http://localhost:3000/cursos/espanol
   ```

4. **Observa los logs iniciales:**
   Deberías ver:
   ```javascript
   📥 Cargando progreso desde API...
   ✅ Progreso cargado desde BD
   ```

5. **Completa un nivel del quiz:**
   - Responde todas las preguntas
   - Al finalizar, deberías ver:
   ```javascript
   🎯 Quiz completado: { percentage: 90, ... }
   📊 Resultado del nivel: { passed: true, ... }
   💾 Estado del progreso después de completar: { currentLevel: 2, completedLevels: 1, ... }
   ⏱️ Esperando guardado automático (2 segundos)...
   ⏳ Guardado automático programado en 2 segundos...
   ```

6. **Espera 3 segundos:**
   Deberías ver:
   ```javascript
   🚀 Ejecutando guardado automático ahora...
   💾 Guardando progreso en API...
   ✅ Progreso guardado en BD
   ```

7. **Revisa la pestaña Network:**
   - Ve a la pestaña `Network` en DevTools
   - Filtra por: `progreso`
   - Deberías ver una petición **POST** a `/api/cursos/progreso`
   - Status: **200 OK**
   - Response: `{ success: true, message: "..." }`

---

## 📝 **Logs Esperados vs Actuales**

### ✅ **Logs Esperados (Sistema Funcionando):**
```
1. Usuario carga página
   → 📥 Cargando progreso desde API...
   → ✅ Progreso cargado desde BD

2. Usuario completa nivel
   → 🎯 Quiz completado
   → 📊 Resultado del nivel
   → 💾 Estado del progreso actualizado
   → ⏳ Guardado automático programado

3. Después de 2 segundos
   → 🚀 Ejecutando guardado automático
   → 💾 Guardando progreso en API...
   → [Network] POST /api/cursos/progreso → 200 OK
   → ✅ Progreso guardado en BD
   → 🕒 lastSaved actualizado
```

### ❌ **Logs Problemáticos (Si algo falla):**

#### Caso A: No se programa el guardado
```
❌ NO aparece: "⏳ Guardado automático programado"
Causa: useEffect no se está ejecutando
Solución: Verificar dependencias de useEffect
```

#### Caso B: Se programa pero no se ejecuta
```
✅ Aparece: "⏳ Guardado automático programado"
❌ NO aparece: "🚀 Ejecutando guardado automático"
Causa: Timeout cancelado prematuramente
Solución: Usuario cierra modal antes de 2 segundos
```

#### Caso C: Se ejecuta pero falla el request
```
✅ Aparece: "🚀 Ejecutando guardado automático"
✅ Aparece: "💾 Guardando progreso en API..."
❌ Aparece: "❌ Error guardando progreso"
Causa: Error en el API endpoint
Solución: Revisar logs del servidor
```

#### Caso D: Request exitoso pero no actualiza BD
```
✅ Aparece: "✅ Progreso guardado en BD"
✅ Network: POST 200 OK
❌ BD no actualiza
Causa: Prisma no ejecuta UPDATE
Solución: Revisar query SQL en logs del servidor
```

---

## 🛠️ **Soluciones por Síntoma**

### Síntoma 1: "No veo ningún log después de completar el nivel"
**Problema:** El `completeLevel` no se está ejecutando

**Solución:**
```javascript
// En la consola del navegador:
console.log('Progress hook:', typeof completeLevel);
// Debería ser: "function"
```

### Síntoma 2: "Veo los logs pero no el POST request"
**Problema:** El debounce se cancela antes de ejecutarse

**Causa posible:** 
- Usuario cierra el modal inmediatamente
- Usuario navega a otra página
- Componente se desmonta

**Solución:** Esperar 3 segundos antes de cerrar

### Síntoma 3: "POST request da error 401"
**Problema:** Usuario no está autenticado

**Solución:**
```javascript
// En la consola:
document.cookie.split(';').forEach(c => console.log(c.trim()));
// Busca: "auth-token=..." y "user=..."
```

### Síntoma 4: "POST 200 pero BD no actualiza"
**Problema:** Query SQL no se ejecuta

**Solución:** Revisar logs del servidor con Prisma query logs activados

---

## 🧪 **Test Manual Rápido**

### Test 1: Guardar Manualmente desde Consola
```javascript
// En la consola del navegador:
fetch('/api/cursos/progreso', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    currentLevel: 2,
    levelScores: {
      "1": {
        score: 95,
        grade: "A+",
        completedAt: new Date().toISOString()
      }
    },
    achievements: [],
    stats: {
      completedLevels: 1,
      averageScore: 95
    }
  })
})
.then(r => r.json())
.then(data => console.log('✅ Respuesta:', data))
.catch(err => console.error('❌ Error:', err));
```

Luego verifica con:
```cmd
node debug-progress.cjs
```

### Test 2: Verificar Estado del Hook
```javascript
// En la consola del navegador (mientras estás en /cursos/espanol):

// Ver si el hook está cargado
console.log('isLoading:', window.progressHook?.isLoading);
console.log('isSaving:', window.progressHook?.isSaving);
console.log('lastSaved:', window.progressHook?.lastSaved);
```

---

## 📊 **Verificar Estado de la BD**

### Antes del Test:
```cmd
node debug-progress.cjs
```

Anota:
- Niveles completados: ___
- Último update: ___

### Después del Test:
```cmd
node debug-progress.cjs
```

Compara:
- ¿Cambió "updatedAt"? → ✅ Sí / ❌ No
- ¿Aumentó "completedLevels"? → ✅ Sí / ❌ No
- ¿Hay datos en "levelScores"? → ✅ Sí / ❌ No

---

## 🎯 **Checklist de Debugging**

Completa este checklist y reporta los resultados:

- [ ] Servidor `npm run dev` corriendo
- [ ] Usuario autenticado (tienes cookies)
- [ ] Navegador en `/cursos/espanol`
- [ ] DevTools abierto en pestaña Console
- [ ] Completaste un nivel del quiz
- [ ] Viste log: "🎯 Quiz completado"
- [ ] Viste log: "📊 Resultado del nivel"
- [ ] Viste log: "⏳ Guardado automático programado"
- [ ] Esperaste 3+ segundos
- [ ] Viste log: "🚀 Ejecutando guardado automático"
- [ ] Viste log: "💾 Guardando progreso en API"
- [ ] Viste log: "✅ Progreso guardado en BD"
- [ ] Network tab muestra POST /api/cursos/progreso
- [ ] POST status es 200 OK
- [ ] Ejecutaste `node debug-progress.cjs`
- [ ] BD muestra completedLevels > 0

---

## 🚨 **Siguiente Paso**

Por favor ejecuta este test completo y reporta:

1. **¿Qué logs ves en la consola?**
2. **¿Aparece el POST request en Network?**
3. **¿Cuál es el status del request?**
4. **¿Qué dice `node debug-progress.cjs` después del test?**

Con esta información podré identificar exactamente dónde está fallando el guardado.

---

**Fecha:** 1 de octubre de 2025  
**Estado:** 🔍 Debugging en progreso  
**Próximo paso:** Ejecutar checklist completo
