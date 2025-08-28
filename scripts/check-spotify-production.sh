#!/bin/bash

echo "🔧 Verificación de configuración de Spotify para producción"
echo "============================================================"

# Detectar entorno
if [ -n "$VERCEL_URL" ]; then
    echo "🌐 Entorno detectado: Vercel"
    BASE_URL="https://$VERCEL_URL"
elif [ -n "$RAILWAY_STATIC_URL" ]; then
    echo "🌐 Entorno detectado: Railway"
    BASE_URL="$RAILWAY_STATIC_URL"
else
    echo "🌐 Entorno detectado: Local/Desarrollo"
    BASE_URL="http://localhost:3001"
fi

echo ""
echo "📋 Configuración actual:"
echo "Base URL: $BASE_URL"
echo "Redirect URI esperado: $BASE_URL/api/spotify/callback"

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
echo "🔍 Páginas de diagnóstico:"
echo "Diagnóstico general: $BASE_URL/spotify-production-debug"
echo "Debug de desarrollo: $BASE_URL/spotify-debug"
echo "Página de solución: $BASE_URL/spotify-fix"
