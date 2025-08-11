'use client';

import { Typography, Card, CardContent, Box, IconButton, Tooltip, Chip } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LaunchIcon from '@mui/icons-material/Launch';
import BugReportIcon from '@mui/icons-material/BugReport';
import { carouselConfig } from '@/data/tasks';
import { useTasks } from '@/context/TasksContext';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import dynamic from 'next/dynamic';

// Lazy loading para el componente de debug pesado
const DebugMetrics = dynamic(() => import('@/components/admin/DebugMetrics'), {
  ssr: false
});

export default function ProjectsDashboard() {
  const { tasks } = useTasks();
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState(false);
  
  // Función de debug para administradores
  const showDebugInfo = () => {
    console.group('🔧 DEBUG INFO - ProjectsDashboard');
    console.log('📊 Total de tareas:', tasks.length);
    console.log('👤 Usuario actual:', user?.name, `(${user?.role})`);
    console.log('🎨 Configuración del carrusel:', carouselConfig);
    console.log('📋 Datos de tareas:', tasks);
    console.log('🏪 LocalStorage keys:', Object.keys(localStorage));
    console.log('⏰ Timestamp:', new Date().toISOString());
    console.groupEnd();
    
    setDebugInfo(!debugInfo);
  };
  
  return (
    <Box sx={{ py: 4, position: 'relative' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, px: 2 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ color: 'text.primary' }}>
          {carouselConfig.title}
        </Typography>
        
        {/* Herramientas de debug solo para admin */}
        {user?.role === 'admin' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" sx={{ 
              color: debugInfo ? 'error.main' : 'text.secondary',
              fontSize: '0.7rem'
            }}>
              {tasks.length} tareas • Admin Mode
            </Typography>
            <Tooltip title="Debug Info (Solo Admin)">
              <IconButton 
                size="small" 
                onClick={showDebugInfo}
                sx={{ 
                  color: debugInfo ? 'error.main' : 'text.secondary',
                  backgroundColor: debugInfo ? 'error.50' : 'transparent'
                }}
              >
                <BugReportIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>
      
      {/* Carrusel horizontal */}
      <Box sx={{ 
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box sx={{ 
          display: 'flex',
          gap: carouselConfig.gap,
          px: 2,
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          paddingBottom: '20px',
          '&::-webkit-scrollbar': {
            display: 'none'
          },
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none'
        }}>
          {tasks.map((task, index) => (
            <Card
              key={task.id || index}
              sx={{
                background: task.color,
                color: 'white',
                minWidth: carouselConfig.cardWidth,
                width: carouselConfig.cardWidth,
                height: carouselConfig.cardHeight,
                borderRadius: carouselConfig.borderRadius,
                position: 'relative',
                overflow: 'hidden',
                flexShrink: 0,
                cursor: 'pointer',
                p: 0.5,
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
                boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                transition: 'transform .25s ease, box-shadow .25s ease',
                border: user?.role === 'admin' && debugInfo ? '1.5px solid #ff9800' : '1px solid rgba(255,255,255,0.15)',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 10px 36px rgba(0,0,0,0.4)'
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  inset: 0,
                  background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.25), transparent 60%)',
                  opacity: 0.4
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  inset: 0,
                  backdropFilter: 'blur(2px)',
                  background: 'linear-gradient(140deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))'
                }
              }}
              onClick={() => {
                if (user?.role === 'admin' && debugInfo) {
                  console.log('🎯 Card clickeada:', task);
                }
              }}
            >
              {/* Etiquetas superiores */}
              <Box sx={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', px: 1, pt: 0.5 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, maxWidth: '75%' }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.15, fontSize: '1.05rem', textShadow: '0 2px 4px rgba(0,0,0,0.25)' }}>
                    {task.title}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.72rem', lineHeight: 1.2 }}>
                    {task.description}
                  </Typography>
                </Box>
                <IconButton size="small" sx={{ color: 'white', opacity: 0.8, mt: -0.5 }}>
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Box>

              {/* Badge ADMIN y fecha */}
              <Box sx={{ position: 'relative', zIndex: 2, mt: 'auto', px: 1, pb: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                  {task.role === 'admin' && (
                    <Chip label="ADMIN" size="small" sx={{
                      height: 20,
                      fontSize: '0.55rem',
                      fontWeight: 600,
                      letterSpacing: '.5px',
                      color: '#fff',
                      bgcolor: 'rgba(0,0,0,0.35)',
                      backdropFilter: 'blur(3px)',
                      border: '1px solid rgba(255,255,255,0.25)'
                    }} />
                  )}
                  {task.date && (
                    <Chip icon={<CalendarTodayIcon sx={{ fontSize: '0.9rem !important' }} />} label={task.date} size="small" sx={{
                      height: 20,
                      fontSize: '0.55rem',
                      pl: 0.5,
                      pr: 0.8,
                      color: '#fff',
                      bgcolor: 'rgba(255,255,255,0.15)',
                      border: '1px solid rgba(255,255,255,0.25)',
                      '.MuiChip-icon': { ml: 0, color: 'inherit' }
                    }} />
                  )}
                </Box>
                <IconButton size="small" sx={{ color: 'white', opacity: 0.85 }}>
                  <LaunchIcon fontSize="inherit" />
                </IconButton>
              </Box>

              {/* Debug overlay id */}
              {user?.role === 'admin' && debugInfo && (
                <Box sx={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  zIndex: 3,
                  background: 'rgba(0,0,0,0.45)',
                  color: 'white',
                  px: 0.5,
                  py: 0.25,
                  fontSize: '0.55rem',
                  borderRadius: '4px',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  ID {task.id?.slice(-4) || 'N/A'}
                </Box>
              )}
            </Card>
          ))}
        </Box>
      </Box>
      
      {/* Métricas de debug para admin */}
      <DebugMetrics show={debugInfo && user?.role === 'admin'} />
    </Box>
  );
}
