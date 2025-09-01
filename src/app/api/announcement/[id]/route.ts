import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Función helper para verificar permisos de administrador
async function verifyAdminPermissions(userId: number): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });
    return user?.role === 'admin';
  } catch (error) {
    console.error('Error verifying admin permissions:', error);
    return false;
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

    // Obtener userId del body de la petición (siguiendo el patrón de la app)
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId requerido' }, { status: 400 });
    }

    // Verificar que el usuario sea administrador
    const isAdmin = await verifyAdminPermissions(userId);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Solo los administradores pueden eliminar anuncios' }, { status: 403 });
    }

    await prisma.announcement.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    return NextResponse.json({ error: 'Error al eliminar el anuncio.' }, { status: 500 });
  }
}