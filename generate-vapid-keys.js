const webpush = require('web-push');

// Generar claves VAPID
const vapidKeys = webpush.generateVAPIDKeys();

console.log('=== CLAVES VAPID GENERADAS ===');
console.log('Clave Pública:', vapidKeys.publicKey);
console.log('Clave Privada:', vapidKeys.privateKey);
console.log('\n=== COPIA ESTAS LÍNEAS A TU ARCHIVO .env.local ===');
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY="${vapidKeys.publicKey}"`);
console.log(`VAPID_PRIVATE_KEY="${vapidKeys.privateKey}"`);
console.log('\n=== CONFIGURACIÓN COMPLETA ===');
console.log(`# VAPID Keys para notificaciones push
NEXT_PUBLIC_VAPID_PUBLIC_KEY="${vapidKeys.publicKey}"
VAPID_PRIVATE_KEY="${vapidKeys.privateKey}"`);
