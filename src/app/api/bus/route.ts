import { NextResponse } from 'next/server';

// Usaremos la parada de "Plaza de Armas" como ejemplo
const STOP_ID = '2001';

// Esta función se ejecutará en el servidor, evitando problemas de CORS
export async function GET() {
  try {
    // Solo devolver datos mockeados para evitar problemas en build
    const mockData = {
      parada: "Plaza de Armas",
      estimaciones: [
        { linea: "L1", destino: "Centro", tiempo: "5 min" },
        { linea: "L2", destino: "Universidad", tiempo: "12 min" },
        { linea: "L3", destino: "Hospital", tiempo: "8 min" }
      ]
    };
    
    return NextResponse.json(mockData);

  } catch (error) {
    console.error('Error en la ruta de API /api/bus:', error);
    return NextResponse.json({ 
      error: 'No se pudieron obtener los datos de los autobuses',
      parada: "Plaza de Armas",
      estimaciones: []
    }, { status: 200 });
  }
}

export const dynamic = 'force-dynamic';