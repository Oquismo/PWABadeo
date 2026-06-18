'use client';

import { useState, useEffect, useMemo } from 'react';
import loggerClient from '@/lib/loggerClient';
import {
  Autocomplete,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack
} from '@mui/material';
import { School as SchoolIcon, LocationOn as LocationIcon } from '@mui/icons-material';

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
  enableFlux?: boolean;
}

// Display entry shown in the autocomplete (can be virtual)
interface DisplaySchool {
  label: string;        // What the user sees
  isVirtual: boolean;   // If true, not a real DB record
  realSchool?: School;  // Real school (null for virtual bases)
  baseName?: string;    // Base name for flux grouping
}

export default function SchoolSelector({ 
  value, 
  onChange, 
  error, 
  helperText, 
  required = false,
  enableFlux = false,
}: SchoolSelectorProps) {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    country: '',
    city: '',
    town: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBase, setSelectedBase] = useState<DisplaySchool | null>(null);
  const [selectedFlux, setSelectedFlux] = useState<string>('');

  // Ciudades por país
  const countryCities: Record<string, string[]> = {
    'Italia': ['Roma', 'Milano', 'Napoli', 'Torino', 'Palermo', 'Genova', 'Bologna', 'Firenze', 'Venezia', 'Bari'],
    'España': ['Madrid', 'Barcelona', 'Toledo']
  };

  // Pueblos/localidades por ciudad italiana
  const cityTowns: Record<string, string[]> = {
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
    'Madrid': ['Alcalá de Henares', 'Alcobendas', 'Alcorcón', 'Aranjuez', 'Boadilla del Monte', 'Collado Villalba', 'Coslada', 'El Escorial', 'Fuenlabrada', 'Getafe', 'Las Rozas', 'Leganés', 'Majadahonda', 'Móstoles', 'Parla', 'Pozuelo de Alarcón', 'San Lorenzo de El Escorial', 'Torrejón de Ardoz', 'Tres Cantos', 'Valdemoro'],
    'Barcelona': ['Badalona', 'Hospitalet de Llobregat', 'Sabadell', 'Terrassa', 'Santa Coloma de Gramenet', 'Cornellà de Llobregat', 'Sant Boi de Llobregat', 'Mataró', 'Granollers', 'Manresa', 'Vic', 'Igualada', 'Vilanova i la Geltrú', 'Girona', 'Lleida', 'Tarragona', 'Reus', 'Sitges', 'Figueres', 'Blanes'],
    'Toledo': ['Talavera de la Reina', 'Illescas', 'Seseña', 'Azuqueca de Henares', 'Guadalajara', 'Yepes', 'Ocaña', 'Quintanar de la Orden', 'Villacañas', 'Madridejos', 'Consuegra', 'Mora', 'Torrijos', 'Fuensalida', 'La Puebla de Montalbán', 'Sonseca', 'Orgaz', 'Tembleque']
  };
  
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [availableTowns, setAvailableTowns] = useState<string[]>([]);

  useEffect(() => {
    if (filters.country && countryCities[filters.country]) {
      setAvailableCities(countryCities[filters.country]);
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
      if (!cityTowns[filters.city].includes(filters.town)) {
        setFilters(prev => ({ ...prev, town: '' }));
      }
    } else {
      setAvailableTowns([]);
      setFilters(prev => ({ ...prev, town: '' }));
    }
  }, [filters.city]);

  useEffect(() => {
    if (filters.country && countryCities[filters.country]) {
      setAvailableCities(countryCities[filters.country]);
    }
  }, []);

  const loadSchools = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
    if (filters.country) params.append('country', filters.country);
    if (filters.city) params.append('city', filters.city);
    if (filters.town) params.append('town', filters.town);

      const response = await fetch(`/api/schools?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setSchools(data.schools);
      } else {
        loggerClient.error('Error cargando escuelas:', data.error);
      }
    } catch (error) {
      loggerClient.error('Error cargando escuelas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchools();
  }, [searchTerm, filters]);

  // Build display options from real schools, deriving virtual bases for flux variants
  const { displayOptions, fluxMap } = useMemo(() => {
    if (!enableFlux) {
      // Regular mode: show all real schools
      return {
        displayOptions: schools.map(s => ({ label: s.name, isVirtual: false, realSchool: s })),
        fluxMap: {} as Record<string, School[]>,
      };
    }

    // Flux mode: group schools by shared prefix (everything before the last word).
    // Two+ schools sharing a prefix form a flux group (e.g., "Minzoni V" + "Minzoni VI" → base "Minzoni").
    const prefixCount = new Map<string, School[]>();
    for (const school of schools) {
      const lastSpace = school.name.lastIndexOf(' ');
      if (lastSpace === -1) continue;
      const prefix = school.name.slice(0, lastSpace);
      if (!prefixCount.has(prefix)) prefixCount.set(prefix, []);
      prefixCount.get(prefix)!.push(school);
    }

    const display: DisplaySchool[] = [];
    const map: Record<string, School[]> = {};
    const grouped = new Set<number>();

    // Groups of 2+ are flux variants
    for (const [prefix, group] of prefixCount) {
      if (group.length < 2) continue;
      const key = prefix.toLowerCase();
      map[key] = group;
      for (const s of group) grouped.add(s.id);
      // Virtual base entry
      display.push({
        label: prefix,
        isVirtual: true,
        baseName: prefix,
        realSchool: { ...group[0], name: prefix, id: -group[0].id },
      });
    }

    // Non-flux schools
    for (const s of schools) {
      if (!grouped.has(s.id)) {
        display.push({ label: s.name, isVirtual: false, realSchool: s });
      }
    }

    return { displayOptions: display, fluxMap: map };
  }, [schools, enableFlux]);

  // Resolve the current value to a display entry
  const currentDisplay = useMemo(() => {
    if (!value || !enableFlux) return value as DisplaySchool | null;

    // If value is a flux variant, find its virtual base
    for (const [baseKey, variants] of Object.entries(fluxMap)) {
      const match = variants.find(v => v.id === value.id);
      if (match) {
        const baseName = match.name.slice(0, match.name.length - match.name.split(' ').pop()!.length - 1);
        return {
          label: baseName,
          isVirtual: true,
          baseName,
          realSchool: { ...value, name: baseName, id: -value.id },
        };
      }
    }

    return displayOptions.find(d => d.realSchool?.id === value.id) || null;
  }, [value, fluxMap, displayOptions, enableFlux]);

  // Init flux selection when value changes externally
  useEffect(() => {
    if (!value || !enableFlux) return;
    for (const [baseKey, variants] of Object.entries(fluxMap)) {
      const match = variants.find(v => v.id === value.id);
      if (match) {
        const baseName = match.name.slice(0, match.name.length - match.name.split(' ').pop()!.length - 1);
        setSelectedFlux(match.name.slice(baseName.length + 1));
        return;
      }
    }
  }, [value?.id, fluxMap, enableFlux]);

  const filterOptions = (options: DisplaySchool[], { inputValue }: any) => {
    if (!inputValue) return options;
    return options.filter(option =>
      option.label.toLowerCase().includes(inputValue.toLowerCase())
    );
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

  const handleSchoolSelect = (display: DisplaySchool | null) => {
    setSelectedFlux('');
    if (!display) {
      setSelectedBase(null);
      onChange(null);
      return;
    }

    setSelectedBase(display);

    // If it's a real non-flux school, emit immediately
    if (!display.isVirtual || !display.baseName) {
      onChange(display.realSchool || null);
      return;
    }

    // Virtual base: wait for flux selection, don't emit yet
    // But if this base has flux options, show the dropdown
    const key = display.baseName!.toLowerCase();
    const variants = fluxMap[key];
    if (variants && variants.length > 0) {
      // Don't call onChange yet — wait for flux
      return;
    }

    // No flux variants (shouldn't happen for virtual bases but handle it)
    onChange(display.realSchool || null);
  };

  const handleFluxSelect = (flux: string) => {
    setSelectedFlux(flux);
    if (!selectedBase?.baseName) return;

    const key = selectedBase.baseName.toLowerCase();
    const variants = fluxMap[key];
    if (!variants) return;

    const match = variants.find(v => {
      const vName = v.name.toLowerCase();
      return vName === `${selectedBase.baseName!.toLowerCase()} ${flux.toLowerCase()}` ||
             vName.endsWith(` ${flux.toLowerCase()}`);
    });

    onChange(match || selectedBase.realSchool || null);
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
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="Italia">Italia</MenuItem>
            <MenuItem value="España">España</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Selector de escuela */}
      <Autocomplete
        value={currentDisplay}
        onChange={(event, newValue) => handleSchoolSelect(newValue)}
        options={displayOptions}
        filterOptions={filterOptions}
        getOptionLabel={(option) => option.label}
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
          <Box component="li" {...props} key={option.realSchool?.id ?? option.label}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <SchoolIcon sx={{ color: 'action.active', mr: 2 }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  {option.label}
                </Typography>
                {option.isVirtual && (
                  <Typography variant="caption" color="text.secondary">
                    Con flux / programa
                  </Typography>
                )}
                {!option.isVirtual && option.realSchool?.city && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationIcon sx={{ fontSize: 14, color: 'text.secondary', mr: 0.5 }} />
                      <Typography variant="caption" color="text.secondary">
                        {option.realSchool.city}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        )}
        noOptionsText={loading ? "Cargando escuelas..." : "No se encontraron escuelas"}
        loadingText="Buscando escuelas..."
      />

      {/* Flux selector for schools with program variants */}
      {enableFlux && selectedBase?.isVirtual && selectedBase.baseName && (() => {
        const key = selectedBase.baseName!.toLowerCase();
        const variants = fluxMap[key] || [];
        if (variants.length === 0) return null;
        return (
          <FormControl fullWidth size="small" sx={{ mt: 2 }}>
            <InputLabel>Flux / Programa</InputLabel>
            <Select
              value={selectedFlux}
              label="Flux / Programa"
              onChange={(e) => handleFluxSelect(e.target.value)}
            >
              <MenuItem value="">
                <em>Selecciona flux</em>
              </MenuItem>
              {variants.map((v) => {
                const fluxName = v.name.slice(selectedBase.baseName!.length + 1);
                return (
                  <MenuItem key={v.id} value={fluxName}>{fluxName}</MenuItem>
                );
              })}
            </Select>
          </FormControl>
        );
      })()}

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
