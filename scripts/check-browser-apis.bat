@echo off
echo ========================================
echo Diagnóstico Rápido de APIs del Navegador
echo ========================================
echo.

echo 🔍 Verificando APIs necesarias para notificaciones push...
echo.

echo 📋 APIs requeridas:
echo - Service Worker API
echo - Push Manager API
echo - Notification API
echo - Contexto Seguro (HTTPS/localhost)
echo.

echo 💡 Para verificar en tu navegador:
echo.
echo 1. Abre Chrome en tu Pixel 9
echo 2. Ve a: chrome://version
echo 3. Verifica que la versión sea reciente
echo.
echo 4. En la página de ajustes de la app, abre la consola (F12)
echo 5. Ejecuta uno de estos comandos:
echo.
echo    diagnoseNotifications()  - Diagnóstico completo detallado
echo    checkNotifications()     - Verificación rápida (true/false)
echo.
echo 6. Busca mensajes que empiecen con "🔍"
echo.

echo 🔧 Comandos de diagnóstico disponibles:
echo - diagnoseNotifications() - Análisis detallado con recomendaciones
echo - checkNotifications() - Verificación rápida (true/false)
echo - También puedes cargar el script: /diagnose-notifications.js
echo.

echo 🌐 Verificación de contexto seguro:
echo - localhost:3000 → ✅ FUNCIONA
echo - 127.0.0.1:3000 → ✅ FUNCIONA
echo - 192.168.1.120:3000 (HTTP) → ❌ NO FUNCIONA
echo - 192.168.1.120:3000 (HTTPS) → ✅ FUNCIONA
echo.

echo 💡 Tu problema específico:
echo - Estás accediendo desde: 192.168.1.120
echo - Usando protocolo: HTTP
echo - Solución: Usa localhost o configura HTTPS
echo.

echo 🔧 Soluciones disponibles:
echo - Ejecuta: scripts\start-localhost.bat (recomendado)
echo - O configura HTTPS: scripts\setup-https.bat
echo - Más info: NOTIFICATIONS-HTTPS-README.md
echo.
echo.

echo 📱 Para Pixel 9 específicamente:
echo - Asegúrate de tener la última versión de Chrome
echo - Verifica que las notificaciones estén habilitadas en Android
echo - Ve a Configuración → Apps → Chrome → Notificaciones
echo.

pause