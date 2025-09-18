@echo off
chcp 65001 >nul
echo ============================================
echo    PWABadeo - Diagnostico de Notificaciones
echo ============================================
echo.

REM Cambiar al directorio raiz del proyecto
cd /d "%~dp0.."
echo 📂 Directorio de trabajo: %CD%
echo.

REM Crear directorio temporal si no existe
if not exist "temp" mkdir temp

echo 🔍 Verificando estado del sistema de notificaciones...
echo.

REM Verificar archivos criticos con rutas absolutas
set "SW_FILE=%CD%\public\service-worker.js"
set "HOOK_FILE=%CD%\src\hooks\useNotifications.ts"
set "PUSH_HOOK_FILE=%CD%\src\hooks\usePushNotifications.ts"
set "SETTINGS_FILE=%CD%\src\components\ui\NotificationSettings.tsx"
set "TEST_FILE=%CD%\src\components\ui\NotificationTest.tsx"

echo 📁 Verificando archivos del sistema de notificaciones:

if exist "%SW_FILE%" (
    echo ✅ service-worker.js encontrado
    for %%A in ("%SW_FILE%") do echo    Ubicacion: %%~fA
    for %%A in ("%SW_FILE%") do echo    Tamano: %%~zA bytes
) else (
    echo ❌ service-worker.js NO encontrado
    echo    Buscado en: %SW_FILE%
)

if exist "%HOOK_FILE%" (
    echo ✅ useNotifications.ts encontrado
    for %%A in ("%HOOK_FILE%") do echo    Ubicacion: %%~fA
) else (
    echo ❌ useNotifications.ts NO encontrado
    echo    Buscado en: %HOOK_FILE%
)

if exist "%PUSH_HOOK_FILE%" (
    echo ✅ usePushNotifications.ts encontrado
    for %%A in ("%PUSH_HOOK_FILE%") do echo    Ubicacion: %%~fA
) else (
    echo ❌ usePushNotifications.ts NO encontrado
    echo    Buscado en: %PUSH_HOOK_FILE%
)

if exist "%SETTINGS_FILE%" (
    echo ✅ NotificationSettings.tsx encontrado
    for %%A in ("%SETTINGS_FILE%") do echo    Ubicacion: %%~fA
) else (
    echo ❌ NotificationSettings.tsx NO encontrado
    echo    Buscado en: %SETTINGS_FILE%
)

if exist "%TEST_FILE%" (
    echo ✅ NotificationTest.tsx encontrado
    for %%A in ("%TEST_FILE%") do echo    Ubicacion: %%~fA
) else (
    echo ❌ NotificationTest.tsx NO encontrado
    echo    Buscado en: %TEST_FILE%
)

echo.
echo 🌐 Verificando configuracion de red:

REM Obtener informacion de IP local
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /i "IPv4" ^| findstr /v "127.0.0.1"') do (
    set LOCAL_IP=%%i
    goto :found_ip
)

:found_ip
set LOCAL_IP=%LOCAL_IP:~1%
echo ✅ IP local detectada: %LOCAL_IP%

echo.
echo 📋 Resumen de diagnostico:
echo.
echo 🖥️  Servidor local:
echo    - localhost:3000 (para notificaciones)
echo    - %LOCAL_IP%:3000 (para acceso desde otros dispositivos)
echo.
echo 🔧 Configuracion requerida:
echo    - Usar localhost o HTTPS para notificaciones
echo    - Service Worker debe estar registrado
echo    - API de Notificaciones debe estar disponible
echo.
echo 📄 Archivos de log disponibles:
if exist "temp\notifications-test.log" echo    - temp\notifications-test.log
if exist "temp\notifications-server.log" echo    - temp\notifications-server.log
if exist "temp\network-info.txt" echo    - temp\network-info.txt

echo.
echo 💡 Proximos pasos:
echo    1. Ejecuta: npm run test:notifications
echo    2. Ve a: http://localhost:3000/test-sw
echo    3. Verifica que aparezca "Contexto Seguro: ✅"
echo    4. Solicita permisos de notificacion
echo.

pause