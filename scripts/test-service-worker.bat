@echo off
chcp 65001 >nul
echo ============================================
echo    PWABadeo - Prueba Rapida de Service Worker
echo ============================================
echo.

REM Cambiar al directorio raiz del proyecto
cd /d "%~dp0.."
echo 📂 Directorio de trabajo: %CD%
echo.

REM Verificar si Node.js esta disponible
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js no esta disponible
    echo Este script requiere Node.js
    pause
    exit /b 1
)

echo ✅ Node.js detectado
echo.

REM Crear directorio temporal si no existe
if not exist "temp" mkdir temp

echo 🔍 Probando registro del service worker...
echo.

REM Crear un script temporal para probar el registro
echo console.log('🧪 Probando registro del service worker...'); > temp\sw-test.js
echo. >> temp\sw-test.js
echo if ('serviceWorker' in navigator) { >> temp\sw-test.js
echo   console.log('✅ Service Worker API disponible'); >> temp\sw-test.js
echo   navigator.serviceWorker.register('/service-worker.js') >> temp\sw-test.js
echo     .then(registration =^> { >> temp\sw-test.js
echo       console.log('✅ Service Worker registrado:', registration.scope); >> temp\sw-test.js
echo       return navigator.serviceWorker.ready; >> temp\sw-test.js
echo     }) >> temp\sw-test.js
echo     .then(() =^> console.log('✅ Service Worker listo')) >> temp\sw-test.js
echo     .catch(error =^> console.error('❌ Error registrando SW:', error)); >> temp\sw-test.js
echo } else { >> temp\sw-test.js
echo   console.log('❌ Service Worker API no disponible'); >> temp\sw-test.js
echo } >> temp\sw-test.js

echo 📄 Script de prueba creado: temp\sw-test.js
echo.

echo 💡 Para probar el service worker:
echo    1. Inicia el servidor: npm run test:notifications
echo    2. Ve a: http://localhost:3000/test-sw
echo    3. Abre la consola del navegador (F12)
echo    4. Ejecuta el codigo de temp\sw-test.js
echo.

echo 🔧 Verificando archivos necesarios...

REM Verificar archivos con rutas absolutas
set "SW_FILE=%CD%\public\service-worker.js"
set "HOOK_FILE=%CD%\src\hooks\usePushNotifications.ts"
set "TEST_PAGE=%CD%\src\app\test-sw\page.tsx"

if exist "%SW_FILE%" (
    echo ✅ service-worker.js encontrado
    for %%A in ("%SW_FILE%") do echo    Ubicacion: %%~fA
    for %%A in ("%SW_FILE%") do echo    Tamano: %%~zA bytes
) else (
    echo ❌ service-worker.js NO encontrado en: %SW_FILE%
)

if exist "%HOOK_FILE%" (
    echo ✅ usePushNotifications.ts encontrado
    for %%A in ("%HOOK_FILE%") do echo    Ubicacion: %%~fA
) else (
    echo ❌ usePushNotifications.ts NO encontrado en: %HOOK_FILE%
)

if exist "%TEST_PAGE%" (
    echo ✅ Pagina de prueba test-sw encontrada
) else (
    echo ⚠️  Pagina de prueba test-sw NO encontrada (sera creada automaticamente)
)

echo.
echo 📋 Resumen:
echo    - Service Worker: %SW_FILE%
echo    - Hook de notificaciones: %HOOK_FILE%
echo    - Pagina de prueba: /test-sw
echo    - Script de prueba: %CD%\temp\sw-test.js
echo.

echo 🎯 Proximos pasos:
echo    1. Ejecuta: npm run test:notifications
echo    2. Ve a: http://localhost:3000/test-sw
echo    3. Abre la consola del navegador (F12)
echo    4. Copia y pega el contenido de temp\sw-test.js
echo.

pause