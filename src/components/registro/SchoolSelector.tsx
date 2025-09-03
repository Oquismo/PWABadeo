'use client';

import { useState, useEffect } from 'react';
import {
  Autocomplete,
  TextField,
  Box,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack
} from '@mui/material';
import {
  School as SchoolIcon,
  LocationOn as LocationIcon,
  Category as CategoryIcon
} from '@mui/icons-material';

interface School {
  id: number;
  name: string;
  address?: string;
  city?: string;
  province?: string;
  country?: string;
  town?: string;
  type: string;
  level: string;
  description?: string;
}

interface SchoolSelectorProps {
  value?: School | null;
  onChange: (school: School | null) => void;
  error?: boolean;
  helperText?: string;
  required?: boolean;
}

export default function SchoolSelector({ 
  value, 
  onChange, 
  error, 
  helperText, 
  required = false 
}: SchoolSelectorProps) {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    country: 'Italia',
    city: '',
    type: '',
    level: '',
    town: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Ciudades por país
  const countryCities: Record<string, string[]> = {
    'Italia': ['Roma', 'Milano', 'Napoli', 'Torino', 'Palermo', 'Genova', 'Bologna', 'Firenze', 'Venezia', 'Bari'],
    'España': ['Madrid', 'Barcelona', 'Toledo']
  };

  // Pueblos/localidades por ciudad italiana
  const cityTowns: Record<string, string[]> = {
    // Italia
    'Roma': ['Albano Laziale', 'Anzio', 'Bracciano', 'Castel Gandolfo', 'Ciampino', 'Frascati', 'Genzano di Roma', 'Guidonia Montecelio', 'Ladispoli', 'Marino', 'Nettuno', 'Ostia', 'Palestrina', 'Pomezia', 'Tivoli', 'Velletri', 'Viterbo'],
    'Milano': ['Abbiategrasso', 'Arese', 'Assago', 'Bergamo', 'Bollate', 'Brescia', 'Busto Arsizio', 'Cinisello Balsamo', 'Como', 'Corsico', 'Cremona', 'Gallarate', 'Legnano', 'Lodi', 'Magenta', 'Mantova', 'Monza', 'Novara', 'Pavia', 'Rho', 'Saronno', 'Sesto San Giovanni', 'Varese'],
    'Napoli': ['Acerra', 'Afragola', 'Aversa', 'Bacoli', 'Baiano', 'Calvizzano', 'Capri', 'Casalnuovo di Napoli', 'Caserta', 'Castellammare di Stabia', 'Ercolano', 'Giugliano in Campania', 'Ischia', 'Marano di Napoli', 'Nola', 'Pompei', 'Portici', 'Pozzuoli', 'Procida', 'San Giorgio a Cremano', 'Sorrento', 'Torre del Greco', 'Torre Annunziata'],
    'Torino': ['Alba', 'Alessandria', 'Asti', 'Avigliana', 'Beinasco', 'Biella', 'Borgaro Torinese', 'Chieri', 'Chivasso', 'Collegno', 'Cuneo', 'Grugliasco', 'Ivrea', 'Moncalieri', 'Nichelino', 'Novara', 'Orbassano', 'Pinerolo', 'Rivoli', 'Settimo Torinese', 'Venaria Reale', 'Verbania', 'Vercelli'],
    'Palermo': ['Bagheria', 'Balestrate', 'Carini', 'Castelvetrano', 'Cefalù', 'Corleone', 'Ficarazzi', 'Gangi', 'Lercara Friddi', 'Marsala', 'Mazara del Vallo', 'Misilmeri', 'Monreale', 'Partinico', 'Petralia Soprana', 'Pollina', 'San Giuseppe Jato', 'Termini Imerese', 'Trabia', 'Trapani'],
    'Genova': ['Arenzano', 'Bogliasco', 'Camogli', 'Chiavari', 'Cogoleto', 'La Spezia', 'Lavagna', 'Nervi', 'Pegli', 'Portofino', 'Rapallo', 'Recco', 'Santa Margherita Ligure', 'Savona', 'Sestri Levante', 'Sori', 'Varazze', 'Voltri'],
    'Bologna': ['Anzola dell\'Emilia', 'Budrio', 'Calderara di Reno', 'Casalecchio di Reno', 'Castel Maggiore', 'Castenaso', 'Cento', 'Crevalcore', 'Faenza', 'Ferrara', 'Imola', 'Medicina', 'Modena', 'Molinella', 'Ozzano dell\'Emilia', 'Parma', 'Pianoro', 'Ravenna', 'Reggio Emilia', 'Rimini', 'San Giovanni in Persiceto', 'San Lazzaro di Savena', 'Zola Predosa'],
    'Firenze': ['Bagno a Ripoli', 'Borgo San Lorenzo', 'Calenzano', 'Campi Bisenzio', 'Empoli', 'Fiesole', 'Figline e Incisa Valdarno', 'Impruneta', 'Lastra a Signa', 'Pontassieve', 'Prato', 'Reggello', 'Rignano sull\'Arno', 'San Casciano in Val di Pesa', 'Scandicci', 'Sesto Fiorentino', 'Signa', 'Vaglia'],
    'Venezia': ['Caorle', 'Cavallino-Treporti', 'Chioggia', 'Dolo', 'Eraclea', 'Jesolo', 'Marcon', 'Martellago', 'Mira', 'Mirano', 'Musile di Piave', 'Noale', 'Padova', 'Portogruaro', 'Quarto d\'Altino', 'San Donà di Piave', 'Spinea', 'Treviso', 'Verona', 'Vicenza'],
    'Bari': ['Acquaviva delle Fonti', 'Alberobello', 'Altamura', 'Andria', 'Barletta', 'Bitonto', 'Brindisi', 'Canosa di Puglia', 'Casamassima', 'Castellana Grotte', 'Conversano', 'Corato', 'Foggia', 'Gravina in Puglia', 'Lecce', 'Locorotondo', 'Martina Franca', 'Molfetta', 'Monopoli', 'Polignano a Mare', 'Putignano', 'Ruvo di Puglia', 'Taranto', 'Trani'],
    // España
    'Madrid': ['Alcalá de Henares', 'Alcobendas', 'Alcorcón', 'Aranjuez', 'Boadilla del Monte', 'Collado Villalba', 'Coslada', 'El Escorial', 'Fuenlabrada', 'Getafe', 'Las Rozas', 'Leganés', 'Majadahonda', 'Móstoles', 'Parla', 'Pozuelo de Alarcón', 'San Lorenzo de El Escorial', 'Torrejón de Ardoz', 'Tres Cantos', 'Valdemoro'],
    'Barcelona': ['Badalona', 'Hospitalet de Llobregat', 'Sabadell', 'Terrassa', 'Santa Coloma de Gramenet', 'Cornellà de Llobregat', 'Sant Boi de Llobregat', 'Mataró', 'Granollers', 'Manresa', 'Vic', 'Igualada', 'Vilanova i la Geltrú', 'Girona', 'Lleida', 'Tarragona', 'Reus', 'Sitges', 'Figueres', 'Blanes'],
    'Toledo': ['Talavera de la Reina', 'Illescas', 'Seseña', 'Azuqueca de Henares', 'Guadalajara', 'Yepes', 'Ocaña', 'Quintanar de la Orden', 'Villacañas', 'Madridejos', 'Consuegra', 'Mora', 'Torrijos', 'Fuensalida', 'La Puebla de Montalbán', 'Sonseca', 'Orgaz', 'Tembleque']
  };
  
  // Estados disponibles
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  // Pueblos disponibles según ciudad
  const [availableTowns, setAvailableTowns] = useState<string[]>([]);

  // Efecto para actualizar ciudades cuando cambia el país
  useEffect(() => {
    if (filters.country && countryCities[filters.country]) {
      setAvailableCities(countryCities[filters.country]);
      // Resetear ciudad y pueblo si el país cambió
      if (!countryCities[filters.country].includes(filters.city)) {
        setFilters(prev => ({ ...prev, city: '', town: '' }));
      }
    } else {
      setAvailableCities([]);
      setFilters(prev => ({ ...prev, city: '', town: '' }));
    }
  }, [filters.country]);

  useEffect(() => {
    if (filters.city && cityTowns[filters.city]) {
      setAvailableTowns(cityTowns[filters.city]);
      // Si el pueblo actual no es válido, resetear
      if (!cityTowns[filters.city].includes(filters.town)) {
        setFilters(prev => ({ ...prev, town: '' }));
      }
    } else {
      setAvailableTowns([]);
      setFilters(prev => ({ ...prev, town: '' }));
    }
  }, [filters.city]);

  // Inicializar ciudades al cargar el componente
  useEffect(() => {
    if (filters.country && countryCities[filters.country]) {
      setAvailableCities(countryCities[filters.country]);
    }
  }, []);

  // Cargar escuelas
  const loadSchools = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filters.country) params.append('country', filters.country);
      if (filters.city) params.append('city', filters.city);
      if (filters.type) params.append('type', filters.type);
      if (filters.level) params.append('level', filters.level);
      if (filters.town) params.append('town', filters.town);

      const response = await fetch(`/api/schools?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setSchools(data.schools);
      } else {
        console.error('Error cargando escuelas:', data.error);
      }
    } catch (error) {
      console.error('Error cargando escuelas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar escuelas al inicio y cuando cambien los filtros
  useEffect(() => {
    loadSchools();
  }, [searchTerm, filters]);

  // Función para filtrar escuelas en tiempo real
  const filterOptions = (options: School[], { inputValue }: any) => {
    if (!inputValue) return options;
    
    return options.filter(option =>
      option.name.toLowerCase().includes(inputValue.toLowerCase()) ||
      option.city?.toLowerCase().includes(inputValue.toLowerCase()) ||
      option.province?.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'pública': return 'primary';
      case 'privada': return 'secondary';
      case 'concertada': return 'success';
      default: return 'default';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'infantil': return 'info';
      case 'primaria': return 'primary';
      case 'secundaria': return 'warning';
      case 'bachillerato': return 'error';
      case 'fp': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box>
      {/* Filtros */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>País</InputLabel>
          <Select
            value={filters.country}
            label="País"
            onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
          >
            <MenuItem value="Italia">Italia</MenuItem>
            <MenuItem value="España">España</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Ciudad</InputLabel>
          <Select
            value={filters.city}
            label="Ciudad"
            onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
          >
            <MenuItem value="">Todas</MenuItem>
            {availableCities.map((city) => (
              <MenuItem key={city} value={city}>{city}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Tipo</InputLabel>
          <Select
            value={filters.type}
            label="Tipo"
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="pública">Pública</MenuItem>
            <MenuItem value="privada">Privada</MenuItem>
            <MenuItem value="concertada">Concertada</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Livello</InputLabel>
          <Select
            value={filters.level}
            label="Livello"
            onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
          >
            <MenuItem value="">Tutte</MenuItem>
            <MenuItem value="scuola_primaria">Scuola Primaria</MenuItem>
            <MenuItem value="secondaria_primo">Secondaria di Primo Grado</MenuItem>
            <MenuItem value="secondaria_secondo">Secondaria di Secondo Grado</MenuItem>
            <MenuItem value="universita">Università</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 140 }} disabled={!filters.city || availableTowns.length === 0}>
          <InputLabel>Comune</InputLabel>
          <Select
            value={filters.town}
            label="Comune"
            onChange={(e) => setFilters(prev => ({ ...prev, town: e.target.value }))}
          >
            <MenuItem value="">{availableTowns.length === 0 ? 'Selecciona ciudad' : 'Tutti'}</MenuItem>
            {availableTowns.map((town) => (
              <MenuItem key={town} value={town}>{town}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {/* Selector de escuela */}
      <Autocomplete
        value={value}
        onChange={(event, newValue) => onChange(newValue)}
        options={schools}
        filterOptions={filterOptions}
        getOptionLabel={(option) => option.name}
        loading={loading}
        renderInput={(params) => (
          <TextField
            {...params}
            label={`Selecciona tu escuela${required ? ' *' : ''}`}
            error={error}
            helperText={helperText}
            InputProps={{
              ...params.InputProps,
              startAdornment: <SchoolIcon sx={{ color: 'action.active', mr: 1 }} />,
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        renderOption={(props, option) => (
          <Box component="li" {...props} key={option.id}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <SchoolIcon sx={{ color: 'action.active', mr: 2 }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  {option.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  {option.city && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationIcon sx={{ fontSize: 14, color: 'text.secondary', mr: 0.5 }} />
                      <Typography variant="caption" color="text.secondary">
                        {option.city}, {option.province}
                      </Typography>
                    </Box>
                  )}
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                  <Chip 
                    label={option.type} 
                    size="small" 
                    color={getTypeColor(option.type) as any}
                    variant="outlined"
                  />
                  <Chip 
                    label={option.level} 
                    size="small" 
                    color={getLevelColor(option.level) as any}
                    variant="outlined"
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        )}
        noOptionsText={loading ? "Cargando escuelas..." : "No se encontraron escuelas"}
        loadingText="Buscando escuelas..."
      />

      {/* Información adicional */}
      {value && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Escuela seleccionada:</strong> {value.name}
            <br />
            {value.address && (
              <>
                <strong>Dirección:</strong> {value.address}, {value.city}
                <br />
              </>
            )}
            <strong>Tipo:</strong> {value.type} | <strong>Nivel:</strong> {value.level}
            {value.description && (
              <>
                <br />
                <strong>Descripción:</strong> {value.description}
              </>
            )}
          </Typography>
        </Alert>
      )}

      {schools.length === 0 && !loading && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          No se encontraron escuelas. Ajusta los filtros de búsqueda.
        </Alert>
      )}
    </Box>
  );
}
