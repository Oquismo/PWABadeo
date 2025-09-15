// src/data/places.ts

export interface Place {
  id: string;
  name: string;
  description: string;
  category: 'Cultural' | 'Comida' | 'Ocio' | 'Servicios' | 'Estudio' | 'Transporte' | 'Salud' | 'Residencia' | 'Metro';
  coordinates: { lat: number; lng: number };
  imageUrl?: string;
  address?: string;
  link?: string;
}

export const placesData: Place[] = [
  // === RESIDENCIAS PARA ESTUDIANTES ERASMUS ===
  {
    id: 'residencia-amro',
    name: 'Residencia AMRO Sevilla',
    description: 'Residencia universitaria con excelente ubicación cerca del centro. Habitaciones individuales y zonas comunes.',
    category: 'Residencia',
    coordinates: { lat: 37.35195144264452, lng: -5.97526460125809 }, // Coordenadas exactas de Google Maps
    address: 'C. Elche, C. Ali Al-Gomari, 41013 Sevilla',
    link: 'https://www.residenciauniversitaria.es/'
  },
  {
    id: 'residencia-one-sevilla',
    name: 'Residencia Universitaria ONE Sevilla (Livinnx)',
    description: 'Residencia moderna con todas las comodidades para estudiantes internacionales. WiFi, cocina equipada, salas de estudio.',
    category: 'Residencia',
    coordinates: { lat: 37.363285317786854, lng: -5.984741107568575 }, // Coordenadas exactas de Google Maps
    address: 'C/ Páez de Rivera, 1, 41012 Sevilla',
    link: 'https://www.livinnx.com/'
  },
  {
    id: 'residencia-estanislao',
    name: 'Residencia Estanislao',
    description: 'Residencia para estudiantes con buena ubicación y servicios básicos. Ideal para quienes estudian en el centro de Sevilla.',
    category: 'Residencia',
    coordinates: { lat: 37.35645121300518, lng: -5.978122866568905 },
    address: 'Zona Residencial, Sevilla',
    link: ''
  },

  // === OFICINAS Y SERVICIOS ===
  {
    id: 'oficina-barrio-oportunidades',
    name: 'Oficina Barrio de Oportunidades',
    description: 'Oficina principal del programa Barrio de Oportunidades. Punto de encuentro y gestiones.',
    category: 'Servicios',
    coordinates: { lat: 37.3895687188777, lng: -5.9916432331313185 }, // Coordenadas exactas de Google Maps
    address: 'Cta. del Rosario, 8, Casa 1, 4F, Casco Antiguo, 41004 Sevilla',
    link: 'https://www.google.com/maps/place/Cta.+del+Rosario,+8,+Casa+1,+4F,+Casco+Antiguo,+41004+Sevilla'
  },

  // === LUGARES CULTURALES ===
  {
    id: 'plaza-de-espana',
    name: 'Plaza de España',
    description: 'Una de las plazas más espectaculares de España, construida para la Exposición Iberoamericana de 1929. Arquitectura semicircular con canales, puentes y azulejos representando las provincias españolas.',
    category: 'Cultural',
    coordinates: { lat: 37.37725611928226, lng: -5.986883526606402 }, // Coordenadas exactas de Google Maps
    address: 'Av. de Isabel la Católica, 41013 Sevilla',
    link: 'https://www.google.com/maps/place/Plaza+de+Espa%C3%B1a,+41013+Sevilla'
  },
  {
    id: 'plaza-de-armas',
    name: 'Plaza de Armas',
    description: 'Histórica estación de autobuses y centro de transporte de Sevilla. Punto de conexión importante para desplazarse por la ciudad y la región.',
    category: 'Transporte',
    coordinates: { lat: 37.39212732174192, lng: -6.003608779440957 }, // Coordenadas exactas de Google Maps
    address: 'Av. del Cristo de la Expiración, 2, 41001 Sevilla',
    link: 'https://www.google.com/maps/place/Plaza+de+Armas,+41001+Sevilla'
  },
  {
    id: 'metro-puerta-jerez',
    name: 'Metro Puerta Jerez',
    description: 'Estación de metro en el centro histórico de Sevilla. Conexión principal del metro ligero con el casco antiguo y las zonas turísticas.',
    category: 'Metro',
    coordinates: { lat: 37.381861907401436, lng: -5.994523946051503 }, // Coordenadas exactas de Google Maps
    address: 'Puerta Jerez, 41001 Sevilla',
    link: 'https://www.google.com/maps/place/Metro+Puerta+Jerez,+41001+Sevilla'
  },

  // === RESTAURANTES ===
  {
    id: 'tropiqal-sevilla',
    name: 'Tropiqal',
    description: 'Restaurante para comer en Sevilla. Excelente opción gastronómica para estudiantes y visitantes.',
    category: 'Comida',
    coordinates: { lat: 37.39355028773172, lng: -5.992344771133435 }, // Coordenadas exactas de Google Maps
    address: 'Sevilla, España',
    link: 'https://www.google.com/maps/place/37.39355028773172,-5.992344771133435'
  },
  {
    id: 'terraviva-sevilla',
    name: 'Terraviva',
    description: 'Restaurante para comer en Sevilla. Excelente opción gastronómica para estudiantes y visitantes.',
    category: 'Comida',
    coordinates: { lat: 37.38887365499451, lng: -5.996489364166827 }, // Coordenadas exactas de Google Maps
    address: 'Sevilla, España',
    link: 'https://www.google.com/maps/place/37.38887365499451,-5.996489364166827'
  },
  {
    id: 'el-sella-triana',
    name: 'Restaurante El Sella Triana',
    description: 'Restaurante en el barrio de Triana, Sevilla. Excelente opción gastronómica para estudiantes y visitantes.',
    category: 'Comida',
    coordinates: { lat: 37.3850075161731, lng: -6.002730464762367 }, // Coordenadas exactas de Google Maps
    address: 'Triana, Sevilla, España',
    link: 'https://www.google.com/maps/place/37.3850075161731,-6.002730464762367'
  },

  // === SERVICIOS DE SALUD ===
  {
    id: 'hospital-virgen-del-rocio',
    name: 'Hospital Universitario Virgen del Rocío',
    description: 'Hospital principal de Sevilla. Centro sanitario de referencia para estudiantes y residentes en la ciudad.',
    category: 'Salud',
    coordinates: { lat: 37.36201536886432, lng: -5.980415928893226 }, // Coordenadas exactas de Google Maps
    address: 'Av. Manuel Siurot, s/n, 41013 Sevilla',
    link: 'https://www.google.com/maps/place/37.36201536886432,-5.980415928893226'
  },
  {
    id: 'hospital-la-macarena',
    name: 'Hospital Universitario La Macarena',
    description: 'Hospital de referencia en Sevilla. Centro sanitario importante para estudiantes y residentes en la zona norte de la ciudad.',
    category: 'Salud',
    coordinates: { lat: 37.40697693097462, lng: -5.986696544309879 }, // Coordenadas exactas de Google Maps
    address: 'Av. Dr. Fedriani, 3, 41009 Sevilla',
    link: 'https://www.google.com/maps/place/37.40697693097462,-5.986696544309879'
  },
  {
    id: 'hospital-viamed-fatima',
    name: 'Hospital Viamed Fátima Sevilla',
    description: 'Hospital privado en Sevilla. Centro sanitario especializado para estudiantes y residentes que busquen atención médica privada.',
    category: 'Salud',
    coordinates: { lat: 37.369201233762254, lng: -5.988228684485652 }, // Coordenadas exactas de Google Maps
    address: 'Sevilla, España',
    link: 'https://www.google.com/maps/place/37.369201233762254,-5.988228684485652'
  },

  // === OCIO Y ENTRETENIMIENTO ===
  {
    id: 'bar-manhattan-sevilla',
    name: 'Bar Manhattan Sevilla',
    description: 'Bar de ocio en Sevilla. Lugar ideal para estudiantes y jóvenes para disfrutar del ambiente nocturno.',
    category: 'Ocio',
    coordinates: { lat: 37.378548212770326, lng: -5.993453873446093 }, // Coordenadas exactas de Google Maps
    address: 'Sevilla, España',
    link: 'https://www.google.com/maps/place/37.378548212770326,-5.993453873446093'
  },
  {
    id: 'makievaello-sevilla',
    name: 'Makievaello Sevilla',
    description: 'Lugar de ocio en Sevilla. Excelente opción para estudiantes y visitantes para disfrutar del ambiente local.',
    category: 'Ocio',
    coordinates: { lat: 37.37528781245707, lng: -5.991693157730823 }, // Coordenadas exactas de Google Maps
    address: 'Sevilla, España',
    link: 'https://www.google.com/maps/place/37.37528781245707,-5.991693157730823'
  }
]