// Tareas adicionales específicas del Barrio de Oportunidades
import { TaskData } from './tasks';

export const barrioDeTasks: TaskData[] = [
  {
    title: 'Acreditación',
    description: 'Renovación certificados EU',
    progress: 75,
    color: 'linear-gradient(135deg, #654ea3 0%, #eaafc8 100%)',
    avatars: ['EU', 'AC', '+3'],
    date: 'Oct 15'
  },
  {
    title: 'Pre-partida',
    description: 'Sesiones culturales',
    progress: 92,
    color: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)',
    avatars: ['C', 'P', 'S', '+18'],
    date: 'Sep 20'
  },
  {
    title: 'Monitoreo',
    description: 'Seguimiento prácticas',
    progress: 68,
    color: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
    avatars: ['M', 'T', 'E', '+15'],
    date: 'Continuo'
  },
  {
    title: 'Red Empresas',
    description: 'Partnerships corporativos',
    progress: 52,
    color: 'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)',
    avatars: ['B', 'P', '+12'],
    date: 'Oct 30'
  },
  {
    title: 'Networking',
    description: 'Eventos profesionales',
    progress: 80,
    color: 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)',
    avatars: ['N', 'E', 'P', '+40'],
    date: 'Mensual'
  },
  {
    title: 'Traslados',
    description: 'Transporte aeropuerto',
    progress: 95,
    color: 'linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)',
    avatars: ['L', 'T', '+8'],
    date: 'Diario'
  },
  {
    title: 'Documentos',
    description: 'Gestión visados',
    progress: 85,
    color: 'linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)',
    avatars: ['D', 'V', '+5'],
    date: 'Semanal'
  },
  {
    title: 'Inmersión',
    description: 'Integración lingüística',
    progress: 70,
    color: 'linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)',
    avatars: ['I', 'L', '+22'],
    date: 'L-V'
  },
  {
    title: 'Tutorías',
    description: 'Seguimiento individual',
    progress: 88,
    color: 'linear-gradient(135deg, #81ecec 0%, #74b9ff 100%)',
    avatars: ['T', 'P', '+25'],
    date: 'Semanal'
  },
  {
    title: 'Certificación',
    description: 'Evaluación y feedback',
    progress: 60,
    color: 'linear-gradient(135deg, #55a3ff 0%, #003d82 100%)',
    avatars: ['E', 'C', '+8'],
    date: 'Mensual'
  }
];

// Categorías de proyectos del barrio actualizadas
export const projectCategories = {
  mobility: {
    name: 'Movilidad Internacional',
    icon: '✈️',
    color: '#667eea'
  },
  education: {
    name: 'Formación',
    icon: '📚',
    color: '#84fab0'
  },
  culture: {
    name: 'Intercambio Cultural',
    icon: '🌍',
    color: '#f093fb'
  },
  professional: {
    name: 'Desarrollo Profesional',
    icon: '💼',
    color: '#ffecd2'
  },
  networking: {
    name: 'Networking',
    icon: '🤝',
    color: '#fa709a'
  },
  logistics: {
    name: 'Logística',
    icon: '�',
    color: '#a8edea'
  }
};

// Proyectos completados del Barrio de Oportunidades
export const completedProjects: TaskData[] = [
  {
    title: '5000+ Participantes',
    description: 'Programas de movilidad completados exitosamente',
    progress: 100,
    color: 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)',
    avatars: ['5K', '✅'],
    date: '2024'
  },
  {
    title: '150+ Partnerships',
    description: 'Instituciones y empresas colaboradoras',
    progress: 100,
    color: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
    avatars: ['150', '🏢'],
    date: '2024'
  },
  {
    title: '4 Países Europeos',
    description: 'Red de colaboración internacional establecida',
    progress: 100,
    color: 'linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)',
    avatars: ['EU', '🇪🇺'],
    date: '2024'
  }
];
