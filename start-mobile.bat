@echo off
echo ========================================
echo   SERVIDOR PWA BADEO - ACCESO MOVIL
echo ========================================
echo.
echo Tu IP local es: 192.168.1.120
echo.
echo Para acceder desde tu movil:
echo   http://192.168.1.120:3000
echo.
echo IMPORTANTE:
echo - PC y movil deben estar en la MISMA WiFi
echo - Si no funciona, desactiva el firewall temporalmente
echo.
echo ========================================
echo Iniciando servidor...
echo ========================================
echo.

npx next dev -H 0.0.0.0 -p 3000
