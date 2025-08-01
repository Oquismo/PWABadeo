import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import { AuthProvider } from '@/context/AuthContext';
import { CustomThemeProvider } from '@/context/ThemeContext';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import BottomNavBar from '@/components/layout/BottomNavBar';

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
        {/* --- SOLUCIÓN PARA EVITAR LA RECARGA POR GESTO --- */}
        <style>{`
          body {
            overscroll-behavior-y: contain;
          }
        `}</style>
      </head>
      <body>
        <AppRouterCacheProvider>
          <AuthProvider> 
            <CustomThemeProvider>
              <CssBaseline />
              <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
                
                <Box component="main" sx={{ pb: '90px' }}>
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
