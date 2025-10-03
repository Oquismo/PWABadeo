@echo off
REM Script para ejecutar PWABadeo en modo host local (accesible desde móvil)
echo 🚀 Iniciando PWABadeo en modo HOST LOCAL...
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
    set LOCAL_IP=TU_IP_LOCAL
)

echo 🌐 Tu IP local: %LOCAL_IP%
echo 📱 Accede desde tu móvil a: http://%LOCAL_IP%:3000
echo.
echo ⚠️  Asegúrate de que tu móvil esté conectado a la misma red WiFi
echo 🔒 Si necesitas HTTPS para PWA, considera usar ngrok o similar
echo.

REM Ejecutar la aplicación
echo 🧩  Construyendo la aplicación...
call npm run build

if %errorlevel% equ 0 (
    echo.
    echo ✅ Build completado. Iniciando servidor...
    echo 🌐 Servidor disponible en:
    echo    📱 Móvil: http://%LOCAL_IP%:3000
    echo    💻 Local: http://localhost:3000
    echo.
    echo ⛔ Presiona Ctrl+C para detener el servidor
    echo.

    set HOST=0.0.0.0
    set PORT=3000
    npm start
) else (
    echo ❌ Error en el build. Revisa los errores arriba.
    pause
    exit /b 1
)
