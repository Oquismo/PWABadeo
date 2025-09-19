import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard de Tráfico - PWABadeo',
  description: 'Monitoreo en tiempo real del tráfico y actividad de PWABadeo',
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