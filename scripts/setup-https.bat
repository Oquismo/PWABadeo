@echo off
echo ===========================================
echo Configuración HTTPS para Notificaciones Push
echo ===========================================
echo.

echo 🔐 Para usar notificaciones push desde red local, necesitas HTTPS
echo.

echo 📋 Opciones disponibles:
echo.

echo 1️⃣  OPCION RECOMENDADA: Usar localhost
echo    - Ventaja: Funciona inmediatamente
echo    - Desventaja: Solo desde el mismo dispositivo
echo.
echo    Ejecuta: npm run dev
echo    Accede desde: http://localhost:3000
echo.

echo 2️⃣  OPCION AVANZADA: Configurar HTTPS local
echo    - Ventaja: Funciona desde cualquier dispositivo en la red
echo    - Desventaja: Requiere configuración adicional
echo.

echo 📄 Pasos para HTTPS local:
echo.

echo 1. Instalar mkcert (generador de certificados):
echo    - Descarga: https://github.com/FiloSottile/mkcert/releases
echo    - Instala el .exe en una carpeta del PATH
echo.

echo 2. Generar certificado local:
echo    mkcert -install
echo    mkcert 192.168.1.120 localhost 127.0.0.1
echo.

echo 3. Configurar Next.js para HTTPS:
echo    - Crear archivo .env.local con:
echo      HTTPS=true
echo      SSL_CRT_FILE=./certs/192.168.1.120.pem
echo      SSL_KEY_FILE=./certs/192.168.1.120-key.pem
echo.

echo 4. Ejecutar con HTTPS:
echo    npm run dev
echo    Acceder desde: https://192.168.1.120:3000
echo.

echo ⚠️  IMPORTANTE:
echo - Los certificados generados solo funcionan en tu red local
echo - Otros dispositivos en la red necesitarán aceptar el certificado
echo - localhost siempre funciona sin configuración adicional
echo.

echo 🔧 Verificación:
echo - Una vez configurado, deberías ver:
echo   isSecureContext: true
echo   hasServiceWorker: true
echo.

pause