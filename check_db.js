const { PrismaClient } = require('@prisma/client');

async function checkSchema() {
  const prisma = new PrismaClient();
  try {
    // Verificar si podemos consultar una escuela con campo town
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'School' AND table_schema = 'public'
      ORDER BY column_name;
    `;
    console.log('Campos de la tabla School:', result);
    
    // Intentar crear una escuela con town para verificar que el campo existe
    console.log('Verificando si el campo town existe...');
    const testQuery = await prisma.school.findFirst({
      select: {
        id: true,
        name: true,
        city: true,
        town: true,
        country: true
      },
      take: 1
    });
    console.log('Campo town existe y es accesible:', testQuery);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSchema();
