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

interface DebugMetricsProps {
  show: boolean;
}

export default function DebugMetrics({ show }: DebugMetricsProps) {
  const { tasks } = useTasks();
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    tasksCount: 0,
    averageProgress: 0,
    storageUsage: 0,
    renderTime: '0ms',
    lastUpdate: ''
  });

  useEffect(() => {
    if (!show) return;

    const calculateMetrics = () => {
      const start = performance.now();
      
      const averageProgress = tasks.length > 0 
        ? Math.round(tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length)
        : 0;

      const storageSize = Object.keys(localStorage).reduce((total, key) => {
        return total + (localStorage.getItem(key)?.length || 0);
      }, 0);

      const renderTime = `${(performance.now() - start).toFixed(2)}ms`;

      setMetrics({
        tasksCount: tasks.length,
        averageProgress,
        storageUsage: Math.round(storageSize / 1024), // KB
        renderTime,
        lastUpdate: new Date().toLocaleTimeString()
      });
    };

    calculateMetrics();
    const interval = setInterval(calculateMetrics, 2000); // Actualizar cada 2 segundos

    return () => clearInterval(interval);
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
            <Grid item xs={6}>
              <Paper sx={{ p: 1, backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <Typography variant="caption" display="block" color="white">
                  Tareas
                </Typography>
                <Typography variant="h6" color="white">
                  {metrics.tasksCount}
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={6}>
              <Paper sx={{ p: 1, backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <Typography variant="caption" display="block" color="white">
                  Progreso Avg
                </Typography>
                <Typography variant="h6" color="white">
                  {metrics.averageProgress}%
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="caption" color="white">
                Progreso General: {metrics.averageProgress}%
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
                  label={`Storage: ${metrics.storageUsage}KB`} 
                  size="small" 
                  color="primary"
                />
                <Chip 
                  label={`Render: ${metrics.renderTime}`} 
                  size="small" 
                  color="secondary"
                />
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="caption" color="rgba(255,255,255,0.7)">
                Última actualización: {metrics.lastUpdate}
              </Typography>
            </Grid>
          </Grid>
        </Alert>
      </Box>
    </Fade>
  );
}
