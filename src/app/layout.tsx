import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import { AuthProvider } from '@/context/AuthContext';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import theme from '@/theme/theme';
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
            <ThemeProvider theme={theme}>
              <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <CssBaseline />
                <Box component="main" sx={{ flexGrow: 1, pb: '90px' }}> {/* Aumentamos padding inferior por la barra flotante */}
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