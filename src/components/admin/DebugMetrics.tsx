'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  Fade,
  Alert
} from '@mui/material';
import { useTasks } from '@/context/TasksContext';
import { useAuth } from '@/context/AuthContext';
import { getDebugConfig, debugIcons, debugColors } from '@/config/debugConfig';

interface DebugMetricsProps {
  show: boolean;
}

export default function DebugMetrics({ show }: DebugMetricsProps) {
  const { tasks } = useTasks();
  const { user } = useAuth();
  const [config] = useState(() => getDebugConfig());
  const [metrics, setMetrics] = useState({
    // Métricas de tareas
    tasksCount: 0,
    averageProgress: 0,
    // Métricas de navegación y páginas
    currentPage: '',
    pageLoadTime: '0ms',
    navigationCount: 0,
    // Métricas de rendimiento
    memoryUsage: '0MB',
    connectionType: 'unknown',
    // Métricas de almacenamiento
    storageUsage: 0,
    localStorageItems: 0,
    // Métricas de interfaz
    domNodes: 0,
    activeElements: 0,
    // Métricas de red
    onlineStatus: true,
    // Tiempo
    renderTime: '0ms',
    lastUpdate: ''
  });

  useEffect(() => {
    if (!show) return;

    // Inicializar contador de navegación si no existe
    if (!sessionStorage.getItem('navigationCount')) {
      sessionStorage.setItem('navigationCount', '1');
    }

    const calculateMetrics = () => {
      const start = performance.now();
      
      // Calcular progreso promedio de tareas
      const averageProgress = tasks.length > 0 
        ? Math.round(tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length)
        : 0;

      // Calcular uso de localStorage
      const storageSize = Object.keys(localStorage).reduce((total, key) => {
        return total + (localStorage.getItem(key)?.length || 0);
      }, 0);

      // Obtener información de la página actual
      const currentPath = window.location.pathname;
      const currentPage = currentPath === '/' ? 'Inicio' : currentPath.split('/').pop() || 'Desconocido';

      // Calcular tiempo de carga de la página
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const pageLoadTime = navigation ? Math.round(navigation.loadEventEnd - navigation.loadEventStart) + 'ms' : '0ms';

      // Contar elementos DOM
      const domNodes = document.querySelectorAll('*').length;
      const activeElements = document.querySelectorAll(':focus, :hover, .active, [aria-pressed="true"], [aria-expanded="true"]').length;

      // Información de conexión
      const connection = (navigator as any).connection;
      const connectionType = connection ? connection.effectiveType || 'unknown' : 'unknown';

      // Uso de memoria (si está disponible)
      const memory = (performance as any).memory;
      const memoryUsage = memory ? Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB' : '0MB';

      // Contador de elementos en localStorage
      const localStorageItems = localStorage.length;

      // Estado de conexión
      const onlineStatus = navigator.onLine;

      // Obtener contador de navegación actual
      const currentNavCount = parseInt(sessionStorage.getItem('navigationCount') || '1');

      const renderTime = `${(performance.now() - start).toFixed(2)}ms`;

      setMetrics({
        tasksCount: tasks.length,
        averageProgress,
        currentPage,
        pageLoadTime,
        navigationCount: currentNavCount,
        memoryUsage,
        connectionType,
        storageUsage: Math.round(storageSize / 1024), // KB
        localStorageItems,
        domNodes,
        activeElements,
        onlineStatus,
        renderTime,
        lastUpdate: new Date().toLocaleTimeString()
      });
    };

    // Listener para cambios de ruta
    const handleRouteChange = () => {
      const currentNavCount = parseInt(sessionStorage.getItem('navigationCount') || '0');
      sessionStorage.setItem('navigationCount', (currentNavCount + 1).toString());
    };

    // Listener para cambios de estado online/offline
    const handleOnlineChange = () => {
      calculateMetrics();
    };

    // Agregar listeners
    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('online', handleOnlineChange);
    window.addEventListener('offline', handleOnlineChange);

    calculateMetrics();
    const interval = setInterval(calculateMetrics, 2000); // Actualizar cada 2 segundos

    return () => {
      clearInterval(interval);
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('online', handleOnlineChange);
      window.removeEventListener('offline', handleOnlineChange);
    };
  }, [tasks, show]);

  if (!show || user?.role !== 'admin') return null;

  return (
    <Fade in={show}>
      <Box sx={{ position: 'fixed', top: 10, right: 10, zIndex: 1000, width: 300 }}>
        <Alert 
          severity="info" 
          sx={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.8)', 
            color: 'white',
            '& .MuiAlert-icon': { color: 'white' }
          }}
        >
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            🔧 Debug Metrics (Live)
          </Typography>
          
          <Grid container spacing={1}>
            {/* Fila 1: Tareas y Progreso */}
            {config.basic.tasks && (
              <Grid item xs={6}>
                <Paper sx={{ p: 1, backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <Typography variant="caption" display="block" color="white">
                    {debugIcons.tasks} Tareas
                  </Typography>
                  <Typography variant="h6" color="white">
                    {metrics.tasksCount}
                  </Typography>
                </Paper>
              </Grid>
            )}
            
            {config.basic.tasks && (
              <Grid item xs={6}>
                <Paper sx={{ p: 1, backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <Typography variant="caption" display="block" color="white">
                    {debugIcons.progress} Progreso Avg
                  </Typography>
                  <Typography variant="h6" color="white">
                    {metrics.averageProgress}%
                  </Typography>
                </Paper>
              </Grid>
            )}

            {/* Fila 2: Página y Navegación */}
            {config.basic.page && (
              <Grid item xs={6}>
                <Paper sx={{ p: 1, backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <Typography variant="caption" display="block" color="white">
                    {debugIcons.page} Página
                  </Typography>
                  <Typography variant="body2" color="white" noWrap>
                    {metrics.currentPage}
                  </Typography>
                </Paper>
              </Grid>
            )}

            {config.basic.page && (
              <Grid item xs={6}>
                <Paper sx={{ p: 1, backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <Typography variant="caption" display="block" color="white">
                    {debugIcons.load} Carga
                  </Typography>
                  <Typography variant="body2" color="white">
                    {metrics.pageLoadTime}
                  </Typography>
                </Paper>
              </Grid>
            )}

            {/* Fila 3: DOM y Memoria */}
            {config.basic.performance && (
              <>
                <Grid item xs={6}>
                  <Paper sx={{ p: 1, backgroundColor: 'rgba(255,255,255,0.1)' }}>
                    <Typography variant="caption" display="block" color="white">
                      {debugIcons.dom} DOM Nodes
                    </Typography>
                    <Typography variant="body2" color="white">
                      {metrics.domNodes}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={6}>
                  <Paper sx={{ p: 1, backgroundColor: 'rgba(255,255,255,0.1)' }}>
                    <Typography variant="caption" display="block" color="white">
                      {debugIcons.memory} Memoria
                    </Typography>
                    <Typography variant="body2" color="white">
                      {metrics.memoryUsage}
                    </Typography>
                  </Paper>
                </Grid>
              </>
            )}

            {/* Fila 4: Storage y Conexión */}
            {config.basic.storage && (
              <Grid item xs={6}>
                <Paper sx={{ p: 1, backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <Typography variant="caption" display="block" color="white">
                    {debugIcons.storage} Storage
                  </Typography>
                  <Typography variant="body2" color="white">
                    {metrics.storageUsage}KB ({metrics.localStorageItems})
                  </Typography>
                </Paper>
              </Grid>
            )}

            <Grid item xs={6}>
              <Paper sx={{ p: 1, backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <Typography variant="caption" display="block" color="white">
                  {debugIcons.connection} Conexión
                </Typography>
                <Typography variant="body2" color="white">
                  {metrics.onlineStatus ? '🟢' : '🔴'} {metrics.connectionType}
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="caption" color="white">
                {debugIcons.progress} Progreso General: {metrics.averageProgress}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={metrics.averageProgress} 
                sx={{ 
                  height: 6, 
                  borderRadius: 3,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  '& .MuiLinearProgress-bar': { 
                    backgroundColor: metrics.averageProgress > 70 ? '#4caf50' : 
                                    metrics.averageProgress > 40 ? '#ff9800' : '#f44336'
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                <Chip 
                  label={`Activos: ${metrics.activeElements}`} 
                  size="small" 
                  color="primary"
                />
                <Chip 
                  label={`Nav: ${metrics.navigationCount}`} 
                  size="small" 
                  color="secondary"
                />
                <Chip 
                  label={`Render: ${metrics.renderTime}`} 
                  size="small" 
                  color={metrics.renderTime.includes('ms') && parseFloat(metrics.renderTime) > 10 ? 'error' : 'success'}
                />
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="caption" color="rgba(255,255,255,0.7)">
                🕒 Última actualización: {metrics.lastUpdate}
              </Typography>
            </Grid>
          </Grid>
        </Alert>
      </Box>
    </Fade>
  );
}
