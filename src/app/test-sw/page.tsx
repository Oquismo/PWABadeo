'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress
} from '@mui/material';
import { CheckCircle, Error, Warning, Info } from '@mui/icons-material';

interface ServiceWorkerStatus {
  isSupported: boolean;
  isRegistered: boolean;
  isReady: boolean;
  registration: ServiceWorkerRegistration | null;
  error: string | null;
}

export default function TestServiceWorkerPage() {
  const [status, setStatus] = useState<ServiceWorkerStatus>({
    isSupported: false,
    isRegistered: false,
    isReady: false,
    registration: null,
    error: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const checkServiceWorkerSupport = () => {
    const supported = 'serviceWorker' in navigator;
    addLog(`Service Worker API ${supported ? 'disponible' : 'no disponible'}`);
    return supported;
  };

  const checkSecureContext = () => {
    const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    addLog(`Contexto seguro: ${isSecure ? '✅ HTTPS/localhost' : '❌ HTTP (requiere HTTPS)'}`);
    return isSecure;
  };

  const checkExistingRegistrations = async () => {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      addLog(`Service Workers registrados: ${registrations.length}`);
      registrations.forEach((reg, index) => {
        addLog(`  ${index + 1}. Scope: ${reg.scope}, Estado: ${reg.active ? 'activo' : 'inactivo'}`);
      });
      return registrations;
    } catch (error) {
      addLog(`Error obteniendo registros: ${error}`);
      return [];
    }
  };

  const unregisterAllWorkers = async () => {
    setIsLoading(true);
    addLog('🧹 Limpiando service workers existentes...');

    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map(registration => {
          addLog(`Eliminando SW: ${registration.scope}`);
          return registration.unregister();
        })
      );
      addLog('✅ Todos los service workers eliminados');
    } catch (error) {
      addLog(`❌ Error limpiando service workers: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const registerServiceWorker = async () => {
    setIsLoading(true);
    addLog('🔄 Registrando service worker...');

    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      addLog(`✅ Service Worker registrado: ${registration.scope}`);

      // Esperar a que esté listo
      await navigator.serviceWorker.ready;
      addLog('✅ Service Worker listo y activo');

      setStatus(prev => ({
        ...prev,
        isRegistered: true,
        isReady: true,
        registration,
        error: null
      }));

    } catch (error: unknown) {
      addLog(`❌ Error registrando service worker: ${error}`);
      setStatus(prev => ({
        ...prev,
        error: (error as Error)?.message || String(error)
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const testPushManager = async () => {
    if (!status.registration) {
      addLog('❌ No hay registro de service worker');
      return;
    }

    try {
      addLog('🔍 Verificando Push Manager...');
      const subscription = await status.registration.pushManager.getSubscription();

      if (subscription) {
        addLog('✅ Suscripción push encontrada');
        addLog(`   Endpoint: ${subscription.endpoint}`);
      } else {
        addLog('ℹ️  No hay suscripción push activa');
      }
    } catch (error) {
      addLog(`❌ Error con Push Manager: ${error}`);
    }
  };

  useEffect(() => {
    addLog('🚀 Iniciando diagnóstico del service worker');

    const isSupported = checkServiceWorkerSupport();
    const isSecure = checkSecureContext();

    setStatus(prev => ({
      ...prev,
      isSupported
    }));

    if (isSupported) {
      checkExistingRegistrations();
    }
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        🛠️ Diagnóstico del Service Worker
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Esta página te ayuda a diagnosticar problemas con el service worker y las notificaciones push.
      </Typography>

      {/* Estado General */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📊 Estado General
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
            <Chip
              icon={status.isSupported ? <CheckCircle /> : <Error />}
              label={`Service Worker: ${status.isSupported ? 'Disponible' : 'No disponible'}`}
              color={status.isSupported ? 'success' : 'error'}
            />

            <Chip
              icon={window.location.protocol === 'https:' || window.location.hostname === 'localhost' ? <CheckCircle /> : <Warning />}
              label={`Contexto: ${window.location.protocol === 'https:' || window.location.hostname === 'localhost' ? 'Seguro' : 'No seguro'}`}
              color={window.location.protocol === 'https:' || window.location.hostname === 'localhost' ? 'success' : 'warning'}
            />

            <Chip
              icon={status.isRegistered ? <CheckCircle /> : <Info />}
              label={`Registrado: ${status.isRegistered ? 'Sí' : 'No'}`}
              color={status.isRegistered ? 'success' : 'default'}
            />

            <Chip
              icon={status.isReady ? <CheckCircle /> : <Info />}
              label={`Listo: ${status.isReady ? 'Sí' : 'No'}`}
              color={status.isReady ? 'success' : 'default'}
            />
          </Box>

          {status.error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {status.error}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Acciones */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🔧 Acciones de Diagnóstico
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              onClick={registerServiceWorker}
              disabled={!status.isSupported || isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              Registrar Service Worker
            </Button>

            <Button
              variant="outlined"
              onClick={unregisterAllWorkers}
              disabled={isLoading}
              color="warning"
            >
              Limpiar Service Workers
            </Button>

            <Button
              variant="outlined"
              onClick={testPushManager}
              disabled={!status.registration}
            >
              Probar Push Manager
            </Button>

            <Button
              variant="outlined"
              onClick={() => window.location.reload()}
            >
              Recargar Página
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Logs */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📋 Logs de Diagnóstico
          </Typography>

          <List sx={{ maxHeight: 300, overflow: 'auto', bgcolor: 'grey.50', borderRadius: 1 }}>
            {logs.map((log, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemText primary={log} />
                </ListItem>
                {index < logs.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>

          {logs.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              No hay logs aún. Las acciones agregarán información aquí.
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Información Adicional */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          💡 Información de Depuración
        </Typography>
        <Typography variant="body2">
          • URL actual: {window.location.href}<br/>
          • Protocolo: {window.location.protocol}<br/>
          • Host: {window.location.hostname}<br/>
          • User Agent: {navigator.userAgent}
        </Typography>
      </Alert>
    </Container>
  );
}