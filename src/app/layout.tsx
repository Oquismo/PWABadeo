import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import React, { useState, useEffect } from 'react';
import './globals.css'; // 1. Importar el archivo de estilos globales
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
import WarmupInitializer from '../components/WarmupInitializer';
import LanguageTest from '@/components/LanguageTest';
import PullToRefreshPreventer from '@/components/layout/PullToRefreshPreventer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Barrio de Oportunidades',
  description: 'Una nueva app para el barrio',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode; 
}) {
  // ...existing code...
  // Diálogo de política de privacidad
  const [showPrivacy, setShowPrivacy] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const accepted = localStorage.getItem('privacyAccepted');
      if (!accepted) setShowPrivacy(true);
    }
  }, []);

  const handleAcceptPrivacy = () => {
    localStorage.setItem('privacyAccepted', 'true');
    setShowPrivacy(false);
  };

  return (
    <html lang="es" className={inter.className}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Badeo PWA" />
        {/* Prevenir pull-to-refresh y mejorar experiencia de app nativa */}
        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-tap-highlight" content="no" />
        {/* 2. Hemos eliminado el bloque <style> de aquí */}
      </head>
      <body>
        <AppRouterCacheProvider>
          <LanguageProvider>
            <AuthProvider> 
              <CustomThemeProvider>
                <TasksProvider>
                  <SpotifyAuthProvider>
                    <CssBaseline />
                    {/* <PullToRefreshPreventer /> */}
                    <DebugInitializer />
                    <WarmupInitializer />
                  <ServiceWorkerProvider>
                    <Box sx={{ 
                      minHeight: '100vh', 
                      bgcolor: 'background.default',
                      width: '100%',
                      overflow: 'hidden', // Prevenir scrollbars horizontales
                      position: 'relative' // Asegurar contexto de posicionamiento
                    }}>
                      {/* Diálogo de privacidad */}
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
                          }}>
                            <h2 style={{marginBottom: 16}}>Política de Privacidad</h2>
                            <p style={{marginBottom: 16}}>Para usar la app Barrio de Oportunidades debes aceptar nuestra <a href="/privacidad" target="_blank" rel="noopener noreferrer">política de privacidad</a>.</p>
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
                        overflow: 'visible' // Permitir que el contenido fluya naturalmente
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
      </body>
    </html>
  );
}
