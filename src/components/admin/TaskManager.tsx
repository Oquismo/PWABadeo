'use client';

import React, { useState } from 'react';
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
  Slider,
  IconButton,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useTasks } from '@/context/TasksContext';
import { TaskData } from '@/data/tasks';

// Gradientes predefinidos para elegir
const gradientOptions = [
  { name: 'Azul-Púrpura', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: 'Rosa-Rojo', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { name: 'Turquesa-Rosa', value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
  { name: 'Naranja-Durazno', value: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
  { name: 'Verde-Azul', value: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)' },
  { name: 'Rosa-Amarillo', value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { name: 'Morado-Azul', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: 'Verde-Menta', value: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)' }
];

interface TaskFormData {
  title: string;
  description: string;
  progress: number;
  color: string;
  avatars: string;
  date: string;
}

export default function TaskManager() {
  const { tasks, addTask, updateTask, deleteTask, resetToDefault } = useTasks();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskData | null>(null);
  const [showAlert, setShowAlert] = useState(false);

  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    progress: 0,
    color: gradientOptions[0].value,
    avatars: '',
    date: ''
  });

  const openDialog = (task?: TaskData) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description,
        progress: task.progress,
        color: task.color,
        avatars: task.avatars.join(', '),
        date: task.date || ''
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        progress: 0,
        color: gradientOptions[0].value,
        avatars: '',
        date: ''
      });
    }
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingTask(null);
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) return;

    const taskData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      progress: formData.progress,
      color: formData.color,
      avatars: formData.avatars.split(',').map(a => a.trim()).filter(a => a),
      date: formData.date || undefined
    };

    if (editingTask) {
      updateTask(editingTask.id!, taskData);
    } else {
      addTask(taskData);
    }

    closeDialog();
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleDelete = (id: string) => {
    deleteTask(id);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Gestionar Tareas
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={resetToDefault}
            size="small"
          >
            Restablecer
          </Button>
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
                  </Box>
                </Box>
                
                <Typography variant="body2" sx={{ opacity: 0.85, mb: 2, fontSize: '0.8rem' }}>
                  {task.description}
                </Typography>
                
                <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.7rem' }}>
                  Progreso: {task.progress}%
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
                  {task.avatars.map((avatar, index) => (
                    <Chip 
                      key={index}
                      label={avatar} 
                      size="small" 
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.2)', 
                        color: 'white', 
                        fontSize: '0.7rem',
                        height: '20px'
                      }} 
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog para crear/editar tareas */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTask ? 'Editar Tarea' : 'Nueva Tarea'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
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

            <Box>
              <Typography gutterBottom>Progreso: {formData.progress}%</Typography>
              <Slider
                value={formData.progress}
                onChange={(_, value) => setFormData({ ...formData, progress: value as number })}
                min={0}
                max={100}
                step={5}
                marks
              />
            </Box>

            <FormControl fullWidth>
              <InputLabel>Color de fondo</InputLabel>
              <Select
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                label="Color de fondo"
              >
                {gradientOptions.map((option, index) => (
                  <MenuItem key={index} value={option.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box 
                        sx={{ 
                          width: 20, 
                          height: 20, 
                          background: option.value, 
                          borderRadius: 1 
                        }} 
                      />
                      {option.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Colaboradores (separados por comas)"
              value={formData.avatars}
              onChange={(e) => setFormData({ ...formData, avatars: e.target.value })}
              fullWidth
              placeholder="J, M, A, +2"
            />

            <TextField
              label="Fecha (opcional)"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              fullWidth
              placeholder="Mar 02"
            />
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
