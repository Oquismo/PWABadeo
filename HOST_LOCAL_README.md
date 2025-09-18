# 🚀 Modo Host Local - PWABadeo

Este documento explica cómo ejecutar la aplicación en modo host local para acceder desde dispositivos móviles.

## 🎯 Opciones Disponibles

### 1. **Script Simple** (Más fácil - Windows)
```bash
scripts\host-simple.bat
```
- ✅ Un solo clic
- ✅ Configuración automática de red
- ✅ Información de acceso clara

### 2. **Desarrollo Rápido** (Sin Build)
Para testing rápido durante desarrollo:
```bash
npm run host:dev
```
- ✅ Sin build necesario
- ✅ Hot reload activado
- ✅ Accesible desde móvil
- ⚠️  Modo desarrollo (no optimizado)

### 3. **Producción Local** (Con Build)
Para testing como en producción:
```bash
npm run host
# o
npm run start:prod
```

### 4. **Con Verificación Completa**
```bash
npm run host:check
# o
scripts\check-and-start.bat
```
- ✅ Verifica configuración de red
- ✅ Detecta problemas de puerto
- ✅ Información detallada de conectividad

### 5. **Scripts Personalizados**
```bash
# Windows
scripts\start-host.bat
scripts\host-simple.bat
scripts\check-and-start.bat

# Linux/macOS
bash scripts/start-host.sh
```

## 📱 Acceso desde Móvil

### Paso 1: Obtener tu IP Local
Ejecuta uno de los comandos y verás tu IP local en la consola:
```
🌐 Tu IP local: 192.168.1.100
```

### Paso 2: Conectar desde Móvil
1. **Asegúrate** de que tu móvil esté en la **misma red WiFi**
2. **Abre el navegador** en tu móvil
3. **Ve a**: `http://TU_IP_LOCAL:3000`
   - Ejemplo: `http://192.168.1.100:3000`

### Paso 3: Verificar Conexión
- ✅ Deberías ver la aplicación cargando
- ✅ Todas las funcionalidades deberían trabajar
- ✅ PWA debería instalarse correctamente

## 🪟 **Instrucciones Específicas para Windows**

### **Configuración Automática**
Los scripts de Windows configuran automáticamente:
- ✅ Variables de entorno (`HOST=0.0.0.0`, `PORT=3000`)
- ✅ Detección de IP local
- ✅ Verificación de puertos disponibles
- ✅ Información de acceso clara

### **Comandos Recomendados**
```bash
# Opción más simple (recomendado)
scripts\host-simple.bat

# Con verificación completa
scripts\check-and-start.bat

# Usando npm
npm run host:dev
```

### **Solución de Problemas en Windows**
```bash
# Si hay problemas de firewall
netsh advfirewall firewall add rule name="NextJS Host" dir=in action=allow protocol=TCP localport=3000

# Verificar qué usa el puerto 3000
netstat -ano | findstr :3000

# Matar proceso si es necesario
taskkill /PID TU_PID /F
```

## 🌐 URLs Disponibles

Una vez ejecutado el comando, tendrás acceso a:
- **Local**: `http://localhost:3000`
- **Red**: `http://TU_IP_LOCAL:3000`
- **API**: `http://TU_IP_LOCAL:3000/api/*`

## 🛑 Detener el Servidor

Presiona `Ctrl+C` en la terminal para detener el servidor.

## 📋 Checklist Pre-Lanzamiento

- [ ] Build exitoso sin errores
- [ ] Base de datos configurada correctamente
- [ ] Variables de entorno configuradas
- [ ] PWA se instala correctamente en móvil
- [ ] Notificaciones push funcionan
- [ ] Todas las rutas responden correctamente

## 🔔 **Solución de Problemas con Notificaciones**

### **¿No aparecen las notificaciones?**

Las notificaciones push requieren un **contexto seguro**. Aquí están las soluciones:

#### **Opción 1: Usar Localhost (Recomendado para testing)**
```bash
# Ejecutar en localhost (funciona con notificaciones)
scripts\test-localhost.bat
```
- ✅ Notificaciones completamente funcionales
- ✅ Acceso desde móvil: `http://localhost:3000`
- ✅ No requiere configuración adicional

#### **Opción 2: Usar IP Local con HTTPS**
Para testing avanzado con HTTPS:
```bash
# Instalar mkcert para HTTPS local
npm install -g mkcert
mkcert -install
mkcert localhost
```

#### **Diagnóstico de Problemas**
Si las notificaciones no funcionan:
1. **Revisa la consola del navegador** (F12 → Console)
2. **Ve a `/test-notifications`** para diagnóstico detallado
3. **Verifica que estés en localhost** o usando HTTPS
4. **Abre Configuración de Notificaciones** para ver el diagnóstico

### **Mensajes de Error Comunes**

#### **"Notificaciones no soportadas"**
- ✅ Solución: Usa `scripts\test-localhost.bat`
- ✅ O accede desde: `http://localhost:3000`

#### **"Permiso denegado"**
- ✅ Ve a configuración del navegador
- ✅ Busca "Permisos del sitio" → Notificaciones
- ✅ Cambia a "Permitir"

#### **No pide permisos**
- ✅ Verifica que estés en un contexto seguro
- ✅ Revisa la consola para mensajes de debug
- ✅ Intenta refrescar la página

---

¡Listo para testing móvil! 📱✨