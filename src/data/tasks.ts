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
    title: 'Programa Erasmus+',
    description: 'Gestión de nuevos participantes europeos',
    progress: 85,
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    avatars: ['E', 'U', 'M', '+15'],
    date: 'Ago 20'
  },
  {
    title: 'Formación Lingüística',
    description: 'Cursos de español para estudiantes internacionales',
    progress: 72,
    color: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    avatars: ['ES', 'EN', 'IT', '+8'],
    date: 'Sep 01'
  },
  {
    title: 'Alojamiento Sevilla',
    description: 'Coordinación de pisos para movilidad',
    progress: 65,
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    avatars: ['H', 'L', '+12'],
    date: 'Ago 25'
  },
  {
    title: 'Prácticas Formativas',
    description: 'Tirocini en empresas colaboradoras',
    progress: 78,
    color: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    avatars: ['T', 'P', 'E', '+20'],
    date: 'Sep 10'
  },
  {
    title: 'Visitas Culturales',
    description: 'Tours por monumentos y museos de Sevilla',
    progress: 90,
    color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    avatars: ['C', 'G', '+25'],
    date: 'Cada Vie'
  },
  {
    title: 'Coordinación PCTO',
    description: 'Programas de competencias transversales',
    progress: 55,
    color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    avatars: ['PC', 'TO', '+10'],
    date: 'Sep 15'
  },
  {
    title: 'Partnerships EU',
    description: 'Nuevas colaboraciones con instituciones',
    progress: 45,
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    avatars: ['EU', 'IT', 'DE', '+6'],
    date: 'Oct 01'
  },
  {
    title: 'Evaluación Perfiles',
    description: 'Valoración de candidatos para programas',
    progress: 88,
    color: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    avatars: ['V', 'A', '+4'],
    date: 'Ago 30'
  }
];

// Configuración adicional del carrusel
export const carouselConfig = {
  title: 'Programas de Movilidad Internacional',
  cardWidth: '280px',
  cardHeight: '200px',
  gap: 2,
  borderRadius: '20px'
};
