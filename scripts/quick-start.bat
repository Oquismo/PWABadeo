@echo off
echo ===========================================
echo PWABadeo - Inicio Rápido con Localhost
echo ===========================================
echo.

echo 🔧 Iniciando servidor...
start /B npm run dev

echo ⏳ Esperando que el servidor inicie (5 segundos)...
timeout /t 5 /nobreak >nul

echo 🌐 Abriendo navegador en localhost...
start http://localhost:3000

echo ✅ Servidor iniciado y navegador abierto
echo 📍 URL: http://localhost:3000
echo.

echo 💡 En localhost las notificaciones deberían funcionar perfectamente
echo 🔍 Si hay problemas, abre la consola (F12) y ejecuta: diagnoseNotifications()
echo.

pause