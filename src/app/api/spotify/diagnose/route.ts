import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const timestamp = new Date().toISOString();

  // Configuración actual
  const currentConfig = {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    SPOTIFY_REDIRECT_URI: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI,
    SPOTIFY_CLIENT_ID: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID ? 'CONFIGURADO' : 'NO CONFIGURADO',
    serverPort: process.env.PORT || '3001',
    nodeEnv: process.env.NODE_ENV
  };

  // URLs esperadas
  const expectedUrls = {
    redirectUri: `${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/api/spotify/callback`,
    callbackUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/api/spotify/callback`,
    authUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/api/spotify/auth`,
    statusUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/api/spotify/status`
  };

  // Diagnóstico
  const diagnosis = {
    redirectUriCorrect: currentConfig.SPOTIFY_REDIRECT_URI === expectedUrls.redirectUri,
    clientIdConfigured: currentConfig.SPOTIFY_CLIENT_ID === 'CONFIGURADO',
    nextAuthConfigured: !!currentConfig.NEXTAUTH_URL,
    portConsistent: currentConfig.NEXTAUTH_URL?.includes('3001') || false
  };

  const issues = [];
  if (!diagnosis.redirectUriCorrect) {
    issues.push({
      type: 'redirect_uri_mismatch',
      message: `El redirect URI configurado (${currentConfig.SPOTIFY_REDIRECT_URI}) no coincide con el esperado (${expectedUrls.redirectUri})`,
      solution: `Actualiza NEXT_PUBLIC_SPOTIFY_REDIRECT_URI en .env.local a: ${expectedUrls.redirectUri}`
    });
  }
  if (!diagnosis.clientIdConfigured) {
    issues.push({
      type: 'client_id_missing',
      message: 'El Client ID de Spotify no está configurado',
      solution: 'Configura NEXT_PUBLIC_SPOTIFY_CLIENT_ID en .env.local'
    });
  }
  if (!diagnosis.nextAuthConfigured) {
    issues.push({
      type: 'nextauth_missing',
      message: 'NEXTAUTH_URL no está configurado',
      solution: 'Configura NEXTAUTH_URL en .env.local'
    });
  }
  if (!diagnosis.portConsistent) {
    issues.push({
      type: 'port_inconsistent',
      message: 'El puerto en NEXTAUTH_URL no coincide con el puerto del servidor',
      solution: 'Asegúrate de que NEXTAUTH_URL use el puerto 3001'
    });
  }

  return NextResponse.json({
    timestamp,
    status: issues.length === 0 ? 'success' : 'issues_found',
    currentConfig,
    expectedUrls,
    diagnosis,
    issues,
    spotifyDashboard: {
      requiredRedirectUri: expectedUrls.redirectUri,
      dashboardUrl: 'https://developer.spotify.com/dashboard',
      instructions: 'Ve a tu app en Spotify Dashboard > Edit Settings > Redirect URIs y configura exactamente: ' + expectedUrls.redirectUri
    }
  });
}
