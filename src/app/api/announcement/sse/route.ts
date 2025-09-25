import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

// Usar variable local por conexión para evitar que todos los usuarios compartan el mismo estado

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const stream = new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(new TextEncoder().encode('retry: 10000\n'));
        let running = true;
        let lastId: number | null = null;

        req.signal.addEventListener('abort', () => {
          running = false;
          try {
            controller.close();
          } catch (error) {
            // Controller might already be closed
          }
        });

        // Al conectar, enviar el anuncio actual una sola vez
        const initial = await prisma.announcement.findFirst({ orderBy: { createdAt: 'desc' } });
        if (initial && running) {
          lastId = initial.id;
          try {
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(initial)}\n\n`));
          } catch (error) {
            running = false;
          }
        }

        while (running) {
          await new Promise(res => setTimeout(res, 2000)); // Chequea cada 2s

          if (!running) break;

          const announcement = await prisma.announcement.findFirst({ orderBy: { createdAt: 'desc' } });
          if (announcement && announcement.id !== lastId && running) {
            lastId = announcement.id;
            try {
              controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(announcement)}\n\n`));
            } catch (error) {
              running = false;
            }
          }
        }

        if (running) {
          controller.close();
        }
      } catch (error) {
        try {
          controller.close();
        } catch (closeError) {
          // Controller might already be closed
        }
      }
    },
    cancel() {
      // Handle client cancellation
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
