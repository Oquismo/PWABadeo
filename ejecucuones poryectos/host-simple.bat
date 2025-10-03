@echo off
REM Script simple para host local en Windows

echo 🚀 Iniciando PWABadeo en modo host local...
echo.

REM Verificar si el puerto 3000 está en uso
netstat -ano | findstr :3000 >nul
if %errorlevel% equ 0 (
    echo ⚠️  Puerto 3000 ocupado, intentando con puerto 3001...
    set PORT=3001
) else (
    set PORT=3000
)

REM Configurar variables de entorno
set HOST=0.0.0.0

REM Obtener IP local
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /R /C:"IPv4"') do (
    set LOCAL_IP=%%a
    goto :found_ip
)
:found_ip
set LOCAL_IP=%LOCAL_IP:~1%

if "%LOCAL_IP%"=="" (
    set LOCAL_IP=localhost
)

echo 🌐 Información de acceso:
echo 📱 Móvil: http://%LOCAL_IP%:%PORT%
echo 💻 Local: http://localhost:%PORT%
echo.
echo ⚠️  Asegúrate de que tu móvil esté en la misma red WiFi
echo ⛔ Presiona Ctrl+C para detener
echo.

REM Ejecutar Next.js
npx next dev --port %PORT% --hostname %HOST%
