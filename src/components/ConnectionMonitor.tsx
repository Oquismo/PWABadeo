"use client";
import React, { useEffect, useState } from 'react';
import { Box, Chip, Typography, CircularProgress } from '@mui/material';
import { useApiWithRetry } from '@/hooks/useRetry';

interface ConnectionStatus {
  status: 'healthy' | 'unhealthy' | 'checking';
  dbLatency?: string;
  lastCheck?: string;
}

export function ConnectionMonitor() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    status: 'checking'
  });

  const healthCheck = useApiWithRetry('/api/health');

  const checkConnection = async () => {
    try {
      setConnectionStatus({ status: 'checking' });
      const result = await healthCheck.execute();
      
      setConnectionStatus({
        status: result.status,
        dbLatency: result.dbLatency,
        lastCheck: new Date().toLocaleTimeString()
      });
    } catch (error) {
      setConnectionStatus({
        status: 'unhealthy',
        lastCheck: new Date().toLocaleTimeString()
      });
    }
  };

  useEffect(() => {
    // Check inicial
    checkConnection();

    // Check periódico cada 5 minutos (300000 ms)
    const interval = setInterval(checkConnection, 300000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (connectionStatus.status) {
      case 'healthy': return 'success';
      case 'unhealthy': return 'error';
      case 'checking': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = () => {
    if (connectionStatus.status === 'checking' || healthCheck.isLoading) {
      return <CircularProgress size={16} />;
    }
    return undefined;
  };

  // Solo mostrar en desarrollo o si hay problemas
  if (process.env.NODE_ENV === 'production' && connectionStatus.status === 'healthy') {
    return null;
  }

  return (
    <Box sx={{ 
      position: 'fixed', 
      bottom: 16, 
      right: 16, 
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: 1
    }}>
      <Chip
        icon={getStatusIcon()}
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption">
              {connectionStatus.status === 'healthy' ? 'Conectado' :
               connectionStatus.status === 'unhealthy' ? 'Desconectado' :
               'Verificando...'}
            </Typography>
            {connectionStatus.dbLatency && (
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                {connectionStatus.dbLatency}
              </Typography>
            )}
          </Box>
        }
        color={getStatusColor()}
        size="small"
        variant="outlined"
        sx={{ backgroundColor: 'background.paper' }}
      />
      
      {healthCheck.retryCount > 0 && (
        <Chip
          label={`Reintento ${healthCheck.retryCount}/3`}
          color="warning"
          size="small"
          variant="outlined"
          sx={{ backgroundColor: 'background.paper' }}
        />
      )}
    </Box>
  );
}
