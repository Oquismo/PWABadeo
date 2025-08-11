// Datos de las tarjetas del carrusel de tareas
export interface TaskData {
  id?: string;
  title: string;
  description: string;
  progress: number;
  color: string;
  avatars: string[];
  date?: string;
  // Rol mínimo requerido para crear/gestionar esta tarea (edición/eliminación)
  role?: 'admin' | 'user';
}

export const carouselTasks: TaskData[] = [
  {
    title: 'Erasmus+',
    description: 'Nuevos participantes europeos',
    progress: 85,
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    avatars: ['E', 'U', 'M', '+15'],
  date: 'Ago 20',
  role: 'user'
  },
  {
    title: 'Formación',
    description: 'Cursos de español e inmersión',
    progress: 72,
    color: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    avatars: ['ES', 'EN', 'IT', '+8'],
  date: 'Sep 01',
  role: 'user'
  },
  {
    title: 'Alojamiento',
    description: 'Coordinación de pisos Sevilla',
    progress: 65,
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    avatars: ['H', 'L', '+12'],
  date: 'Ago 25',
  role: 'user'
  },
  {
    title: 'Prácticas',
    description: 'Tirocini en empresas locales',
    progress: 78,
    color: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    avatars: ['T', 'P', 'E', '+20'],
  date: 'Sep 10',
  role: 'user'
  },
  {
    title: 'Cultura',
    description: 'Tours monumentos y museos',
    progress: 90,
    color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    avatars: ['C', 'G', '+25'],
  date: 'Viernes',
  role: 'user'
  },
  {
    title: 'PCTO',
    description: 'Competencias transversales',
    progress: 55,
    color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    avatars: ['PC', 'TO', '+10'],
  date: 'Sep 15',
  role: 'user'
  },
  {
    title: 'Partnerships',
    description: 'Nuevas instituciones EU',
    progress: 45,
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    avatars: ['EU', 'IT', 'DE', '+6'],
  date: 'Oct 01',
  role: 'admin'
  },
  {
    title: 'Evaluación',
    description: 'Valoración de candidatos',
    progress: 88,
    color: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    avatars: ['V', 'A', '+4'],
  date: 'Ago 30',
  role: 'admin'
  }
];

// Configuración adicional del carrusel
export const carouselConfig = {
  title: 'Proyectos Activos',
  cardWidth: '280px',
  cardHeight: '200px',
  gap: 2,
  borderRadius: '20px'
};
