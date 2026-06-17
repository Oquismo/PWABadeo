import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard de Tráfico - Mi Erasmus App',
  description: 'Monitoreo en tiempo real del tráfico y actividad de Mi Erasmus App',
};

export default function TrafficDashboardPage() {
  return (
    <div style={{ margin: 0, padding: 0, minHeight: '100vh' }}>
      <iframe
        src="/traffic-dashboard.html"
        style={{
          width: '100%',
          height: '100vh',
          border: 'none',
          margin: 0,
          padding: 0
        }}
        title="Dashboard de Tráfico"
      />
    </div>
  );
}