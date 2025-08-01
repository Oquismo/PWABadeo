import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Chip, 
  Alert,
  Fade,
  IconButton,
  Collapse
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import DebugMonitor from '../../utils/debugUtils';
import { useAuth } from '../../context/AuthContext';

interface AdvancedDebugMetricsProps {
  show: boolean;
}

export default function AdvancedDebugMetrics({ show }: AdvancedDebugMetricsProps) {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [extendedMetrics, setExtendedMetrics] = useState(DebugMonitor.getInstance().getMetrics());

  useEffect(() => {
    if (!show) return;

    const updateExtendedMetrics = () => {
      setExtendedMetrics(DebugMonitor.getInstance().getMetrics());
    };

    updateExtendedMetrics();
    const interval = setInterval(updateExtendedMetrics, 3000); // Actualizar cada 3 segundos

    return () => clearInterval(interval);
  }, [show]);

  if (!show || user?.role !== 'admin') return null;

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'success';
    if (value <= thresholds.warning) return 'warning';
    return 'error';
  };

  return (
    <Fade in={show}>
      <Box sx={{ position: 'fixed', top: 220, right: 10, zIndex: 999, width: 320 }}>
        <Alert 
          severity="warning" 
          sx={{ 
            backgroundColor: 'rgba(25, 25, 25, 0.95)', 
            color: 'white',
            '& .MuiAlert-icon': { color: '#ff9800' }
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" fontWeight="bold">
              ⚡ Métricas Avanzadas
            </Typography>
            <IconButton 
              size="small" 
              onClick={() => setExpanded(!expanded)}
              sx={{ color: 'white' }}
            >
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>

          <Collapse in={expanded}>
            <Grid container spacing={1} sx={{ mt: 1 }}>
              {/* Performance */}
              <Grid item xs={12}>
                <Typography variant="caption" color="#ff9800" fontWeight="bold">
                  🚀 PERFORMANCE
                </Typography>
              </Grid>
              
              <Grid item xs={4}>
                <Paper sx={{ p: 0.5, backgroundColor: 'rgba(255,255,255,0.05)' }}>
                  <Typography variant="caption" display="block" color="white">
                    FPS
                  </Typography>
                  <Typography variant="body2" color={extendedMetrics.fps >= 55 ? '#4caf50' : extendedMetrics.fps >= 30 ? '#ff9800' : '#f44336'}>
                    {extendedMetrics.fps}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={4}>
                <Paper sx={{ p: 0.5, backgroundColor: 'rgba(255,255,255,0.05)' }}>
                  <Typography variant="caption" display="block" color="white">
                    FCP
                  </Typography>
                  <Typography variant="body2" color="white">
                    {extendedMetrics.firstContentfulPaint}ms
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={4}>
                <Paper sx={{ p: 0.5, backgroundColor: 'rgba(255,255,255,0.05)' }}>
                  <Typography variant="caption" display="block" color="white">
                    LCP
                  </Typography>
                  <Typography variant="body2" color="white">
                    {extendedMetrics.largestContentfulPaint}ms
                  </Typography>
                </Paper>
              </Grid>

              {/* Errores y Red */}
              <Grid item xs={12}>
                <Typography variant="caption" color="#f44336" fontWeight="bold" sx={{ mt: 1 }}>
                  🚨 ERRORES & RED
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Paper sx={{ p: 0.5, backgroundColor: 'rgba(255,255,255,0.05)' }}>
                  <Typography variant="caption" display="block" color="white">
                    Errores
                  </Typography>
                  <Typography variant="body2" color={extendedMetrics.errorCount === 0 ? '#4caf50' : '#f44336'}>
                    {extendedMetrics.errorCount}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={6}>
                <Paper sx={{ p: 0.5, backgroundColor: 'rgba(255,255,255,0.05)' }}>
                  <Typography variant="caption" display="block" color="white">
                    API Calls
                  </Typography>
                  <Typography variant="body2" color="white">
                    {extendedMetrics.apiCalls}
                  </Typography>
                </Paper>
              </Grid>

              {extendedMetrics.lastError && (
                <Grid item xs={12}>
                  <Paper sx={{ p: 0.5, backgroundColor: 'rgba(244, 67, 54, 0.1)', border: '1px solid #f44336' }}>
                    <Typography variant="caption" color="#f44336">
                      Último Error:
                    </Typography>
                    <Typography variant="caption" display="block" color="white" sx={{ fontSize: '0.7rem' }}>
                      {extendedMetrics.lastError.substring(0, 50)}...
                    </Typography>
                  </Paper>
                </Grid>
              )}

              {/* Usuario */}
              <Grid item xs={12}>
                <Typography variant="caption" color="#2196f3" fontWeight="bold" sx={{ mt: 1 }}>
                  👤 USUARIO
                </Typography>
              </Grid>

              <Grid item xs={4}>
                <Paper sx={{ p: 0.5, backgroundColor: 'rgba(255,255,255,0.05)' }}>
                  <Typography variant="caption" display="block" color="white">
                    Clicks
                  </Typography>
                  <Typography variant="body2" color="white">
                    {extendedMetrics.clickCount}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={4}>
                <Paper sx={{ p: 0.5, backgroundColor: 'rgba(255,255,255,0.05)' }}>
                  <Typography variant="caption" display="block" color="white">
                    Scroll
                  </Typography>
                  <Typography variant="body2" color="white">
                    {Math.round(extendedMetrics.scrollDistance)}px
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={4}>
                <Paper sx={{ p: 0.5, backgroundColor: 'rgba(255,255,255,0.05)' }}>
                  <Typography variant="caption" display="block" color="white">
                    Tiempo
                  </Typography>
                  <Typography variant="body2" color="white">
                    {Math.floor(extendedMetrics.timeOnPage / 60)}:{(extendedMetrics.timeOnPage % 60).toString().padStart(2, '0')}
                  </Typography>
                </Paper>
              </Grid>

              {/* Sistema */}
              <Grid item xs={12}>
                <Typography variant="caption" color="#9c27b0" fontWeight="bold" sx={{ mt: 1 }}>
                  💻 SISTEMA
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {extendedMetrics.batteryLevel !== null && (
                    <Chip 
                      label={`🔋 ${extendedMetrics.batteryLevel}%`} 
                      size="small" 
                      color={extendedMetrics.batteryLevel > 50 ? 'success' : extendedMetrics.batteryLevel > 20 ? 'warning' : 'error'}
                      sx={{ fontSize: '0.7rem' }}
                    />
                  )}
                  
                  {extendedMetrics.deviceMemory !== null && (
                    <Chip 
                      label={`💾 ${extendedMetrics.deviceMemory}GB`} 
                      size="small" 
                      color="info"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  )}
                  
                  {extendedMetrics.coreCount !== null && (
                    <Chip 
                      label={`⚙️ ${extendedMetrics.coreCount} cores`} 
                      size="small" 
                      color="secondary"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  )}

                  <Chip 
                    label={`📡 ${Math.round(extendedMetrics.averageResponseTime)}ms`} 
                    size="small" 
                    color={getStatusColor(extendedMetrics.averageResponseTime, { good: 200, warning: 500 })}
                    sx={{ fontSize: '0.7rem' }}
                  />
                </Box>
              </Grid>

              {/* Acciones */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Chip 
                    label="🔄 Reset Contadores" 
                    size="small" 
                    variant="outlined"
                    onClick={() => DebugMonitor.getInstance().resetCounters()}
                    sx={{ 
                      color: 'white', 
                      borderColor: 'rgba(255,255,255,0.3)',
                      fontSize: '0.7rem',
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Collapse>
        </Alert>
      </Box>
    </Fade>
  );
}
