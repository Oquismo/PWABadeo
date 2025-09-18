'use client';

import React, { useState, useEffect } from 'react';
import { Button, Typography, Box, Alert } from '@mui/material';
import { useNotifications } from '@/hooks/useNotifications';

export default function NotificationTest() {
  const { isSupported, permission, requestPermission, refreshPermission } = useNotifications();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runTests = () => {
    addResult('🔧 Iniciando pruebas de notificaciones...');

    // Detectar dispositivo
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    addResult(`📱 Dispositivo móvil: ${isMobile ? 'Sí' : 'No'}`);
    addResult(`🌐 User Agent: ${navigator.userAgent}`);

    // Verificar soporte
    if (isSupported) {
      addResult('✅ Las notificaciones están soportadas');
      addResult(`🔧 Estado del permiso: ${permission}`);
    } else {
      addResult('❌ Las notificaciones no están soportadas');
      return;
    }

    // Verificar localStorage
    const testSettings = {
      announcements: true,
      reminders: false,
      updates: true,
      social: false,
      system: true,
      sound: true,
      vibration: false
    };

    addResult('🔧 Probando persistencia de configuraciones...');
    localStorage.setItem('notification-settings-test', JSON.stringify(testSettings));

    const saved = localStorage.getItem('notification-settings-test');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const match = JSON.stringify(testSettings) === JSON.stringify(parsed);
        if (match) {
          addResult('✅ La persistencia de configuraciones funciona correctamente');
        } else {
          addResult('❌ Error: Las configuraciones no coinciden');
        }
      } catch (error) {
        addResult(`❌ Error parseando configuraciones: ${error}`);
      }
    } else {
      addResult('❌ Error: No se pudieron guardar las configuraciones');
    }

    // Limpiar test
    localStorage.removeItem('notification-settings-test');

    // Verificar service worker
    if ('serviceWorker' in navigator) {
      addResult('✅ Service Worker está soportado');
      navigator.serviceWorker.getRegistrations().then(registrations => {
        addResult(`🔧 Service Workers registrados: ${registrations.length}`);
        registrations.forEach(reg => {
          addResult(`🔧 SW scope: ${reg.scope}`);
        });
      });
    } else {
      addResult('❌ Service Worker no está soportado');
    }

    addResult('🔧 Pruebas completadas');
  };

  const testNotification = async () => {
    if (permission !== 'granted') {
      addResult('❌ No hay permisos para enviar notificaciones');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification('Prueba de Notificación', {
        body: 'Esta es una notificación de prueba',
        icon: '/icon_192x192.png',
        badge: '/icon_192x192.png',
        tag: 'test-notification'
      });
      addResult('✅ Notificación de prueba enviada correctamente');
    } catch (error) {
      addResult(`❌ Error enviando notificación: ${error}`);
    }
  };

  return (
    <Box sx={{ p: 2, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        🧪 Pruebas de Notificaciones
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Button variant="contained" onClick={runTests} sx={{ mr: 1 }}>
          Ejecutar Pruebas
        </Button>
        <Button variant="outlined" onClick={refreshPermission} sx={{ mr: 1 }}>
          🔄 Refrescar Permisos
        </Button>
        <Button variant="outlined" onClick={testNotification}>
          Enviar Notificación de Prueba
        </Button>
      </Box>

      {permission !== 'granted' && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Para probar las notificaciones, necesitas conceder permisos primero.
          <Button onClick={requestPermission} sx={{ ml: 1 }}>
            Solicitar Permisos
          </Button>
        </Alert>
      )}

      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Resultados de las pruebas:
        </Typography>
        <Box sx={{
          maxHeight: 300,
          overflow: 'auto',
          bgcolor: 'grey.100',
          p: 1,
          borderRadius: 1,
          fontFamily: 'monospace',
          fontSize: '0.875rem'
        }}>
          {testResults.map((result, index) => (
            <div key={index}>{result}</div>
          ))}
        </Box>
      </Box>
    </Box>
  );
}