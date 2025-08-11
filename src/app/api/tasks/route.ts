import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { logActionServer } from '@/lib/logger';

// Nota: Autenticación sencilla basada en userId enviado en body/query (mejorar a futuro con sesión real/JWT)

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const tasksClient = (prisma as any).task;
    const tasks = await tasksClient.findMany({
      where: role ? { role } : {},
      orderBy: { createdAt: 'desc' }
    });
    // Seed básico si vacío
    if (!tasks.length) {
      await tasksClient.createMany({
        data: [
          { title: 'Proyecto Base', description: 'Ejemplo inicial', color: 'linear-gradient(135deg,#667eea,#764ba2)', role: 'user', progress: 0 },
          { title: 'Coordinación', description: 'Card admin de ejemplo', color: 'linear-gradient(135deg,#f093fb,#f5576c)', role: 'admin', progress: 0 }
        ]
      });
      const seeded = await tasksClient.findMany({ orderBy: { createdAt: 'desc' } });
      return NextResponse.json({ tasks: seeded, seeded: true });
    }
    return NextResponse.json({ tasks });
  } catch (e: any) {
    return NextResponse.json({ error: 'Error listando tareas', details: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
  const { title, description, color, date, role = 'user', avatars, progress = 0, userId } = body;

    if (!title || !color) {
      return NextResponse.json({ error: 'title y color requeridos' }, { status: 400 });
    }

    if (role === 'admin') {
      // Verificar que el usuario sea admin
      const user = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Solo admin puede crear tareas admin' }, { status: 403 });
      }
    }

  const task = await (prisma as any).task.create({
      data: {
        title,
        description,
        color,
        date,
        role,
    avatars: avatars ? avatars : undefined,
    progress,
        createdBy: userId
      }
    });

    await logActionServer({ userId, action: 'task_create', meta: { id: task.id, role } });
    return NextResponse.json({ task });
  } catch (e: any) {
    return NextResponse.json({ error: 'Error creando tarea', details: e.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, updates, userId } = body;
    if (!id || !updates) {
      return NextResponse.json({ error: 'id y updates requeridos' }, { status: 400 });
    }

  const existing = await (prisma as any).task.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'No existe' }, { status: 404 });

    if (existing.role === 'admin') {
      const user = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'No autorizado para editar tarea admin' }, { status: 403 });
      }
    }

    // Evitar escalar a admin si no es admin
    if (updates.role === 'admin') {
      const user = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
      if (!user || user.role !== 'admin') {
        delete updates.role;
      }
    }

  const task = await (prisma as any).task.update({ where: { id }, data: { ...updates } });
    await logActionServer({ userId, action: 'task_update', meta: { id } });
    return NextResponse.json({ task });
  } catch (e: any) {
    return NextResponse.json({ error: 'Error actualizando tarea', details: e.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');
    const userIdParam = searchParams.get('userId');
    const id = idParam ? parseInt(idParam, 10) : NaN;
    const userId = userIdParam ? parseInt(userIdParam, 10) : undefined;
    if (isNaN(id)) return NextResponse.json({ error: 'id inválido' }, { status: 400 });

  const existing = await (prisma as any).task.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'No existe' }, { status: 404 });

    if (existing.role === 'admin') {
      const user = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'No autorizado para eliminar tarea admin' }, { status: 403 });
      }
    }

  await (prisma as any).task.delete({ where: { id } });
    await logActionServer({ userId, action: 'task_delete', meta: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: 'Error eliminando tarea', details: e.message }, { status: 500 });
  }
}
