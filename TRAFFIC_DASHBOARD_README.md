# 📊 Dashboard de Tráfico - PWABadeo

Un dashboard completo para monitorear el tráfico y actividad de tu aplicación PWABadeo en tiempo real.

## 🌐 **Acceso Directo**

**Dashboard en Producción**: [https://pwa-badeo.vercel.app/traffic-dashboard](https://pwa-badeo.vercel.app/traffic-dashboard)

**Dashboard Local**: [http://localhost:3000/traffic-dashboard](http://localhost:3000/traffic-dashboard) (cuando ejecutes `npm run dev`)

## 🚀 Características

- **Métricas en tiempo real**: Visualiza el total de eventos y actividad reciente
- **Gráficos interactivos**: Gráficos de dona para tipos de eventos y timeline de actividad
- **Lista de eventos recientes**: Ve los últimos eventos registrados
- **Actualización automática**: Se refresca cada 30 segundos
- **Diseño responsive**: Funciona en desktop y móvil
- **Modo offline**: Maneja desconexiones gracefully

## 📁 Archivos Creados

- `traffic-dashboard.html` - Dashboard principal
- `src/app/api/telemetry/summary/route.ts` - API para resumen de eventos
- `src/app/api/telemetry/events/route.ts` - API para lista de eventos

## 🛠️ Cómo Usar

### Opción 1: Producción (Recomendado)
1. Ve directamente al dashboard: `https://pwa-badeo.vercel.app/traffic-dashboard`
2. ¡Listo! Sin configuración necesaria, funciona inmediatamente

### Opción 2: Archivo HTML directo
1. Abre el archivo `traffic-dashboard.html` en tu navegador
2. La URL ya está configurada para producción: `https://pwa-badeo.vercel.app`
3. Haz clic en "Probar Conexión" para verificar

### Opción 3: Desarrollo Local
1. Ejecuta tu aplicación: `npm run dev`
2. Ve al dashboard: `http://localhost:3000/traffic-dashboard`
3. O configura manualmente la URL a `http://localhost:3000`
4. Haz clic en "Probar Conexión" para verificar

### Opción 3: Servidor local (Fácil)
Si tienes problemas con CORS al abrir el HTML localmente:
```bash
# Ejecuta el script incluido
start-dashboard-server.bat

# O manualmente:
# Instalar un servidor simple
npm install -g http-server

# Ejecutar en el directorio del proyecto
http-server -p 8080

# Abrir en navegador
# http://localhost:8080/traffic-dashboard.html
```

### Opción 4: Desde cualquier servidor web
1. Sube el archivo `traffic-dashboard.html` a cualquier servidor web
2. Modifica la variable `API_BASE` en el JavaScript para que apunte a tu API:
   ```javascript
   const API_BASE = 'https://tu-dominio.com'; // Cambia esto
   ```

## 📊 Métricas Disponibles

### Total de Eventos
- Muestra el número total de eventos registrados
- Se actualiza en tiempo real

### Última Actividad
- Muestra la hora del último evento registrado
- Indica si hay actividad reciente

### Eventos por Tipo
- Gráfico de dona que muestra la distribución de tipos de eventos
- Colores diferenciados para cada tipo

### Actividad Reciente
- Lista de los 10 eventos más recientes
- Muestra tipo de evento, usuario (si aplica) y hora

### Timeline de Actividad
- Gráfico de línea mostrando eventos por hora en las últimas 24 horas
- Ayuda a identificar patrones de uso

## 🔧 Configuración

### Variables Personalizables

```javascript
const API_BASE = window.location.origin; // URL de tu API
const REFRESH_INTERVAL = 30000; // Intervalo de actualización en ms (30 segundos)
```

### Personalización Visual

El dashboard usa CSS moderno con:
- Gradientes atractivos
- Animaciones suaves
- Diseño Material Design-inspired
- Tema responsive

## 📡 APIs Utilizadas

### GET /api/telemetry/summary
Retorna un resumen de todos los eventos:
```json
{
  "total": 150,
  "byType": {
    "page_view": 45,
    "user_action": 32,
    "error": 5
  }
}
```

### GET /api/telemetry/events
Retorna la lista completa de eventos:
```json
[
  {
    "id": "abc123",
    "type": "page_view",
    "userEmail": "usuario@email.com",
    "payload": { "page": "/home" },
    "timestamp": "2025-09-19T10:30:00.000Z"
  }
]
```

## 🔍 Debugging

### Script de Prueba
Ejecuta el script `test-dashboard-apis.js` en la consola del navegador para verificar que las APIs funcionen:

```javascript
// Copia y pega el contenido de test-dashboard-apis.js en la consola
// O ejecuta el archivo directamente
```

### Funciones de Debug del Dashboard
El dashboard incluye funciones de debug disponibles en la consola del navegador:

```javascript
// Forzar actualización
window.dashboardDebug.refresh();

// Detener auto-refresh
window.dashboardDebug.stop();

// Iniciar auto-refresh
window.dashboardDebug.start();

// Obtener referencias a los gráficos
window.dashboardDebug.getCharts();
```

## 🚨 Solución de Problemas

### Error "Failed to fetch"
**Causa**: El navegador bloquea las peticiones desde archivos locales a localhost por seguridad.

**Soluciones**:
1. **Usa la página integrada**: Ve a `http://localhost:3000/traffic-dashboard`
2. **Servidor local**: Usa `http-server` o similar
3. **Deshabilita CORS temporalmente** (solo desarrollo):
   - Chrome: Ejecuta con `--disable-web-security --user-data-dir=/tmp/chrome_dev`
   - Firefox: Configura `security.fileuri.strict_origin_policy` a `false`

### Error "CORS policy"
**Causa**: La API no permite peticiones desde otros orígenes.

**Solución**: Agrega headers CORS a tu API:
```javascript
// En tu API route
export async function GET() {
  return new Response(data, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
```

### No se muestran datos
**Causa**: La aplicación no está registrando eventos de telemetría.

**Verificación**:
1. Revisa la consola del navegador para ver si se envían eventos
2. Verifica que las funciones `pushEvent()` se llamen correctamente
3. Asegúrate de que la API esté respondiendo

### Gráficos no se cargan
**Causa**: Chart.js no se pudo cargar desde CDN.

**Solución**: Descarga Chart.js localmente o usa una CDN alternativa:
```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
```

## 📱 Compatibilidad

- ✅ Chrome/Edge (recomendado)
- ✅ Firefox
- ✅ Safari
- ✅ Navegadores móviles
- ✅ Requiere JavaScript habilitado

## 🎨 Personalización

### Cambiar Colores
Modifica las variables CSS en el `<style>`:
```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --background-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### Agregar Nuevas Métricas
1. Agrega un nuevo elemento HTML en el dashboard
2. Crea una función para actualizarlo en JavaScript
3. Llama a la función en `updateDashboard()`

## 📈 Próximas Mejoras

- [ ] Filtros por tipo de evento
- [ ] Exportar datos a CSV
- [ ] Alertas configurables
- [ ] Métricas históricas
- [ ] Dashboard multi-página

---

¡Disfruta monitoreando el tráfico de tu aplicación! 🎉