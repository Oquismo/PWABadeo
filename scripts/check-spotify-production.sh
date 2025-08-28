#!/bin/bash

echo "🔧 Verificación rápida de configuración de Spotify para producción"
echo "================================================================="

# Verificar variables de entorno
echo ""
echo "📋 Variables de entorno:"
echo "NEXTAUTH_URL: ${NEXTAUTH_URL:-'NO CONFIGURADO'}"
echo "NEXT_PUBLIC_SPOTIFY_CLIENT_ID: ${NEXT_PUBLIC_SPOTIFY_CLIENT_ID:+'CONFIGURADO'}"
echo "SPOTIFY_CLIENT_SECRET: ${SPOTIFY_CLIENT_SECRET:+'CONFIGURADO'}"
echo "NEXT_PUBLIC_SPOTIFY_REDIRECT_URI: ${NEXT_PUBLIC_SPOTIFY_REDIRECT_URI:-'NO CONFIGURADO'}"

# Verificar URLs
echo ""
echo "🔗 URLs configuradas:"
echo "Base URL: ${NEXTAUTH_URL:-'http://localhost:3001'}"
echo "Redirect URI: ${NEXT_PUBLIC_SPOTIFY_REDIRECT_URI:-'NO CONFIGURADO'}"
echo "Callback URL: ${NEXTAUTH_URL:-'http://localhost:3001'}/api/spotify/callback"

# Verificar consistencia
echo ""
echo "✅ Verificaciones:"
if [ -n "$NEXTAUTH_URL" ]; then
    echo "✓ NEXTAUTH_URL configurado"
else
    echo "✗ NEXTAUTH_URL NO configurado"
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

if [ -n "$NEXT_PUBLIC_SPOTIFY_REDIRECT_URI" ]; then
    echo "✓ SPOTIFY_REDIRECT_URI configurado"
else
    echo "✗ SPOTIFY_REDIRECT_URI NO configurado"
fi

# Verificar consistencia de URLs
EXPECTED_REDIRECT="${NEXTAUTH_URL:-'http://localhost:3001'}/api/spotify/callback"
if [ "$NEXT_PUBLIC_SPOTIFY_REDIRECT_URI" = "$EXPECTED_REDIRECT" ]; then
    echo "✓ URLs consistentes"
else
    echo "✗ URLs inconsistentes"
    echo "  Esperado: $EXPECTED_REDIRECT"
    echo "  Actual:   $NEXT_PUBLIC_SPOTIFY_REDIRECT_URI"
fi

echo ""
echo "🎵 Próximos pasos:"
echo "1. Ve a https://developer.spotify.com/dashboard"
echo "2. Selecciona tu aplicación"
echo "3. Ve a 'Edit Settings'"
echo "4. En 'Redirect URIs' agrega:"
echo "   $EXPECTED_REDIRECT"
echo "5. Guarda los cambios"
echo "6. Reinicia tu aplicación en producción"

echo ""
echo "🔍 Para diagnóstico detallado, visita:"
echo "${NEXTAUTH_URL:-'http://localhost:3001'}/spotify-production-debug"
