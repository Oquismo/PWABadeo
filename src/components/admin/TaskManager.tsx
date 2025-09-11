'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Checkbox,
  FormControlLabel,
  ListItemText
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useTasks } from '@/context/TasksContext';
import { useAuth } from '@/context/AuthContext';
import { TaskData } from '@/data/tasks';


interface TaskFormData {
  title: string;
  description: string;
  date: string;
}

export default function TaskManager() {
  const { tasks, addTask, updateTask, deleteTask, resetToDefault, canManageAdminTasks } = useTasks();
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskData | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  
  // Estados para escuelas
  const [schools, setSchools] = useState<any[]>([]);
  const [selectedSchoolIds, setSelectedSchoolIds] = useState<number[]>([]);
  const [isCommonTask, setIsCommonTask] = useState(false);

  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    date: ''
  });
  const [taskRole, setTaskRole] = useState<'admin' | 'user'>('user');

  // Cargar escuelas al montar el componente
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await fetch('/api/schools');
        const data = await response.json();
        if (response.ok && data.success) {
          setSchools(data.schools);
        }
      } catch (error) {
        console.error('Error cargando escuelas:', error);
      }
    };
    fetchSchools();
  }, []);

  const openDialog = (task?: TaskData) => {
    if (task) {
      setEditingTask(task);
      setFormData({
  title: task.title,
  description: task.description,
  date: task.date || ''
      });
      setTaskRole(task.role || 'user');
      
      // Configurar escuelas para edición
      if (task.schools && task.schools.length > 0) {
        setSelectedSchoolIds(task.schools.map((s: any) => s.id));
        setIsCommonTask(false);
      } else {
        setSelectedSchoolIds([]);
        setIsCommonTask(task.comun || false);
      }
    } else {
      setEditingTask(null);
      setFormData({
  title: '',
  description: '',
  date: ''
      });
      setTaskRole('user');
      // Si el usuario no es admin, asignar su propia escuela por defecto y evitar que elija otras
      if (user && user.role !== 'admin') {
        setSelectedSchoolIds(user.schoolId ? [user.schoolId] : []);
      } else {
        setSelectedSchoolIds([]);
      }
      setIsCommonTask(false);
    }
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingTask(null);
    setSelectedSchoolIds([]);
    setIsCommonTask(false);
    setFormData({
      title: '',
      description: '',
      date: ''
    });
    setTaskRole('user');
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) return;

    const taskData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      // Convert datetime-local value (local) to ISO for backend
      date: formData.date ? new Date(formData.date).toISOString() : undefined,
      role: taskRole,
      // defaults for removed fields
      progress: 0,
      color: '#667eea',
      avatars: [],
      schoolIds: isCommonTask ? [] : selectedSchoolIds,
      comun: isCommonTask
    } as any;

    (async () => {
      if (editingTask) {
        const res = await updateTask(editingTask.id!, taskData);
        if (res) {
          closeDialog();
          setShowAlert(true);
          setTimeout(() => setShowAlert(false), 3000);
        }
      } else {
        const res = await addTask(taskData);
        if (res) {
          closeDialog();
          setShowAlert(true);
          setTimeout(() => setShowAlert(false), 3000);
        }
      }
    })();
  };

  const handleDelete = (id: string) => {
    (async () => {
      const ok = await deleteTask(id);
      if (ok) {
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
      }
    })();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Gestionar Tareas
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {canManageAdminTasks && (
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={resetToDefault}
              size="small"
            >
              Restablecer
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => openDialog()}
          >
            Nueva Tarea
          </Button>
        </Box>
      </Box>

      {showAlert && (
        <Alert severity="success" sx={{ mb: 2 }}>
          ¡Cambios guardados exitosamente!
        </Alert>
      )}

      <Grid container spacing={2}>
        {tasks.map((task) => (
          <Grid item xs={12} sm={6} md={4} key={task.id}>
            <Card sx={{ 
              background: task.color,
              color: 'white',
              position: 'relative',
              minHeight: '160px'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1rem' }}>
                    {task.title}
                  </Typography>
                  <Box>
                    {(
                      canManageAdminTasks ||
                      // Permitir editar/Eliminar sólo si la tarea no es admin y fue creada por el user actual
                      (((task.role || 'user') === 'user') && user && task.user && Number(task.user.id) === Number(user.id))
                    ) && (
                      <>
                        <IconButton 
                          size="small" 
                          sx={{ color: 'white', p: 0.5 }}
                          onClick={() => openDialog(task)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          sx={{ color: 'white', p: 0.5, ml: 0.5 }}
                          onClick={() => handleDelete(task.id!)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </Box>
                </Box>
                
                <Typography variant="body2" sx={{ opacity: 0.85, mb: 2, fontSize: '0.8rem' }}>
                  {task.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog para crear/editar tareas */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTask ? 'Editar Tarea' : 'Nueva Tarea'} {taskRole === 'admin' && '(Admin)'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {canManageAdminTasks && (
              <FormControl fullWidth>
                <InputLabel>Rol de la tarea</InputLabel>
                <Select
                  value={taskRole}
                  label="Rol de la tarea"
                  onChange={(e) => setTaskRole(e.target.value as 'admin' | 'user')}
                >
                  <MenuItem value="user">Usuario</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
            )}
            <TextField
              label="Título de la tarea"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
              required
            />
            
            <TextField
              label="Descripción"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />

            {/* progress, color and collaborators removed per request */}

            <TextField
              label="Fecha y hora (opcional)"
              type="datetime-local"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            {/* Selector de escuelas */}
            {canManageAdminTasks && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isCommonTask}
                    onChange={(e) => {
                      setIsCommonTask(e.target.checked);
                      if (e.target.checked) {
                        setSelectedSchoolIds([]);
                      }
                    }}
                  />
                }
                label="Tarea común para todas las escuelas"
              />
            )}

            {!isCommonTask && (
              <>
                {user && user.role !== 'admin' ? null : (
                  <FormControl fullWidth>
                    <InputLabel>Escuelas asignadas</InputLabel>
                    <Select
                      multiple
                      value={selectedSchoolIds}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSelectedSchoolIds(typeof value === 'string' ? [] : value);
                      }}
                      label="Escuelas asignadas"
                      renderValue={(selected) => {
                        const selectedSchools = schools.filter(school => selected.includes(school.id));
                        return selectedSchools.map(school => school.name).join(', ');
                      }}
                    >
                      {schools.map((school) => (
                        <MenuItem key={school.id} value={school.id}>
                          <Checkbox checked={selectedSchoolIds.indexOf(school.id) > -1} />
                          <ListItemText primary={school.name} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingTask ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
