// Datos de las tarjetas del carrusel de tareas
export interface TaskData {
  id?: string;
  title: string;
  description: string;
  progress: number;
  color: string;
  avatars: string[];
  date?: string;
}

export const carouselTasks: TaskData[] = [
  {
    title: 'Formación Digital',
    description: 'Curso básico de informática para vecinos',
    progress: 85,
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    avatars: ['M', 'A', 'C', '+12'],
    date: 'Ago 15'
  },
  {
    title: 'Huerto Comunitario',
    description: 'Plantación de verduras de temporada',
    progress: 62,
    color: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    avatars: ['J', 'L', 'R', '+8'],
    date: 'Ago 10'
  },
  {
    title: 'Taller de Empleo',
    description: 'Preparación de currículums y entrevistas',
    progress: 45,
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    avatars: ['P', 'S', '+6'],
    date: 'Ago 20'
  },
  {
    title: 'Red Wifi Vecinal',
    description: 'Instalación de puntos de acceso gratuito',
    progress: 78,
    color: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    avatars: ['T', 'K', 'D', '+4'],
    date: 'Sep 01'
  },
  {
    title: 'Banco de Tiempo',
    description: 'Intercambio de servicios entre vecinos',
    progress: 33,
    color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    avatars: ['N', 'V', '+15'],
    date: 'Ago 25'
  },
  {
    title: 'Centro Coworking',
    description: 'Habilitación del espacio de trabajo',
    progress: 90,
    color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    avatars: ['H', 'I', 'B', '+7'],
    date: 'Sep 10'
  },
  {
    title: 'Mercadillo Social',
    description: 'Organización del mercado local semanal',
    progress: 55,
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    avatars: ['X', 'Y', 'Z', '+20'],
    date: 'Cada Sáb'
  },
  {
    title: 'Punto Joven',
    description: 'Actividades y talleres para adolescentes',
    progress: 72,
    color: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    avatars: ['Q', 'W', '+9'],
    date: 'Ago 30'
  }
];

// Configuración adicional del carrusel
export const carouselConfig = {
  title: 'Proyectos Activos del Barrio',
  cardWidth: '280px',
  cardHeight: '200px',
  gap: 2,
  borderRadius: '20px'
};
