// Datos de las tarjetas del carrusel de tareas
export interface TaskData {
  title: string;
  description: string;
  progress: number;
  color: string;
  avatars: string[];
  date?: string;
}

export const carouselTasks: TaskData[] = [
  {
    title: 'App Design',
    description: 'Task management mobile app',
    progress: 62,
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    avatars: ['J', 'M', 'A', '+2'],
    date: 'Mar 02'
  },
  {
    title: 'Dashboard',
    description: 'Revisión de la página',
    progress: 75,
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    avatars: ['C', 'D', 'L', '+5']
  },
  {
    title: 'UI Kit',
    description: 'Design system components',
    progress: 45,
    color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    avatars: ['R', 'S', '+3']
  },
  {
    title: 'Website',
    description: 'Corporate website redesign',
    progress: 88,
    color: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    avatars: ['T', 'K', '+4'],
    date: 'Apr 15'
  },
  {
    title: 'Mobile App',
    description: 'iOS & Android development',
    progress: 33,
    color: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    avatars: ['P', 'Q', '+1']
  },
  {
    title: 'Branding',
    description: 'Logo and brand identity',
    progress: 90,
    color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    avatars: ['H', 'I', '+6'],
    date: 'May 20'
  },
  {
    title: 'E-commerce',
    description: 'Online store development',
    progress: 55,
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    avatars: ['X', 'Y', '+3'],
    date: 'Jun 10'
  },
  {
    title: 'SEO Audit',
    description: 'Website optimization',
    progress: 78,
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    avatars: ['Z', 'W', '+2']
  }
];

// Configuración adicional del carrusel
export const carouselConfig = {
  title: 'Tareas de Hoy',
  cardWidth: '280px',
  cardHeight: '200px',
  gap: 2,
  borderRadius: '20px'
};
