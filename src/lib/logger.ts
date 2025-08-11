import { prisma } from './db';

interface LogOptions {
  userId?: number;
  action: string;
  meta?: Record<string, any>;
  updateLastSeen?: boolean;
}

export async function logActionServer({ userId, action, meta, updateLastSeen = false }: LogOptions) {
  try {
    const [log] = await prisma.$transaction([
      prisma.log.create({ data: { action, meta, userId } })
    ]);
    if (updateLastSeen && userId) {
      await prisma.user.update({ where: { id: userId }, data: { lastSeen: new Date() } });
    }
    return log;
  } catch (e) {
    console.error('Failed to log action', action, e);
  }
}

export async function updateUserLastSeen(userId: number) {
  try {
    await prisma.user.update({ where: { id: userId }, data: { lastSeen: new Date() } });
  } catch (e) {
    // swallow errors
  }
}
