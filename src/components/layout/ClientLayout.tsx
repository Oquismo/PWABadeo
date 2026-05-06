'use client';

import React, { useState, useEffect } from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import { AuthProvider } from '@/context/AuthContext';
import { CustomThemeProvider } from '@/context/ThemeContext';
import { SpotifyAuthProvider } from '@/context/SpotifyAuthContext';
import { TasksProvider } from '@/context/TasksContext';
import { LanguageProvider } from '@/hooks/useLanguage';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import BottomNavBar from '@/components/layout/BottomNavBar';
import PageTransition from '@/components/layout/PageTransition';
import DebugInitializer from '@/components/debug/DebugInitializer';
import AnnouncementBanner from '@/components/home/AnnouncementBanner';
import ServiceWorkerProvider from '@/components/layout/ServiceWorkerProvider';
import { ConnectionMonitor } from '@/components/ConnectionMonitor';
import WarmupInitializer from '@/components/WarmupInitializer';
import InitialLanguageDialog from '@/components/InitialLanguageDialog';
import StandaloneModeDetector from '@/components/layout/StandaloneModeDetector';
import SplashScreen from '@/components/layout/SplashScreen';
import ScrollProgress from '@/components/ui/ScrollProgress';
import ClientTopBarWrapper from '@/components/layout/ClientTopBarWrapper';

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
              <SpotifyAuthProvider>
                <CssBaseline />

                {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
                <InitialLanguageDialog />
                <StandaloneModeDetector />
                <DebugInitializer />
                <WarmupInitializer />

                <ServiceWorkerProvider>
                  <Box sx={{
                    width: '100%',
                    bgcolor: 'background.default',
                    position: 'relative'
                  }}>
                    <ScrollProgress />
                    <ClientTopBarWrapper />

                    {showPrivacy && (
                      <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(0,0,0,0.45)',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <div style={{
                          background: '#fff',
                          borderRadius: 16,
                          boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
                          maxWidth: 420,
                          padding: 32,
                          textAlign: 'center',
                          color: '#222',
                        }}>
                          <h2 style={{ marginBottom: 16, color: '#222' }}>Política de Privacidad</h2>
                          <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 16, textAlign: 'left', fontSize: '14px', color: '#444', lineHeight: 1.6 }}>
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
                          <button style={{
                            background: '#1976d2',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            padding: '10px 28px',
                            fontSize: '1rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            marginTop: 8,
                          }} onClick={handleAcceptPrivacy}>Aceptar y continuar</button>
                        </div>
                      </div>
                    )}

                    <Box component="main" sx={{
                      pb: '90px',
                      width: '100%',
                      overflow: 'visible'
                    }}>
                      <PageTransition>
                        {children}
                      </PageTransition>
                    </Box>

                    <BottomNavBar />
                    <ConnectionMonitor />
                  </Box>
                </ServiceWorkerProvider>
              </SpotifyAuthProvider>
            </TasksProvider>
          </CustomThemeProvider>
        </AuthProvider>
      </LanguageProvider>
    </AppRouterCacheProvider>
  );
}
