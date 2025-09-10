// Tareas adicionales específicas del Barrio de Oportunidades
import { TaskData } from './tasks';

export const barrioDeTasks: TaskData[] = [
  {
    title: 'Acreditación',
    description: 'Renovación certificados EU',
    progress: 75,
    color: '#654ea3',
    avatars: ['EU', 'AC', '+3'],
  date: 'Oct 15',
  role: 'admin'
  },
  {
    title: 'Pre-partida',
    description: 'Sesiones culturales',
    progress: 92,
    color: '#ff6b6b',
    avatars: ['C', 'P', 'S', '+18'],
  date: 'Sep 20',
  role: 'admin'
  },
  {
    title: 'Monitoreo',
    description: 'Seguimiento prácticas',
    progress: 68,
    color: '#74b9ff',
    avatars: ['M', 'T', 'E', '+15'],
  date: 'Continuo',
  role: 'admin'
  },
  {
    title: 'Red Empresas',
    description: 'Partnerships corporativos',
    progress: 52,
    color: '#fd79a8',
    avatars: ['B', 'P', '+12'],
  date: 'Oct 30',
  role: 'admin'
  },
  {
    title: 'Networking',
    description: 'Eventos profesionales',
    progress: 80,
    color: '#00b894',
    avatars: ['N', 'E', 'P', '+40'],
  date: 'Mensual',
  role: 'admin'
  },
  {
    title: 'Traslados',
    description: 'Transporte aeropuerto',
    progress: 95,
    color: '#fdcb6e',
    avatars: ['L', 'T', '+8'],
  date: 'Diario',
  role: 'admin'
  },
  {
    title: 'Documentos',
    description: 'Gestión visados',
    progress: 85,
    color: '#a29bfe',
    avatars: ['D', 'V', '+5'],
  date: 'Semanal',
  role: 'admin'
  },
  {
    title: 'Inmersión',
    description: 'Integración lingüística',
    progress: 70,
    color: '#ffeaa7',
    avatars: ['I', 'L', '+22'],
  date: 'L-V',
  role: 'admin'
  },
  {
    title: 'Tutorías',
    description: 'Seguimiento individual',
    progress: 88,
    color: '#81ecec',
    avatars: ['T', 'P', '+25'],
  date: 'Semanal',
  role: 'admin'
  },
  {
    title: 'Certificación',
    description: 'Evaluación y feedback',
    progress: 60,
    color: '#55a3ff',
    avatars: ['E', 'C', '+8'],
  date: 'Mensual',
  role: 'admin'
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
