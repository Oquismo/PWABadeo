#!/bin/bash

# Script para ejecutar la aplicación en modo host local (accesible desde móvil)
echo "🚀 Iniciando PWABadeo en modo HOST LOCAL..."
echo "📱 La aplicación será accesible desde otros dispositivos en la red"
echo ""

# Obtener la IP local
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    # Windows
    LOCAL_IP=$(ipconfig | grep -Eo "IPv4.*: ([0-9]{1,3}\.){3}[0-9]{1,3}" | grep -Eo "([0-9]{1,3}\.){3}[0-9]{1,3}" | head -1)
else
    # macOS/Linux
    LOCAL_IP=$(ifconfig | grep -Eo "inet (addr:)?([0-9]{1,3}\.){3}[0-9]{1,3}" | grep -v "127.0.0.1" | head -1 | awk '{print $2}')
fi

if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP="TU_IP_LOCAL"
fi

echo "🌐 Tu IP local: $LOCAL_IP"
echo "📱 Accede desde tu móvil a: http://$LOCAL_IP:3000"
echo ""
echo "⚠️  Asegúrate de que tu móvil esté conectado a la misma red WiFi"
echo "🔒 Si necesitas HTTPS para PWA, considera usar ngrok o similar"
echo ""

# Ejecutar la aplicación
echo "🏗️  Construyendo la aplicación..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build completado. Iniciando servidor..."
    echo "🌐 Servidor disponible en:"
    echo "   📱 Móvil: http://$LOCAL_IP:3000"
    echo "   💻 Local: http://localhost:3000"
    echo ""
    echo "🛑 Presiona Ctrl+C para detener el servidor"
    echo ""

    HOST=0.0.0.0 PORT=3000 npm start
else
    echo "❌ Error en el build. Revisa los errores arriba."
    exit 1
fi