import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🔄 Recibida solicitud POST a /api/spotify/auth');

  try {
    const { code, code_verifier, redirect_uri } = await request.json();
    console.log('📋 Datos recibidos:', {
      code: code ? 'PRESENTE' : 'NO PRESENTE',
      code_verifier: code_verifier ? 'PRESENTE' : 'NO PRESENTE',
      redirect_uri
    });

    if (!code || !code_verifier || !redirect_uri) {
      console.error('❌ Faltan parámetros requeridos');
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    console.log('🔑 Credenciales:', {
      clientId: clientId ? 'CONFIGURADO' : 'NO CONFIGURADO',
      clientSecret: clientSecret ? 'CONFIGURADO' : 'NO CONFIGURADO'
    });

    if (!clientId || !clientSecret) {
      console.error('❌ Credenciales de Spotify no configuradas');
      return NextResponse.json(
        { error: 'Spotify credentials not configured' },
        { status: 500 }
      );
    }

    // Crear las credenciales en base64 para Basic Auth
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    console.log('🔐 Credenciales codificadas en base64');

    // Preparar los datos para el POST a Spotify
    const tokenRequestData = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirect_uri,
      code_verifier: code_verifier,
      client_id: clientId,
    });

    console.log('📡 Enviando solicitud a Spotify API...');

    // Hacer la solicitud a la API de Spotify
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
      body: tokenRequestData,
    });

    console.log('📥 Respuesta de Spotify:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Error de Spotify:', errorData);
      return NextResponse.json(
        { error: 'Failed to exchange code for token', details: errorData },
        { status: response.status }
      );
    }

    const tokenData = await response.json();
    console.log('✅ Token obtenido exitosamente:', {
      access_token: tokenData.access_token ? 'PRESENTE' : 'NO PRESENTE',
      refresh_token: tokenData.refresh_token ? 'PRESENTE' : 'NO PRESENTE',
      expires_in: tokenData.expires_in,
      token_type: tokenData.token_type
    });

    // Devolver los tokens al cliente
    return NextResponse.json({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      token_type: tokenData.token_type,
    });

  } catch (error) {
    console.error('❌ Error en /api/spotify/auth:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
