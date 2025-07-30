export interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  longDescription?: string;
  eventDate?: Date; // 1. Nueva propiedad para la fecha del evento
}

export const projectsData: Project[] = [
  {
    id: 'impulso-digital',
    title: 'Impulso Digital',
    description: 'Capacitación en habilidades tecnológicas para jóvenes y adultos.',
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978',
    longDescription: 'Este proyecto se centra en cerrar la brecha digital...',
    eventDate: new Date(2025, 8, 15), // 2. Fecha de ejemplo para el evento (15 de Septiembre)
  },
  // ... (el resto de los proyectos no necesitan fecha por ahora)
];