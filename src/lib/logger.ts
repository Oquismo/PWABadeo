import { prisma } from './db';

interface LogOptions {
  userId?: number;
  action: string;
  meta?: Record<string, any>;
  updateLastSeen?: boolean;
}

// Detecta si el cliente Prisma actual conoce el modelo Log
function hasLogModel(p: any) {
  return p && typeof p === 'object' && 'log' in p;
}

// Detecta si el tipo User incluye lastSeen (schema regenerado)
async function tryUpdateLastSeen(userId: number) {
  try {
    // Intento directo (si el client ya tiene el campo)
    await (prisma as any).user.update({ where: { id: userId }, data: { lastSeen: new Date() } });
  } catch (e: any) {
    // Fallback: si el campo no existe todavía en tipos, intentar SQL crudo (ignorando error si tampoco existe en DB)
    try {
      await (prisma as any).$executeRawUnsafe('UPDATE "User" SET "lastSeen" = NOW() WHERE id = $1', userId);
    } catch {}
  }
}

export async function logActionServer({ userId, action, meta, updateLastSeen = false }: LogOptions) {
  try {
    let created: any = null;
    if (hasLogModel(prisma)) {
      try {
        created = await (prisma as any).log.create({ data: { action, meta, userId } });
      } catch (e) {
        // Si falla (por ejemplo tabla aún no creada) ignoramos para no romper flujo
        console.warn('[logger] Falló create Log (posible migración pendiente):', (e as any)?.message);
      }
    } else {
      // Intento de inserción cruda si el modelo no está disponible aún pero la tabla quizá sí
      try {
        await (prisma as any).$executeRawUnsafe(
          'INSERT INTO "Log" (action, meta, "userId") VALUES ($1, $2, $3)',
          action,
          meta ? JSON.stringify(meta) : null,
          userId ?? null
        );
      } catch (e) {
        // Silencioso, solo log para debug
        console.warn('[logger] Insert crudo Log falló:', (e as any)?.message);
      }
    }

    if (updateLastSeen && userId) {
      await tryUpdateLastSeen(userId);
    }

    return created;
  } catch (e) {
    console.error('Failed to log action', action, e);
  }
}

export async function updateUserLastSeen(userId: number) {
  await tryUpdateLastSeen(userId);
}
