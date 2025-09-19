import { NextResponse } from 'next/server';
import { pushEvent, getSummary, getEvents } from '@/lib/telemetryStore';
import loggerClient from '@/lib/loggerClient';

// Intentaremos usar Prisma Client si está disponible en tiempo de ejecución.
async function tryPersistToDb(ev: any) {
  try {
    // importar dinámicamente para evitar fallos si prisma client no está generado en algunos entornos
    // eslint-disable-next-line
    const { PrismaClient } = require('@prisma/client');
    // Reutilizar instancia global para evitar crear/destruir en cada petición
    const _global = (globalThis as any);
    if (!_global.__prisma) {
      _global.__prisma = new PrismaClient();
    }
    const prisma = _global.__prisma as any;
    // Insert solo (ADD-ONLY)
    await prisma.telemetryEvent.create({ data: {
      type: ev.type,
      userEmail: ev.userEmail,
      payload: ev.payload,
      // createdAt se genera por defecto
    } });
    return true;
  } catch (err) {
    // No hacer nada destructivo; solo loguear y devolver false para indicar fallback
    const anyErr: any = err;
  loggerClient.warn('Prisma persist failed (will fallback to memory store):', anyErr?.message ?? anyErr);
    return false;
  }
}

function createId() {
  return Math.random().toString(36).slice(2, 9);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const ev = {
      id: createId(),
      type: body.type || 'event',
      userEmail: body.userEmail || null,
      payload: body.payload || null,
      timestamp: new Date().toISOString()
    };
    // Primero intentamos persistir en DB. Si falla, usamos el store en memoria.
    const persisted = await tryPersistToDb(ev);
    if (!persisted) {
      pushEvent(ev as any);
    }
    return NextResponse.json(
      { ok: true, event: ev, persisted },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      }
    );
  } catch (e) {
  loggerClient.error('Error en /api/telemetry POST:', e);
    return NextResponse.json(
      { ok: false, error: 'invalid json' },
      {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      }
    );
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const path = url.searchParams.get('action') || '';

  if (path === 'stream') {
    // SSE stream
    const stream = new ReadableStream({
      start(controller) {
        // send latest events periodically
        const encoder = new TextEncoder();
        let cancelled = false;

        const send = () => {
          if (cancelled || controller.desiredSize === null || controller.desiredSize <= 0) {
            return;
          }

          try {
            const data = JSON.stringify({ time: new Date().toISOString(), events: getEvents().slice(0, 20) });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          } catch (error) {
            // Stream might be closed, stop the interval
            loggerClient.warn('Error sending telemetry data, stream might be closed:', error);
            cancelled = true;
            clearInterval(id);
          }
        };

        // initial
        send();
        const id = setInterval(send, 2000);

        return () => {
          cancelled = true;
          clearInterval(id);
          try {
            controller.close();
          } catch (error) {
            // Controller might already be closed
            loggerClient.debug('Controller already closed during cleanup');
          }
        };
      },
      cancel() {
        loggerClient.debug('Telemetry stream cancelled by client');
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive'
      }
    });
  }

  // default: summary
  try {
    const summary = getSummary();
    return NextResponse.json(
      { ok: true, summary },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      }
    );
  } catch (e) {
  loggerClient.error('Error en /api/telemetry GET:', e);
    return NextResponse.json(
      { ok: false },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      }
    );
  }
}
