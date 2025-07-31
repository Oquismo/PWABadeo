import { NextResponse } from 'next/server';

// Usaremos la parada de "Plaza de Armas" como ejemplo
const STOP_ID = '2001';

// Esta función se ejecutará en el servidor, evitando problemas de CORS
export async function GET() {
  try {
    const response = await fetch(`http://api.ctan.es/v1/co/paradas/${STOP_ID}/estimaciones`);
    
    if (!response.ok) {
      throw new Error(`Error al contactar la API de autobuses: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en la ruta de API /api/bus:', error);
    return NextResponse.json({ error: 'No se pudieron obtener los datos de los autobuses' }, { status: 500 });
  }
}