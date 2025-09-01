// Script para crear una escuela de ejemplo en la base de datos
const { PrismaClient } = require('@prisma/client');

async function createExampleSchool() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🏫 Creando escuela de ejemplo...');
    
    const exampleSchool = await prisma.school.create({
      data: {
        name: "CEIP Miguel de Cervantes",
        address: "Calle de la Educación, 123",
        city: "Madrid",
        province: "Madrid", 
        country: "España",
        phoneNumber: "+34 91 123 45 67",
        email: "secretaria@ceip-cervantes.edu.es",
        website: "https://ceip-cervantes.educamadrid.org",
        type: "pública",
        level: "primaria",
        description: "Centro educativo público de educación infantil y primaria ubicado en el distrito centro de Madrid. Ofrecemos una educación integral y de calidad con especial atención a la diversidad y la innovación educativa.",
        isActive: true
      }
    });
    
    console.log('✅ Escuela creada exitosamente:', exampleSchool);
    console.log(`📋 ID de la escuela: ${exampleSchool.id}`);
    console.log(`🏫 Nombre: ${exampleSchool.name}`);
    console.log(`📍 Ubicación: ${exampleSchool.address}, ${exampleSchool.city}`);
    
  } catch (error) {
    console.error('❌ Error al crear la escuela:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la función
createExampleSchool();
