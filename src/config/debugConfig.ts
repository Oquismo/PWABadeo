// Configuración de métricas de debug
export interface DebugConfig {
  // Métricas básicas (siempre visibles)
  basic: {
    tasks: boolean;
    storage: boolean;
    performance: boolean;
    page: boolean;
  };
  
  // Métricas avanzadas (opcionales)
  advanced: {
    errors: boolean;
    network: boolean;
    userActivity: boolean;
    systemInfo: boolean;
    fps: boolean;
    webVitals: boolean;
  };
  
  // Configuración de actualización
  updateInterval: number; // en milisegundos
  maxErrorLogs: number;
  
  // Alertas y umbrales
  thresholds: {
    fps: { good: number; warning: number };
    memory: { good: number; warning: number }; // en MB
    responseTime: { good: number; warning: number }; // en ms
    battery: { good: number; warning: number }; // en %
  };
}

export const defaultDebugConfig: DebugConfig = {
  basic: {
    tasks: true,
    storage: true,
    performance: true,
    page: true
  },
  advanced: {
    errors: true,
    network: true,
    userActivity: true,
    systemInfo: true,
    fps: true,
    webVitals: true
  },
  updateInterval: 2000, // 2 segundos
  maxErrorLogs: 5,
  thresholds: {
    fps: { good: 55, warning: 30 },
    memory: { good: 50, warning: 100 },
    responseTime: { good: 200, warning: 500 },
    battery: { good: 50, warning: 20 }
  }
};

// Función para obtener configuración personalizada desde localStorage
export function getDebugConfig(): DebugConfig {
  try {
    const saved = localStorage.getItem('debugConfig');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...defaultDebugConfig, ...parsed };
    }
  } catch (error) {
    console.warn('Error loading debug config:', error);
  }
  return defaultDebugConfig;
}

// Función para guardar configuración
export function saveDebugConfig(config: Partial<DebugConfig>) {
  try {
    const current = getDebugConfig();
    const updated = { ...current, ...config };
    localStorage.setItem('debugConfig', JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Error saving debug config:', error);
    return defaultDebugConfig;
  }
}

// Colores para diferentes estados
export const debugColors = {
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
  primary: '#9c27b0',
  secondary: '#607d8b'
};

// Iconos para diferentes métricas
export const debugIcons = {
  tasks: '📋',
  progress: '📊',
  page: '📄',
  load: '🚀',
  dom: '🌐',
  memory: '💾',
  storage: '💿',
  connection: '📡',
  errors: '🚨',
  api: '🌍',
  clicks: '👆',
  scroll: '📜',
  time: '⏱️',
  battery: '🔋',
  cpu: '⚙️',
  fps: '🎬',
  network: '📡'
};
