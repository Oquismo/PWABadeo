import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // Detectar dinámicamente la URL base
  const host = request.headers.get('host') || 'localhost:3001';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  console.log('🔄 Callback de Spotify recibido');
  console.log('📋 Parámetros:', { code: code ? 'PRESENTE' : 'NO PRESENTE', error });
  console.log('🏠 URL base detectada:', baseUrl);
  console.log('🌐 Host:', host, 'Protocol:', protocol);

  if (error) {
    console.error('❌ Spotify auth error:', error);
    // Redirigir a la página principal con error
    return NextResponse.redirect(`${baseUrl}?spotify_error=${error}`);
  }

  if (!code) {
    console.error('❌ No authorization code received');
    return NextResponse.redirect(`${baseUrl}?spotify_error=no_code`);
  }

  try {
    // Redirigir a la página principal con el código
    // La aplicación manejará el intercambio del código por token
    const redirectUrl = new URL('/', baseUrl);
    redirectUrl.searchParams.set('spotify_code', code);

    console.log('✅ Redirigiendo a:', redirectUrl.toString());
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('❌ Error processing Spotify callback:', error);
    return NextResponse.redirect(`${baseUrl}?spotify_error=callback_error`);
  }
}
