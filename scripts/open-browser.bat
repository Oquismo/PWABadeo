@echo off
REM Script para abrir automáticamente el navegador con la URL correcta

REM Obtener la IP local
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /R /C:"IPv4"') do (
    set LOCAL_IP=%%a
    goto :found_ip
)
:found_ip
set LOCAL_IP=%LOCAL_IP:~1%

if "%LOCAL_IP%"=="" (
    echo ❌ No se pudo detectar la IP local
    echo Usa manualmente: http://localhost:3000
    pause
    exit /b 1
)

echo 🌐 Abriendo navegador con URL: http://%LOCAL_IP%:3000
start http://%LOCAL_IP%:3000

echo 📱 También puedes acceder desde tu móvil a: http://%LOCAL_IP%:3000
echo.
echo 🛑 Presiona cualquier tecla para continuar...
pause >nul