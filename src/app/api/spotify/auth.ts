import { NextRequest, NextResponse } from 'next/server';

const SPOTIFY_CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;

// Endpoint para intercambiar código por token (PKCE)
export async function POST(request: NextRequest) {
  console.log('🔄 Endpoint /api/spotify/auth llamado');

  const { code, code_verifier, redirect_uri, refresh_token } = await request.json();
  console.log('📋 Datos recibidos:', {
    code: code ? 'PRESENTE' : 'NO PRESENTE',
    code_verifier: code_verifier ? 'PRESENTE' : 'NO PRESENTE',
    redirect_uri: redirect_uri,
    refresh_token: refresh_token ? 'PRESENTE' : 'NO PRESENTE'
  });

  console.log('🔧 Variables de entorno:', {
    SPOTIFY_CLIENT_ID: SPOTIFY_CLIENT_ID ? 'CONFIGURADO' : 'NO CONFIGURADO',
    SPOTIFY_CLIENT_SECRET: SPOTIFY_CLIENT_SECRET ? 'CONFIGURADO' : 'NO CONFIGURADO',
    SPOTIFY_REDIRECT_URI: SPOTIFY_REDIRECT_URI
  });

  try {
    let tokenParams;

    if (refresh_token) {
      console.log('🔄 Refrescando token...');
      // Refrescar token
      tokenParams = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refresh_token,
        client_id: SPOTIFY_CLIENT_ID!,
      });
    } else {
      console.log('🔄 Intercambiando código por token...');
      // Intercambiar código por token
      tokenParams = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirect_uri || SPOTIFY_REDIRECT_URI!,
        client_id: SPOTIFY_CLIENT_ID!,
        code_verifier: code_verifier,
      });
    }

    console.log('📡 Enviando solicitud a Spotify API...');
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams,
    });

    console.log('📥 Respuesta de Spotify:', response.status, response.statusText);

    const data = await response.json();
    console.log('📋 Datos de respuesta:', {
      access_token: data.access_token ? 'PRESENTE' : 'NO PRESENTE',
      refresh_token: data.refresh_token ? 'PRESENTE' : 'NO PRESENTE',
      expires_in: data.expires_in,
      error: data.error,
      error_description: data.error_description
    });

    if (!response.ok) {
      console.error('❌ Error de Spotify API:', data);
      return NextResponse.json(
        { error: data.error_description || 'Error en autenticación' },
        { status: response.status }
      );
    }

    console.log('✅ Token intercambiado exitosamente');
    return NextResponse.json({
      access_token: data.access_token,
      refresh_token: data.refresh_token || refresh_token, // Mantener refresh token si no viene nuevo
      expires_in: data.expires_in,
      token_type: data.token_type,
    });

  } catch (error) {
    console.error('❌ Error en autenticación de Spotify:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
