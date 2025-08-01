'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Grid,
  Chip,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  BugReport as BugReportIcon,
  Storage as StorageIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Code as CodeIcon,
  Visibility as VisibilityIcon,
  Speed as SpeedIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
  GetApp as GetAppIcon
} from '@mui/icons-material';
import { useTasks } from '@/context/TasksContext';
import { useAuth } from '@/context/AuthContext';

export default function AdminDevTools() {
  const { tasks, resetToDefault, addTask } = useTasks();
  const { user } = useAuth();
  const [debugMode, setDebugMode] = useState(false);
  const [showStorage, setShowStorage] = useState(false);
  const [testAlert, setTestAlert] = useState('');
  const [performanceData, setPerformanceData] = useState<any>(null);

  // Función para generar datos de prueba
  const generateTestData = () => {
    const testTasks = Array.from({ length: 5 }, (_, i) => ({
      title: `Tarea de Prueba ${i + 1}`,
      description: `Descripción generada automáticamente para testing ${i + 1}`,
      progress: Math.floor(Math.random() * 100),
      color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`,
      avatars: [`T${i + 1}`, 'A', '+2'],
      date: new Date().toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
    }));

    // Usar el contexto para agregar las tareas
    testTasks.forEach(task => addTask(task));
    setTestAlert(`✅ ${testTasks.length} tareas de prueba generadas y guardadas`);
    setTimeout(() => setTestAlert(''), 3000);
  };

  // Función para limpiar localStorage
  const clearStorage = () => {
    const keys = ['userTasks', 'testTasks', 'debugLogs'];
    keys.forEach(key => localStorage.removeItem(key));
    setTestAlert('🗑️ Storage local limpiado');
    setTimeout(() => setTestAlert(''), 3000);
  };

  // Función para medir rendimiento
  const measurePerformance = () => {
    const start = performance.now();
    
    // Simular operaciones pesadas
    const data = {
      timestamp: new Date().toISOString(),
      renderTime: `${(performance.now() - start).toFixed(2)}ms`,
      memoryUsage: (performance as any).memory ? {
        used: `${((performance as any).memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
        total: `${((performance as any).memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
        limit: `${((performance as any).memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`
      } : 'No disponible',
      tasksCount: tasks.length,
      storageUsage: Object.keys(localStorage).length
    };

    setPerformanceData(data);
    setTestAlert('📊 Análisis de rendimiento completado');
    setTimeout(() => setTestAlert(''), 3000);
  };

  // Función para simular errores
  const simulateError = () => {
    try {
      throw new Error('Error de prueba generado por el admin');
    } catch (error) {
      console.error('🔴 Error simulado:', error);
      setTestAlert('🔴 Error simulado - Ver consola del navegador');
      setTimeout(() => setTestAlert(''), 3000);
    }
  };

  // Función para exportar logs de debugging
  const exportDebugData = () => {
    const debugData = {
      timestamp: new Date().toISOString(),
      userInfo: {
        name: user?.name,
        email: user?.email,
        isAdmin: user?.role === 'admin'
      },
      tasksData: tasks,
      localStorage: Object.keys(localStorage).reduce((acc, key) => {
        acc[key] = localStorage.getItem(key);
        return acc;
      }, {} as any),
      browserInfo: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform
      }
    };

    const blob = new Blob([JSON.stringify(debugData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setTestAlert('📥 Datos de debug exportados');
    setTimeout(() => setTestAlert(''), 3000);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <CodeIcon color="primary" />
        <Typography variant="h5" fontWeight="bold" color="primary">
          Herramientas de Desarrollo - Admin
        </Typography>
        <Chip label="DEV MODE" color="warning" size="small" />
      </Box>

      {testAlert && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {testAlert}
        </Alert>
      )}

      {/* Panel de estado general */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Estado de la Aplicación
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="primary">{tasks.length}</Typography>
                <Typography variant="caption">Tareas Activas</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="secondary">{Object.keys(localStorage).length}</Typography>
                <Typography variant="caption">Items en Storage</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {user?.role === 'admin' ? 'Admin' : 'User'}
                </Typography>
                <Typography variant="caption">Rol Actual</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="info.main">
                  {new Date().toLocaleDateString('es-ES')}
                </Typography>
                <Typography variant="caption">Fecha</Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Herramientas de testing */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <BugReportIcon sx={{ mr: 1 }} />
          <Typography>Herramientas de Testing</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="outlined"
                onClick={generateTestData}
                startIcon={<RefreshIcon />}
              >
                Generar Datos de Prueba
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="outlined"
                color="error"
                onClick={simulateError}
                startIcon={<BugReportIcon />}
              >
                Simular Error
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="outlined"
                onClick={resetToDefault}
                startIcon={<RefreshIcon />}
              >
                Reset Tareas
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="outlined"
                color="warning"
                onClick={clearStorage}
                startIcon={<DeleteIcon />}
              >
                Limpiar Storage
              </Button>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Análisis de rendimiento */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <SpeedIcon sx={{ mr: 1 }} />
          <Typography>Análisis de Rendimiento</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Button
            variant="contained"
            onClick={measurePerformance}
            startIcon={<SpeedIcon />}
            sx={{ mb: 2 }}
          >
            Medir Rendimiento
          </Button>
          
          {performanceData && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Resultados:</Typography>
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Tiempo de Render" 
                    secondary={performanceData.renderTime} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Memoria Usada" 
                    secondary={performanceData.memoryUsage.used || 'No disponible'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Total de Tareas" 
                    secondary={performanceData.tasksCount} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Items en Storage" 
                    secondary={performanceData.storageUsage} 
                  />
                </ListItem>
              </List>
            </Paper>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Depuración y logs */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <StorageIcon sx={{ mr: 1 }} />
          <Typography>Depuración y Logs</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormControlLabel
            control={
              <Switch
                checked={debugMode}
                onChange={(e) => setDebugMode(e.target.checked)}
              />
            }
            label="Modo Debug (logs en consola)"
          />
          
          <Divider sx={{ my: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="contained"
                onClick={exportDebugData}
                startIcon={<GetAppIcon />}
              >
                Exportar Datos Debug
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setShowStorage(!showStorage)}
                startIcon={<VisibilityIcon />}
              >
                {showStorage ? 'Ocultar' : 'Ver'} LocalStorage
              </Button>
            </Grid>
          </Grid>

          {showStorage && (
            <Paper sx={{ p: 2, mt: 2, maxHeight: 200, overflow: 'auto' }}>
              <Typography variant="subtitle2" gutterBottom>
                Contenido del LocalStorage:
              </Typography>
              <pre style={{ fontSize: '0.8rem', margin: 0 }}>
                {JSON.stringify(
                  Object.keys(localStorage).reduce((acc, key) => {
                    acc[key] = localStorage.getItem(key);
                    return acc;
                  }, {} as any),
                  null,
                  2
                )}
              </pre>
            </Paper>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Información del sistema */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <InfoIcon sx={{ mr: 1 }} />
          <Typography>Información del Sistema</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List dense>
            <ListItem>
              <ListItemText 
                primary="Navegador" 
                secondary={navigator.userAgent.split(' ')[0]} 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Idioma" 
                secondary={navigator.language} 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Plataforma" 
                secondary={navigator.platform} 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Conexión" 
                secondary={(navigator as any).connection?.effectiveType || 'Desconocida'} 
              />
            </ListItem>
          </List>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
