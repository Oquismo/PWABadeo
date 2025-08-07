import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
// Usar variable local por conexión para evitar que todos los usuarios compartan el mismo estado

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(new TextEncoder().encode('retry: 10000\n'));
      let running = true;
      let lastId: number | null = null;
      req.signal.addEventListener('abort', () => { running = false; });
      // Al conectar, enviar el anuncio actual una sola vez
      const initial = await prisma.announcement.findFirst({ orderBy: { createdAt: 'desc' } });
      if (initial) {
        lastId = initial.id;
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(initial)}\n\n`));
      }
      while (running) {
        await new Promise(res => setTimeout(res, 2000)); // Chequea cada 2s
        const announcement = await prisma.announcement.findFirst({ orderBy: { createdAt: 'desc' } });
        if (announcement && announcement.id !== lastId) {
          lastId = announcement.id;
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(announcement)}\n\n`));
        }
      }
      controller.close();
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
