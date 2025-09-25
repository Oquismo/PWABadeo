# 🔐 Problema: Notificaciones Push en Red Local

## 📋 Problema Identificado

Estás intentando usar notificaciones push desde `192.168.1.120` usando HTTP, pero las notificaciones push requieren un **contexto seguro** (HTTPS o localhost).

### ❌ Lo que NO funciona:
- `http://192.168.1.120:3000` - HTTP en IP local
- Cualquier URL HTTP que no sea localhost

### ✅ Lo que SÍ funciona:
- `http://localhost:3000` - Localhost con HTTP
- `https://192.168.1.120:3000` - IP local con HTTPS

## 🚀 Soluciones Rápidas

### Opción 1: Usar Localhost (Recomendado)
```bash
# Ejecuta este comando:
scripts\start-localhost.bat

# O manualmente:
npm run dev

# Accede desde:
http://localhost:3000
```

### Opción 2: Configurar HTTPS Local
```bash
# Sigue los pasos en:
scripts\setup-https.bat
```

## 🔍 Diagnóstico

Si ejecutas `diagnoseNotifications()` en la consola, deberías ver:
- `isSecureContext: false` ← Este es el problema
- `hasServiceWorker: false` ← Consecuencia del problema
- `protocol: 'http:'` ← Confirmación

## 💡 ¿Por qué ocurre esto?

Las APIs modernas como Service Worker y Push Notifications requieren HTTPS por seguridad. Localhost es la única excepción que permite HTTP.

## 🎯 Resultado Esperado

Después de usar localhost, deberías ver:
- `isSecureContext: true`
- `hasServiceWorker: true`
- `isSupported: true`
- El switch de notificaciones habilitado

## 📱 Para Móviles

Si quieres acceder desde tu Pixel 9:
1. Ejecuta la app en localhost
2. Desde tu teléfono, ve a la IP del servidor: `http://[IP_DE_TU_PC]:3000`
3. Pero necesitarás HTTPS para que funcionen las notificaciones

¿Has probado usar localhost? Esa es la solución más rápida.