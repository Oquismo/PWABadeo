@echo off
echo ========================================
echo 🚀 Servidor Local para Dashboard de Tráfico
echo ========================================
echo.

echo Este script inicia un servidor local para probar
echo el dashboard de tráfico sin problemas de CORS.
echo.

echo Instrucciones:
echo 1. Asegúrate de que tu aplicación PWABadeo esté ejecutándose
echo 2. El dashboard estará disponible en:
echo    http://localhost:8080/traffic-dashboard.html
echo.
echo Presiona Ctrl+C para detener el servidor
echo ========================================

REM Verificar si http-server está instalado
http-server --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ http-server no está instalado.
    echo.
    echo Instálalo con:
    echo npm install -g http-server
    echo.
    pause
    exit /b 1
)

REM Iniciar servidor
echo ✅ Iniciando servidor en puerto 8080...
http-server -p 8080 -c-1 --cors

pause
