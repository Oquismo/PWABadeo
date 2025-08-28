import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.url;
  const method = request.method;
  const userAgent = request.headers.get('user-agent') || 'Unknown';
  const timestamp = new Date().toISOString();

  console.log('🌐 Endpoint de prueba llamado:', {
    url,
    method,
    userAgent,
    timestamp
  });

  return NextResponse.json({
    status: 'success',
    message: 'Endpoint funcionando correctamente',
    timestamp,
    request: {
      url,
      method,
      userAgent: userAgent.substring(0, 100)
    },
    environment: {
      node_env: process.env.NODE_ENV,
      nextauth_url: process.env.NEXTAUTH_URL,
      spotify_client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID ? 'CONFIGURADO' : 'NO CONFIGURADO',
      spotify_redirect_uri: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI
    }
  });
}
