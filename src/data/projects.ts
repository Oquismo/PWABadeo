export interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  longDescription?: string;
  eventDate?: Date;
}

export const projectsData: Project[] = [
  {
    id: 'impulso-digital',
    title: 'Impulso Digital',
    description: 'Capacitación en habilidades tecnológicas.',
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978',
    longDescription: 'Este proyecto se centra en cerrar la brecha digital en la comunidad, ofreciendo cursos gratuitos de programación, diseño web y marketing digital. Colaboramos con expertos de la industria para asegurar que el contenido esté actualizado y sea relevante para el mercado laboral actual.',
    eventDate: new Date(2025, 8, 15),
  },
  {
    id: 'cultura-en-accion',
    title: 'Cultura en Acción',
    description: 'Talleres de arte, música y teatro.',
    imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d',
    longDescription: 'Creemos en el poder transformador del arte. Este programa organiza eventos culturales, exposiciones y talleres abiertos a todas las edades, proporcionando un espacio seguro para la expresión creativa y la cohesión comunitaria.',
    eventDate: new Date(2025, 9, 22),
  },
  {
    id: 'deporte-para-todos',
    title: 'Deporte para Todos',
    description: 'Organización de ligas deportivas.',
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b',
    longDescription: 'Fomentamos un estilo de vida saludable y el trabajo en equipo a través del deporte. Organizamos torneos de fútbol, clases de yoga al aire libre y carreras populares para involucrar a toda la comunidad.',
    eventDate: new Date(2025, 10, 5),
  },
  {
    id: 'huertos-urbanos',
    title: 'Huertos Urbanos',
    description: 'Creación y mantenimiento de huertos comunitarios.',
    // --- IMAGEN CORREGIDA AQUÍ ---
    imageUrl: 'https://images.unsplash.com/photo-1466692496629-3e47ea480c7d',
    longDescription: 'Transformamos espacios no utilizados en huertos verdes y productivos. Los participantes aprenden sobre agricultura sostenible, trabajan juntos y comparten las cosechas, mejorando la dieta local y el medio ambiente.',
    eventDate: new Date(2025, 11, 12),
  },
  {
    id: 'refuerzo-escolar',
    title: 'Refuerzo Escolar',
    description: 'Apoyo educativo para niños y adolescentes.',
    imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7',
    longDescription: 'Ayudamos a los estudiantes a alcanzar su máximo potencial académico. Un equipo de voluntarios ofrece tutorías personalizadas y ayuda con los deberes para combatir el abandono escolar y fomentar el amor por el aprendizaje.',
    eventDate: new Date(2026, 0, 20),
  },
  {
    id: 'emprende-barrio',
    title: 'Emprende Barrio',
    description: 'Asesoramiento y microcréditos para emprendedores locales.',
    imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7',
    longDescription: 'Apoyamos a los residentes que tienen una idea de negocio. Ofrecemos talleres de planificación, asesoramiento legal y acceso a una red de microcréditos para ayudar a lanzar y hacer crecer pequeños negocios que enriquezcan la economía local.'
  },
];
