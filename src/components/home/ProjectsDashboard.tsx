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
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [swipedCardIndex, setSwipedCardIndex] = useState<number | null>(null);
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
    const timeoutId = setTimeout(() => {
      // Solo inicializar si estamos en modo swapy, hay al menos 2 tareas y el contenedor existe
      if (dragMode !== 'swapy' || !swapyRef.current || orderedTasks.length < 2) {
        if (swapyInstance.current) {
          try {
            swapyInstance.current.destroy();
            swapyInstance.current = null;
          } catch (error) {
            console.error('Error limpiando Swapy:', error instanceof Error ? error.message : String(error));
          }
        }
        return;
      }

      try {
        // Limpiar instancia anterior si existe
        if (swapyInstance.current) {
          swapyInstance.current.destroy();
          swapyInstance.current = null;
        }

        if (!swapyRef.current) {
          console.warn('Contenedor Swapy no disponible');
          return;
        }

        const items = swapyRef.current.querySelectorAll('[data-swapy-item]');
        const slots = swapyRef.current.querySelectorAll('[data-swapy-slot]');
        
        console.log('🔍 Debug Swapy:');
        console.log('- Items encontrados:', items.length);
        console.log('- Slots encontrados:', slots.length);
        
        if (items.length === 0) {
          console.warn('❌ No se encontraron elementos con data-swapy-item');
          return;
        }
        
        if (slots.length === 0) {
          console.warn('❌ No se encontraron elementos con data-swapy-slot');
          return;
        }

        console.log('🎯 Inicializando Swapy con', items.length, 'items y', slots.length, 'slots');

        // Configuración optimizada de Swapy para scroll lateral
        swapyInstance.current = createSwapy(swapyRef.current, {
          animation: 'spring', // Animación de resorte para máxima fluidez
          swapMode: 'hover',
          dragOnHold: false
        });

        // Event listener mejorado usando la nueva API
        swapyInstance.current.onSwap((event: any) => {
          try {
            console.log('🔄 Evento swap recibido:', event);
            
            // Usar la nueva estructura del evento
            const { data } = event;
            if (!data || !Array.isArray(data.asArray)) {
              console.warn('Estructura de evento no válida:', data);
              return;
            }

            console.log('📋 Datos del swap:', data.asArray);

            // Reconstruir el orden basado en los slots
            const newOrder: TaskData[] = [];
            
            data.asArray.forEach((slotItem: any) => {
              const itemIndex = parseInt(slotItem.item.replace('item-', ''));
              if (!isNaN(itemIndex) && orderedTasks[itemIndex]) {
                newOrder.push(orderedTasks[itemIndex]);
              }
            });

            if (newOrder.length === orderedTasks.length && newOrder.length > 0) {
              console.log('✅ Nuevo orden aplicado:', newOrder.map(t => t.title));
              setOrderedTasks(newOrder);

              // Guardar el orden en localStorage
              const orderIds = newOrder.map(task => task.id);
              localStorage.setItem('tasksOrder', JSON.stringify(orderIds));
            } else {
              console.warn('❌ Orden inválido generado:', newOrder.length, 'vs', orderedTasks.length);
            }
          } catch (error) {
            console.error('❌ Error procesando swap de Swapy:', error instanceof Error ? error.message : String(error));
          }
        });

        console.log('✅ Swapy inicializado correctamente');

        // Verificar que los elementos sean arrastrables
        const draggableElements = swapyRef.current.querySelectorAll('.swapy-item');
        console.log('🎯 Elementos arrastrables encontrados:', draggableElements.length);

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
          console.error('Error limpiando Swapy:', error instanceof Error ? error.message : String(error));
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
    
    if (dragIndex === dropIndex) return;
    
    const newTasks = [...orderedTasks];
    const [draggedTask] = newTasks.splice(dragIndex, 1);
    newTasks.splice(dropIndex, 0, draggedTask);
    
    setOrderedTasks(newTasks);
    console.log('🔄 Nuevo orden (HTML5):', newTasks.map(t => t.title));
  };

  // Función para cambiar modo de drag
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
        console.error('Error limpiando Swapy:', error instanceof Error ? error.message : String(error));
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

      items.forEach((item: any, index: number) => {
        console.log(`  ${index}:`, item.id, item.className);
      });

      // Verificar si los elementos están visibles
      const rect = swapyRef.current.getBoundingClientRect();
      console.log('📐 Dimensiones del contenedor:', rect);
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

  // Funciones para manejar swipe gestures
  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setSwipedCardIndex(index);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || swipedCardIndex === null) {
      setTouchStart(null);
      setTouchEnd(null);
      setSwipedCardIndex(null);
      return;
    }

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe || isRightSwipe) {
      // Agregar feedback visual
      const cardElement = document.getElementById(`task-${orderedTasks[swipedCardIndex]?.id || swipedCardIndex}`);
      if (cardElement) {
        cardElement.classList.add(isLeftSwipe ? 'swipe-feedback-left' : 'swipe-feedback-right');
        setTimeout(() => {
          cardElement.classList.remove('swipe-feedback-left', 'swipe-feedback-right');
        }, 300);
      }

      const newTasks = [...orderedTasks];
      const [swipedTask] = newTasks.splice(swipedCardIndex, 1);

      if (isLeftSwipe) {
        // Mover al final
        newTasks.push(swipedTask);
        console.log('👈 Swipe izquierda - moviendo al final:', swipedTask.title);
      } else {
        // Mover al inicio
        newTasks.unshift(swipedTask);
        console.log('👉 Swipe derecha - moviendo al inicio:', swipedTask.title);
      }

      setOrderedTasks(newTasks);

      // Guardar el nuevo orden en localStorage
      const orderIds = newTasks.map(task => task.id);
      localStorage.setItem('tasksOrder', JSON.stringify(orderIds));
    }

    setTouchStart(null);
    setTouchEnd(null);
    setSwipedCardIndex(null);
  };

  // Función de debug para administradores
  const showDebugInfo = () => {
    console.group('🔧 DEBUG INFO - ProjectsDashboard');
    console.log('📊 Total de tareas:', tasks.length);
    console.log('👤 Usuario actual:', user?.name, `(${user?.role})`);
    console.log('🎨 Configuración del carrusel:', carouselConfig);
    console.log('📋 Datos de tareas:', tasks);
    console.log('🔄 Tareas ordenadas:', orderedTasks);
    console.log('🎯 Swapy inicializado:', !!swapyInstance.current);
    console.log('🏪 LocalStorage keys:', Object.keys(localStorage));
    console.log('⏰ Timestamp:', new Date().toISOString());
    console.groupEnd();

    setDebugInfo(!debugInfo);
  };
  
  return (
    <Box sx={{ py: 4, position: 'relative' }}>
      <style>{`
        /* Estilos específicos para Swapy */
        [data-swapy-slot] {
          min-height: 300px;
          display: flex;
          flex-direction: column;
          touch-action: auto;
        }
        
        [data-swapy-item] {
          transition: transform 0.22s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.18s cubic-bezier(0.22, 1, 0.36, 1);
          cursor: grab;
          user-select: none;
          position: relative;
          touch-action: pan-y pinch-zoom;
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          width: 100% !important;
          box-shadow: none;
        }
        
        [data-swapy-item]:active {
          cursor: grabbing;
        }
        
        [data-swapy-highlighted] {
          background: rgba(33, 150, 243, 0.1) !important;
          border: 2px dashed rgba(33, 150, 243, 0.5) !important;
        }
        
        .swapy-item {
          transition: transform 0.22s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.18s cubic-bezier(0.22, 1, 0.36, 1);
          cursor: grab;
          user-select: none;
          position: relative;
          touch-action: pan-y pinch-zoom;
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          box-shadow: none;
        }
        .swapy-item[data-swapy-dragging],
        [data-swapy-item][data-swapy-dragging] {
          transform: scale(1.04) !important;
          z-index: 10;
          box-shadow: 0 6px 24px rgba(0,0,0,0.10);
        }

        .swapy-item:active {
          cursor: grabbing;
          z-index: 1000;
        }

        .drag-indicator {
          position: absolute;
          top: 5px;
          left: 5px;
          background: rgba(0,0,0,0.7);
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          z-index: 10;
          pointer-events: none;
        }

        /* Estilos para el contenedor de scroll */
        .scroll-container {
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
        }

        .scroll-container > div[data-swapy-slot] {
          scroll-snap-align: start;
        }

        /* Estilos para swipe feedback */
        .swipe-feedback-left {
          animation: swipeLeft 0.3s ease-out;
        }

        .swipe-feedback-right {
          animation: swipeRight 0.3s ease-out;
        }

        @keyframes swipeLeft {
          0% { transform: translateX(0); }
          50% { transform: translateX(-20px) scale(0.95); }
          100% { transform: translateX(0); }
        }

        @keyframes swipeRight {
          0% { transform: translateX(0); }
          50% { transform: translateX(20px) scale(0.95); }
          100% { transform: translateX(0); }
        }
      `}</style>

      {/* Header con título y botones de control */}
      <Box sx={{ mb: 3, px: 2 }}>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
          Proyectos Activos
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {orderedTasks.length} proyectos
        </Typography>
      </Box>
      
      {/* Carrusel horizontal con swipe support */}
      <Box sx={{ 
        position: 'relative',
        overflow: 'visible'
      }}>
        {/* 
          Funcionalidad de Swipe:
          - Swipe izquierda: mueve la tarjeta al final del carrusel
          - Swipe derecha: mueve la tarjeta al inicio del carrusel
          - Funciona junto con el drag & drop existente
        */}
        <Box 
          className="scroll-container"
          sx={{ 
            display: 'flex',
            gap: carouselConfig.gap,
            px: 2,
            overflowX: 'auto',
            overflowY: 'visible',
            scrollBehavior: 'smooth',
            paddingBottom: '20px',
            '&::-webkit-scrollbar': {
              display: 'none'
            },
            '-ms-overflow-style': 'none',
            'scrollbar-width': 'none'
          }} 
          ref={swapyRef}
        >
          {orderedTasks.map((task, index) => (
            <div
              key={task.id || index}
              data-swapy-slot={dragMode === 'swapy' ? `slot-${index}` : undefined}
              style={{ 
                minWidth: carouselConfig.cardWidth,
                width: carouselConfig.cardWidth,
                flexShrink: 0
              }}
            >
              <Card
                id={`task-${task.id || index}`}
                data-swapy-item={dragMode === 'swapy' ? `item-${index}` : undefined}
                className={dragMode === 'swapy' ? "swapy-item" : ""}
                draggable={dragMode === 'html5'}
                onDragStart={dragMode === 'html5' ? (e) => handleDragStart(e, index) : undefined}
                onDragOver={dragMode === 'html5' ? handleDragOver : undefined}
                onDrop={dragMode === 'html5' ? (e) => handleDrop(e, index) : undefined}
                onTouchStart={(e) => handleTouchStart(e, index)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                sx={{
                  background: task.color,
                  color: 'white',
                  width: '100%',
                  height: carouselConfig.cardHeight,
                  borderRadius: carouselConfig.borderRadius,
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: dragMode === 'swapy' ? 'grab' : dragMode === 'html5' ? 'grab' : 'pointer',
                  p: 0.5,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                  transition: 'transform .25s ease, box-shadow .25s ease',
                  border: '1px solid rgba(255,255,255,0.15)',
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Tooltip title="Arrastrar para reordenar • Swipe izquierda/derecha para mover al final/inicio">
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
                        '& .MuiChip-icon': {
                          color: 'inherit'
                        }
                      }} />
                    )}
                  </Box>
                </Box>

                {/* Badge de ID para debug */}

              </Card>
            </div>
          ))}
        </Box>
      </Box>
      

    </Box>
  );
}
