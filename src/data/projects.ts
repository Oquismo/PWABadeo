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
    id: 'emprende-barrio',
    title: 'Emprende Barrio',
    description: 'Asesoramiento y microcréditos para emprendedores locales.',
    imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7',
    longDescription: 'Apoyamos a los residentes que tienen una idea de negocio. Ofrecemos talleres de planificación, asesoramiento legal y acceso a una red de microcréditos para ayudar a lanzar y hacer crecer pequeños negocios que enriquezcan la economía local.'
  },
];
