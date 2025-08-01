// Tareas adicionales específicas del Barrio de Oportunidades
import { TaskData } from './tasks';

export const barrioDeTasks: TaskData[] = [
  {
    title: 'Biblioteca Digital',
    description: 'Digitalización de libros y documentos',
    progress: 40,
    color: 'linear-gradient(135deg, #654ea3 0%, #eaafc8 100%)',
    avatars: ['B', 'L', '+5'],
    date: 'Sep 15'
  },
  {
    title: 'Comedor Social',
    description: 'Preparación de menús saludables',
    progress: 95,
    color: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)',
    avatars: ['M', 'C', 'A', '+25'],
    date: 'Diario'
  },
  {
    title: 'Guardería Cooperativa',
    description: 'Cuidado compartido de niños',
    progress: 68,
    color: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
    avatars: ['P', 'L', 'R', '+12'],
    date: 'L-V'
  },
  {
    title: 'Reparación Vecinal',
    description: 'Taller de arreglo de electrodomésticos',
    progress: 52,
    color: 'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)',
    avatars: ['T', 'F', '+8'],
    date: 'Sáb 14h'
  },
  {
    title: 'Radio Comunitaria',
    description: 'Programas de radio hechos por vecinos',
    progress: 80,
    color: 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)',
    avatars: ['J', 'S', 'D', '+6'],
    date: 'Dom 18h'
  },
  {
    title: 'Intercambio de Ropa',
    description: 'Ropero comunitario y talleres de costura',
    progress: 65,
    color: 'linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)',
    avatars: ['N', 'V', 'I', '+18'],
    date: 'Mié 17h'
  },
  {
    title: 'Apoyo Escolar',
    description: 'Clases de refuerzo para estudiantes',
    progress: 75,
    color: 'linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)',
    avatars: ['E', 'U', '+10'],
    date: 'L-J 16h'
  },
  {
    title: 'Energía Solar',
    description: 'Instalación de paneles solares',
    progress: 30,
    color: 'linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)',
    avatars: ['G', 'H', '+4'],
    date: 'Oct 01'
  },
  {
    title: 'Asesoría Legal',
    description: 'Consultas jurídicas gratuitas',
    progress: 85,
    color: 'linear-gradient(135deg, #81ecec 0%, #74b9ff 100%)',
    avatars: ['Dr.M', 'L', '+3'],
    date: 'Vie 10h'
  },
  {
    title: 'Club de Lectura',
    description: 'Tertulias literarias semanales',
    progress: 88,
    color: 'linear-gradient(135deg, #55a3ff 0%, #003d82 100%)',
    avatars: ['A', 'B', 'C', '+15'],
    date: 'Mar 19h'
  }
];

// Categorías de proyectos del barrio
export const projectCategories = {
  education: {
    name: 'Educación',
    icon: '📚',
    color: '#667eea'
  },
  community: {
    name: 'Comunidad',
    icon: '🤝',
    color: '#84fab0'
  },
  technology: {
    name: 'Tecnología',
    icon: '💻',
    color: '#f093fb'
  },
  environment: {
    name: 'Medio Ambiente',
    icon: '🌱',
    color: '#84fab0'
  },
  culture: {
    name: 'Cultura',
    icon: '🎭',
    color: '#fa709a'
  },
  health: {
    name: 'Salud',
    icon: '🏥',
    color: '#ff6b6b'
  },
  economy: {
    name: 'Economía Social',
    icon: '💰',
    color: '#feca57'
  }
};

// Datos de ejemplo para proyectos completados
export const completedProjects: TaskData[] = [
  {
    title: 'Parque Infantil',
    description: 'Renovación completa del área de juegos',
    progress: 100,
    color: 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)',
    avatars: ['All', '👥'],
    date: 'Jul 2024'
  },
  {
    title: 'Red de Voluntarios',
    description: 'Organización del sistema de ayuda mutua',
    progress: 100,
    color: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
    avatars: ['Coord', '+50'],
    date: 'Jun 2024'
  },
  {
    title: 'Plan de Reciclaje',
    description: 'Sistema de separación y compostaje',
    progress: 100,
    color: 'linear-gradient(135deg, #00b894 0%, #55a3ff 100%)',
    avatars: ['Eco', '+30'],
    date: 'May 2024'
  }
];
