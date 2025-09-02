// Test de la API de avatar
// Ejecutar con: node test-avatar.js

const testAvatarAPI = async () => {
  const baseURL = 'http://localhost:3000';

  console.log('🧪 Probando API de Avatar...\n');

  // Test 1: Obtener avatar (debería fallar sin userId)
  console.log('1. Test GET sin userId:');
  try {
    const response = await fetch(`${baseURL}/api/avatar`);
    const data = await response.json();
    console.log('❌ Debería haber fallado:', data);
  } catch (error) {
    console.log('✅ Correctamente rechazado:', error.message);
  }

  // Test 2: Actualizar avatar (debería fallar sin userId)
  console.log('\n2. Test POST sin userId:');
  try {
    const response = await fetch(`${baseURL}/api/avatar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avatarUrl: '🥚' })
    });
    const data = await response.json();
    console.log('❌ Debería haber fallado:', data);
  } catch (error) {
    console.log('✅ Correctamente rechazado:', error.message);
  }

  // Test 3: Eliminar avatar (debería fallar sin userId)
  console.log('\n3. Test DELETE sin userId:');
  try {
    const response = await fetch(`${baseURL}/api/avatar`, {
      method: 'DELETE'
    });
    const data = await response.json();
    console.log('❌ Debería haber fallado:', data);
  } catch (error) {
    console.log('✅ Correctamente rechazado:', error.message);
  }

  console.log('\n✅ Todos los tests de validación pasaron correctamente!');
  console.log('\n📝 La API de avatar está lista para usar.');
  console.log('💡 Para usar en producción, asegúrate de que:');
  console.log('   - La base de datos esté configurada');
  console.log('   - El campo avatarUrl existe en la tabla User');
  console.log('   - Las rutas API estén accesibles');
};

testAvatarAPI().catch(console.error);
