// Uso: node check-telemetry.js https://tu-dominio.com
const [,, base] = process.argv;
if (!base) {
  console.error('Uso: node check-telemetry.js <base_url>');
  process.exit(1);
}

async function run() {
  try {
    console.log('GET ' + base + '/api/telemetry');
    const g = await fetch(base + '/api/telemetry');
    const gj = await g.json();
    console.log('GET result:', JSON.stringify(gj, null, 2));

    console.log('\nPOST test event');
    const p = await fetch(base + '/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'smoke_test_node', payload: { msg: 'hello from node' } })
    });
    const pj = await p.json();
    console.log('POST result:', JSON.stringify(pj, null, 2));
  } catch (e) {
    console.error('Error:', e);
  }
}

run();
