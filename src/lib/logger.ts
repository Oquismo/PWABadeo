import { prisma } from './db';

interface LogOptions {
  userId?: number;
  action: string;
  meta?: Record<string, any>;
  updateLastSeen?: boolean;
}

export async function logActionServer({ userId, action, meta, updateLastSeen = false }: LogOptions) {
  try {
    // Intentar crear el log
    let created: any = null;
    try {
      created = await prisma.log.create({ 
        data: { 
          action, 
          meta: meta || {},
          userId 
        } 
      });
      console.log(`📝 Log creado: ${action} para usuario ${userId}`);
    } catch (e: any) {
      console.warn('[logger] Error creando log:', e?.message);
      // No interrumpir el flujo si falla el log
    }

    // Actualizar lastSeen si se solicita
    if (updateLastSeen && userId) {
      try {
        await prisma.user.update({ 
          where: { id: userId }, 
          data: { lastSeen: new Date() } 
        });
        console.log(`⏰ LastSeen actualizado para usuario ${userId}`);
      } catch (e: any) {
        console.warn('[logger] Error actualizando lastSeen:', e?.message);
      }
    }

    return created;
  } catch (e: any) {
    console.error('[logger] Error general en logActionServer:', e?.message);
    // No relanzar error para no interrumpir el flujo principal
    return null;
  }
}
