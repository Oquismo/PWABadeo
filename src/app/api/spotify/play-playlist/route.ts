import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🎵 Solicitud para reproducir playlist recibida');

  try {
    const { playlistId } = await request.json();
    console.log('📋 Playlist ID:', playlistId);

    if (!playlistId) {
      console.error('❌ No se proporcionó playlistId');
      return NextResponse.json(
        { error: 'Playlist ID is required' },
        { status: 400 }
      );
    }

    // Obtener el token de acceso desde las cookies o headers
    // Nota: En producción, esto debería venir de una sesión segura
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ No hay token de autorización');
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    const accessToken = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Obtener información del dispositivo del usuario
    // Primero necesitamos obtener los dispositivos disponibles
    const devicesResponse = await fetch('https://api.spotify.com/v1/me/player/devices', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!devicesResponse.ok) {
      console.error('❌ Error obteniendo dispositivos');
      return NextResponse.json(
        { error: 'Failed to get devices' },
        { status: devicesResponse.status }
      );
    }

    const devicesData = await devicesResponse.json();
    console.log('📱 Dispositivos disponibles:', devicesData.devices?.length || 0);

    // Buscar el dispositivo web (este navegador)
    const webDevice = devicesData.devices?.find((device: any) =>
      device.name === 'Clima Music Player' || device.type === 'Computer'
    );

    if (!webDevice) {
      console.error('❌ No se encontró el dispositivo web');
      return NextResponse.json(
        { error: 'Web device not found. Make sure the Spotify Web Player is active.' },
        { status: 404 }
      );
    }

    console.log('🎯 Dispositivo web encontrado:', webDevice.name, webDevice.id);

    // Transferir la reproducción al dispositivo web
    const transferResponse = await fetch('https://api.spotify.com/v1/me/player', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        device_ids: [webDevice.id],
        play: false
      })
    });

    if (!transferResponse.ok) {
      const errorData = await transferResponse.text();
      console.error('❌ Error transfiriendo reproducción:', errorData);
      return NextResponse.json(
        { error: 'Failed to transfer playback' },
        { status: transferResponse.status }
      );
    }

    // Esperar un momento para que la transferencia se complete
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Ahora reproducir la playlist en el dispositivo web
    const playResponse = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${webDevice.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        context_uri: `spotify:playlist:${playlistId}`,
        position_ms: 0
      })
    });

    if (!playResponse.ok) {
      const errorData = await playResponse.text();
      console.error('❌ Error reproduciendo playlist:', errorData);
      return NextResponse.json(
        { error: 'Failed to start playlist playback' },
        { status: playResponse.status }
      );
    }

    console.log('✅ Playlist iniciada correctamente en el dispositivo web');

    return NextResponse.json({
      success: true,
      message: 'Playlist started successfully',
      device: {
        id: webDevice.id,
        name: webDevice.name,
        type: webDevice.type
      }
    });

  } catch (error) {
    console.error('❌ Error en /api/spotify/play-playlist:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
