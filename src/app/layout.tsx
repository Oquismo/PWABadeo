import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
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
import GlobalLanguageSwitch from '@/components/GlobalLanguageSwitch';
import LanguageTest from '@/components/LanguageTest';

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
  return (
    <html lang="es" className={inter.className}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Badeo PWA" />
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
                    <DebugInitializer />
                    <WarmupInitializer />
                  <ServiceWorkerProvider>
                    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
                      <GlobalLanguageSwitch />
                      
                      <Box component="main" sx={{ pb: '90px' }}>
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
