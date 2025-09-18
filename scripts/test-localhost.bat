@echo off
REM Script para probar notificaciones en localhost

echo 🔍 Verificando configuración para notificaciones...
echo.

REM Verificar si estamos en localhost
echo 🌐 Hostname actual: %COMPUTERNAME%
echo 🔗 URL esperada: http://localhost:3000
echo.

REM Verificar firewall
echo 🔥 Verificando firewall...
netsh advfirewall firewall show rule name="NextJS Dev" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Regla de firewall encontrada
) else (
    echo ⚠️  No hay regla de firewall específica
    echo 💡 Si hay problemas, ejecuta:
    echo netsh advfirewall firewall add rule name="NextJS Dev" dir=in action=allow protocol=TCP localport=3000
)

echo.
echo 🚀 Iniciando servidor en localhost...
echo 📱 Accede desde tu móvil a: http://localhost:3000
echo 💻 Accede localmente a: http://localhost:3000
echo.
echo 🔔 Las notificaciones deberían funcionar en localhost
echo 🛑 Presiona Ctrl+C para detener
echo.

REM Ejecutar Next.js en localhost
set HOST=localhost
set PORT=3000
npx next dev