// src/data/places.ts

export interface Place {
  id: string;
  name: string;
  description: string;
  category: 'Cultural' | 'Comida' | 'Ocio' | 'Servicios' | 'Estudio' | 'Transporte' | 'Salud';
  coordinates: { lat: number; lng: number };
  imageUrl?: string;
  address?: string;
  link?: string;
}

export const placesData: Place[] = [
  {
    id: 'plaza-espana',
    name: 'Plaza de España',
    description: 'Impresionante conjunto arquitectónico, ideal para pasear y hacer fotos.',
    category: 'Cultural',
    coordinates: { lat: 37.3776, lng: -5.9865 },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Plaza_de_Espa%C3%B1a_-_Sevilla_2016-04-12_15-12-07.jpg',
    address: 'Av. Isabel la Católica, 41013 Sevilla',
    link: 'https://es.wikipedia.org/wiki/Plaza_de_Espa%C3%B1a_(Sevilla)'
  },
  {
    id: 'setas-sevilla',
    name: 'Las Setas de Sevilla',
    description: 'Estructura de madera moderna con mirador y mercado en la planta baja.',
    category: 'Ocio',
    coordinates: { lat: 37.3948, lng: -5.9917 },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Setas_de_Sevilla_-_Panor%C3%A1mica.jpg',
    address: 'Pl. de la Encarnación, 41003 Sevilla',
    link: 'https://setasdesevilla.com/'
  },
  {
    id: 'tussam-parada-prado',
    name: 'Parada TUSSAM Prado S. S.',
    description: 'Importante nudo de transporte público y parada del Bus Especial Aeropuerto (EA).',
    category: 'Transporte',
    coordinates: { lat: 37.3768, lng: -5.9904 },
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Estaci%C3%B3n_de_autobuses_Prado_de_San_Sebasti%C3%A1n.jpg/1200px-Estaci%C3%B3n_de_autobuses_Prado_de_San_Sebasti%C3%A1n.jpg',
    address: 'Av. Portugal, s/n, 41004 Sevilla',
    link: 'https://www.tussam.es/es/paradas'
  },
  // --- NUEVAS PARADAS DE METRO ---
  {
    id: 'metro-puerta-jerez',
    name: 'Metro Puerta Jerez',
    description: 'Estación de metro céntrica, ideal para conectar con el centro histórico.',
    category: 'Transporte',
    coordinates: { lat: 37.3828, lng: -5.9961 },
    address: 'Av. de la Constitución, s/n, 41001 Sevilla',
    link: 'https://www.metrodesevilla.es/estaciones/puerta-jerez'
  },
  {
    id: 'metro-prado-san-sebastian',
    name: 'Metro Prado S. S.',
    description: 'Estación de metro y autobús, un gran intercambiador de transporte.',
    category: 'Transporte',
    coordinates: { lat: 37.3769, lng: -5.9904 },
    address: 'Av. de Carlos V, s/n, 41004 Sevilla',
    link: 'https://www.metrodesevilla.es/estaciones/prado-de-san-sebastian'
  },
  {
    id: 'metro-san-bernardo',
    name: 'Metro San Bernardo',
    description: 'Conexión con tren de cercanías y varias líneas de autobús.',
    category: 'Transporte',
    coordinates: { lat: 37.3769, lng: -5.9818 },
    address: 'Av. de la Buhaira, s/n, 41018 Sevilla',
    link: 'https://www.metrodesevilla.es/estaciones/san-bernardo'
  },
  {
    id: 'metro-nervion',
    name: 'Metro Nervión',
    description: 'Estación que da servicio a la zona comercial y al estadio Ramón Sánchez-Pizjuán.',
    category: 'Transporte',
    coordinates: { lat: 37.3879, lng: -5.9723 },
    address: 'Av. Eduardo Dato, 41005 Sevilla',
    link: 'https://www.metrodesevilla.es/estaciones/nervion'
  },
  // --- FIN NUEVAS PARADAS DE METRO ---
  {
    id: 'hospital-virgen-rocio',
    name: 'Hospital Universitario Virgen del Rocío',
    description: 'Uno de los hospitales más grandes de Sevilla.',
    category: 'Salud',
    coordinates: { lat: 37.3592, lng: -5.9868 },
    address: 'Av. Manuel Siurot, s/n, 41013 Sevilla',
    link: 'https://www.juntadeandalucia.es/servicioandaluzdesalud/huvr/'
  },
  {
    id: 'bar-el-sardinero',
    name: 'Bar El Sardinero',
    description: 'Tapas tradicionales sevillanas a buen precio.',
    category: 'Comida',
    coordinates: { lat: 37.3917, lng: -5.9855 },
    address: 'C. Gravina, 16, 41001 Sevilla',
    link: 'https://www.tripadvisor.es/Restaurant_Review-g187443-d2508000-Reviews-Restaurante_El_Sardinero-Seville_Province_of_Seville_Andalucia.html'
  }
];