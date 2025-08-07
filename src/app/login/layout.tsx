import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - Barrio de Oportunidades',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {children}
    </div>
  );
}
