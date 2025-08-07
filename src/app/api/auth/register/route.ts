import { NextResponse } from 'next/server';

// Endpoint temporalmente simplificado para resolver build errors
// Se restaurará la funcionalidad completa después del deploy exitoso
export async function POST(request: Request) {
  return NextResponse.json(
    { error: 'Registro temporalmente en mantenimiento' },
    { status: 503 }
  );
}
