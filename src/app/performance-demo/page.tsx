/**
 * Página de Demostración de Optimizaciones de Performance
 * Muestra todas las mejoras implementadas en acción
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Fab,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  Image as ImageIcon,
  CloudDownload as CloudIcon,
  TouchApp as TouchIcon,
  Analytics as AnalyticsIcon,
  Refresh as RefreshIcon,
  BugReport as DebugIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// Importar nuestros sistemas de optimización
import { LazyLoader, useLazyComponent } from '@/components/performance/LazyLoader';
import OptimizedImage from '@/components/performance/OptimizedImage';
import { 
  useIntelligentPreloading, 
  useComponentPreloading,
  PreloadLink 
} from '@/components/performance/IntelligentPreloading';
import { 
  usePerformanceMonitoring, 
  useGesturePerformance,
  usePerformanceDebug 
} from '@/components/performance/PerformanceMonitor';
import { 
  useOptimizedGestures,
  useDeviceCapabilities 
} from '@/components/performance/GestureOptimization';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`performance-tabpanel-${index}`}
      aria-labelledby={`performance-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const PerformanceDemoPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [demoEnabled, setDemoEnabled] = useState(true);

  // Hooks de performance
  const { metrics, measureFPS, measureMemory, generateReport } = usePerformanceMonitoring();
  const { measureGesture } = useGesturePerformance();
  const { isDebugMode, toggleDebug } = usePerformanceDebug();
  const { 
    preloadRoute, 
    preloadImage, 
    getRecommendedRoutes, 
    getStats,
    enabled: preloadEnabled,
    setEnabled: setPreloadEnabled 
  } = useIntelligentPreloading();
  const { bindElement, measureGesturePerformance } = useOptimizedGestures();
  const deviceCapabilities = useDeviceCapabilities();

  // Estados locales
  const [currentFPS, setCurrentFPS] = useState(0);
  const [memoryInfo, setMemoryInfo] = useState<any>(null);
  const [preloadStats, setPreloadStats] = useState<any>({});

  // Componente lazy para demostración
  const LazyDemoComponent = useLazyComponent(
    () => import('@/components/gestures/GestureTestPage'),
    { fallback: 'skeleton', viewport: true }
  );

  // Actualizar métricas cada 5 segundos
  useEffect(() => {
    const interval = setInterval(async () => {
      if (demoEnabled) {
        const fps = await measureFPS(1000);
        const memory = measureMemory();
        const stats = getStats();
        
        setCurrentFPS(fps);
        setMemoryInfo(memory);
        setPreloadStats(stats);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [demoEnabled, measureFPS, measureMemory, getStats]);

  // Precargar componentes críticos
  useComponentPreloading([
    '/images/demo-1.jpg',
    '/images/demo-2.jpg',
    '/api/performance/stats',
  ], 'medium');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Simular gesto para demostración
  const simulateGesture = async () => {
    const result = await measureGesture('pinch', async () => {
      // Simular gesto de pinch
      await new Promise(resolve => setTimeout(resolve, 200));
      return Math.random() > 0.2; // 80% de éxito
    });
    
    console.log('Gesture performance:', result);
  };

  const generateFullReport = async () => {
    const report = generateReport();
    console.table(report);
    
    // Simular envío a analytics
    console.log('📊 Performance report generated:', report);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Typography variant="h3" component="h1" gutterBottom align="center">
          🚀 Optimizaciones de Performance
        </Typography>
        
        <Typography variant="h6" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Todas las mejoras implementadas en tu PWA Badeo
        </Typography>

        {/* Métricas Generales */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <SpeedIcon color="primary" />
                  <Box>
                    <Typography variant="h4">{currentFPS}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      FPS Actual
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <AnalyticsIcon color="success" />
                  <Box>
                    <Typography variant="h4">{Math.round(metrics.vitalsScore)}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Score Vitals
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <TouchIcon color="warning" />
                  <Box>
                    <Typography variant="h4">{Math.round(metrics.gestureSuccessRate)}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      % Gestos Exitosos
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <MemoryIcon color="info" />
                  <Box>
                    <Typography variant="h4">
                      {memoryInfo ? Math.round(memoryInfo.used / 1024 / 1024) : '0'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      MB Memoria
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Controles */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={demoEnabled}
                      onChange={(e) => setDemoEnabled(e.target.checked)}
                    />
                  }
                  label="Monitoreo Activo"
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preloadEnabled}
                      onChange={(e) => setPreloadEnabled(e.target.checked)}
                    />
                  }
                  label="Preloading Inteligente"
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isDebugMode}
                      onChange={toggleDebug}
                    />
                  }
                  label="Modo Debug"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Fab 
                  size="small" 
                  color="primary" 
                  onClick={generateFullReport}
                  sx={{ ml: 2 }}
                >
                  <DebugIcon />
                </Fab>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Tabs de Demostraciones */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} centered>
              <Tab label="Lazy Loading" icon={<CloudIcon />} />
              <Tab label="Imágenes Optimizadas" icon={<ImageIcon />} />
              <Tab label="Preloading Inteligente" icon={<RefreshIcon />} />
              <Tab label="Info del Dispositivo" icon={<MemoryIcon />} />
            </Tabs>
          </Box>

          {/* Tab 1: Lazy Loading */}
          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" gutterBottom>
              🔄 Lazy Loading Inteligente
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Los componentes se cargan solo cuando los necesitas, mejorando el tiempo de carga inicial.
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Chip 
                label="Viewport-based Loading" 
                color="success" 
                size="small" 
                sx={{ mr: 1 }} 
              />
              <Chip 
                label="Skeleton Fallbacks" 
                color="info" 
                size="small" 
                sx={{ mr: 1 }} 
              />
              <Chip 
                label="Error Boundaries" 
                color="warning" 
                size="small" 
              />
            </Box>

            <LazyLoader fallback="skeleton">
              <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
                <Typography variant="h6">Componente Lazy Cargado ✅</Typography>
                <Typography variant="body2">
                  Este contenido se cargó de forma lazy cuando scrolleaste hasta aquí.
                </Typography>
              </Box>
            </LazyLoader>
          </TabPanel>

          {/* Tab 2: Imágenes */}
          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom>
              🖼️ Optimización de Imágenes
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Formatos modernos (AVIF/WebP), lazy loading automático y fallbacks inteligentes.
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <OptimizedImage
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400"
                  alt="Imagen optimizada 1"
                  width={400}
                  height={200}
                  lazy={true}
                  fadeIn={true}
                  quality={85}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <OptimizedImage
                  src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400"
                  alt="Imagen optimizada 2"
                  width={400}
                  height={200}
                  lazy={true}
                  fadeIn={true}
                  quality={85}
                />
              </Grid>
            </Grid>
          </TabPanel>

          {/* Tab 3: Preloading */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom>
              🧠 Preloading Inteligente
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Predice qué contenido necesitarás y lo precarga automáticamente.
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Estadísticas de Navegación
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText 
                          primary={`Patrones registrados: ${preloadStats.patterns || 0}`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary={`Recursos precargados: ${preloadStats.preloadedResources || 0}`}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Enlaces Inteligentes
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <PreloadLink href="/mapa" preloadOnHover>
                        📍 Mapa (hover para precargar)
                      </PreloadLink>
                      <PreloadLink href="/eventos" preloadOnHover>
                        📅 Eventos (hover para precargar)
                      </PreloadLink>
                      <PreloadLink href="/perfil" preloadOnHover>
                        👤 Perfil (hover para precargar)
                      </PreloadLink>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Tab 4: Info del Dispositivo */}
          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" gutterBottom>
              📱 Información del Dispositivo
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Optimizaciones adaptadas a las capacidades de tu dispositivo.
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <TouchIcon color={deviceCapabilities.supportsTouch ? 'success' : 'disabled'} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Soporte Touch"
                      secondary={deviceCapabilities.supportsTouch ? 'Disponible' : 'No disponible'}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <MemoryIcon color="info" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Memoria del Dispositivo"
                      secondary={`${deviceCapabilities.deviceMemory || 'Desconocida'} GB`}
                    />
                  </ListItem>
                </List>
              </Grid>

              <Grid item xs={12} sm={6}>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <SpeedIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Cores de CPU"
                      secondary={`${deviceCapabilities.hardwareConcurrency || 'Desconocido'} cores`}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <CloudIcon color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Tipo de Conexión"
                      secondary={deviceCapabilities.effectiveType || 'Desconocida'}
                    />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </TabPanel>
        </Card>

        {/* Botón de Prueba de Gestos */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <motion.div
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
          >
            <Fab
              variant="extended"
              color="primary"
              onClick={simulateGesture}
              size="large"
            >
              <TouchIcon sx={{ mr: 1 }} />
              Probar Performance de Gestos
            </Fab>
          </motion.div>
        </Box>

        {/* Debug Info */}
        <AnimatePresence>
          {isDebugMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card sx={{ mt: 4, bgcolor: 'grey.900', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    🐛 Información de Debug
                  </Typography>
                  <Typography variant="body2" component="pre" sx={{ fontSize: '0.75rem' }}>
                    {JSON.stringify({ metrics, deviceCapabilities, preloadStats }, null, 2)}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Container>
  );
};

export default PerformanceDemoPage;