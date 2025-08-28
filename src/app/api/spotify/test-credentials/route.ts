import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;

  const status = {
    clientIdConfigured: clientId && clientId !== 'tu_client_id_aqui' && clientId.length > 10,
    clientSecretConfigured: clientSecret && clientSecret !== 'tu_client_secret_aqui' && clientSecret.length > 10,
    redirectUriConfigured: redirectUri && redirectUri.includes('localhost:3000'),
    clientId: clientId ? `${clientId.substring(0, 8)}...` : null,
    redirectUri: redirectUri,
  };

  return NextResponse.json({
    status: 'checked',
    message: status.clientIdConfigured && status.clientSecretConfigured
      ? '✅ Credenciales configuradas correctamente'
      : '❌ Credenciales no configuradas o inválidas',
    details: status,
    instructions: {
      dashboard: 'https://developer.spotify.com/dashboard',
      redirectUri: 'http://localhost:3000/api/spotify/callback'
    }
  });
}
