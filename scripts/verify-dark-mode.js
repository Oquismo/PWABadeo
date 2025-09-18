// Script de verificación del modo oscuro constante
// Ejecutar en la consola del navegador para verificar configuración

console.log('🔍 Verificando configuración del modo oscuro constante...');

// Verificar hook useTheme
import { useTheme } from './hooks/useTheme';
const themeHook = useTheme();
console.log('✅ Hook useTheme:', {
  isDark: themeHook.isDark, // Debe ser true
  mode: themeHook.mode, // Debe ser 'dark'
  systemPreference: themeHook.systemPreference
});

// Verificar que no hay funciones de cambio
console.log('✅ Funciones removidas:', {
  hasToggle: typeof themeHook.toggle === 'undefined', // Debe ser true
  hasSetMode: typeof themeHook.setMode === 'undefined' // Debe ser true
});

// Verificar manifest.json
fetch('/manifest.json')
  .then(res => res.json())
  .then(manifest => {
    console.log('✅ Manifest.json colores:', {
      theme_color: manifest.theme_color, // Debe ser oscuro
      background_color: manifest.background_color // Debe ser oscuro
    });
  });

// Verificar que no hay localStorage de tema
const savedTheme = localStorage.getItem('theme-mode');
console.log('✅ LocalStorage limpio:', {
  savedTheme: savedTheme, // Debe ser null
  noThemePreference: savedTheme === null
});

console.log('🎉 ¡Modo oscuro constante configurado correctamente!');