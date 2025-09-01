import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Obtener todas las escuelas con el conteo de usuarios
    const schools = await (prisma as any).school.findMany({
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
        },
        orderBy: {
          name: 'asc'
        }
      });

      return NextResponse.json({
        schools,
        total: schools.length
      });

  } catch (error) {
    console.error('Error al obtener escuelas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      address,
      city,
      province,
      country = 'España',
      phoneNumber,
      email,
      website,
      type = 'pública',
      level = 'primaria',
      description
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'El nombre de la escuela es obligatorio' },
        { status: 400 }
      );
    }

    // Verificar si ya existe una escuela con el mismo nombre
    const existingSchool = await (prisma as any).school.findUnique({
      where: { name: name.trim() }
    });

    if (existingSchool) {
      return NextResponse.json(
        { error: 'Ya existe una escuela con ese nombre' },
          { status: 409 }
        );
      }

      // Crear la nueva escuela
      const schoolData: any = {
        name: name.trim(),
        country,
        type,
        level
      };

      // Agregar campos opcionales solo si tienen valor
      if (address && address.trim()) schoolData.address = address.trim();
      if (city && city.trim()) schoolData.city = city.trim();
      if (province && province.trim()) schoolData.province = province.trim();
      if (phoneNumber && phoneNumber.trim()) schoolData.phoneNumber = phoneNumber.trim();
      if (email && email.trim()) schoolData.email = email.trim();
      if (website && website.trim()) schoolData.website = website.trim();
      if (description && description.trim()) schoolData.description = description.trim();

      const newSchool = await (prisma as any).school.create({
        data: schoolData,
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
        message: 'Escuela creada exitosamente',
        school: newSchool
      });

  } catch (error) {
    console.error('Error al crear escuela:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
