'use client';

import { useEffect } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import PushNotificationManager from '@/components/home/PushNotificationManager';

export default function ServiceWorkerProvider({ children }: { children: React.ReactNode }) {
  const { registerServiceWorker } = usePushNotifications();

  useEffect(() => {
    // Registrar service worker al montar la app
    registerServiceWorker();
  }, [registerServiceWorker]);

  return (
    <>
      {children}
      <PushNotificationManager />
    </>
  );
}
