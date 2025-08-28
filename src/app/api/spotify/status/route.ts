import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'API de Spotify funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: {
      node_env: process.env.NODE_ENV,
      nextauth_url: process.env.NEXTAUTH_URL,
      spotify_client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID ? 'CONFIGURADO' : 'NO CONFIGURADO',
      spotify_redirect_uri: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI,
    }
  });
}
