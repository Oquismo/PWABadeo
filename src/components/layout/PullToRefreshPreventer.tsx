/**
 * Componente que aplica prevención de pull-to-refresh
 * Se ejecuta una vez en el layout principal
 */

'use client';

import { usePreventPullToRefresh } from '@/hooks/usePreventPullToRefresh';

const PullToRefreshPreventer = () => {
  usePreventPullToRefresh();
  return null; // No renderiza nada, solo aplica el comportamiento
};

export default PullToRefreshPreventer;
