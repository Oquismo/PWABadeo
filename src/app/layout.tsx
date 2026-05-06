import type { Metadata, Viewport } from 'next';
import { Inter, Bricolage_Grotesque } from 'next/font/google';
import './globals.css';
import '@/styles/page-transitions.css';
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
    default: 'Badeo — Barrio de Oportunidades',
    template: '%s | Badeo',
  },
  description:
    'App complementaria para estudiantes Erasmus del programa Barrio de Oportunidades. Descubre Sevilla, gestiona tus tareas, conecta con la comunidad y vive tu experiencia al máximo.',
  keywords: ['Erasmus', 'Sevilla', 'Barrio de Oportunidades', 'Badeo', 'estudiantes', 'app'],
  authors: [{ name: 'Badeo Team' }],
  creator: 'Badeo',
  publisher: 'Badeo',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://badeo.es',
    siteName: 'Badeo',
    title: 'Badeo — Barrio de Oportunidades',
    description:
      'App complementaria para estudiantes Erasmus del programa Barrio de Oportunidades.',
    images: [
      {
        url: '/icons/icon_512x512.png',
        width: 512,
        height: 512,
        alt: 'Badeo App Icon',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Badeo — Barrio de Oportunidades',
    description:
      'App complementaria para estudiantes Erasmus del programa Barrio de Oportunidades.',
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
    title: 'Badeo',
    statusBarStyle: 'black-translucent',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'application-name': 'Badeo',
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
