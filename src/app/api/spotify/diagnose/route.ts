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

  // Determinar si estamos en desarrollo o producción
  const isDevelopment = currentConfig.NEXTAUTH_URL?.includes('localhost') || 
                       currentConfig.NEXTAUTH_URL?.includes('127.0.0.1') || false;
  
  // Diagnóstico
  const diagnosis = {
    redirectUriCorrect: currentConfig.SPOTIFY_REDIRECT_URI === expectedUrls.redirectUri,
    clientIdConfigured: currentConfig.SPOTIFY_CLIENT_ID === 'CONFIGURADO',
    nextAuthConfigured: !!currentConfig.NEXTAUTH_URL,
    portConsistent: isDevelopment ? 
      (currentConfig.NEXTAUTH_URL?.includes('3001') || false) : 
      !currentConfig.NEXTAUTH_URL?.includes('3001') || false
  };

  // Probar conectividad con Spotify
  let spotifyConnectivity = 'NO PROBADO';
  try {
    const testResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': 'Bearer test'
      }
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
      message: `El redirect URI configurado (${currentConfig.SPOTIFY_REDIRECT_URI}) no coincide con el esperado (${expectedUrls.redirectUri})`,
      solution: `Actualiza NEXT_PUBLIC_SPOTIFY_REDIRECT_URI en ${envFile} a: ${expectedUrls.redirectUri}`
    });
  }
  if (!diagnosis.clientIdConfigured) {
    issues.push({
      type: 'client_id_missing',
      message: 'El Client ID de Spotify no está configurado',
      solution: `Configura NEXT_PUBLIC_SPOTIFY_CLIENT_ID en ${envFile}`
    });
  }
  if (!diagnosis.nextAuthConfigured) {
    issues.push({
      type: 'nextauth_missing',
      message: 'NEXTAUTH_URL no está configurado',
      solution: `Configura NEXTAUTH_URL en ${envFile}`
    });
  }
  if (!diagnosis.portConsistent) {
    const portMessage = isDevelopment 
      ? 'El puerto en NEXTAUTH_URL no es 3001'
      : 'NEXTAUTH_URL tiene un puerto específico (no necesario en producción)';
    const portSolution = isDevelopment
      ? 'Asegúrate de que NEXTAUTH_URL sea http://localhost:3001'
      : 'Quita el puerto específico de NEXTAUTH_URL (ej: https://tu-dominio.com)';
    
    issues.push({
      type: 'port_inconsistent',
      message: portMessage,
      solution: portSolution
    });
  }

  return NextResponse.json({
    timestamp,
    status: issues.length === 0 ? 'success' : 'issues_found',
    currentConfig,
    expectedUrls,
    diagnosis: {
      ...diagnosis,
      spotifyConnectivity
    },
    issues,
    spotifyDashboard: {
      requiredRedirectUri: expectedUrls.redirectUri,
      dashboardUrl: 'https://developer.spotify.com/dashboard',
      environment: isDevelopment ? 'desarrollo' : 'producción',
      instructions: `Ve a tu app en Spotify Dashboard > Edit Settings > Redirect URIs y configura exactamente: ${expectedUrls.redirectUri}`,
      note: isDevelopment 
        ? 'Esta configuración es solo para desarrollo local. En producción necesitarás una URI diferente.'
        : 'Esta es la configuración correcta para producción.'
    }
  });
}
