'use client';

import { Typography, CardContent, Box, IconButton, Tooltip, Chip } from '@mui/material';
import Material3ElevatedCard from '@/components/ui/Material3ElevatedCard';
import { useTranslation } from '@/hooks/useTranslation';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LaunchIcon from '@mui/icons-material/Launch';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { carouselConfig } from '@/data/tasks';
import { TaskData } from '@/data/tasks';
import { useTasks } from '@/context/TasksContext';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { createSwapy } from 'swapy';
import dynamic from 'next/dynamic';
import SchoolSelector from '@/components/SchoolSelector';

// Lazy loading para el componente de debug pesado
const DebugMetrics = dynamic(() => import('@/components/admin/DebugMetrics'), {
  ssr: false
});

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
  const { tasks, deleteTask } = useTasks();
  const { user } = useAuth();
  const { palette, getProjectColors, currentTime } = useMaterialYouTheme();
  const [debugInfo, setDebugInfo] = useState(false);
  const [dragMode, setDragMode] = useState<'swapy' | 'html5'>('swapy'); // Usar Swapy por defecto para animaciones
  const [orderedTasks, setOrderedTasks] = useState<TaskData[]>([]);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [swipedCardIndex, setSwipedCardIndex] = useState<number | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);
  const swapyRef = useRef<HTMLDivElement>(null);
  const swapyInstance = useRef<any>(null);
  
  // Marcar cuando la hidratación está completa
  useEffect(() => {
    setIsHydrated(true);
  }, []);
  
  // Función helper para acceder a localStorage de forma segura
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
  
  // Inicializar Swapy para drag and drop
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Solo inicializar si estamos en modo swapy, hay al menos 2 tareas y el contenedor existe
      if (dragMode !== 'swapy' || !swapyRef.current || orderedTasks.length < 2) {
        if (swapyInstance.current) {
          try {
            swapyInstance.current.destroy();
            swapyInstance.current = null;
          } catch (error: unknown) {
            console.error('Error limpiando Swapy:', getErrorMessage(error));
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
              safeLocalStorage.setItem('tasksOrder', JSON.stringify(orderIds));
            } else {
              console.warn('❌ Orden inválido generado:', newOrder.length, 'vs', orderedTasks.length);
            }
          } catch (error: unknown) {
            console.error('❌ Error procesando swap de Swapy:', getErrorMessage(error));
          }
        });

        console.log('✅ Swapy inicializado correctamente');

        // Verificar que los elementos sean arrastrables
        const draggableElements = swapyRef.current.querySelectorAll('.swapy-item');
        console.log('🎯 Elementos arrastrables encontrados:', draggableElements.length);

        console.log('🚀 ¡Swapy está listo! Puedes arrastrar las tarjetas ahora.');

      } catch (error: unknown) {
        console.error('❌ Error inicializando Swapy:', getErrorMessage(error));
        console.error('Stack trace:', error instanceof Error ? (error as Error).stack : 'No stack trace available');

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
        } catch (error: unknown) {
          console.error('Error limpiando Swapy:', getErrorMessage(error));
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
      } catch (error: unknown) {
        console.error('Error limpiando Swapy:', getErrorMessage(error));
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
      } catch (error: unknown) {
        console.log('🔧 Error accediendo a Swapy:', getErrorMessage(error));
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
      safeLocalStorage.removeItem('tasksOrder');
      
      console.log('🔄 Orden de tareas reseteado al original');
      
      // Reinicializar Swapy con el nuevo orden
      if (swapyInstance.current) {
        setTimeout(() => {
          // Limpiar instancia de Swapy
          try {
            swapyInstance.current.destroy();
            swapyInstance.current = null;
            console.log('🧹 Instancia Swapy limpiada para reinicialización');
          } catch (error: unknown) {
            console.error('Error limpiando Swapy:', getErrorMessage(error));
          }
        }, 100);
      }
    } catch (error: unknown) {
      console.error('Error reseteando orden de tareas:', getErrorMessage(error));
    }
  };

  // Funciones para manejar swipe gestures
  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    console.log('👆 TouchStart en tarjeta:', index, 'Posición X:', e.targetTouches[0].clientX);
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setSwipedCardIndex(index);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    console.log('👆 TouchMove - Posición X:', e.targetTouches[0].clientX);
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    console.log('👆 TouchEnd - Start:', touchStart, 'End:', touchEnd, 'Index:', swipedCardIndex);

    if (!touchStart || !touchEnd || swipedCardIndex === null) {
      console.log('❌ TouchEnd - faltan datos');
      setTouchStart(null);
      setTouchEnd(null);
      setSwipedCardIndex(null);
      return;
    }

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    console.log('📏 Distancia:', distance, 'LeftSwipe:', isLeftSwipe, 'RightSwipe:', isRightSwipe);

    if (isLeftSwipe || isRightSwipe) {
      console.log('✅ Swipe detectado!');

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
      safeLocalStorage.setItem('tasksOrder', JSON.stringify(orderIds));
    } else {
      console.log('❌ Swipe no válido - distancia insuficiente');
    }

    setTouchStart(null);
    setTouchEnd(null);
    setSwipedCardIndex(null);
  };

  return (
    <Box sx={{ py: 2, position: 'relative' }}>
      {/* Mostrar loading state durante hidratación para evitar diferencias */}
      {!isHydrated ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <Typography>Cargando...</Typography>
        </Box>
      ) : (
        <>
          <style>{`
            /* Estilos específicos para Swapy */
            [data-swapy-slot] {
              display: flex;
              flex-direction: column;
              touch-action: auto;
            }
            
            [data-swapy-item] {
              transition: transform 0.22s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.18s cubic-bezier(0.22, 1, 0.36, 1);
              cursor: grab;
              user-select: none;
              position: relative;
              touch-action: pan-x pan-y pinch-zoom;
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
          /* Estilos de resaltado removidos */
        }            .swapy-item {
              transition: transform 0.22s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.18s cubic-bezier(0.22, 1, 0.36, 1);
              cursor: grab;
              user-select: none;
              position: relative;
              touch-action: pan-x pan-y pinch-zoom;
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

            /* 🎨 Material You - Animaciones y efectos mejorados */
            @keyframes materialYouGlow {
              0%, 100% {
                box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
              }
              50% {
                box-shadow: 0 2px 8px rgba(0,0,0,0.16), 0 4px 16px rgba(0,0,0,0.24);
              }
            }

            @keyframes materialYouHover {
              0% {
                transform: translateY(0) scale(1);
              }
              100% {
                transform: translateY(-8px) scale(1.02);
              }
            }

            @keyframes materialYouPress {
              0% {
                transform: translateY(-8px) scale(1.02);
              }
              100% {
                transform: translateY(-4px) scale(0.98);
              }
            }

            /* Efectos de profundidad Material You */
            .material-you-card {
              position: relative;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .material-you-card::before {
              content: '';
              position: absolute;
              inset: 0;
              border-radius: inherit;
              padding: 1px;
              background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
              mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
              mask-composite: xor;
              -webkit-mask-composite: xor;
              opacity: 0;
              transition: opacity 0.3s ease;
            }

            .material-you-card:hover::before {
              opacity: 1;
            }

            /* Efectos de ripple Material You */
            .material-you-ripple {
              position: relative;
              overflow: hidden;
            }

            .material-you-ripple::after {
              content: '';
              position: absolute;
              top: 50%;
              left: 50%;
              width: 0;
              height: 0;
              border-radius: 50%;
              background: rgba(255,255,255,0.3);
              transform: translate(-50%, -50%);
              transition: width 0.6s, height 0.6s;
            }

            .material-you-ripple:active::after {
              width: 300px;
              height: 300px;
            }

            /* Gradientes dinámicos Material You */
            .material-you-gradient {
              background: linear-gradient(135deg,
                var(--material-primary) 0%,
                var(--material-secondary) 50%,
                var(--material-primary) 100%);
              background-size: 200% 200%;
              animation: materialYouGradient 8s ease infinite;
            }

            @keyframes materialYouGradient {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }

            /* Efectos de elevación Material You */
            .material-you-elevation-1 {
              box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
            }

            .material-you-elevation-2 {
              box-shadow: 0 2px 8px rgba(0,0,0,0.16), 0 4px 16px rgba(0,0,0,0.12);
            }

            .material-you-elevation-3 {
              box-shadow: 0 4px 16px rgba(0,0,0,0.20), 0 8px 32px rgba(0,0,0,0.16);
            }

            .material-you-elevation-4 {
              box-shadow: 0 8px 32px rgba(0,0,0,0.24), 0 16px 48px rgba(0,0,0,0.20);
            }

            /* Transiciones fluidas Material You */
            .material-you-transition {
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .material-you-transition-fast {
              transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .material-you-transition-slow {
              transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            }
          `}</style>

          {/* Header con título y botones de control */}
          <Box sx={{ mb: 3, px: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              {/* Traducción del título */}
              {(() => {
                const { t } = useTranslation();
                return (
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
                );
              })()}
              <Box sx={{ display: 'flex', gap: 1 }}>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Traducción del contador de proyectos */}
              {(() => {
                const { t } = useTranslation();
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
                  <Material3ElevatedCard
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
                    isDragged={false}
                    interactive={true}
                    sx={{
                      // 🎨 Material You - Colores dinámicos
                      background: `linear-gradient(135deg,
                        ${getProjectColors(task.title, index).primary}E6 0%,
                        ${getProjectColors(task.title, index).secondary}CC 50%,
                        ${getProjectColors(task.title, index).primary}B3 100%)`,
                      color: 'white',
                      width: '100%',
                      height: carouselConfig.cardHeight,
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: dragMode === 'swapy' ? 'grab' : dragMode === 'html5' ? 'grab' : 'pointer',
                      p: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0,

                      // 🌟 Sombras realistas Material You
                      boxShadow: `
                        0 1px 3px rgba(0,0,0,0.12),
                        0 1px 2px rgba(0,0,0,0.24),
                        0 4px 8px rgba(0,0,0,0.16),
                        0 8px 16px rgba(0,0,0,0.12)
                      `,

                      // ✨ Transiciones fluidas Material You
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',

                      // 🎯 Bordes Material You
                      border: `1px solid ${getProjectColors(task.title, index).primary}40`,

                      // 🎭 Estados hover/active Material You
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.02)',
                        boxShadow: `
                          0 2px 8px rgba(0,0,0,0.16),
                          0 4px 16px rgba(0,0,0,0.24),
                          0 8px 32px rgba(0,0,0,0.20),
                          0 16px 48px rgba(0,0,0,0.16),
                          0 0 0 1px ${getProjectColors(task.title, index).accent}30
                        `,
                        borderColor: `${getProjectColors(task.title, index).accent}60`
                      },

                      '&:active': {
                        transform: 'scale(0.98)',
                        transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)'
                      },

                      // 🌈 Efectos de profundidad Material You
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        background: `radial-gradient(circle at 20% 30%,
                          ${getProjectColors(task.title, index).accent}20 0%,
                          transparent 50%)`,
                        opacity: 0.6,
                        transition: 'opacity 0.3s ease'
                      },

                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        background: `linear-gradient(145deg,
                          rgba(255,255,255,0.1) 0%,
                          rgba(255,255,255,0.05) 25%,
                          transparent 50%,
                          rgba(0,0,0,0.05) 100%)`,
                        borderRadius: 'inherit',
                        pointerEvents: 'none'
                      },

                      // 🎨 Efectos hover adicionales
                      '&:hover::before': {
                        opacity: 0.8
                      },

                      '&:hover::after': {
                        background: `linear-gradient(145deg,
                          rgba(255,255,255,0.15) 0%,
                          rgba(255,255,255,0.08) 25%,
                          transparent 50%,
                          rgba(0,0,0,0.08) 100%)`
                      }
                    }}
                    onClick={() => {
                      if (user?.role === 'admin' && debugInfo) {
                        console.log('🎯 Card clickeada:', task);
                      }
                    }}
                  >

                    
                    {/* Etiquetas superiores */}
                    <Box sx={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', px: 1.5, pt: 1 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3, maxWidth: '75%' }}>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.1, fontSize: '0.95rem', textShadow: '0 2px 4px rgba(0,0,0,0.25)' }}>
                          {task.title}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.65rem', lineHeight: 1.15 }}>
                          {task.description}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <IconButton size="small" sx={{ color: 'white', opacity: 0.8, mt: -0.5 }}>
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>

                    {/* Badge ADMIN y fecha */}
                    <Box sx={{ position: 'relative', zIndex: 2, mt: 'auto', px: 1.5, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                        {task.role === 'admin' && (
                          <Chip
                            label="ADMIN"
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: '0.5rem',
                              fontWeight: 700,
                              letterSpacing: '0.5px',
                              color: getProjectColors(task.title, index).accent,
                              bgcolor: 'rgba(255,255,255,0.95)',
                              backdropFilter: 'blur(8px)',
                              border: `1px solid ${getProjectColors(task.title, index).accent}40`,
                              boxShadow: `0 2px 8px ${getProjectColors(task.title, index).primary}20`,
                              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                              '&:hover': {
                                bgcolor: 'rgba(255,255,255,0.98)',
                                boxShadow: `0 4px 12px ${getProjectColors(task.title, index).primary}30`,
                                transform: 'translateY(-1px)'
                              }
                            }}
                          />
                        )}
                        {task.date && (
                          <Chip
                            icon={<CalendarTodayIcon sx={{ fontSize: '0.7rem !important' }} />}
                            label={task.date}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: '0.5rem',
                              fontWeight: 600,
                              pl: 0.5,
                              pr: 0.8,
                              color: 'rgba(255,255,255,0.9)',
                              bgcolor: 'rgba(0,0,0,0.2)',
                              backdropFilter: 'blur(4px)',
                              border: '1px solid rgba(255,255,255,0.15)',
                              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                              '& .MuiChip-icon': {
                                color: 'inherit',
                                opacity: 0.8
                              },
                              '&:hover': {
                                bgcolor: 'rgba(0,0,0,0.3)',
                                borderColor: 'rgba(255,255,255,0.25)',
                                transform: 'translateY(-1px)'
                              }
                            }}
                          />
                        )}
                      </Box>
                    </Box>

                    {/* Badge de ID para debug */}

                  </Material3ElevatedCard>
                </div>
              ))}
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
}
