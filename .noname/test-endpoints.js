const { PrismaClient } = require('@prisma/client');

async function testAllEndpoints() {
  console.log('🌐 Probando todos los endpoints de la API...\n');
  
  const baseUrl = 'http://localhost:3000';
  
  // Lista de endpoints para probar
  const endpoints = [
    {
      name: 'Escuelas',
      method: 'GET',
      url: '/api/schools',
      expectSuccess: true
    },
    {
      name: 'Tareas',
      method: 'GET', 
      url: '/api/tasks',
      expectSuccess: true
    },
    {
      name: 'Anuncios',
      method: 'GET',
      url: '/api/announcement/all',
      expectSuccess: true
    },
    {
      name: 'Crear escuela (admin)',
      method: 'POST',
      url: '/api/admin/schools',
      body: {
        name: 'Escuela de Prueba API',
        city: 'Madrid',
        type: 'pública',
        level: 'primaria',
        description: 'Escuela creada para probar el API'
      },
      expectSuccess: true
    },
    {
      name: 'Reset de contraseña (solicitud)',
      method: 'POST',
      url: '/api/auth/forgot-password',
      body: {
        email: 'rovetta215@gmail.com'
      },
      expectSuccess: true
    }
  ];

  let successCount = 0;
  let failCount = 0;

  for (const [index, endpoint] of endpoints.entries()) {
    try {
      console.log(`${index + 1}. Probando ${endpoint.name}...`);
      
      const options = {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
        }
      };

      if (endpoint.body) {
        options.body = JSON.stringify(endpoint.body);
      }

      const response = await fetch(`${baseUrl}${endpoint.url}`, options);
      const data = await response.json();

      if (response.ok) {
        console.log(`   ✅ ${endpoint.name} - Status: ${response.status}`);
        
        // Mostrar información relevante según el endpoint
        if (endpoint.url === '/api/schools') {
          console.log(`   📊 Escuelas encontradas: ${data.schools?.length || 0}`);
        } else if (endpoint.url === '/api/tasks') {
          console.log(`   📋 Tareas encontradas: ${data.tasks?.length || 0}`);
        } else if (endpoint.url === '/api/announcement/all') {
          console.log(`   📢 Anuncios encontrados: ${data.announcements?.length || 0}`);
        } else if (endpoint.url === '/api/admin/schools') {
          console.log(`   🏫 Escuela creada con ID: ${data.school?.id || 'N/A'}`);
        } else if (endpoint.url === '/api/auth/forgot-password') {
          console.log(`   📧 Email de reset: ${data.success ? 'Enviado' : 'Error'}`);
        }
        
        successCount++;
      } else {
        console.log(`   ❌ ${endpoint.name} - Status: ${response.status}`);
        console.log(`   Error: ${data.error || 'Error desconocido'}`);
        failCount++;
      }
      
    } catch (error) {
      console.log(`   ❌ ${endpoint.name} - Error de conexión: ${error.message}`);
      failCount++;
    }
    
    console.log(''); // Línea en blanco para separar
  }

  // Resumen final
  console.log('📊 Resumen de pruebas:');
  console.log(`   ✅ Exitosas: ${successCount}`);
  console.log(`   ❌ Fallidas: ${failCount}`);
  console.log(`   📈 Tasa de éxito: ${Math.round((successCount / endpoints.length) * 100)}%`);

  if (failCount === 0) {
    console.log('\n🎉 ¡Todos los endpoints funcionan correctamente!');
  } else {
    console.log('\n⚠️ Algunos endpoints necesitan revisión.');
  }

  // Verificar estado de la base de datos
  console.log('\n🔍 Verificando estado final de la base de datos...');
  
  const prisma = new PrismaClient();
  try {
    const counts = await Promise.all([
      prisma.user.count(),
      prisma.school.count(),
      prisma.task.count(),
      prisma.announcement.count(),
      prisma.log.count(),
      prisma.passwordResetToken.count()
    ]);

    console.log('   📊 Conteos actuales:');
    console.log(`   - Usuarios: ${counts[0]}`);
    console.log(`   - Escuelas: ${counts[1]}`);
    console.log(`   - Tareas: ${counts[2]}`);
    console.log(`   - Anuncios: ${counts[3]}`);
    console.log(`   - Logs: ${counts[4]}`);
    console.log(`   - Tokens reset: ${counts[5]}`);

  } catch (error) {
    console.log('   ❌ Error verificando base de datos:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testAllEndpoints();
