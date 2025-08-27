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
    city: '',
    type: '',
    level: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar escuelas
  const loadSchools = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filters.city) params.append('city', filters.city);
      if (filters.type) params.append('type', filters.type);
      if (filters.level) params.append('level', filters.level);

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
          <InputLabel>Ciudad</InputLabel>
          <Select
            value={filters.city}
            label="Ciudad"
            onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
          >
            <MenuItem value="">Todas</MenuItem>
            <MenuItem value="Madrid">Madrid</MenuItem>
            <MenuItem value="Barcelona">Barcelona</MenuItem>
            <MenuItem value="Valencia">Valencia</MenuItem>
            <MenuItem value="Sevilla">Sevilla</MenuItem>
            <MenuItem value="Bilbao">Bilbao</MenuItem>
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
          <InputLabel>Nivel</InputLabel>
          <Select
            value={filters.level}
            label="Nivel"
            onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="infantil">Infantil</MenuItem>
            <MenuItem value="primaria">Primaria</MenuItem>
            <MenuItem value="secundaria">Secundaria</MenuItem>
            <MenuItem value="bachillerato">Bachillerato</MenuItem>
            <MenuItem value="fp">FP</MenuItem>
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
