'use client';

import React, { useState, useEffect } from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import { AuthProvider } from '@/context/AuthContext';
import { CustomThemeProvider } from '@/context/ThemeContext';
import { TasksProvider } from '@/context/TasksContext';
import { LanguageProvider } from '@/hooks/useLanguage';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import BottomNavBar from '@/components/layout/BottomNavBar';
import PageTransition from '@/components/layout/PageTransition';
import AnnouncementBanner from '@/components/home/AnnouncementBanner';
import ServiceWorkerProvider from '@/components/layout/ServiceWorkerProvider';
import { ConnectionMonitor } from '@/components/ConnectionMonitor';
import OfflineNotice from '@/components/ui/OfflineNotice';

import WarmupInitializer from '@/components/WarmupInitializer';
import InitialLanguageDialog from '@/components/InitialLanguageDialog';
import StandaloneModeDetector from '@/components/layout/StandaloneModeDetector';
import SplashScreen from '@/components/layout/SplashScreen';
import InstallPrompt from '@/components/layout/InstallPrompt';
import ScrollProgress from '@/components/ui/ScrollProgress';
import ClientTopBarWrapper from '@/components/layout/ClientTopBarWrapper';

function PrivacyDialog({ open, onAccept }: { open: boolean; onAccept: () => void }) {
  const theme = useTheme();
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.55)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        background: theme.palette.background.paper,
        borderRadius: theme.shape.borderRadius * 2,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: theme.shadows[4],
        maxWidth: 420,
        width: '100%',
        padding: 32,
        textAlign: 'center',
        color: theme.palette.text.primary,
      }}>
        <h2 style={{ marginBottom: 16, color: theme.palette.text.primary, fontFamily: theme.typography.h6.fontFamily, fontSize: '1.5rem', fontWeight: 700 }}>
          Política de Privacidad
        </h2>
        <div style={{
          maxHeight: 300,
          overflowY: 'auto',
          marginBottom: 16,
          textAlign: 'left',
          fontSize: '14px',
          color: theme.palette.text.secondary,
          lineHeight: 1.6,
        }}>
          <p><strong>Información que recopilamos:</strong></p>
          <ul>
            <li>Datos de registro (nombre, correo electrónico, etc.)</li>
            <li>Información de uso y actividad dentro de la app</li>
            <li>Datos de ubicación (si el usuario lo permite)</li>
          </ul>
          <p><strong>Uso de la información:</strong></p>
          <ul>
            <li>Mejorar la experiencia y los servicios ofrecidos</li>
            <li>Personalizar el contenido y las notificaciones</li>
            <li>Contactar al usuario en caso necesario</li>
          </ul>
          <p><strong>Protección de datos:</strong> La información se almacena de forma segura y no se comparte con terceros salvo obligación legal o consentimiento explícito del usuario.</p>
          <p><strong>Contacto:</strong> Para cualquier duda escribir a info@badeo.es</p>
        </div>
        <Button variant="contained" onClick={onAccept}>
          Aceptar y continuar
        </Button>
      </div>
    </div>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const accepted = localStorage.getItem('privacyAccepted');
      if (!accepted) setShowPrivacy(true);

      const splashShown = sessionStorage.getItem('splashShown');
      if (!splashShown) {
        setShowSplash(true);
        sessionStorage.setItem('splashShown', 'true');
      }
    }
  }, []);

  const handleAcceptPrivacy = () => {
    localStorage.setItem('privacyAccepted', 'true');
    setShowPrivacy(false);
  };

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return (
    <AppRouterCacheProvider>
      <LanguageProvider>
        <AuthProvider>
          <CustomThemeProvider>
            <TasksProvider>
              <CssBaseline />

              {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
              <InitialLanguageDialog />
              <StandaloneModeDetector />
              <InstallPrompt />
              <WarmupInitializer />

              <ServiceWorkerProvider>
                <Box sx={{
                  width: '100%',
                  bgcolor: 'background.default',
                  position: 'relative'
                }}>
                  <ScrollProgress />
                  <ClientTopBarWrapper />

                  <PrivacyDialog open={showPrivacy} onAccept={handleAcceptPrivacy} />

                  <Box component="main" sx={{
                    pb: '90px',
                    width: '100%',
                    overflow: 'visible',
                    contain: 'content',
                    contentVisibility: 'auto',
                    containIntrinsicSize: '0 500px',
                  }}>
                    <PageTransition>
                      {children}
                    </PageTransition>
                  </Box>

                  <BottomNavBar />
                  <ConnectionMonitor />
                  <OfflineNotice />
                </Box>
              </ServiceWorkerProvider>
            </TasksProvider>
          </CustomThemeProvider>
        </AuthProvider>
      </LanguageProvider>
    </AppRouterCacheProvider>
  );
}
