'use client';

import { Typography, Box, IconButton, Tooltip, Chip } from '@mui/material';
import Material3ElevatedCard from '@/components/ui/Material3ElevatedCard';
import { useTranslation } from '@/hooks/useTranslation';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { TaskData } from '@/data/tasks';
import { useTasks } from '@/context/TasksContext';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import SchoolSelector from '@/components/SchoolSelector';

// Helper para acceder a localStorage de forma segura (exported at file scope)
const safeLocalStorage = {
  getItem: (key: string) => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, value);
    } catch {
      // Silently fail if localStorage is not available
    }
  },
  removeItem: (key: string) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch {
      // Silently fail if localStorage is not available
    }
  }
};

// Lazy loading para el componente de debug pesado
const DebugMetrics = dynamic(() => import('@/components/admin/DebugMetrics'), {
  ssr: false
});

// Styles extracted for readability
const PROJECTS_STYLES = `
  /* Android (Material) inspired layout: denser grid, clear elevation, left accent strip */
  .projects-grid {
    display: grid;
    gap: 12px;
    grid-template-columns: 1fr;
    padding-bottom: 6px;
  }

  @media (min-width: 900px) {
    .projects-grid {
      grid-template-columns: 1fr 1fr; /* dos columnas en pantallas grandes */
      gap: 14px;
    }
  }

  /* Tarjeta estilo Android - Material Elevation */
  .android-card {
    border-radius: 12px;
    overflow: hidden;
    will-change: transform, box-shadow;
  }

  /* tactile interaction: denser and snappy */
  .tap-press {
    transition: transform 180ms cubic-bezier(.2,.8,.2,1), box-shadow 180ms ease;
    touch-action: manipulation;
  }

  .tap-press:active {
    transform: translateY(1px) scale(0.997);
  }

  /* Left accent bar consistent with Android guidelines */
  .android-accent-bar {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 6px;
    border-top-right-radius: 6px;
    border-bottom-right-radius: 6px;
  }

  /* subtle focus ring */
  .android-card:focus-within {
    box-shadow: 0 4px 10px rgba(16,24,40,0.08);
  }
`;

// 🎨 Sistema de Colores Material You/Google
const useMaterialYouTheme = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Actualizar cada minuto
    return () => clearInterval(timer);
  }, []);

  const hour = currentTime.getHours();

  // 🎨 Paletas dinámicas basadas en la hora del día
  const getDynamicPalette = () => {
    if (hour >= 6 && hour < 12) {
      // 🌅 Mañana - tonos cálidos y energéticos
      return {
        primary: '#FF6B35',      // Coral vibrante
        secondary: '#F7931E',    // Naranja soleado
        tertiary: '#FFD23F',     // Amarillo dorado
        surface: '#FFF8F0',      // Blanco cálido
        surfaceVariant: '#F5E6D3', // Beige claro
        onSurface: '#2D1810',    // Marrón oscuro
        onSurfaceVariant: '#5D4037', // Marrón medio
        outline: '#D7C4B7',      // Beige oscuro
        shadow: 'rgba(255, 107, 53, 0.25)' // Sombra coral
      };
    } else if (hour >= 12 && hour < 17) {
      // ☀️ Tarde - tonos frescos y productivos
      return {
        primary: '#1976D2',      // Azul profesional
        secondary: '#42A5F5',    // Azul cielo
        tertiary: '#81C784',     // Verde menta
        surface: '#FAFAFA',      // Gris muy claro
        surfaceVariant: '#F5F5F5', // Gris claro
        onSurface: '#0D47A1',    // Azul oscuro
        onSurfaceVariant: '#1565C0', // Azul medio
        outline: '#BDBDBD',      // Gris medio
        shadow: 'rgba(25, 118, 210, 0.25)' // Sombra azul
      };
    } else if (hour >= 17 && hour < 21) {
      // 🌆 Atardecer - tonos cálidos y relajantes
      return {
        primary: '#9C27B0',      // Púrpura elegante
        secondary: '#BA68C8',    // Lavanda
        tertiary: '#FF7043',     // Coral oscuro
        surface: '#FEF7FF',      // Blanco lavanda
        surfaceVariant: '#F3E5F5', // Lavanda claro
        onSurface: '#4A148C',    // Púrpura oscuro
        onSurfaceVariant: '#7B1FA2', // Púrpura medio
        outline: '#CE93D8',      // Lavanda medio
        shadow: 'rgba(156, 39, 176, 0.25)' // Sombra púrpura
      };
    } else {
      // 🌙 Noche - tonos oscuros y sofisticados
      return {
        primary: '#212121',      // Gris muy oscuro
        secondary: '#424242',    // Gris oscuro
        tertiary: '#FF5722',     // Naranja intenso
        surface: '#303030',      // Gris oscuro
        surfaceVariant: '#424242', // Gris medio
        onSurface: '#FFFFFF',    // Blanco
        onSurfaceVariant: '#BDBDBD', // Gris claro
        outline: '#616161',      // Gris
        shadow: 'rgba(33, 33, 33, 0.4)' // Sombra oscura
      };
    }
  };

  const palette = getDynamicPalette();

  // 🎯 Generar colores para cada tipo de proyecto
  const getProjectColors = (taskType?: string, index?: number) => {
    const baseColors = [
      { primary: '#FF6B35', secondary: '#FF8F65', accent: '#FFD23F' }, // Coral
      { primary: '#1976D2', secondary: '#42A5F5', accent: '#81C784' }, // Azul
      { primary: '#9C27B0', secondary: '#BA68C8', accent: '#FF7043' }, // Púrpura
      { primary: '#388E3C', secondary: '#4CAF50', accent: '#8BC34A' }, // Verde
      { primary: '#F57C00', secondary: '#FF9800', accent: '#FFC107' }, // Naranja
      { primary: '#7B1FA2', secondary: '#9C27B0', accent: '#E91E63' }, // Morado
    ];

    const colorIndex = index !== undefined ? index % baseColors.length : Math.floor(Math.random() * baseColors.length);
    return baseColors[colorIndex];
  };

  return {
    palette,
    getProjectColors,
    currentTime: hour
  };
};

const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return String(error || 'Unknown error');
};

export default function ProjectsDashboard() {
  const { tasks } = useTasks();
  const { user } = useAuth();
  const { palette, getProjectColors, currentTime } = useMaterialYouTheme();
  const [debugInfo, setDebugInfo] = useState(false);
  const [orderedTasks, setOrderedTasks] = useState<TaskData[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);
  const { t } = useTranslation();
  
  // Marcar cuando la hidratación está completa
  useEffect(() => {
    setIsHydrated(true);
  }, []);
  
  // safeLocalStorage moved above for readability (see file top)
  
  // Efecto para cerrar debug al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Si debugInfo está activo y el clic no es dentro del panel de debug
      if (debugInfo && user?.role === 'admin') {
        const debugPanel = document.querySelector('[data-debug-panel]');
        if (debugPanel && !debugPanel.contains(event.target as Node)) {
          setDebugInfo(false);
        }
      }
    };

    if (debugInfo) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [debugInfo, user?.role]);
  
  // Efecto para auto-cerrar el tooltip de información después de 3 segundos
  useEffect(() => {
    if (showInfoTooltip) {
      const timer = setTimeout(() => {
        setShowInfoTooltip(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [showInfoTooltip]);
  
  // Inicializar tareas ordenadas
  useEffect(() => {
    if (!isHydrated) return; // Solo ejecutar después de la hidratación
    
    let initialTasks = [...tasks];
    
    // Cargar orden guardado desde localStorage
    const savedOrder = safeLocalStorage.getItem('tasksOrder');
    if (savedOrder) {
      try {
        const orderIds = JSON.parse(savedOrder);
        const ordered = orderIds.map((id: string) => 
          initialTasks.find(task => String(task.id) === id)
        ).filter(Boolean);
        
        // Agregar tareas nuevas que no estén en el orden guardado
        const newTasks = initialTasks.filter(task => 
          !orderIds.includes(String(task.id))
        );
        
        initialTasks = [...ordered, ...newTasks];
      } catch (error) {
        console.warn('Error loading saved task order:', error);
      }
    }
    
    setOrderedTasks(initialTasks);
  }, [tasks, isHydrated]);
  
  // Eliminada la lógica de drag & drop para simplificar la UI móvil
  
  // Se han eliminado los handlers de drag/swipe para un comportamiento de lista simple y móvil

  return (
    <Box sx={{ py: 2, position: 'relative' }}>
      {/* Mostrar loading state durante hidratación para evitar diferencias */}
      {!isHydrated ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <Typography>Cargando...</Typography>
        </Box>
      ) : (
        <>
          <style>{PROJECTS_STYLES}</style>

          {/* Header con título y botones de control */}
          <Box sx={{ mb: 3, px: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              {/* Traducción del título */}
              <Typography
                variant="h4"
                fontWeight={700}
                sx={{
                  mb: 0,
                  background: `linear-gradient(135deg, ${palette.primary} 0%, ${palette.secondary} 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: `0 2px 4px ${palette.shadow}`,
                  letterSpacing: '-0.02em',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {t('pages.home.projectsActive')}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Traducción del contador de proyectos */}
              {(() => {
                // Reemplazo manual de {{count}} por el valor
                const countText = t('pages.home.projectsCount').replace('{{count}}', orderedTasks.length.toString());
                return (
                  <Typography variant="body2" color="text.secondary">
                    {countText}
                  </Typography>
                );
              })()}
              <Tooltip 
                title="💡 Desliza las tarjetas horizontalmente para reorganizar"
                open={showInfoTooltip}
                onClose={() => setShowInfoTooltip(false)}
                placement="top"
                arrow
                componentsProps={{
                  tooltip: {
                    sx: {
                      bgcolor: 'rgba(0, 0, 0, 0.9)',
                      fontSize: '0.75rem',
                      maxWidth: 250,
                      textAlign: 'center',
                      borderRadius: 1
                    }
                  },
                  arrow: {
                    sx: {
                      color: 'rgba(0, 0, 0, 0.9)'
                    }
                  }
                }}
              >
                <IconButton 
                  size="small"
                  onClick={() => setShowInfoTooltip(!showInfoTooltip)}
                  onTouchStart={() => setShowInfoTooltip(!showInfoTooltip)}
                  sx={{ 
                    p: 0.5,
                    color: 'text.secondary',
                    '&:hover': {
                      color: 'primary.main',
                      bgcolor: 'rgba(25, 118, 210, 0.04)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <InfoOutlinedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Selector de Escuela para filtrar tasks (solo admins) */}
          <Box sx={{ px: 2, mb: 2 }}>
            <SchoolSelector />
          </Box>
          
          {/* Lista vertical Material3 */}
          <Box sx={{ position: 'relative', overflow: 'visible', px: 2 }}>
            <Box
              component={motion.div}
              className="projects-grid"
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
            >
              {orderedTasks.map((task, index) => (
                <motion.div
                  key={task.id || index}
                  variants={{ hidden: { opacity: 0, y: 8, scale: 0.995 }, show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } } }}
                  className="tap-press"
                >
                  <Material3ElevatedCard
                    id={`task-${task.id || index}`}
                    isDragged={false}
                    interactive={true}
                    sx={{
                      // Android Material style: solid project color, white text
                      background: getProjectColors(task.title, index).primary,
                      color: 'white',
                      width: '100%',
                      minHeight: 96,
                      position: 'relative',
                      overflow: 'hidden',
                      borderRadius: 12,
                      p: { xs: 1, sm: 1 },
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.5,

                      // Material elevation levels (Android 16 vibe)
                      boxShadow: `0 2px 6px rgba(0,0,0,0.12), 0 6px 18px rgba(0,0,0,0.10)`,
                      border: `1px solid ${getProjectColors(task.title, index).primary}30`,

                      // Left accent bar full height
                      '&:before': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 6,
                        background: getProjectColors(task.title, index).accent,
                        zIndex: 1,
                        borderTopRightRadius: 6,
                        borderBottomRightRadius: 6
                      },

                      // stronger ripple visual
                      '& .MuiTouchRipple-root': {
                        color: 'rgba(255,255,255,0.18)'
                      },

                      '@media (hover: hover) and (pointer: fine)': {
                        '&:hover': {
                          transform: 'translateY(-6px)',
                          boxShadow: `0 8px 24px rgba(0,0,0,0.18)`,
                        }
                      }
                    }}
                    onClick={() => {
                      if (user?.role === 'admin' && debugInfo) {
                        console.log('🎯 Card clickeada:', task);
                      }
                    }}
                  >

                    {/* Contenido de la tarjeta: título, descripción y acciones */}
                    <Box sx={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', px: 2, pt: 0.75 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4, maxWidth: '75%' }}>
                        <span className="ios-accent-pill" aria-hidden />
                        <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.05, fontSize: '1.02rem', mt: 0.5 }}>
                          {task.title}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.85, fontSize: '0.825rem', lineHeight: 1.28, mt: 0.4 }}>
                          {task.description}
                        </Typography>
                      </Box>
                      {/* removed more-actions button to simplify UI */}
                    </Box>

                    <Box sx={{ position: 'relative', zIndex: 2, mt: 'auto', px: 2, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        {task.role === 'admin' && (
                          <Chip
                            label="ADMIN"
                            size="small"
                            sx={{
                              height: 22,
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              letterSpacing: '0.5px',
                              color: getProjectColors(task.title, index).accent,
                              bgcolor: 'rgba(255,255,255,0.9)',
                              border: `1px solid ${getProjectColors(task.title, index).accent}40`,
                              boxShadow: `0 2px 8px ${getProjectColors(task.title, index).primary}10`,
                            }}
                          />
                        )}
                        {task.date && (
                          <Chip
                            icon={<CalendarTodayIcon sx={{ fontSize: '0.75rem !important', color: '#000' }} />}
                            label={(() => {
                              try {
                                return new Date(String(task.date)).toLocaleString();
                              } catch {
                                return String(task.date);
                              }
                            })()}
                            size="small"
                            sx={{
                              height: 24,
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              color: '#000',
                              bgcolor: 'rgba(255,255,255,0.92)',
                              border: `1px solid rgba(0,0,0,0.08)`,
                              boxShadow: `0 2px 8px rgba(0,0,0,0.06)`,
                            }}
                          />
                        )}
                      </Box>
                      {/* removed launch/share button per UX request */}
                    </Box>

                  </Material3ElevatedCard>
                </motion.div>
              ))}
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
}
