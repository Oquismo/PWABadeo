// Script de diagnóstico rápido para notificaciones
// Ejecuta esto en la consola del navegador (F12) en la página de ajustes

console.log('🔍 Diagnóstico Rápido de Notificaciones Push');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Verificar APIs básicas
const hasServiceWorker = 'serviceWorker' in navigator;
const hasPushManager = 'PushManager' in window;
const hasNotification = 'Notification' in window;
const isSecureContext = window.isSecureContext || location.protocol === 'https:' || location.hostname === 'localhost';

console.log('📋 Verificación de APIs:');
console.log('  Service Worker:', hasServiceWorker ? '✅' : '❌');
console.log('  Push Manager:', hasPushManager ? '✅' : '❌');
console.log('  Notification API:', hasNotification ? '✅' : '❌');
console.log('  Secure Context:', isSecureContext ? '✅' : '❌');

console.log('');
console.log('🌐 Información del contexto:');
console.log('  Protocol:', location.protocol);
console.log('  Hostname:', location.hostname);
console.log('  isSecureContext:', window.isSecureContext);

if (hasNotification) {
  console.log('  Notification Permission:', Notification.permission);
}

console.log('');
console.log('🎯 Resultado:');
const allGood = hasServiceWorker && hasPushManager && hasNotification && isSecureContext;
console.log(allGood ? '✅ Todo parece estar bien' : '❌ Hay problemas que revisar');

if (!allGood) {
  console.log('');
  console.log('💡 Posibles soluciones:');
  if (!hasServiceWorker) console.log('  - Service Worker no disponible: Actualiza Chrome');
  if (!hasPushManager) console.log('  - Push Manager no disponible: Actualiza Chrome');
  if (!hasNotification) console.log('  - Notification API no disponible: Actualiza Chrome');
  if (!isSecureContext) console.log('  - Contexto no seguro: Usa HTTPS o localhost');
}

console.log('');
console.log('🔧 Para diagnóstico completo, ejecuta: diagnoseNotifications()');