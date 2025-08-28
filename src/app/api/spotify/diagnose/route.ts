import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const timestamp = new Date().toISOString();

  // Detectar dinámicamente la URL base
  const host = request.headers.get('host') || 'localhost:3001';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const detectedBaseUrl = `${protocol}://${host}`;

  console.log('🔍 Diagnóstico de Spotify - URL detectada:', detectedBaseUrl);

  // Configuración actual
  const currentConfig = {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    SPOTIFY_REDIRECT_URI: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI,
    SPOTIFY_CLIENT_ID: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID ? 'CONFIGURADO' : 'NO CONFIGURADO',
    SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET ? 'CONFIGURADO' : 'NO CONFIGURADO',
    serverPort: process.env.PORT || '3001',
    nodeEnv: process.env.NODE_ENV,
    detectedBaseUrl
  };

  // URLs calculadas dinámicamente
  const calculatedUrls = {
    redirectUri: `${detectedBaseUrl}/api/spotify/callback`,
    callbackUrl: `${detectedBaseUrl}/api/spotify/callback`,
    authUrl: `${detectedBaseUrl}/api/spotify/auth`,
    statusUrl: `${detectedBaseUrl}/api/spotify/status`,
    diagnoseUrl: `${detectedBaseUrl}/api/spotify/diagnose`
  };

  // URLs esperadas (para compatibilidad)
  const expectedUrls = {
    redirectUri: process.env.NEXTAUTH_URL
      ? `${process.env.NEXTAUTH_URL}/api/spotify/callback`
      : calculatedUrls.redirectUri,
    callbackUrl: process.env.NEXTAUTH_URL
      ? `${process.env.NEXTAUTH_URL}/api/spotify/callback`
      : calculatedUrls.callbackUrl,
    authUrl: process.env.NEXTAUTH_URL
      ? `${process.env.NEXTAUTH_URL}/api/spotify/auth`
      : calculatedUrls.authUrl,
    statusUrl: process.env.NEXTAUTH_URL
      ? `${process.env.NEXTAUTH_URL}/api/spotify/status`
      : calculatedUrls.statusUrl
  };

  // Determinar si estamos en desarrollo o producción
  const isDevelopment = detectedBaseUrl.includes('localhost') ||
                       detectedBaseUrl.includes('127.0.0.1') ||
                       host.includes('localhost');

  // Diagnóstico mejorado
  const diagnosis = {
    redirectUriCorrect: currentConfig.SPOTIFY_REDIRECT_URI === calculatedUrls.redirectUri,
    clientIdConfigured: currentConfig.SPOTIFY_CLIENT_ID === 'CONFIGURADO',
    clientSecretConfigured: currentConfig.SPOTIFY_CLIENT_SECRET === 'CONFIGURADO',
    nextAuthConfigured: !!currentConfig.NEXTAUTH_URL,
    usingDynamicDetection: !process.env.NEXTAUTH_URL || process.env.NEXTAUTH_URL !== detectedBaseUrl,
    portConsistent: isDevelopment ?
      (detectedBaseUrl.includes('3001') || detectedBaseUrl.includes('localhost')) :
      !detectedBaseUrl.includes(':3001')
  };

  // Probar conectividad con Spotify
  let spotifyConnectivity = 'NO PROBADO';
  try {
    const testResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': 'Bearer test'
      },
      signal: AbortSignal.timeout(5000)
    });
    spotifyConnectivity = testResponse.status === 401 ? 'CONECTIVIDAD OK' : 'ERROR DE CONECTIVIDAD';
  } catch (error) {
    spotifyConnectivity = 'ERROR DE RED';
  }

  const envFile = isDevelopment ? '.env.local' : '.env.production';
  
  const issues = [];
  if (!diagnosis.redirectUriCorrect) {
    issues.push({
      type: 'redirect_uri_mismatch',
      message: `El redirect URI configurado (${currentConfig.SPOTIFY_REDIRECT_URI}) no coincide con el detectado dinámicamente (${calculatedUrls.redirectUri})`,
      solution: `Actualiza NEXT_PUBLIC_SPOTIFY_REDIRECT_URI en ${envFile} a: ${calculatedUrls.redirectUri}`
    });
  }
  if (!diagnosis.clientIdConfigured) {
    issues.push({
      type: 'client_id_missing',
      message: 'El Client ID de Spotify no está configurado',
      solution: `Configura NEXT_PUBLIC_SPOTIFY_CLIENT_ID en ${envFile}`
    });
  }
  if (!diagnosis.clientSecretConfigured) {
    issues.push({
      type: 'client_secret_missing',
      message: 'El Client Secret de Spotify no está configurado',
      solution: `Configura SPOTIFY_CLIENT_SECRET en ${envFile}`
    });
  }
  if (!diagnosis.portConsistent) {
    const portMessage = isDevelopment
      ? 'El puerto detectado no es consistente con desarrollo'
      : 'El puerto detectado no es consistente con producción';
    const portSolution = isDevelopment
      ? 'Asegúrate de que la aplicación esté corriendo en el puerto correcto (3001)'
      : 'Verifica que la URL de producción esté configurada correctamente';

    issues.push({
      type: 'port_inconsistent',
      message: portMessage,
      solution: portSolution
    });
  }

  return NextResponse.json({
    timestamp,
    status: issues.length === 0 ? 'success' : 'issues_found',
    environment: {
      isDevelopment,
      detectedBaseUrl,
      usingDynamicDetection: diagnosis.usingDynamicDetection
    },
    currentConfig,
    calculatedUrls,
    expectedUrls,
    diagnosis: {
      ...diagnosis,
      spotifyConnectivity
    },
    issues,
    spotifyDashboard: {
      requiredRedirectUri: calculatedUrls.redirectUri,
      dashboardUrl: 'https://developer.spotify.com/dashboard',
      environment: isDevelopment ? 'desarrollo' : 'producción',
      instructions: `Ve a tu app en Spotify Dashboard > Edit Settings > Redirect URIs y configura exactamente: ${calculatedUrls.redirectUri}`,
      note: isDevelopment
        ? 'Esta configuración es solo para desarrollo local. En producción necesitarás una URI diferente.'
        : 'Esta es la configuración correcta para producción. Asegúrate de que coincida exactamente.',
      troubleshooting: {
        commonIssues: [
          'Asegúrate de que la URI termine con /api/spotify/callback',
          'No agregues parámetros de consulta a la URI',
          'La URI debe ser exactamente igual, sin espacios adicionales',
          'Verifica que no haya caracteres especiales o encoding issues'
        ],
        verificationSteps: [
          '1. Ve a https://developer.spotify.com/dashboard',
          '2. Selecciona tu aplicación',
          '3. Ve a "Edit Settings"',
          '4. En "Redirect URIs", agrega o verifica esta URI exacta',
          '5. Guarda los cambios',
          '6. Espera unos minutos para que los cambios tomen efecto'
        ]
      }
    }
  });
}
