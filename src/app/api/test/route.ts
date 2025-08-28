import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.url;
  const userAgent = request.headers.get('user-agent') || 'Unknown';
  const timestamp = new Date().toISOString();

  console.log('🌐 Solicitud HTTP recibida:', {
    url,
    method: 'GET',
    userAgent,
    timestamp
  });

  return NextResponse.json({
    status: 'ok',
    message: 'Servidor funcionando correctamente',
    timestamp,
    request: {
      url,
      userAgent: userAgent.substring(0, 100) + '...'
    }
  });
}

export async function POST(request: NextRequest) {
  const url = request.url;
  const userAgent = request.headers.get('user-agent') || 'Unknown';
  const timestamp = new Date().toISOString();

  console.log('🌐 Solicitud HTTP POST recibida:', {
    url,
    method: 'POST',
    userAgent,
    timestamp
  });

  try {
    const body = await request.json();
    console.log('📋 Cuerpo de la solicitud:', body);

    return NextResponse.json({
      status: 'ok',
      message: 'POST recibido correctamente',
      timestamp,
      receivedData: body
    });
  } catch (error) {
    console.error('❌ Error procesando POST:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Error procesando la solicitud',
      timestamp
    }, { status: 400 });
  }
}
