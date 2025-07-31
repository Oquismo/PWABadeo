import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter'; // --- CORRECCIÓN AQUÍ ---
import { AuthProvider } from '@/context/AuthContext';
import { CustomThemeProvider } from '@/context/ThemeContext';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import BottomNavBar from '@/components/layout/BottomNavBar';
// import PageTransition from '@/components/layout/PageTransition'; // 1. Desactivamos la importación

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
              <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
                
                <Box component="main" sx={{ 
                  pb: '90px' 
                }}>
                  {/* 2. Mostramos el contenido directamente, sin el PageTransition */}
                  {children}
                </Box>

                <BottomNavBar />

              </Box>
            </CustomThemeProvider>
          </AuthProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
