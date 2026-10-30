export interface MapTileServer {
  url: string;
  attribution: string;
  maxZoom: number;
}

// Estilo suave (CARTO Voyager, sin etiquetas) para que el mapa case con el diseño de la app.
// OpenStreetMap queda como alternativa si CARTO falla.
export const TILE_SERVERS: MapTileServer[] = [
  {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
    maxZoom: 19,
  },
  {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  },
];

// Nombres de calles: solo se muestran al acercarse, para no ensuciar el mapa.
export const LABEL_TILES_URL = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png';
export const LABEL_TILES_MIN_ZOOM = 16;
