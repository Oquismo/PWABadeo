// Datos de las tarjetas del carrusel de tareas
export interface TaskData {
  id?: string;
  title: string;
  description: string;
  progress: number;
  color: string;
  avatars: string[];
  date?: string;
  /** Explicit completion status; derived from progress if not set */
  status?: 'completado' | 'proceso' | 'pendiente';
  // Rol mínimo requerido para crear/gestionar esta tarea (edición/eliminación)
  role?: 'admin' | 'user';
  // Nueva propiedades para sistema de escuelas
  comun?: boolean;  // Si es true, se muestra a todas las escuelas
  schools?: Array<{  // Escuelas a las que está asignada esta task
    id: number;
    name: string;
    city: string;
    type: string;
    level: string;
  }>;
  user?: {         // Usuario que creó la task
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export const carouselTasks: TaskData[] = [
  {
    title: 'Erasmus+',
    description: 'Nuevos participantes europeos',
    progress: 85,
    color: '#667eea',
    avatars: ['E', 'U', 'M', '+15'],
  date: 'Ago 20',
  role: 'user'
  },
  {
    title: 'Formación',
    description: 'Cursos de español e inmersión',
    progress: 72,
    color: '#84fab0',
    avatars: ['ES', 'EN', 'IT', '+8'],
  date: 'Sep 01',
  role: 'user'
  },
  {
    title: 'Alojamiento',
    description: 'Coordinación de pisos Sevilla',
    progress: 65,
    color: '#f093fb',
    avatars: ['H', 'L', '+12'],
  date: 'Ago 25',
  role: 'user'
  },
  {
    title: 'Prácticas',
    description: 'Tirocini en empresas locales',
    progress: 78,
    color: '#ffecd2',
    avatars: ['T', 'P', 'E', '+20'],
  date: 'Sep 10',
  role: 'user'
  },
  {
    title: 'Cultura',
    description: 'Tours monumentos y museos',
    progress: 90,
    color: '#a8edea',
    avatars: ['C', 'G', '+25'],
  date: 'Viernes',
  role: 'user'
  },
  {
    title: 'PCTO',
    description: 'Competencias transversales',
    progress: 55,
    color: '#fa709a',
    avatars: ['PC', 'TO', '+10'],
  date: 'Sep 15',
  role: 'user'
  },
  {
    title: 'Partnerships',
    description: 'Nuevas instituciones EU',
    progress: 45,
    color: '#667eea',
    avatars: ['EU', 'IT', 'DE', '+6'],
  date: 'Oct 01',
  role: 'admin'
  },
  {
    title: 'Evaluación',
    description: 'Valoración de candidatos',
    progress: 88,
    color: '#ff9a9e',
    avatars: ['V', 'A', '+4'],
  date: 'Ago 30',
  role: 'admin'
  }
];

// Configuración adicional del carrusel
export const carouselConfig = {
  title: 'Proyectos Activos',
  cardWidth: '260px',
  cardHeight: '160px',
  gap: 1.5,
  borderRadius: '16px'
};
