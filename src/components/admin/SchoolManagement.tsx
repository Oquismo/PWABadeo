'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Card,
  CardContent,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  School as SchoolIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Web as WebIcon
} from '@mui/icons-material';

interface School {
  id: number;
  name: string;
  address?: string;
  city?: string;
  province?: string;
  country: string;
  phoneNumber?: string;
  email?: string;
  website?: string;
  type: string;
  level: string;
  description?: string;
  users?: Array<{
    id: number;
    firstName?: string;
    lastName?: string;
    name?: string;
    email: string;
  }>;
}

const schoolTypes = ['pública', 'privada', 'concertada'];
const schoolLevels = [
  'scuola_primaria',
  'secondaria_primo',
  'secondaria_secondo',
  'universita'
];

export default function SchoolManagement() {
  // Estado principal del formulario
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    province: '',
    town: '',
    country: 'Italia',
    phoneNumber: '',
    email: '',
    website: '',
    type: 'pública',
    level: 'primaria',
    description: ''
  });

  // Provincias por ciudad italiana
  const cityProvinces: Record<string, string[]> = {
    // Italia
    'Roma': ['Roma'],
    'Milano': ['Milano', 'Monza e Brianza'],
    'Napoli': ['Napoli'],
    'Torino': ['Torino'],
    'Palermo': ['Palermo'],
    'Genova': ['Genova'],
    'Bologna': ['Bologna'],
    'Firenze': ['Firenze'],
    'Venezia': ['Venezia'],
    'Bari': ['Bari'],
    // España
    'Madrid': ['Madrid'],
    'Barcelona': ['Barcelona'],
    'Toledo': ['Toledo']
  };

  // Ciudades por país
  const countryCities: Record<string, string[]> = {
    'Italia': ['Roma', 'Milano', 'Napoli', 'Torino', 'Palermo', 'Genova', 'Bologna', 'Firenze', 'Venezia', 'Bari'],
    'España': ['Madrid', 'Barcelona', 'Toledo']
  };

  // Pueblos/localidades por ciudad
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
  // Provincias disponibles según ciudad
  const [availableProvinces, setAvailableProvinces] = useState<string[]>([]);
  // Pueblos disponibles según ciudad
  const [availableTowns, setAvailableTowns] = useState<string[]>([]);

  // Efecto para actualizar ciudades cuando cambia el país
  useEffect(() => {
    if (formData.country && countryCities[formData.country]) {
      setAvailableCities(countryCities[formData.country]);
      // Resetear ciudad, provincia y pueblo si el país cambió
      if (!countryCities[formData.country].includes(formData.city)) {
        setFormData(prev => ({ ...prev, city: '', province: '', town: '' }));
      }
    } else {
      setAvailableCities([]);
      setFormData(prev => ({ ...prev, city: '', province: '', town: '' }));
    }
  }, [formData.country]);

  useEffect(() => {
    if (formData.city && cityProvinces[formData.city]) {
      setAvailableProvinces(cityProvinces[formData.city]);
      setAvailableTowns(cityTowns[formData.city] || []);
      // Si la provincia actual no es válida, resetear
      if (!cityProvinces[formData.city].includes(formData.province)) {
        setFormData(prev => ({ ...prev, province: '', town: '' }));
      }
    } else {
      setAvailableProvinces([]);
      setAvailableTowns([]);
      setFormData(prev => ({ ...prev, province: '', town: '' }));
    }
  }, [formData.city]);

  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<School | null>(null);

  // Cargar escuelas
  const loadSchools = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/schools');
      if (response.ok) {
        const data = await response.json();
        setSchools(data.schools || []);
      } else {
        setError('Error al cargar las escuelas');
      }
    } catch (err) {
      setError('Error de conexión al cargar escuelas');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSchools();
  }, []);

  // Limpiar mensajes después de unos segundos
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleOpenDialog = (school?: School) => {
    if (school) {
      setEditingSchool(school);
      setFormData({
        name: school.name,
        address: school.address || '',
        city: school.city || '',
        province: school.province || '',
        town: (school as any).town || '',
        country: school.country,
        phoneNumber: school.phoneNumber || '',
        email: school.email || '',
        website: school.website || '',
        type: school.type,
        level: school.level,
        description: school.description || ''
      });
    } else {
      setEditingSchool(null);
      setFormData({
        name: '',
        address: '',
        city: '',
        province: '',
        town: '',
        country: 'Italia',
        phoneNumber: '',
        email: '',
        website: '',
        type: 'pública',
        level: 'primaria',
        description: ''
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingSchool(null);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: typeof formData) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError('El nombre de la escuela es obligatorio');
      return;
    }

    setLoading(true);
    try {
      const url = editingSchool 
        ? `/api/admin/schools/${editingSchool.id}`
        : '/api/admin/schools';
      
      const method = editingSchool ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(editingSchool ? 'Escuela actualizada exitosamente' : 'Escuela creada exitosamente');
        handleCloseDialog();
        loadSchools();
      } else {
        const data = await response.json();
        setError(data.error || 'Error al guardar la escuela');
      }
    } catch (err) {
      setError('Error de conexión al guardar la escuela');
    }
    setLoading(false);
  };

  const handleDelete = async (school: School) => {
    if (school.users && school.users.length > 0) {
      setError(`No se puede eliminar la escuela "${school.name}" porque tiene ${school.users.length} usuario(s) asociado(s)`);
      setDeleteConfirmOpen(null);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/schools/${school.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('Escuela eliminada exitosamente');
        loadSchools();
      } else {
        const data = await response.json();
        setError(data.error || 'Error al eliminar la escuela');
      }
    } catch (err) {
      setError('Error de conexión al eliminar la escuela');
    }
    setLoading(false);
    setDeleteConfirmOpen(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SchoolIcon />
          Gestión de Escuelas
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          disabled={loading}
        >
          Agregar Escuela
        </Button>
      </Box>

      {/* Mensajes de estado */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Estadísticas rápidas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Escuelas
              </Typography>
              <Typography variant="h4">
                {schools.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Escuelas Públicas
              </Typography>
              <Typography variant="h4">
                {schools.filter((s: School) => s.type === 'pública').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Escuelas Privadas
              </Typography>
              <Typography variant="h4">
                {schools.filter((s: School) => s.type === 'privada').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Con Usuarios
              </Typography>
              <Typography variant="h4">
                {schools.filter((s: School) => s.users && s.users.length > 0).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabla de escuelas */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Ciudad</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Nivel</TableCell>
              <TableCell>Usuarios</TableCell>
              <TableCell>Contacto</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schools.map((school: School) => (
              <TableRow key={school.id}>
                <TableCell>
                  <Box>
                    <Typography variant="subtitle2">{school.name}</Typography>
                    {school.address && (
                      <Typography variant="caption" color="textSecondary">
                        {school.address}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  {school.city && (
                    <Chip 
                      icon={<LocationIcon />} 
                      label={`${school.city}${school.province ? `, ${school.province}` : ''}`} 
                      size="small"
                      variant="outlined"
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={school.type} 
                    color={school.type === 'pública' ? 'primary' : school.type === 'privada' ? 'secondary' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip label={school.level} size="small" variant="outlined" />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {school.users ? school.users.length : 0} usuario(s)
                  </Typography>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    {school.phoneNumber && (
                      <Tooltip title={school.phoneNumber}>
                        <PhoneIcon fontSize="small" color="action" />
                      </Tooltip>
                    )}
                    {school.email && (
                      <Tooltip title={school.email}>
                        <EmailIcon fontSize="small" color="action" />
                      </Tooltip>
                    )}
                    {school.website && (
                      <Tooltip title={school.website}>
                        <WebIcon fontSize="small" color="action" />
                      </Tooltip>
                    )}
                  </Stack>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Editar">
                    <IconButton onClick={() => handleOpenDialog(school)} size="small">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton 
                      onClick={() => setDeleteConfirmOpen(school)} 
                      size="small"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog para agregar/editar escuela */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingSchool ? 'Editar Escuela' : 'Agregar Nueva Escuela'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre de la Escuela *"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('name', e.target.value)}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dirección"
                value={formData.address}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('address', e.target.value)}
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Ciudad</InputLabel>
                <Select
                  value={formData.city}
                  label="Ciudad"
                  onChange={(e: any) => handleInputChange('city', e.target.value)}
                >
                  <MenuItem value="">Todas</MenuItem>
                  {availableCities.map((city) => (
                    <MenuItem key={city} value={city}>{city}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={!formData.city || availableProvinces.length === 0}>
                <InputLabel>Provincia</InputLabel>
                <Select
                  value={formData.province}
                  label="Provincia"
                  onChange={(e: any) => handleInputChange('province', e.target.value)}
                >
                  <MenuItem value="">{availableProvinces.length === 0 ? 'Selecciona ciudad' : 'Todas'}</MenuItem>
                  {availableProvinces.map((prov: string) => (
                    <MenuItem key={prov} value={prov}>{prov}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={!formData.city || availableTowns.length === 0}>
                <InputLabel>Comune</InputLabel>
                <Select
                  value={formData.town}
                  label="Comune"
                  onChange={(e: any) => handleInputChange('town', e.target.value)}
                >
                  <MenuItem value="">{availableTowns.length === 0 ? 'Selecciona ciudad' : 'Tutti'}</MenuItem>
                  {availableTowns.map((town: string) => (
                    <MenuItem key={town} value={town}>{town}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>País</InputLabel>
                <Select
                  value={formData.country}
                  label="País"
                  onChange={(e: any) => handleInputChange('country', e.target.value)}
                >
                  <MenuItem value="Italia">Italia</MenuItem>
                  <MenuItem value="España">España</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Teléfono"
                value={formData.phoneNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('phoneNumber', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('email', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Sitio Web"
                value={formData.website}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('website', e.target.value)}
                placeholder="https://..."
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Escuela</InputLabel>
                <Select
                  value={formData.type}
                  label="Tipo de Escuela"
                  onChange={(e) => handleInputChange('type', e.target.value)}
                >
                  {schoolTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Nivel Educativo</InputLabel>
                <Select
                  value={formData.level}
                  label="Nivel Educativo"
                  onChange={(e) => handleInputChange('level', e.target.value)}
                >
                  <MenuItem value="scuola_primaria">Scuola Primaria</MenuItem>
                  <MenuItem value="secondaria_primo">Secondaria di Primo Grado</MenuItem>
                  <MenuItem value="secondaria_secondo">Secondaria di Secondo Grado</MenuItem>
                  <MenuItem value="universita">Università</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                multiline
                rows={3}
                placeholder="Información adicional sobre la escuela..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={loading || !formData.name.trim()}
          >
            {editingSchool ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmación para eliminar */}
      <Dialog 
        open={!!deleteConfirmOpen} 
        onClose={() => setDeleteConfirmOpen(null)}
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar la escuela "{deleteConfirmOpen?.name}"?
          </Typography>
          {deleteConfirmOpen?.users && deleteConfirmOpen.users.length > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Esta escuela tiene {deleteConfirmOpen.users.length} usuario(s) asociado(s). 
              No se puede eliminar hasta que no haya usuarios vinculados.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(null)}>Cancelar</Button>
          <Button 
            onClick={() => deleteConfirmOpen && handleDelete(deleteConfirmOpen)} 
            color="error"
            variant="contained"
            disabled={loading || (deleteConfirmOpen?.users && deleteConfirmOpen.users.length > 0)}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
