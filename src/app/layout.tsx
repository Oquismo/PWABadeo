import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css'; // 1. Importar el archivo de estilos globales
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import { AuthProvider } from '@/context/AuthContext';
import { CustomThemeProvider } from '@/context/ThemeContext';
import { TasksProvider } from '@/context/TasksContext';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import BottomNavBar from '@/components/layout/BottomNavBar';
import PageTransition from '@/components/layout/PageTransition';
import DebugInitializer from '@/components/debug/DebugInitializer';

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
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Badeo PWA" />
        {/* 2. Hemos eliminado el bloque <style> de aquí */}
      </head>
      <body>
        <AppRouterCacheProvider>
          <AuthProvider> 
            <CustomThemeProvider>
              <TasksProvider>
                <CssBaseline />
                <DebugInitializer />
                <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
                  
                  <Box component="main" sx={{ pb: '90px' }}>
                    <PageTransition>
                      {children}
                    </PageTransition>
                  </Box>

                  <BottomNavBar />

                </Box>
              </TasksProvider>
            </CustomThemeProvider>
          </AuthProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
