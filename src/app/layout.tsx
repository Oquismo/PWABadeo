import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import { AuthProvider } from '@/context/AuthContext';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import theme from '@/theme/theme';
import CustomAppBar from '@/components/layout/CustomAppBar';
import BottomNavBar from '@/components/layout/BottomNavBar';
import PageTransition from '@/components/layout/PageTransition';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Barrio de Oportunidades',
  description: 'Una nueva app para el barrio',
  // manifest: '/manifest.json', // <-- 1. HEMOS QUITADO ESTA LÍNEA
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={inter.className}>
      <head>
        {/* 2. AÑADIMOS LA ETIQUETA DIRECTAMENTE AQUÍ */}
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <AppRouterCacheProvider>
          <AuthProvider> 
            <ThemeProvider theme={theme}>
              <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <CssBaseline />
                <CustomAppBar />
                <Box component="main" sx={{ flexGrow: 1, pb: '56px' }}>
                  <Toolbar />
                  <PageTransition>
                    {children}
                  </PageTransition>
                </Box>
                <BottomNavBar />
              </Box>
            </ThemeProvider>
          </AuthProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}