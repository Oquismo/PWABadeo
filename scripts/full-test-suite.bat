@echo off
chcp 65001 >nul
echo ============================================
echo    PWABadeo - Suite Completa de Pruebas
echo ============================================
echo.

REM Cambiar al directorio raiz del proyecto
cd /d "%~dp0.."
echo 📂 Directorio de trabajo: %CD%
echo.

REM Verificar Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js no encontrado. Instálalo desde https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Node.js detectado
echo.

REM Crear directorio temporal
if not exist "temp" mkdir temp

echo 🔍 Ejecutando diagnóstico completo del sistema de notificaciones...
echo.

REM Ejecutar diagnóstico
call scripts\diagnose-notifications.bat > temp\diagnose-output.txt 2>&1
echo ✅ Diagnóstico completado - temp\diagnose-output.txt
echo.

echo 🚀 Iniciando pruebas del service worker...
echo.

REM Ejecutar prueba del service worker
call scripts\test-service-worker.bat > temp\sw-test-output.txt 2>&1
echo ✅ Prueba del service worker completada - temp\sw-test-output.txt
echo.

echo 📋 Resumen de archivos generados:
echo    📄 temp\diagnose-output.txt - Resultados del diagnóstico
echo    📄 temp\sw-test-output.txt - Resultados de pruebas del SW
echo    📄 temp\notifications-test.log - Logs del servidor (si ejecutado)
echo    📄 temp\network-info.txt - Información de red
echo.

echo 🎯 Próximos pasos recomendados:
echo.
echo 1. 📊 Revisar los archivos de log en la carpeta temp\
echo 2. 🚀 Ejecutar: npm run test:notifications
echo 3. 🌐 Ir a: http://localhost:3000/test-sw
echo 4. 🔧 Usar la interfaz de diagnóstico para probar el service worker
echo 5. 📱 Ir a: http://localhost:3000/test-notifications
echo 6. 🔔 Probar las notificaciones push
echo.

echo 💡 Si encuentras problemas:
echo    - Asegúrate de usar localhost (no IP)
echo    - Verifica que no haya otros service workers activos
echo    - Revisa la consola del navegador (F12) para errores
echo.

pause