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
const schoolLevels = ['infantil', 'primaria', 'secundaria', 'bachillerato', 'fp'];

export default function SchoolManagement() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<School | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    province: '',
    country: 'España',
    phoneNumber: '',
    email: '',
    website: '',
    type: 'pública',
    level: 'primaria',
    description: ''
  });

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
        country: 'España',
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
    setFormData(prev => ({
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
                {schools.filter(s => s.type === 'pública').length}
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
                {schools.filter(s => s.type === 'privada').length}
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
                {schools.filter(s => s.users && s.users.length > 0).length}
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
            {schools.map((school) => (
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
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dirección"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ciudad"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Provincia"
                value={formData.province}
                onChange={(e) => handleInputChange('province', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="País"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Teléfono"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Sitio Web"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
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
                  {schoolLevels.map((level) => (
                    <MenuItem key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </MenuItem>
                  ))}
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
