import React, { useState, useEffect } from 'react';
import { useTasks } from '@/context/TasksContext';
import { useAuth } from '@/context/AuthContext';
import { Box, FormControl, InputLabel, Select, MenuItem, CircularProgress, IconButton, Typography } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import { useTranslation } from '@/hooks/useTranslation';

interface School {
  id: number;
  name: string;
  city: string;
  type: string;
  level: string;
  country: string;
}

const SchoolSelector: React.FC = () => {
  const { currentSchoolId, setCurrentSchoolId, refreshTasks } = useTasks();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/schools');
      const data = await response.json();

      if (response.ok && data.success) {
        setSchools(data.schools || []);
      } else {
        setError('Error cargando escuelas');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleSchoolChange = (schoolId: number | null) => {
    setCurrentSchoolId(schoolId);
    // Forzar recarga con el id seleccionado para evitar inconsistencias por setState asíncrono
    refreshTasks(schoolId);
  };

  // Si el usuario no es admin, no mostrar el selector (se filtra automáticamente por su escuela)
  if (user?.role !== 'admin') {
    return null;
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size={18} />
        <Typography variant="body2" color="text.secondary">{t('schools.loading')}</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Typography variant="body2" color="error">{error}</Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <FormControl size="small" sx={{ minWidth: 260 }}>
        <InputLabel id="school-filter-label">{t('schools.filterLabel')}</InputLabel>
        <Select
          labelId="school-filter-label"
          value={currentSchoolId ?? ''}
          label={t('schools.filterLabel')}
          onChange={(e) => handleSchoolChange(e.target.value === '' ? null : Number(e.target.value))}
        >
          <MenuItem value="">{t('schools.allSchools')}</MenuItem>
          <MenuItem value={-1}>{t('schools.noSchool')}</MenuItem>
          {schools.map((school) => (
            <MenuItem key={school.id} value={school.id} sx={{ whiteSpace: 'normal' }}>
              {school.name} — {school.city} ({school.type})
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {currentSchoolId && (
        <IconButton aria-label={t('schools.clearFilter')} size="small" onClick={() => handleSchoolChange(null)}>
          <ClearIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
};

export default SchoolSelector;
