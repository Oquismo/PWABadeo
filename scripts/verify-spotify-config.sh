#!/bin/bash

# Script de verificación de configuración de Spotify
# Ejecuta: bash scripts/verify-spotify-config.sh

echo "🎵 Verificando configuración de Spotify..."
echo "========================================"

# Verificar variables de entorno requeridas
echo ""
echo "📋 Verificando variables de entorno:"

REQUIRED_VARS=(
    "NEXT_PUBLIC_SPOTIFY_CLIENT_ID"
    "SPOTIFY_CLIENT_SECRET"
    "NEXT_PUBLIC_SPOTIFY_REDIRECT_URI"
)

OPTIONAL_VARS=(
    "NEXT_PUBLIC_SPOTIFY_DEFAULT_PLAYLIST"
    "NEXT_PUBLIC_SPOTIFY_AUTO_PLAY"
    "NEXT_PUBLIC_SPOTIFY_VOLUME"
)

for var in "${REQUIRED_VARS[@]}"; do
    if [ -n "${!var}" ]; then
        echo "✅ $var: Configurada"
    else
        echo "❌ $var: NO configurada (REQUERIDA)"
    fi
done

echo ""
echo "📋 Variables opcionales:"
for var in "${OPTIONAL_VARS[@]}"; do
    if [ -n "${!var}" ]; then
        echo "✅ $var: ${!var}"
    else
        echo "⚠️  $var: No configurada (usará valores por defecto)"
    fi
done

# Verificar formato de URLs
echo ""
echo "🔗 Verificando URLs:"
if [[ $NEXT_PUBLIC_SPOTIFY_REDIRECT_URI == http* ]]; then
    echo "✅ Redirect URI tiene formato correcto"
else
    echo "❌ Redirect URI debe comenzar con http:// o https://"
fi

# Verificar que no se exponga el client secret
echo ""
echo "🔒 Verificando seguridad:"
if [[ $NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET ]]; then
    echo "❌ ERROR: SPOTIFY_CLIENT_SECRET está expuesta (no debe tener NEXT_PUBLIC_)"
else
    echo "✅ Client Secret está protegida correctamente"
fi

# Verificar playlists
echo ""
echo "🎶 Verificando playlists:"
if [ -n "$NEXT_PUBLIC_SPOTIFY_DEFAULT_PLAYLIST" ]; then
    if [[ $NEXT_PUBLIC_SPOTIFY_DEFAULT_PLAYLIST =~ ^[0-9a-zA-Z]{22}$ ]]; then
        echo "✅ Default playlist ID tiene formato correcto"
    else
        echo "⚠️  Default playlist ID puede no ser válido"
    fi
fi

echo ""
echo "📝 Próximos pasos:"
echo "1. Ve a https://developer.spotify.com/dashboard"
echo "2. Configura el Redirect URI: $NEXT_PUBLIC_SPOTIFY_REDIRECT_URI"
echo "3. Asegúrate de que coincida exactamente"
echo "4. Prueba la autenticación en tu aplicación"

echo ""
echo "✨ ¡Configuración verificada!"
