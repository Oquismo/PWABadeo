@echo off
echo ============================================
echo    PWABadeo - Pruebas de Notificaciones
echo ============================================
echo.

REM Verificar si Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Node.js no está instalado
    echo Por favor instala Node.js desde https://nodejs.org
    pause
    exit /b 1
)

REM Verificar si el proyecto tiene las dependencias instaladas
if not exist "node_modules" (
    echo 📦 Instalando dependencias...
    npm install
    if errorlevel 1 (
        echo ❌ Error al instalar dependencias
        pause
        exit /b 1
    )
)

echo ✅ Dependencias verificadas
echo.

REM Crear directorio temporal para logs si no existe
if not exist "temp" mkdir temp

REM Verificar configuración de red para notificaciones
echo 🔍 Verificando configuración de red...
ipconfig | findstr /i "IPv4" > temp\network-info.txt
echo 📄 Información de red guardada en: temp\network-info.txt
echo.

echo 🔔 Configuración Óptima para Notificaciones Push
echo.

REM Verificar si estamos en localhost
if "%COMPUTERNAME%"=="%COMPUTERNAME%" (
    echo ✅ Ejecutando en localhost
    echo 🌐 URL: http://localhost:3000
    echo 🔔 Notificaciones: Habilitadas
) else (
    echo ⚠️  No estás en localhost
    echo 💡 Las notificaciones requieren localhost o HTTPS
)

echo.
echo 📋 Requisitos para notificaciones:
echo ✅ Contexto seguro (localhost o HTTPS)
echo ✅ Service Worker registrado
echo ✅ API de notificaciones disponible
echo ✅ Permisos concedidos por el usuario
echo.

echo 🚀 Iniciando servidor...
echo 📱 Accede a: http://localhost:3000
echo 🔔 Ve a: http://localhost:3000/test-notifications
echo.

REM Configurar para localhost específicamente
set HOST=localhost
set PORT=3000
set NODE_ENV=development

REM Ejecutar Next.js con logs
echo 📄 Logs del servidor en: temp\notifications-server.log
npx next dev --hostname localhost --port 3000 > temp\notifications-server.log 2>&1