'use client';

import { Typography, Card, CardContent, Box, LinearProgress, Avatar, AvatarGroup, IconButton, Fab, Tooltip } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BugReportIcon from '@mui/icons-material/BugReport';
import { carouselConfig } from '@/data/tasks';
import { useTasks } from '@/context/TasksContext';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import DebugMetrics from '@/components/admin/DebugMetrics';

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
                boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                position: 'relative',
                overflow: 'hidden',
                flexShrink: 0,
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                border: user?.role === 'admin' && debugInfo ? '2px solid #ff5722' : 'none',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 48px rgba(0,0,0,0.25)'
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: 'inherit'
                }
              }}
              onClick={() => {
                if (user?.role === 'admin' && debugInfo) {
                  console.log('🎯 Card clickeada:', task);
                }
              }}
            >
              <CardContent sx={{ height: '100%', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Indicador de debug para admin */}
                {user?.role === 'admin' && debugInfo && (
                  <Box sx={{ 
                    position: 'absolute', 
                    top: 0, 
                    right: 0, 
                    backgroundColor: 'error.main', 
                    color: 'white', 
                    px: 1, 
                    py: 0.5, 
                    fontSize: '0.6rem',
                    borderRadius: '0 0 0 8px'
                  }}>
                    ID: {task.id?.slice(-4) || 'N/A'}
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.1rem' }}>
                    {task.title}
                  </Typography>
                  <IconButton size="small" sx={{ color: 'white', mt: -1, mr: -1, opacity: 0.8 }}>
                    <MoreVertIcon />
                  </IconButton>
                </Box>
                
                <Typography variant="body2" sx={{ opacity: 0.85, mb: 3, fontSize: '0.85rem' }}>
                  {task.description}
                </Typography>
                
                <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
                  Progreso
                </Typography>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                  {task.progress}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={task.progress}
                  sx={{ 
                    height: 8, 
                    borderRadius: '4px', 
                    mb: 2,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    '& .MuiLinearProgress-bar': { 
                      backgroundColor: 'white',
                      borderRadius: '4px'
                    }
                  }}
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                  <AvatarGroup max={4} sx={{ 
                    '& .MuiAvatar-root': { 
                      width: 32, 
                      height: 32, 
                      fontSize: '0.8rem', 
                      border: '2px solid white',
                      ml: -1
                    } 
                  }}>
                    {task.avatars.map((avatar, avatarIndex) => (
                      <Avatar key={avatarIndex} sx={{ 
                        bgcolor: avatarIndex === 0 ? '#ff6b6b' : 
                                avatarIndex === 1 ? '#4ecdc4' : 
                                avatarIndex === 2 ? '#45b7d1' : '#96ceb4',
                        fontSize: avatar.includes('+') ? '0.7rem' : '0.8rem' 
                      }}>
                        {avatar}
                      </Avatar>
                    ))}
                  </AvatarGroup>
                  {task.date && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, opacity: 0.8 }}>
                      <CalendarTodayIcon sx={{ fontSize: '1rem' }} />
                      <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                        {task.date}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
      
      {/* Métricas de debug para admin */}
      <DebugMetrics show={debugInfo && user?.role === 'admin'} />
    </Box>
  );
}
