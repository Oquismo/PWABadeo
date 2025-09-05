import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { logActionServer } from '@/lib/logger';

// API para asignar o desasignar tasks a grupos
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { taskId, grupoIds, userId, action } = body; // action: 'assign' | 'unassign'

    if (!taskId || !userId || !action) {
      return NextResponse.json({ 
        error: 'taskId, userId y action son requeridos' 
      }, { status: 400 });
    }

    // Verificar que el usuario sea admin
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Solo admin puede asignar tasks a grupos' }, { status: 403 });
    }

    // Verificar que la task existe
    const task = await (prisma as any).task.findUnique({ 
      where: { id: taskId },
      include: { grupos: true }
    });
    if (!task) {
      return NextResponse.json({ error: 'Task no encontrada' }, { status: 404 });
    }

    let updatedTask;

    if (action === 'assign') {
      // Asignar task a grupos específicos
      if (!grupoIds || grupoIds.length === 0) {
        return NextResponse.json({ error: 'grupoIds requerido para asignar' }, { status: 400 });
      }

      updatedTask = await (prisma as any).task.update({
        where: { id: taskId },
        data: {
          grupos: {
            connect: grupoIds.map((id: number) => ({ id }))
          },
          comun: false // Si se asigna a grupos específicos, no es común
        },
        include: { 
          grupos: true,
          user: {
            select: { id: true, firstName: true, lastName: true, email: true }
          }
        }
      });

      await logActionServer({ 
        userId, 
        action: 'ASSIGN_TASK_TO_GRUPOS', 
        meta: { taskId, grupoIds, title: task.title } 
      });

    } else if (action === 'unassign') {
      // Desasignar task de todos los grupos (hacerla común)
      updatedTask = await (prisma as any).task.update({
        where: { id: taskId },
        data: {
          grupos: {
            set: [] // Desconectar de todos los grupos
          },
          comun: true // Hacerla común para todos
        },
        include: { 
          grupos: true,
          user: {
            select: { id: true, firstName: true, lastName: true, email: true }
          }
        }
      });

      await logActionServer({ 
        userId, 
        action: 'UNASSIGN_TASK_FROM_GRUPOS', 
        meta: { taskId, title: task.title } 
      });

    } else {
      return NextResponse.json({ error: 'Action debe ser "assign" o "unassign"' }, { status: 400 });
    }

    return NextResponse.json({ task: updatedTask });
  } catch (e: any) {
    return NextResponse.json({ error: 'Error asignando task a grupos', details: e.message }, { status: 500 });
  }
}

// API para obtener las asignaciones de una task específica
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get('taskId');
    const userId = searchParams.get('userId');

    if (!taskId || !userId) {
      return NextResponse.json({ error: 'taskId y userId requeridos' }, { status: 400 });
    }

    // Verificar que el usuario sea admin
    const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Solo admin puede ver asignaciones' }, { status: 403 });
    }

    const task = await (prisma as any).task.findUnique({
      where: { id: parseInt(taskId) },
      include: {
        grupos: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true }
            }
          }
        },
        user: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    if (!task) {
      return NextResponse.json({ error: 'Task no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ task });
  } catch (e: any) {
    return NextResponse.json({ error: 'Error obteniendo asignaciones', details: e.message }, { status: 500 });
  }
}
