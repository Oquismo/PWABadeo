const { PrismaClient } = require('@prisma/client');

async function updateSchoolsWithTowns() {
  const prisma = new PrismaClient();
  
  try {
    // Obtener todas las escuelas
    const schools = await prisma.school.findMany({
      select: {
        id: true,
        name: true,
        city: true,
        country: true,
        town: true
      }
    });
    
    console.log(`Encontradas ${schools.length} escuelas:`);
    schools.forEach(school => {
      console.log(`- ${school.name} (${school.city}, ${school.country}) - Town: ${school.town || 'sin localidad'}`);
    });
    
    // Definir localidades por ciudad para las escuelas que no tienen
    const cityTowns = {
      // España
      'Madrid': ['Alcalá de Henares', 'Getafe', 'Leganés', 'Móstoles', 'Fuenlabrada'],
      'Barcelona': ['Badalona', 'Hospitalet de Llobregat', 'Sabadell', 'Terrassa', 'Santa Coloma de Gramenet'],
      'Toledo': ['Talavera de la Reina', 'Illescas', 'Seseña', 'Azuqueca de Henares'],
      // Italia
      'Roma': ['Albano Laziale', 'Frascati', 'Tivoli', 'Ostia', 'Anzio'],
      'Milano': ['Monza', 'Bergamo', 'Brescia', 'Como', 'Varese'],
      'Napoli': ['Pompei', 'Caserta', 'Aversa', 'Ercolano', 'Sorrento'],
      'Torino': ['Alba', 'Asti', 'Cuneo', 'Ivrea', 'Pinerolo'],
      'Palermo': ['Bagheria', 'Monreale', 'Carini', 'Cefalù', 'Marsala'],
      'Genova': ['Savona', 'La Spezia', 'Chiavari', 'Rapallo', 'Arenzano'],
      'Bologna': ['Modena', 'Ferrara', 'Imola', 'Parma', 'Reggio Emilia'],
      'Firenze': ['Prato', 'Empoli', 'Pistoia', 'Arezzo', 'Siena'],
      'Venezia': ['Padova', 'Treviso', 'Verona', 'Vicenza', 'Rovigo'],
      'Bari': ['Brindisi', 'Lecce', 'Taranto', 'Foggia', 'Altamura']
    };
    
    let updatesCount = 0;
    
    for (const school of schools) {
      if (!school.town && school.city && cityTowns[school.city]) {
        // Asignar una localidad aleatoria de las disponibles para esa ciudad
        const availableTowns = cityTowns[school.city];
        const randomTown = availableTowns[Math.floor(Math.random() * availableTowns.length)];
        
        await prisma.school.update({
          where: { id: school.id },
          data: { town: randomTown }
        });
        
        console.log(`✅ Actualizada ${school.name}: ${school.city} -> ${randomTown}`);
        updatesCount++;
      }
    }
    
    console.log(`\n✅ Proceso completado. ${updatesCount} escuelas actualizadas con localidades.`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateSchoolsWithTowns();
