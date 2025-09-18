# PWABadeo - Guía de Diagnóstico de Notificaciones

## 🎯 Problema Resuelto

Las notificaciones push no funcionaban correctamente en móviles debido a:
- Falta de contexto seguro (HTTP en lugar de HTTPS/localhost)
- Service Worker no registrado correctamente
- Detección inadecuada de redes locales

## 🛠️ Scripts de Diagnóstico Disponibles

### Comandos Rápidos

```bash
# Diagnóstico completo del sistema
npm run test:full-suite

# Solo diagnóstico de archivos y configuración
npm run diagnose:notifications

# Prueba específica del service worker
npm run test:service-worker

# Servidor optimizado para pruebas de notificaciones
npm run test:notifications
```

### Scripts Individuales

#### 1. `npm run test:full-suite`
Ejecuta todos los diagnósticos y pruebas automáticamente:
- Verifica archivos del sistema
- Revisa configuración de red
- Prueba registro del service worker
- Genera logs completos en `temp/`

#### 2. `npm run diagnose:notifications`
Diagnóstico estático del sistema:
- ✅ Verifica existencia de archivos críticos
- 🌐 Detecta configuración de red local
- 📁 Revisa integridad del proyecto
- 📄 Genera reporte en `temp/diagnose-output.txt`

#### 3. `npm run test:service-worker`
Prueba específica del service worker:
- 🔍 Verifica soporte de Service Worker API
- 🧪 Crea script de prueba temporal
- 📋 Genera instrucciones para testing manual
- 📄 Output en `temp/sw-test-output.txt`

#### 4. `npm run test:notifications`
Servidor optimizado para notificaciones:
- 🚀 Inicia Next.js en localhost:3000
- ✅ Verifica dependencias automáticamente
- 📄 Logs guardados en `temp/notifications-server.log`
- 🔧 Configuración optimizada para notificaciones

## 🌐 Páginas de Prueba

### `/test-notifications`
Página completa de pruebas de notificaciones:
- 🔔 Pruebas de permisos
- 📱 Simulación de notificaciones push
- 🔍 Diagnóstico detallado del estado
- 📊 Información en tiempo real

### `/test-sw`
Página específica para service worker:
- 🔧 Registro manual del service worker
- 🧹 Limpieza de service workers antiguos
- 📋 Logs detallados de operaciones
- 🔍 Verificación del Push Manager

## 📋 Requisitos para Notificaciones

### ✅ Requisitos Obligatorios
- **Contexto Seguro**: HTTPS o localhost
- **Service Worker**: Registrado y activo
- **API de Notificaciones**: Soporte del navegador
- **Permisos**: Concedidos por el usuario

### 🔧 Configuración Recomendada
```javascript
// En el navegador, ve a:
http://localhost:3000/test-sw

// O para pruebas completas:
http://localhost:3000/test-notifications
```

## 📁 Archivos de Log

Todos los logs se guardan en la carpeta `temp/`:
- `diagnose-output.txt` - Resultados del diagnóstico
- `sw-test-output.txt` - Pruebas del service worker
- `notifications-server.log` - Logs del servidor
- `network-info.txt` - Información de red detectada

## 🚨 Solución de Problemas

### Service Worker no se registra
```bash
# 1. Limpiar service workers antiguos
npm run test:service-worker

# 2. Ir a /test-sw y usar "Limpiar Service Workers"
# 3. Luego "Registrar Service Worker"
```

### Contexto no seguro
```bash
# Usar localhost en lugar de IP
npm run test:notifications
# URL: http://localhost:3000
```

### Notificaciones no llegan
```bash
# 1. Verificar permisos en /test-notifications
# 2. Revisar consola del navegador (F12)
# 3. Verificar logs en temp/
```

## 📊 Estados Esperados

### ✅ Estado Ideal
```
Service Worker: ✅ Disponible
Contexto: ✅ Seguro (localhost)
Registrado: ✅ Sí
Listo: ✅ Sí
Permisos: ✅ granted
```

### ⚠️ Estados Problemáticos
```
Service Worker: ❌ No disponible  → Actualizar navegador
Contexto: ❌ No seguro          → Usar localhost
Registrado: ❌ No               → Registrar manualmente
Permisos: ❌ denied            → Conceder permisos
```

## 🔄 Flujo de Trabajo Recomendado

1. **Diagnóstico Inicial**
   ```bash
   npm run test:full-suite
   ```

2. **Revisar Logs**
   ```
   temp/diagnose-output.txt
   temp/sw-test-output.txt
   ```

3. **Testing Interactivo**
   - Ir a `http://localhost:3000/test-sw`
   - Usar herramientas de diagnóstico
   - Limpiar y registrar service worker

4. **Pruebas de Notificaciones**
   - Ir a `http://localhost:3000/test-notifications`
   - Solicitar permisos
   - Probar notificaciones

5. **Verificación Final**
   - Revisar consola del navegador
   - Verificar recepción de notificaciones
   - Confirmar funcionamiento en móvil

## 📞 Soporte

Si persisten los problemas:
1. Revisar todos los logs en `temp/`
2. Abrir consola del navegador (F12)
3. Compartir los logs generados
4. Indicar navegador y dispositivo usado