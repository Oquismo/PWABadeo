import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { logActionServer } from '@/lib/logger';

// Nota: Autenticación sencilla basada en userId enviado en body/query (mejorar a futuro con sesión real/JWT)

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const userId = searchParams.get('userId');
    const schoolId = searchParams.get('schoolId');
    
    const tasksClient = (prisma as any).task;
    
    let whereCondition: any = {};
    
    // Filtrar por rol si se especifica
    if (role) {
      whereCondition.role = role;
    }
    
    // Si se especifica schoolId o userId, filtrar tasks asignadas a esa escuela o tasks comunes
    if (schoolId || userId) {
      // Si se pasa userId, obtener su schoolId
      let userSchoolId = schoolId;
      if (userId && !schoolId) {
        const user = await prisma.user.findUnique({
          where: { id: parseInt(userId) },
          select: { schoolId: true }
        });
        userSchoolId = user?.schoolId ? user.schoolId.toString() : null;
      }
      
      if (userSchoolId) {
        whereCondition = {
          ...whereCondition,
          OR: [
            { comun: true }, // Tasks comunes para todas las escuelas
            { 
              schools: {
                some: { id: parseInt(userSchoolId) }
              }
            } // Tasks específicas de la escuela
          ]
        };
      }
    }
    
    const tasks = await tasksClient.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
      include: {
        schools: {
          select: {
            id: true,
            name: true,
            city: true,
            type: true,
            level: true
          }
        },
        user: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });
    
    // Seed básico si vacío
    if (!tasks.length && !schoolId && !userId) {
      await tasksClient.createMany({
        data: [
          { title: 'Proyecto Base', description: 'Ejemplo inicial', color: 'linear-gradient(135deg,#667eea,#764ba2)', role: 'user', progress: 0, comun: true },
          { title: 'Coordinación', description: 'Card admin de ejemplo', color: 'linear-gradient(135deg,#f093fb,#f5576c)', role: 'admin', progress: 0, comun: true }
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
    const { title, description, color, date, role = 'user', avatars, progress = 0, userId, comun = false, schoolIds = [] } = body;

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

    const taskData: any = {
      title,
      description,
      color,
      date,
      role,
      avatars: avatars ? avatars : undefined,
      progress,
      comun,
      createdBy: userId
    };

    // Si se especifican schoolIds, conectar la task con esas escuelas
    if (schoolIds.length > 0 && !comun) {
      taskData.schools = {
        connect: schoolIds.map((id: number) => ({ id }))
      };
    }

    const task = await (prisma as any).task.create({
      data: taskData,
      include: {
        schools: {
          select: {
            id: true,
            name: true,
            city: true,
            type: true,
            level: true
          }
        },
        user: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    await logActionServer({ userId, action: 'task_create', meta: { id: task.id, role, comun, schoolIds } });
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
