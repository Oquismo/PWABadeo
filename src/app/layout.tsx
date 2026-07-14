import type { Metadata, Viewport } from 'next';
import { Inter, Bricolage_Grotesque } from 'next/font/google';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import ClientLayout from '@/components/layout/ClientLayout';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Mi Erasmus App',
    template: '%s | Mi Erasmus App',
  },
  description:
    'App complementaria para estudiantes Erasmus. Descubre Sevilla, gestiona tus tareas, conecta con la comunidad y vive tu experiencia al máximo.',
  keywords: ['Erasmus', 'Sevilla', 'Mi Erasmus App', 'estudiantes', 'app'],
  authors: [{ name: 'Mi Erasmus App Team' }],
  creator: 'Mi Erasmus App',
  publisher: 'Mi Erasmus App',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://badeo.es',
    siteName: 'Mi Erasmus App',
    title: 'Mi Erasmus App',
    description:
      'App complementaria para estudiantes Erasmus.',
    images: [
      {
        url: '/icons/icon_512x512.png',
        width: 512,
        height: 512,
        alt: 'Mi Erasmus App Icon',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mi Erasmus App',
    description:
      'App complementaria para estudiantes Erasmus.',
    images: ['/icons/icon_512x512.png'],
  },
  icons: {
    icon: [
      { url: '/icons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/icons/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'Mi Erasmus App',
    statusBarStyle: 'black-translucent',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'application-name': 'Mi Erasmus App',
    'msapplication-tap-highlight': 'no',
    ' HandheldFriendly': 'true',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#18181B',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${bricolage.variable}`}>
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
