// Script de prueba para verificar las APIs del dashboard
// Ejecuta esto en la consola del navegador

async function testAPIs() {
    console.log('🧪 Probando APIs del Dashboard de Tráfico...\n');

    // URLs para probar
    const urls = [
        'https://pwa-badeo.vercel.app',  // Producción
        'http://localhost:3000'          // Desarrollo local
    ];

    for (const baseUrl of urls) {
        console.log(`🌐 Probando ${baseUrl}...\n`);

        try {
            // Probar API de resumen
            console.log('📊 Probando /api/telemetry/summary...');
            const summaryResponse = await fetch(`${baseUrl}/api/telemetry/summary`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (summaryResponse.ok) {
                const summary = await summaryResponse.json();
                console.log('✅ Resumen:', summary);
            } else {
                console.log('❌ Error en resumen:', summaryResponse.status, summaryResponse.statusText);
            }

            // Probar API de eventos
            console.log('\n📋 Probando /api/telemetry/events...');
            const eventsResponse = await fetch(`${baseUrl}/api/telemetry/events`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (eventsResponse.ok) {
                const events = await eventsResponse.json();
                console.log('✅ Eventos (últimos 3):', events.slice(0, 3));
            } else {
                console.log('❌ Error en eventos:', eventsResponse.status, eventsResponse.statusText);
            }

            // Probar envío de evento de prueba
            console.log('\n📤 Enviando evento de prueba...');
            const testEvent = {
                type: 'dashboard_test',
                userEmail: 'test@example.com',
                payload: {
                    message: 'Prueba desde dashboard',
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent
                }
            };

            const postResponse = await fetch(`${baseUrl}/api/telemetry`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(testEvent)
            });

            if (postResponse.ok) {
                const result = await postResponse.json();
                console.log('✅ Evento de prueba enviado:', result);
            } else {
                console.log('❌ Error enviando evento:', postResponse.status, postResponse.statusText);
            }

        } catch (error) {
            console.error('❌ Error de conexión:', error.message);
        }

        console.log('\n' + '='.repeat(50) + '\n');
    }

    console.log('💡 Consejos para solucionar problemas:');
    console.log('1. Asegúrate de que la aplicación esté desplegada en Vercel');
    console.log('2. Verifica que las APIs estén accesibles públicamente');
    console.log('3. Revisa los logs de Vercel para errores del servidor');
    console.log('4. Prueba con el dashboard en: https://pwa-badeo.vercel.app/traffic-dashboard');
}

// Ejecutar pruebas
testAPIs();