import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import { AuthProvider } from '@/context/AuthContext';
import { CustomThemeProvider } from '@/context/ThemeContext';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import BottomNavBar from '@/components/layout/BottomNavBar';
import PageTransition from '@/components/layout/PageTransition';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Barrio de Oportunidades',
  description: 'Una nueva app para el barrio',
  manifest: '/manifest.json',
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
      </head>
      <body>
        <AppRouterCacheProvider>
          <AuthProvider> 
            <CustomThemeProvider>
              <CssBaseline />
              {/* Contenedor principal de la app */}
              <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
                
                {/* Área de contenido principal */}
                <Box component="main" sx={{ 
                  // El padding inferior es crucial para que el contenido no quede oculto
                  // detrás de la barra de navegación flotante.
                  pb: '90px' 
                }}>
                  <PageTransition>
                    {children}
                  </PageTransition>
                </Box>

                {/* La barra de navegación se renderiza aquí */}
                <BottomNavBar />

              </Box>
            </CustomThemeProvider>
          </AuthProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}