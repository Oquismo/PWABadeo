import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const schools = [
  // Italia
  { name: 'Liceo Scientifico Statale Augusto Righi', city: 'Roma', province: 'Roma', country: 'Italia', type: 'pública', level: 'secundaria' },
  { name: 'Istituto Tecnico Economico Statale', city: 'Roma', province: 'Roma', country: 'Italia', type: 'pública', level: 'secundaria' },
  { name: 'Liceo Classico Statale Ennio Quirino Visconti', city: 'Roma', province: 'Roma', country: 'Italia', type: 'pública', level: 'secundaria' },
  { name: 'Istituto Professionale IPSIA', city: 'Milano', province: 'Milano', country: 'Italia', type: 'pública', level: 'fp' },
  { name: 'Liceo Linguistico Statale', city: 'Milano', province: 'Milano', country: 'Italia', type: 'pública', level: 'secundaria' },
  { name: 'Istituto Comprensivo Napoli Centro', city: 'Napoli', province: 'Napoli', country: 'Italia', type: 'pública', level: 'primaria' },
  { name: 'Liceo Artistico Statale', city: 'Torino', province: 'Torino', country: 'Italia', type: 'pública', level: 'secundaria' },
  { name: 'Istituto Tecnico Industriale', city: 'Bologna', province: 'Bologna', country: 'Italia', type: 'pública', level: 'secundaria' },
  { name: 'Scuola Primaria Dante Alighieri', city: 'Firenze', province: 'Firenze', country: 'Italia', type: 'pública', level: 'primaria' },
  { name: 'Liceo delle Scienze Umane', city: 'Palermo', province: 'Palermo', country: 'Italia', type: 'pública', level: 'secundaria' },
  // España
  { name: 'IES San Isidro', city: 'Madrid', province: 'Madrid', country: 'España', type: 'pública', level: 'secundaria' },
  { name: 'IES Ramon Llull', city: 'Barcelona', province: 'Barcelona', country: 'España', type: 'pública', level: 'secundaria' },
  { name: 'Colegio Público Santa María', city: 'Toledo', province: 'Toledo', country: 'España', type: 'pública', level: 'primaria' },
  { name: 'IES Cervantes', city: 'Madrid', province: 'Madrid', country: 'España', type: 'pública', level: 'bachillerato' },
  { name: 'Institut Jaume Balmes', city: 'Barcelona', province: 'Barcelona', country: 'España', type: 'pública', level: 'secundaria' },
];

async function main() {
  console.log('🌱 Seeding schools...');

  for (const school of schools) {
    try {
      const created = await prisma.school.create({
        data: school,
      });
      console.log(`✅ Created: ${created.name} (${created.city}, ${created.country})`);
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log(`⏭️  Already exists: ${school.name}`);
      } else {
        console.error(`❌ Error creating ${school.name}:`, error.message);
      }
    }
  }

  const count = await prisma.school.count();
  console.log(`\n📊 Total schools in database: ${count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
