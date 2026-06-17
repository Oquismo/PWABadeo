import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.school.count();
  console.log('Total schools:', count);
  
  const schools = await prisma.school.findMany({ 
    take: 15, 
    select: { id: true, name: true, city: true, country: true, isActive: true } 
  });
  console.log('Sample schools:', JSON.stringify(schools, null, 2));
}

main().then(() => prisma.$disconnect()).catch(e => { console.error(e); prisma.$disconnect(); });
