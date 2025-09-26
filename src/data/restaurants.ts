// Datos curados de restaurantes recomendados en Sevilla
// Esta será la base de datos local que complementará la API externa

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  priceRange: "€" | "€€" | "€€€";
  rating: number;
  reviewCount: number;
  address: string;
  coordinates: { lat: number; lng: number };
  image: string;
  openNow: boolean;
  distance?: number; // Se calculará dinámicamente
  walkingTime?: string; // Se calculará dinámicamente
  description: string;
  specialties: string[];
  openingHours?: {
    [key: string]: string; // "monday": "12:00-16:00, 20:00-24:00"
  };
  phoneNumber?: string;
  website?: string;
  priceAverage?: number; // Precio promedio en euros
}

export const sevillaRestaurants: Restaurant[] = [
  {
    id: 'el-rinconcillo',
    name: 'El Rinconcillo',
    cuisine: 'Tapas Tradicionales',
    priceRange: '€€',
    rating: 4.3,
    reviewCount: 1245,
    address: 'C. Gerona, 40, 41003 Sevilla',
    coordinates: { lat: 37.3895687, lng: -5.9916432 },
    image: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?w=400',
    openNow: true,
    description: 'El bar más antiguo de Sevilla, fundado en 1670. Famoso por sus tapas tradicionales y su ambiente histórico.',
    specialties: ['Jamón ibérico', 'Cazón en adobo', 'Espinacas con garbanzos'],
    phoneNumber: '+34 954 22 31 83',
    priceAverage: 25
  },
  {
    id: 'abantal',
    name: 'Abantal',
    cuisine: 'Alta Cocina Andaluza',
    priceRange: '€€€',
    rating: 4.8,
    reviewCount: 892,
    address: 'C. Alcalde Manuel del Valle, 5, 41003 Sevilla',
    coordinates: { lat: 37.3912573, lng: -5.9952447 },
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
    openNow: false,
    description: 'Restaurante con estrella Michelin especializado en cocina andaluza moderna con productos de temporada.',
    specialties: ['Menú degustación', 'Atún de almadraba', 'Gazpacho de cereza'],
    phoneNumber: '+34 954 54 00 00',
    website: 'https://www.abantalrestaurante.es',
    priceAverage: 85
  },
  {
    id: 'bar-estrella',
    name: 'Bar Estrella',
    cuisine: 'Pescaíto Frito',
    priceRange: '€',
    rating: 4.1,
    reviewCount: 567,
    address: 'C. Estrella, 3, 41003 Sevilla',
    coordinates: { lat: 37.3858075, lng: -5.9932146 },
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
    openNow: true,
    description: 'Auténtico bar sevillano especializado en pescaíto frito y mariscos frescos del día.',
    specialties: ['Boquerones fritos', 'Gambas al pil pil', 'Tortillitas de camarones'],
    phoneNumber: '+34 954 22 72 58',
    priceAverage: 15
  },
  {
    id: 'la-azotea',
    name: 'La Azotea',
    cuisine: 'Cocina Moderna',
    priceRange: '€€',
    rating: 4.5,
    reviewCount: 1089,
    address: 'C. Zaragoza, 5, 41001 Sevilla',
    coordinates: { lat: 37.3876543, lng: -5.9901234 },
    image: 'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=400',
    openNow: true,
    description: 'Cocina creativa con toques tradicionales. Terraza con vistas al centro histórico de Sevilla.',
    specialties: ['Salmorejo con jamón', 'Pulpo a la plancha', 'Cheesecake de limón'],
    phoneNumber: '+34 955 11 67 48',
    website: 'https://www.laazoteasevilla.com',
    priceAverage: 35
  },
  {
    id: 'casa-robles',
    name: 'Casa Robles',
    cuisine: 'Cocina Andaluza',
    priceRange: '€€',
    rating: 4.4,
    reviewCount: 743,
    address: 'C. Álvarez Quintero, 58, 41004 Sevilla',
    coordinates: { lat: 37.3889456, lng: -5.9934567 },
    image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400',
    openNow: true,
    description: 'Restaurante familiar con más de 40 años de tradición. Especializado en cocina casera andaluza.',
    specialties: ['Rabo de toro', 'Paella sevillana', 'Flan de huevo'],
    phoneNumber: '+34 954 56 32 72',
    priceAverage: 30
  },
  {
    id: 'eslava',
    name: 'Eslava',
    cuisine: 'Tapas Modernas',
    priceRange: '€€',
    rating: 4.6,
    reviewCount: 1456,
    address: 'C. Eslava, 3, 41002 Sevilla',
    coordinates: { lat: 37.3845678, lng: -5.9923456 },
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
    openNow: true,
    description: 'Tapas innovadoras en el tradicional barrio de la Alameda. Fusión perfecta entre tradición e innovación.',
    specialties: ['Huevo con caviar', 'Solomillo con foie', 'Croquetas de rabo de toro'],
    phoneNumber: '+34 954 90 65 68',
    priceAverage: 28
  },
  {
    id: 'modesto',
    name: 'Modesto',
    cuisine: 'Mariscos',
    priceRange: '€€',
    rating: 4.2,
    reviewCount: 892,
    address: 'C. Cano y Cueto, 5, 41004 Sevilla',
    coordinates: { lat: 37.3867890, lng: -5.9912345 },
    image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400',
    openNow: true,
    description: 'Especialista en mariscos y pescados frescos. Productos de la costa andaluza de primera calidad.',
    specialties: ['Langostinos de Sanlúcar', 'Lubina a la sal', 'Paella de mariscos'],
    phoneNumber: '+34 954 41 68 11',
    website: 'https://www.modestobar.com',
    priceAverage: 40
  },
  {
    id: 'taberna-coloniales',
    name: 'Taberna Coloniales',
    cuisine: 'Tapas Caseras',
    priceRange: '€',
    rating: 4.0,
    reviewCount: 1234,
    address: 'Plaza Cristo de Burgos, 19, 41003 Sevilla',
    coordinates: { lat: 37.3823456, lng: -5.9934567 },
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
    openNow: true,
    description: 'Taberna tradicional con ambiente auténtico sevillano. Tapas abundantes y precios muy razonables.',
    specialties: ['Montadito de pringá', 'Cazuela de garbanzos', 'Carrillada ibérica'],
    phoneNumber: '+34 954 50 57 21',
    priceAverage: 18
  }
];

// Categorías para filtros
export const cuisineTypes = [
  'Tapas Tradicionales',
  'Alta Cocina Andaluza', 
  'Pescaíto Frito',
  'Cocina Moderna',
  'Cocina Andaluza',
  'Tapas Modernas',
  'Mariscos',
  'Tapas Caseras'
];

// Función helper para calcular distancia (aproximada)
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Radio de la Tierra en metros
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distancia en metros
}

// Función helper para calcular tiempo caminando aproximado
export function calculateWalkingTime(distanceInMeters: number): string {
  const walkingSpeedMPS = 1.4; // metros por segundo (velocidad promedio caminando)
  const timeInSeconds = distanceInMeters / walkingSpeedMPS;
  const timeInMinutes = Math.round(timeInSeconds / 60);
  
  if (timeInMinutes < 1) return '< 1 min';
  if (timeInMinutes === 1) return '1 min';
  return `${timeInMinutes} min`;
}