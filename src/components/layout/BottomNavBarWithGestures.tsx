/**
 * Ejemplo de integración de gestos con BottomNavBar
 * Demuestra cómo añadir gestos avanzados a componentes de navegación
 */

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Paper, 
  BottomNavigation, 
  BottomNavigationAction, 
  Box,
  Typography,
  Fab
} from '@mui/material';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import { motion } from 'framer-motion';

import { GestureWrapper } from '@/components/gestures';
import { ContextMenuItem } from '@/hooks/useLongPressMenu';
import { EdgeSwipePresets } from '@/hooks/useEdgeSwipeNavigation';
import { PressureLevelPresets } from '@/hooks/use3DTouchSimulation';
import { useHaptics } from '@/hooks/useHaptics';
import { useTranslation } from '@/hooks/useTranslation';

const BottomNavBarWithGestures: React.FC = () => {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const { tap, buttonClick } = useHaptics();
  const router = useRouter();
  const [showQuickActions, setShowQuickActions] = useState(false);
  const { t } = useTranslation();

  // Ocultar en páginas de login
  if (pathname === '/login' || pathname === '/login-simple' || pathname === '/registro') {
    return null;
  }

  // Acciones principales de navegación
  const navActions = [
    { value: "/", icon: <HomeRoundedIcon />, label: t('nav.home') },
    { value: "/mapa", icon: <MapRoundedIcon />, label: t('nav.map') },
    { value: "/perfil", icon: <AccountCircleRoundedIcon />, label: t('nav.profile') },
    ...(user?.role === 'admin' ? [
      { value: "/admin", icon: <AdminPanelSettingsRoundedIcon />, label: t('nav.admin') }
    ] : [])
  ];

  // Menú contextual para cada tab
  const getTabContextMenu = (action: any): ContextMenuItem[] => [
    {
      id: 'navigate',
      label: `Ir a ${action.label}`,
      icon: action.icon,
      action: () => {
        router.push(action.value);
        buttonClick();
      }
    },
    {
      id: 'new-tab',
      label: 'Abrir en nueva pestaña',
      icon: '🔗',
      action: () => {
        window.open(action.value, '_blank');
        tap();
      }
    },
    {
      id: 'bookmark',
      label: 'Marcar como favorito',
      icon: '⭐',
      action: () => {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        if (!favorites.includes(action.value)) {
          favorites.push(action.value);
          localStorage.setItem('favorites', JSON.stringify(favorites));
          tap();
        }
      }
    }
  ];

  // Acciones de edge swipe
  const edgeActions = {
    left: [
      {
        id: 'back',
        label: 'Volver',
        icon: '⬅️',
        action: () => {
          router.back();
          buttonClick();
        },
        color: '#2196F3'
      }
    ],
    right: [
      {
        id: 'forward',
        label: 'Adelante',
        icon: '➡️',
        action: () => {
          router.forward();
          buttonClick();
        },
        color: '#4CAF50'
      }
    ],
    bottom: [
      {
        id: 'quick-actions',
        label: 'Acciones rápidas',
        icon: '⚡',
        action: () => setShowQuickActions(!showQuickActions),
        color: '#FF9800'
      }
    ]
  };

  // 3D Touch para navegación avanzada
  const getNavigation3DTouch = (action: any) => 
    PressureLevelPresets.contextualNav(
      () => {
        // Nivel 1: Vista previa (peek)
        console.log(`Preview: ${action.label}`);
        tap();
      },
      () => {
        // Nivel 2: Navegación rápida (pop)
        router.push(action.value);
        buttonClick();
      },
      () => {
        // Nivel 3: Acción avanzada (force)
        window.open(action.value, '_blank');
        buttonClick();
      }
    );

  // Acciones rápidas flotantes
  const QuickActionsFab = () => {
    if (!showQuickActions) return null;

    const quickActions = [
      { icon: '🔍', label: 'Buscar', action: () => router.push('/search') },
      { icon: '📝', label: 'Notas', action: () => router.push('/notes') },
      { icon: '📅', label: 'Calendario', action: () => router.push('/calendario') },
      { icon: '⚙️', label: 'Ajustes', action: () => router.push('/ajustes') }
    ];

    return (
      <Box
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 16,
          zIndex: 1300,
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}
      >
        {quickActions.map((quickAction, index) => (
          <motion.div
            key={quickAction.label}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ delay: index * 0.1 }}
          >
            <GestureWrapper
              longPressEnabled
              longPressItems={[
                {
                  id: 'execute',
                  label: quickAction.label,
                  icon: quickAction.icon,
                  action: quickAction.action
                },
                {
                  id: 'close',
                  label: 'Cerrar menú',
                  icon: '❌',
                  action: () => setShowQuickActions(false)
                }
              ]}
            >
              <Fab
                size="small"
                onClick={quickAction.action}
                sx={{
                  background: 'rgba(18, 18, 27, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  '&:hover': {
                    background: 'rgba(18, 18, 27, 0.95)',
                  }
                }}
              >
                <span style={{ fontSize: '16px' }}>
                  {quickAction.icon}
                </span>
              </Fab>
            </GestureWrapper>
          </motion.div>
        ))}
      </Box>
    );
  };

  return (
    <>
      <GestureWrapper
        gesturePreset="generalNavigation"
        edgeActions={edgeActions}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1100
        }}
      >
        <Paper
          elevation={8}
          onContextMenu={(e) => {
            e.preventDefault(); // Prevenir menú contextual del navegador en todo el navbar
            e.stopPropagation();
          }}
          sx={{
            background: 'rgba(18, 18, 27, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px 24px 0 0',
            overflow: 'hidden',
            // Deshabilitar selección de texto y arrastre
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
            WebkitTouchCallout: 'none',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {/* Indicador de arrastre */}
          <Box
            sx={{
              width: 40,
              height: 4,
              background: 'rgba(255, 255, 255, 0.3)',
              borderRadius: 2,
              mx: 'auto',
              mt: 1,
              mb: 0.5
            }}
          />

          <BottomNavigation
            value={pathname}
            onChange={(event, newValue) => {
              router.push(newValue);
              buttonClick();
            }}
            sx={{
              background: 'transparent',
              '& .MuiBottomNavigationAction-root': {
                color: 'rgba(255, 255, 255, 0.6)',
                '&.Mui-selected': {
                  color: '#2196F3'
                }
              }
            }}
          >
            {navActions.map((action) => (
              <GestureWrapper
                key={action.value}
                longPressEnabled
                longPressItems={getTabContextMenu(action)}
                force3DEnabled
                pressureLevels={getNavigation3DTouch(action)}
                enableHaptics={true}
                style={{
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none',
                  WebkitTouchCallout: 'none',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <BottomNavigationAction
                  value={action.value}
                  icon={action.icon}
                  label={action.label}
                  sx={{
                    minWidth: 'auto',
                    px: 1,
                    // Deshabilitar selección de texto y arrastre
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                    msUserSelect: 'none',
                    WebkitTouchCallout: 'none',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                />
              </GestureWrapper>
            ))}
          </BottomNavigation>

          {/* Texto de ayuda para gestos */}
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.4)',
              pb: 1,
              fontSize: '0.7rem'
            }}
          >
            Mantén presionado para opciones • Desliza desde bordes
          </Typography>
        </Paper>
      </GestureWrapper>

      {/* Acciones rápidas flotantes */}
      <QuickActionsFab />
    </>
  );
};

export default BottomNavBarWithGestures;