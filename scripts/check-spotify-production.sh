#!/bin/bash

echo "🔧 Verificación de configuración de Spotify para producción"
echo "============================================================"

# Detectar entorno automáticamente
if [ -n "$VERCEL_URL" ]; then
    DETECTED_ENV="Vercel"
    BASE_URL="https://$VERCEL_URL"
elif [ -n "$RAILWAY_STATIC_URL" ]; then
    DETECTED_ENV="Railway"
    BASE_URL="$RAILWAY_STATIC_URL"
elif [ -n "$NEXTAUTH_URL" ]; then
    if [[ $NEXTAUTH_URL == https://* ]]; then
        DETECTED_ENV="Producción (desde NEXTAUTH_URL)"
        BASE_URL="$NEXTAUTH_URL"
    else
        DETECTED_ENV="Desarrollo (desde NEXTAUTH_URL)"
        BASE_URL="$NEXTAUTH_URL"
    fi
else
    DETECTED_ENV="Desarrollo (localhost)"
    BASE_URL="http://localhost:3001"
fi

echo "🌐 Entorno detectado: $DETECTED_ENV"
echo "🏠 URL base: $BASE_URL"

# Verificar variables de entorno
echo ""
echo "� Variables de entorno:"
echo "NEXTAUTH_URL: ${NEXTAUTH_URL:-'NO CONFIGURADO'}"
echo "NEXT_PUBLIC_SPOTIFY_CLIENT_ID: ${NEXT_PUBLIC_SPOTIFY_CLIENT_ID:+'CONFIGURADO'}"
echo "SPOTIFY_CLIENT_SECRET: ${SPOTIFY_CLIENT_SECRET:+'CONFIGURADO'}"
echo "NEXT_PUBLIC_SPOTIFY_REDIRECT_URI: ${NEXT_PUBLIC_SPOTIFY_REDIRECT_URI:-'NO CONFIGURADO'}"

# Verificar consistencia
echo ""
echo "✅ Verificaciones:"
if [ "$NEXTAUTH_URL" = "$BASE_URL" ]; then
    echo "✓ NEXTAUTH_URL correcto"
else
    echo "✗ NEXTAUTH_URL incorrecto"
    echo "  Actual: ${NEXTAUTH_URL:-'NO CONFIGURADO'}"
    echo "  Esperado: $BASE_URL"
fi

if [ -n "$NEXT_PUBLIC_SPOTIFY_CLIENT_ID" ]; then
    echo "✓ SPOTIFY_CLIENT_ID configurado"
else
    echo "✗ SPOTIFY_CLIENT_ID NO configurado"
fi

if [ -n "$SPOTIFY_CLIENT_SECRET" ]; then
    echo "✓ SPOTIFY_CLIENT_SECRET configurado"
else
    echo "✗ SPOTIFY_CLIENT_SECRET NO configurado"
fi

EXPECTED_REDIRECT="$BASE_URL/api/spotify/callback"
if [ "$NEXT_PUBLIC_SPOTIFY_REDIRECT_URI" = "$EXPECTED_REDIRECT" ]; then
    echo "✓ SPOTIFY_REDIRECT_URI correcto"
else
    echo "✗ SPOTIFY_REDIRECT_URI incorrecto"
    echo "  Actual: ${NEXT_PUBLIC_SPOTIFY_REDIRECT_URI:-'NO CONFIGURADO'}"
    echo "  Esperado: $EXPECTED_REDIRECT"
fi

echo ""
echo "🎵 Configuración de Spotify Dashboard:"
echo "Ve a: https://developer.spotify.com/dashboard"
echo "Configura el Redirect URI como: $EXPECTED_REDIRECT"

echo ""
echo "� Para aplicar cambios:"
if [[ $DETECTED_ENV == *"Vercel"* ]]; then
    echo "1. Ve al dashboard de Vercel"
    echo "2. Proyecto > Settings > Environment Variables"
    echo "3. Actualiza las variables"
    echo "4. Redeploya la aplicación"
elif [[ $DETECTED_ENV == *"Railway"* ]]; then
    echo "1. Ve al dashboard de Railway"
    echo "2. Proyecto > Variables"
    echo "3. Actualiza las variables"
    echo "4. Redeploya la aplicación"
else
    echo "1. Edita tu archivo .env.local"
    echo "2. Reinicia el servidor (Ctrl+C, luego npm run dev)"
fi
