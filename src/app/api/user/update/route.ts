import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userId, 
      name, 
      school, 
      age, 
      arrivalDate, 
      departureDate,
      country,
      city,
      town
    } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'ID de usuario requerido' },
        { status: 400 }
      );
    }

    // Actualizar usuario en la base de datos
    const updateData: any = {
      name,
      age: age ? parseInt(age) : null,
      arrivalDate,
      departureDate,
      country,
      city,
      town,
    };

    // Manejar el campo school si se proporciona
    if (school !== undefined) {
      // Si school es una cadena vacía o null, no conectar ninguna escuela
      if (school && school.trim() !== '') {
        // Buscar la escuela por nombre para conectarla de forma segura
        const foundSchool = await prisma.school.findFirst({
          where: { name: school }
        });
        
        if (foundSchool) {
          updateData.schoolId = foundSchool.id;
        }
      } else {
        // Si school es null o vacío, desconectar la escuela
        updateData.schoolId = null;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: updateData,
      include: {
        school: {
          select: {
            id: true,
            name: true,
            city: true,
            type: true,
            level: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Usuario actualizado correctamente',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
