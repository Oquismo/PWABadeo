'use client';

import { Typography, Card, CardContent, Box, IconButton, Tooltip, Chip } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LaunchIcon from '@mui/icons-material/Launch';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import BugReportIcon from '@mui/icons-material/BugReport';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { carouselConfig } from '@/data/tasks';
import { TaskData } from '@/data/tasks';
import { useTasks } from '@/context/TasksContext';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { createSwapy } from 'swapy';
import dynamic from 'next/dynamic';

// Lazy loading para el componente de debug pesado
const DebugMetrics = dynamic(() => import('@/components/admin/DebugMetrics'), {
  ssr: false
});

export default function ProjectsDashboard() {
  const { tasks, deleteTask } = useTasks();
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState(false);
  const [dragMode, setDragMode] = useState<'swapy' | 'html5'>('swapy'); // Usar Swapy por defecto para animaciones
  const [orderedTasks, setOrderedTasks] = useState<TaskData[]>([]);
  const swapyRef = useRef<HTMLDivElement>(null);
  const swapyInstance = useRef<any>(null);
  
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
  
  // Inicializar tareas ordenadas
  useEffect(() => {
    let initialTasks = [...tasks];
    
    // Cargar orden guardado desde localStorage
    const savedOrder = localStorage.getItem('tasksOrder');
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
  }, [tasks]);
  
  // Inicializar Swapy para drag and drop
  useEffect(() => {
    // Solo inicializar si estamos en modo swapy, hay al menos 2 tareas y el contenedor existe
    if (dragMode !== 'swapy' || !swapyRef.current || orderedTasks.length < 2) {
      if (swapyInstance.current) {
        try {
          swapyInstance.current.destroy();
          swapyInstance.current = null;
        } catch (error) {
          console.error('Error limpiando Swapy:', error);
        }
      }
      return;
    }

    // Pequeño delay para asegurar que los elementos estén renderizados
    const timeoutId = setTimeout(() => {
      try {
        // Destruir instancia anterior si existe
        if (swapyInstance.current) {
          swapyInstance.current.destroy();
          swapyInstance.current = null;
        }

        // Verificar que los elementos existen
        if (!swapyRef.current) {
          console.warn('Contenedor Swapy no disponible');
          return;
        }

        const items = swapyRef.current.querySelectorAll('[data-swapy-item]');
        if (items.length === 0) {
          console.warn('No se encontraron elementos con data-swapy-item');
          return;
        }

        console.log('🎯 Inicializando Swapy con', items.length, 'elementos');

        // Configuración avanzada de Swapy con animaciones
        swapyInstance.current = createSwapy(swapyRef.current, {
          animation: 'spring',
          swapMode: 'hover',
          dragOnHold: false,
          autoScrollOnDrag: false
        });

        swapyInstance.current.onSwap((event: any) => {
          try {
            if (!event || !event.detail || !event.detail.data) {
              console.warn('Evento swap inválido:', event);
              return;
            }

            const { data } = event.detail;
            if (!Array.isArray(data) || data.length === 0) {
              console.warn('Data del swap no es array válido:', data);
              return;
            }

            const newOrder = data
              .filter((item: any) => item && item.element && item.element.id)
              .map((item: any) => {
                const taskId = item.element.id.replace('task-', '');
                return orderedTasks.find(task => String(task.id) === taskId);
              })
              .filter((task): task is TaskData => task !== undefined && task !== null);

            if (newOrder.length === orderedTasks.length && newOrder.length > 0) {
              console.log('🔄 Nuevo orden (Swapy):', newOrder.map(t => t.title));
              setOrderedTasks(newOrder);

              // Guardar el orden en localStorage
              const orderIds = newOrder.map(task => task.id);
              localStorage.setItem('tasksOrder', JSON.stringify(orderIds));
            } else {
              console.warn('Orden inválido generado:', newOrder.length, 'vs', orderedTasks.length);
            }
          } catch (error) {
            console.error('❌ Error procesando swap de Swapy:', error instanceof Error ? error.message : String(error));
          }
        });

        console.log('✅ Swapy inicializado correctamente');

        // Verificar que los elementos sean arrastrables
        const draggableElements = swapyRef.current.querySelectorAll('.swapy-item');
        console.log('🎯 Elementos arrastrables encontrados:', draggableElements.length);

        // Agregar listener adicional para verificar funcionamiento
        swapyInstance.current.onBeforeSwap((event: any) => {
          console.log('🎯 onBeforeSwap:', event?.detail);
        });

        swapyInstance.current.onAfterSwap((event: any) => {
          console.log('🎉 onAfterSwap completado');
        });

        // Mostrar mensaje de éxito
        console.log('🚀 ¡Swapy está listo! Puedes arrastrar las tarjetas ahora.');

      } catch (error) {
        console.error('❌ Error inicializando Swapy:', error instanceof Error ? error.message : String(error));
        console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');

        // Mostrar información de debug adicional
        console.log('🔍 Información de debug:');
        console.log('- Modo:', dragMode);
        console.log('- Tareas:', orderedTasks.length);
        console.log('- Contenedor:', !!swapyRef.current);

        // Limpiar instancia en caso de error
        if (swapyInstance.current) {
          try {
            swapyInstance.current.destroy();
          } catch (destroyError) {
            console.error('Error destruyendo Swapy después del error:', destroyError instanceof Error ? destroyError.message : String(destroyError));
          }
          swapyInstance.current = null;
        }
      }
    }, 100); // Pequeño delay

    return () => {
      clearTimeout(timeoutId);
      if (swapyInstance.current) {
        try {
          swapyInstance.current.destroy();
          swapyInstance.current = null;
        } catch (error) {
          console.error('Error limpiando Swapy:', error);
        }
      }
    };
  }, [orderedTasks.length, dragMode]); // Incluir dragMode en las dependencias
  
  // Función alternativa de drag and drop usando HTML5 API
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));

    if (dragIndex !== dropIndex) {
      const newTasks = [...orderedTasks];
      const [draggedTask] = newTasks.splice(dragIndex, 1);
      newTasks.splice(dropIndex, 0, draggedTask);

      setOrderedTasks(newTasks);
      localStorage.setItem('tasksOrder', JSON.stringify(newTasks.map(task => task.id)));
      console.log('🔄 Orden actualizado (HTML5):', newTasks.map(t => t.title));
    }
  };
  
  // Función para cambiar el modo de drag
  const toggleDragMode = () => {
    const newMode = dragMode === 'html5' ? 'swapy' : 'html5';
    setDragMode(newMode);
    console.log(`🔄 Modo cambiado a: ${newMode}`);

    // Limpiar instancia de Swapy cuando cambiamos de modo
    if (swapyInstance.current) {
      try {
        swapyInstance.current.destroy();
        swapyInstance.current = null;
        console.log('🧹 Instancia Swapy limpiada');
      } catch (error) {
        console.error('Error limpiando Swapy:', error);
      }
    }
  };
  
  // Función para probar drag and drop
  const testDragDrop = () => {
    console.group('🧪 Diagnóstico Drag & Drop');

    console.log('📦 Contenedor Swapy:', swapyRef.current);
    console.log('🎯 Instancia Swapy:', swapyInstance.current);
    console.log('📋 Tareas ordenadas:', orderedTasks.length);
    console.log('🔢 Número de tareas:', orderedTasks.length);
    console.log('🎮 Modo actual:', dragMode);

    if (swapyRef.current) {
      const items = swapyRef.current.querySelectorAll('[data-swapy-item]');
      console.log('🎯 Elementos con data-swapy-item:', items.length);

      items.forEach((item, index) => {
        console.log(`  ${index}:`, item.id, item.className);
      });

      // Verificar si los elementos están visibles
      const rect = swapyRef.current.getBoundingClientRect();
      console.log('📏 Dimensiones del contenedor:', rect.width, 'x', rect.height);
    }

    if (swapyInstance.current) {
      console.log('✅ Swapy está activo');
      // Intentar acceder a métodos de Swapy para verificar estado
      try {
        console.log('🔧 Estado interno de Swapy: OK');
      } catch (error) {
        console.log('🔧 Error accediendo a Swapy:', error instanceof Error ? error.message : String(error));
      }
    } else {
      console.log('❌ Swapy no está inicializado');
      if (dragMode === 'swapy' && orderedTasks.length >= 2) {
        console.log('💡 Debería estar inicializado. Revisa la consola por errores.');
      }
    }

    console.groupEnd();
  };
  
  // Función para resetear el orden de las tareas al orden original
  const resetTaskOrder = () => {
    try {
      // Resetear al orden original (por título alfabéticamente, ya que id es string opcional)
      const originalOrder = [...tasks].sort((a, b) => {
        const aId = a.id || a.title;
        const bId = b.id || b.title;
        return aId.localeCompare(bId);
      });
      setOrderedTasks(originalOrder);
      
      // Limpiar el orden guardado en localStorage
      localStorage.removeItem('tasksOrder');
      
      console.log('🔄 Orden de tareas reseteado al original');
      
      // Reinicializar Swapy con el nuevo orden
      if (swapyInstance.current) {
        setTimeout(() => {
          // Limpiar instancia de Swapy
          try {
            swapyInstance.current.destroy();
            swapyInstance.current = null;
            console.log('🧹 Instancia Swapy limpiada para reinicialización');
          } catch (error) {
            console.error('Error limpiando Swapy:', error instanceof Error ? error.message : String(error));
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error reseteando orden de tareas:', error instanceof Error ? error.message : String(error));
    }
  };

  // Función de debug para administradores
  const showDebugInfo = () => {
    console.group('🔧 DEBUG INFO - ProjectsDashboard');
    console.log('📊 Total de tareas:', tasks.length);
    console.log('👤 Usuario actual:', user?.name, `(${user?.role})`);
    console.log('🎨 Configuración del carrusel:', carouselConfig);
    console.log('📋 Datos de tareas:', tasks);
    console.log('🔄 Tareas ordenadas:', orderedTasks);
    console.log('� Swapy inicializado:', !!swapyInstance.current);
    console.log('�🏪 LocalStorage keys:', Object.keys(localStorage));
    console.log('⏰ Timestamp:', new Date().toISOString());
    console.groupEnd();

    setDebugInfo(!debugInfo);
  };
  
  return (
    <Box sx={{ py: 4, position: 'relative' }}>
      <style>{`
        .swapy-item {
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
          cursor: grab;
          user-select: none;
          position: relative;
          touch-action: none;
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          will-change: transform, opacity;
        }
        .swapy-item:active {
          cursor: grabbing;
        }
        .swapy-item.is-dragging {
          opacity: 0.95;
          transform: rotate(2deg) scale(1.03) translateZ(0);
          z-index: 1000;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease;
        }
        .swapy-item.is-ghost {
          opacity: 0.6;
          transform: scale(0.98) translateZ(0);
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease;
        }
        .swapy-slot {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .swapy-slot.is-highlighted {
          transform: scale(1.02) translateZ(0);
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .swapy-container {
          position: relative;
          overflow: visible;
        }
        /* Indicador de drag */
        .drag-indicator {
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(255, 255, 255, 0.95);
          color: rgba(0, 0, 0, 0.8);
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 600;
          opacity: 0;
          transition: opacity 0.2s ease;
          pointer-events: none;
          z-index: 10;
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .swapy-item:hover .drag-indicator {
          opacity: 1;
        }
      `}</style>
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
              {orderedTasks.length} tareas • {dragMode === 'swapy' ? '🎯 Swapy' : '🌐 HTML5'} {swapyInstance.current ? '✅' : '❌'}
            </Typography>
            <Tooltip title="Resetear orden">
              <IconButton 
                size="small" 
                onClick={resetTaskOrder}
                sx={{ 
                  color: 'warning.main',
                  backgroundColor: 'warning.50'
                }}
              >
                <LaunchIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={`Modo ${dragMode === 'html5' ? 'HTML5' : 'Swapy'} - Click para cambiar`}>
              <IconButton 
                size="small" 
                onClick={toggleDragMode}
                sx={{ 
                  color: dragMode === 'html5' ? 'success.main' : 'info.main',
                  backgroundColor: dragMode === 'html5' ? 'success.50' : 'info.50',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    backgroundColor: dragMode === 'html5' ? 'success.100' : 'info.100'
                  }
                }}
              >
                {dragMode === 'html5' ? '🌐' : '🎯'}
              </IconButton>
            </Tooltip>
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
        }} ref={swapyRef}>
          {orderedTasks.map((task, index) => (
            <Card
              key={task.id || index}
              id={`task-${task.id || index}`}
              data-swapy-item={dragMode === 'swapy' ? `item-${index}` : undefined}
              className={dragMode === 'swapy' ? "swapy-item" : ""}
              draggable={dragMode === 'html5'}
              onDragStart={dragMode === 'html5' ? (e) => handleDragStart(e, index) : undefined}
              onDragOver={dragMode === 'html5' ? handleDragOver : undefined}
              onDrop={dragMode === 'html5' ? (e) => handleDrop(e, index) : undefined}
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
                cursor: dragMode === 'html5' ? 'grab' : 'pointer',
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
              {/* Indicador de drag */}
              <Box className="drag-indicator">
                {dragMode === 'swapy' ? '🎯 Swapy' : '🌐 HTML5'}
              </Box>
              
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Tooltip title="Arrastrar para reordenar">
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      color: 'white', 
                      opacity: 0.6,
                      '&:hover': { opacity: 1 }
                    }}>
                      <DragIndicatorIcon fontSize="small" />
                    </Box>
                  </Tooltip>
                  <IconButton size="small" sx={{ color: 'white', opacity: 0.8, mt: -0.5 }}>
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Box>
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
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Eliminar tarea">
                    <IconButton 
                      size="small" 
                      sx={{ 
                        color: 'white', 
                        opacity: 0.85,
                        '&:hover': { 
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          opacity: 1
                        }
                      }}
                      onClick={() => {
                        console.log('Eliminando tarea:', task.id);
                        deleteTask(String(task.id));
                      }}
                    >
                      <InfoOutlinedIcon fontSize="inherit" />
                    </IconButton>
                  </Tooltip>
                  <IconButton size="small" sx={{ color: 'white', opacity: 0.85 }}>
                    <LaunchIcon fontSize="inherit" />
                  </IconButton>
                </Box>
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
                  ID {String(task.id).slice(-4) || 'N/A'}
                </Box>
              )}
            </Card>
          ))}
        </Box>
      </Box>
      
      {/* Métricas de debug para admin - oculto por defecto para no interferir */}
      <Box sx={{ 
        position: 'fixed', 
        bottom: 20, 
        right: 20, 
        zIndex: 1000,
        maxWidth: '300px',
        display: debugInfo && user?.role === 'admin' ? 'block' : 'none'
      }} data-debug-panel>
        <DebugMetrics show={debugInfo && user?.role === 'admin'} />
      </Box>
    </Box>
  );
}
