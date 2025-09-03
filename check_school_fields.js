const { PrismaClient } = require('@prisma/client');

async function checkSchoolFields() {
  const prisma = new PrismaClient();
  try {
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'School' AND table_schema = 'public'
      ORDER BY column_name;
    `;
    console.log('Campos de la tabla School:', result);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSchoolFields();
