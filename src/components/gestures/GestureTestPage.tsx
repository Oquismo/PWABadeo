/**
 * Página de testing y ejemplos para gestos avanzados
 * Permite probar todos los gestos implementados
 */

import React, { useState, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  Paper,
  Stack,
  Chip,
  Alert,
  Divider
} from '@mui/material';
import { motion } from 'framer-motion';

import {
  GestureWrapper,
  PinchZoomContainer,
  EdgeSwipeIndicator,
  Force3DIndicator,
  ContextMenu
} from '@/components/gestures';
import useAdvancedGestures from '@/hooks/useAdvancedGestures';
import { ContextMenuItem, ContextMenuPresets } from '@/hooks/useLongPressMenu';
import { EdgeSwipePresets } from '@/hooks/useEdgeSwipeNavigation';
import { PressureLevelPresets } from '@/hooks/use3DTouchSimulation';

const GestureTestPage: React.FC = () => {
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  const [enableHaptics, setEnableHaptics] = useState(true);
  const [showHelp, setShowHelp] = useState(true);

  const imageRef = useRef<HTMLDivElement>(null);

  // Gestores de eventos para testing
  const handleGestureTest = (gestureType: string, success = true) => {
    setTestResults(prev => ({ ...prev, [gestureType]: success }));
    setActiveTest(gestureType);
    setTimeout(() => setActiveTest(null), 2000);
  };

  // Menús contextuales de prueba
  const testContextMenuItems: ContextMenuItem[] = [
    {
      id: 'test1',
      label: 'Acción de prueba 1',
      icon: '✅',
      action: () => handleGestureTest('longPress')
    },
    {
      id: 'test2',
      label: 'Acción de prueba 2',
      icon: '🔄',
      action: () => handleGestureTest('longPress')
    },
    {
      id: 'test3',
      label: 'Acción destructiva',
      icon: '🗑️',
      action: () => handleGestureTest('longPress'),
      destructive: true
    }
  ];

  // Acciones de edge swipe de prueba
  const testEdgeActions = {
    left: [
      {
        id: 'test-left',
        label: 'Acción Izquierda',
        icon: '⬅️',
        action: () => handleGestureTest('edgeSwipeLeft'),
        color: '#2196F3'
      }
    ],
    right: [
      {
        id: 'test-right',
        label: 'Acción Derecha',
        icon: '➡️',
        action: () => handleGestureTest('edgeSwipeRight'),
        color: '#4CAF50'
      }
    ],
    top: [
      {
        id: 'test-top',
        label: 'Acción Superior',
        icon: '⬆️',
        action: () => handleGestureTest('edgeSwipeTop'),
        color: '#FF9800'
      }
    ],
    bottom: [
      {
        id: 'test-bottom',
        label: 'Acción Inferior',
        icon: '⬇️',
        action: () => handleGestureTest('edgeSwipeBottom'),
        color: '#9C27B0'
      }
    ]
  };

  // Niveles de 3D Touch de prueba
  const test3DTouchLevels = PressureLevelPresets.contextualNav(
    () => handleGestureTest('3dTouchLevel1'),
    () => handleGestureTest('3dTouchLevel2'),
    () => handleGestureTest('3dTouchLevel3')
  );

  // Indicador de estado de prueba
  const TestStatusIndicator = ({ testName }: { testName: string }) => {
    const status = testResults[testName];
    const isActive = activeTest === testName;

    return (
      <Chip
        size="small"
        label={
          isActive ? 'Probando...' : 
          status === true ? 'Exitoso' : 
          status === false ? 'Falló' : 'Sin probar'
        }
        color={
          isActive ? 'info' : 
          status === true ? 'success' : 
          status === false ? 'error' : 'default'
        }
        variant={isActive ? 'filled' : 'outlined'}
      />
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Testing de Gestos Avanzados
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Prueba todos los gestos implementados en tu PWA. Cada gesto mostrará 
        feedback visual y háptico cuando se active correctamente.
      </Typography>

      {/* Controles generales */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom>
          Configuración de Pruebas
        </Typography>
        
        <Stack direction="row" spacing={3} alignItems="center">
          <FormControlLabel
            control={
              <Switch
                checked={enableHaptics}
                onChange={(e) => setEnableHaptics(e.target.checked)}
              />
            }
            label="Feedback Háptico"
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={showHelp}
                onChange={(e) => setShowHelp(e.target.checked)}
              />
            }
            label="Mostrar Ayuda"
          />
          
          <Button
            variant="outlined"
            onClick={() => setTestResults({})}
            size="small"
          >
            Resetear Pruebas
          </Button>
        </Stack>
      </Paper>

      {/* Ayuda visual */}
      {showHelp && (
        <Alert severity="info" sx={{ mb: 4 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            Cómo probar los gestos:
          </Typography>
          <Typography variant="body2" component="div" sx={{ mt: 1 }}>
            • <strong>Long Press:</strong> Mantén presionado 500ms<br/>
            • <strong>Edge Swipe:</strong> Desliza desde los bordes de la pantalla<br/>
            • <strong>3D Touch:</strong> Presiona con diferentes niveles de fuerza<br/>
            • <strong>Pinch Zoom:</strong> Pellizca para hacer zoom (solo en imagen)
          </Typography>
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Test 1: Long Press Menu */}
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">
                  Long Press Menu
                </Typography>
                <TestStatusIndicator testName="longPress" />
              </Stack>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Mantén presionado el área azul para ver el menú contextual.
              </Typography>
              
              <GestureWrapper
                longPressEnabled
                longPressItems={testContextMenuItems}
                enableHaptics={enableHaptics}
              >
                <Box
                  sx={{
                    height: 120,
                    background: 'linear-gradient(135deg, #2196F3, #21CBF3)',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  👆 Long Press Aquí
                </Box>
              </GestureWrapper>
            </CardContent>
          </Card>
        </Grid>

        {/* Test 2: 3D Touch */}
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">
                  3D Touch Simulation
                </Typography>
                <TestStatusIndicator testName="3dTouchLevel1" />
              </Stack>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Presiona con diferentes niveles de fuerza (tiempo).
              </Typography>
              
              <GestureWrapper
                force3DEnabled
                pressureLevels={test3DTouchLevels}
                enableHaptics={enableHaptics}
              >
                <Box
                  sx={{
                    height: 120,
                    background: 'linear-gradient(135deg, #FF9800, #FFB74D)',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  💪 3D Touch Aquí
                </Box>
              </GestureWrapper>
            </CardContent>
          </Card>
        </Grid>

        {/* Test 3: Pinch to Zoom */}
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">
                  Pinch to Zoom
                </Typography>
                <TestStatusIndicator testName="pinchZoom" />
              </Stack>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Pellizca para hacer zoom en la imagen.
              </Typography>
              
              <PinchZoomContainer
                showControls
                controlsPosition="bottom-right"
                onZoomChange={(scale) => {
                  if (scale !== 1) {
                    handleGestureTest('pinchZoom');
                  }
                }}
              >
                <Box
                  sx={{
                    height: 200,
                    background: 'linear-gradient(135deg, #4CAF50, #81C784)',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1.2rem'
                  }}
                >
                  🤏 Pinch to Zoom
                </Box>
              </PinchZoomContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Test 4: Edge Swipe */}
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">
                  Edge Swipe Navigation
                </Typography>
                <Stack direction="row" spacing={1}>
                  <TestStatusIndicator testName="edgeSwipeLeft" />
                  <TestStatusIndicator testName="edgeSwipeRight" />
                </Stack>
              </Stack>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Desliza desde los bordes de la pantalla.
              </Typography>
              
              <GestureWrapper
                edgeSwipeEnabled
                edgeActions={testEdgeActions}
                enableHaptics={enableHaptics}
              >
                <Box
                  sx={{
                    height: 200,
                    background: 'linear-gradient(135deg, #9C27B0, #BA68C8)',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  ↔️ Edge Swipe
                  
                  {/* Indicadores de bordes */}
                  <Box sx={{ position: 'absolute', top: 8, left: 8, opacity: 0.7 }}>⬅️</Box>
                  <Box sx={{ position: 'absolute', top: 8, right: 8, opacity: 0.7 }}>➡️</Box>
                  <Box sx={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', opacity: 0.7 }}>⬆️</Box>
                  <Box sx={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', opacity: 0.7 }}>⬇️</Box>
                </Box>
              </GestureWrapper>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Estadísticas de pruebas */}
      <Paper elevation={2} sx={{ p: 3, mt: 4, borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom>
          Resultados de Pruebas
        </Typography>
        
        <Grid container spacing={2}>
          {[
            { key: 'longPress', label: 'Long Press Menu' },
            { key: '3dTouchLevel1', label: '3D Touch Nivel 1' },
            { key: '3dTouchLevel2', label: '3D Touch Nivel 2' },
            { key: '3dTouchLevel3', label: '3D Touch Nivel 3' },
            { key: 'pinchZoom', label: 'Pinch to Zoom' },
            { key: 'edgeSwipeLeft', label: 'Edge Swipe Izquierda' },
            { key: 'edgeSwipeRight', label: 'Edge Swipe Derecha' },
            { key: 'edgeSwipeTop', label: 'Edge Swipe Superior' },
            { key: 'edgeSwipeBottom', label: 'Edge Swipe Inferior' }
          ].map(({ key, label }) => (
            <Grid item xs={12} sm={6} md={4} key={key}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2">{label}</Typography>
                <TestStatusIndicator testName={key} />
              </Stack>
            </Grid>
          ))}
        </Grid>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="body2" color="text.secondary">
          Prueba exitosa: {Object.values(testResults).filter(Boolean).length} / {Object.keys(testResults).length}
        </Typography>
      </Paper>
    </Container>
  );
};

export default GestureTestPage;