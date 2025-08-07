import { NextResponse } from 'next/server';

// Endpoint temporal para resolver build - TODO: restaurar funcionalidad completa
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    // Respuesta temporal para evitar errores de build
    return NextResponse.json({
      error: 'Servicio temporalmente no disponible - en mantenimiento'
    }, { status: 503 });
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'Error en el servicio' 
    }, { status: 500 });
  }
}
