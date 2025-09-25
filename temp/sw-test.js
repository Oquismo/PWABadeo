console.log('🧪 Probando registro del service worker...'); 
 
if ('serviceWorker' in navigator) { 
  console.log('✅ Service Worker API disponible'); 
  navigator.serviceWorker.register('/service-worker.js') 
    .then(registration => { 
      console.log('✅ Service Worker registrado:', registration.scope); 
      return navigator.serviceWorker.ready; 
    }) 
    .then(() => console.log('✅ Service Worker listo')) 
    .catch(error => console.error('❌ Error registrando SW:', error)); 
} else { 
  console.log('❌ Service Worker API no disponible'); 
} 
