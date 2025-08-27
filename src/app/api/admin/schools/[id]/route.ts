import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const schoolId = parseInt(params.id, 10);
    if (isNaN(schoolId)) {
      return NextResponse.json(
        { error: 'ID de escuela inválido' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      name,
      address,
      city,
      province,
      country,
      phoneNumber,
      email,
      website,
      type,
      level,
      description
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'El nombre de la escuela es obligatorio' },
        { status: 400 }
      );
    }

    const [{ PrismaClient }] = await Promise.all([
      import('@prisma/client').catch(err => {
        console.error('Failed to import PrismaClient:', err);
        throw new Error('Prisma import failed: ' + err.message);
      })
    ]);

    const prisma = new PrismaClient({
      log: ['error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });

    try {
      await prisma.$connect();

      // Verificar si la escuela existe
      const existingSchool = await (prisma as any).school.findUnique({
        where: { id: schoolId }
      });

      if (!existingSchool) {
        return NextResponse.json(
          { error: 'Escuela no encontrada' },
          { status: 404 }
        );
      }

      // Verificar si el nombre ya está en uso por otra escuela
      const nameConflict = await (prisma as any).school.findFirst({
        where: {
          name: name.trim(),
          id: { not: schoolId }
        }
      });

      if (nameConflict) {
        return NextResponse.json(
          { error: 'Ya existe otra escuela con ese nombre' },
          { status: 409 }
        );
      }

      // Preparar datos de actualización
      const updateData: any = {
        name: name.trim(),
        type,
        level,
        country
      };

      // Agregar campos opcionales (usar null para limpiar valores vacíos)
      updateData.address = address && address.trim() ? address.trim() : null;
      updateData.city = city && city.trim() ? city.trim() : null;
      updateData.province = province && province.trim() ? province.trim() : null;
      updateData.phoneNumber = phoneNumber && phoneNumber.trim() ? phoneNumber.trim() : null;
      updateData.email = email && email.trim() ? email.trim() : null;
      updateData.website = website && website.trim() ? website.trim() : null;
      updateData.description = description && description.trim() ? description.trim() : null;

      // Actualizar la escuela
      const updatedSchool = await (prisma as any).school.update({
        where: { id: schoolId },
        data: updateData,
        include: {
          users: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              name: true,
              email: true
            }
          }
        }
      });

      return NextResponse.json({
        message: 'Escuela actualizada exitosamente',
        school: updatedSchool
      });

    } finally {
      await prisma.$disconnect();
    }

  } catch (error) {
    console.error('Error al actualizar escuela:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const schoolId = parseInt(params.id, 10);
    if (isNaN(schoolId)) {
      return NextResponse.json(
        { error: 'ID de escuela inválido' },
        { status: 400 }
      );
    }

    const [{ PrismaClient }] = await Promise.all([
      import('@prisma/client').catch(err => {
        console.error('Failed to import PrismaClient:', err);
        throw new Error('Prisma import failed: ' + err.message);
      })
    ]);

    const prisma = new PrismaClient({
      log: ['error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });

    try {
      await prisma.$connect();

      // Verificar si la escuela existe y tiene usuarios asociados
      const school = await (prisma as any).school.findUnique({
        where: { id: schoolId },
        include: {
          users: true
        }
      });

      if (!school) {
        return NextResponse.json(
          { error: 'Escuela no encontrada' },
          { status: 404 }
        );
      }

      if (school.users && school.users.length > 0) {
        return NextResponse.json(
          { 
            error: `No se puede eliminar la escuela porque tiene ${school.users.length} usuario(s) asociado(s)`,
            userCount: school.users.length
          },
          { status: 400 }
        );
      }

      // Eliminar la escuela
      await (prisma as any).school.delete({
        where: { id: schoolId }
      });

      return NextResponse.json({
        message: 'Escuela eliminada exitosamente'
      });

    } finally {
      await prisma.$disconnect();
    }

  } catch (error) {
    console.error('Error al eliminar escuela:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
