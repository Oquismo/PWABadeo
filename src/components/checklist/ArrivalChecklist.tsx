'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Box, Typography, List, ListItem, ListItemIcon, Checkbox, ListItemText, LinearProgress } from '@mui/material';

interface Task {
  id: string;
  text: string;
  done: boolean;
}

const initialTasks: Task[] = [
  { id: 'keys', text: 'Recoger las llaves del alojamiento', done: false },
  { id: 'office', text: 'Registrarse en la oficina', done: false },
  { id: 'transport', text: 'Sacar la tarjeta de transporte público', done: false },
  { id: 'bank', text: 'Abrir una cuenta bancaria', done: false },
  { id: 'sim', text: 'Conseguir una tarjeta SIM española', done: false },
];

export default function ArrivalChecklist() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const { user, isAuthenticated } = useAuth(); // 1. Obtenemos el usuario actual

  // Cargar y guardar tareas basándose en el usuario
  useEffect(() => {
    // Solo ejecutamos esto si el usuario ha iniciado sesión
    if (isAuthenticated && user) {
      // 2. Usamos una clave única para cada usuario
      const savedTasks = localStorage.getItem(`arrivalChecklist_${user.email}`);
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      } else {
        // Si es la primera vez para este usuario, usamos la lista inicial
        setTasks(initialTasks);
      }
    } else {
      // Si no hay usuario, mostramos la lista por defecto sin progreso
      setTasks(initialTasks);
    }
  }, [isAuthenticated, user]);

  const handleToggle = (taskId: string) => {
    if (!isAuthenticated || !user) return; // No se puede cambiar si no estás logueado

    const newTasks = tasks.map(task => 
      task.id === taskId ? { ...task, done: !task.done } : task
    );
    setTasks(newTasks);
    // 3. Guardamos el progreso en la clave única del usuario
    localStorage.setItem(`arrivalChecklist_${user.email}`, JSON.stringify(newTasks));
  };

  const completedTasks = tasks.filter(task => task.done).length;
  const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography sx={{ flexGrow: 1 }}>Progreso</Typography>
        <Typography fontWeight="bold">{`${Math.round(progress)}%`}</Typography>
      </Box>
      <LinearProgress variant="determinate" value={progress} sx={{ mb: 2 }} />
      <List sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: '16px' }}>
        {tasks.map((task) => (
          <ListItem 
            key={task.id} 
            dense 
            button 
            onClick={() => handleToggle(task.id)}
            disabled={!isAuthenticated} // Desactivamos si no hay sesión
          >
            <ListItemIcon>
              <Checkbox
                edge="start"
                checked={task.done}
                tabIndex={-1}
                disableRipple
                disabled={!isAuthenticated}
              />
            </ListItemIcon>
            <ListItemText 
              primary={task.text} 
              sx={{ 
                textDecoration: task.done ? 'line-through' : 'none', 
                color: task.done ? 'text.secondary' : 'text.primary' 
              }} 
            />
          </ListItem>
        ))}
      </List>
      {!isAuthenticated && (
        <Typography variant="caption" color="text.secondary" textAlign="center" sx={{ display: 'block', mt: 2 }}>
          Inicia sesión para guardar tu progreso.
        </Typography>
      )}
    </Box>
  );
}
