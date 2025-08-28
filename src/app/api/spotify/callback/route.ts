import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // URL base de la aplicación (ajusta según tu configuración)
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001';
  console.log('🔄 Callback de Spotify recibido');
  console.log('📋 Parámetros:', { code: code ? 'PRESENTE' : 'NO PRESENTE', error });
  console.log('🏠 Base URL:', baseUrl);

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
