@echo off
REM Script para verificar configuración de red y ejecutar host local

echo 🌐 Verificando configuración de red...
echo.

REM Obtener información de red
echo 📋 Información de red:
ipconfig | findstr /R /C:"IPv4"
echo.

REM Verificar si el puerto 3000 está en uso
netstat -ano | findstr :3000 >nul
if %errorlevel% equ 0 (
    echo ⚠️  Puerto 3000 ya está en uso. Detén otros procesos primero.
    echo.
    echo Ejecuta: netstat -ano | findstr :3000
    echo Luego: taskkill /PID TU_PID /F
    echo.
    pause
    exit /b 1
) else (
    echo ✅ Puerto 3000 disponible
)

echo.
echo 🚀 Iniciando PWABadeo en modo host local...
echo 📱 La aplicación será accesible desde otros dispositivos en la red
echo.

REM Obtener la IP local
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /R /C:"IPv4"') do (
    set LOCAL_IP=%%a
    goto :found_ip
)
:found_ip
set LOCAL_IP=%LOCAL_IP:~1%

if "%LOCAL_IP%"=="" (
    set LOCAL_IP=localhost
)

echo 🌐 Tu IP local: %LOCAL_IP%
echo 📱 Accede desde tu móvil a: http://%LOCAL_IP%:3000
echo 💻 Local: http://localhost:3000
echo.
echo ⚠️  Asegúrate de que tu móvil esté conectado a la misma red WiFi
echo 🛑 Presiona Ctrl+C para detener el servidor
echo.

REM Configurar variables de entorno y ejecutar
set HOST=0.0.0.0
set PORT=3000
npx next dev