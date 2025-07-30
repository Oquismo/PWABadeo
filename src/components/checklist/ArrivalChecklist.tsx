'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemIcon, Checkbox, ListItemText, LinearProgress } from '@mui/material';

const initialTasks = [
  { id: 'keys', text: 'Recoger las llaves del alojamiento', done: false },
  { id: 'office', text: 'Registrarse en la oficina', done: false },
  { id: 'transport', text: 'Sacar la tarjeta de transporte público', done: false },
  { id: 'bank', text: 'Abrir una cuenta bancaria', done: false },
  { id: 'sim', text: 'Conseguir una tarjeta SIM española', done: false },
];

export default function ArrivalChecklist() {
  const [tasks, setTasks] = useState(initialTasks);

  // Cargar el estado guardado desde localStorage al iniciar
  useEffect(() => {
    const savedTasks = localStorage.getItem('arrivalChecklist');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  const handleToggle = (taskId: string) => {
    const newTasks = tasks.map(task => 
      task.id === taskId ? { ...task, done: !task.done } : task
    );
    setTasks(newTasks);
    // Guardar el nuevo estado en localStorage
    localStorage.setItem('arrivalChecklist', JSON.stringify(newTasks));
  };

  const completedTasks = tasks.filter(task => task.done).length;
  const progress = (completedTasks / tasks.length) * 100;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography sx={{ flexGrow: 1 }}>Progreso</Typography>
        <Typography fontWeight="bold">{`${Math.round(progress)}%`}</Typography>
      </Box>
      <LinearProgress variant="determinate" value={progress} sx={{ mb: 2 }} />
      <List sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: '8px' }}>
        {tasks.map((task) => (
          <ListItem key={task.id} dense button onClick={() => handleToggle(task.id)}>
            <ListItemIcon>
              <Checkbox
                edge="start"
                checked={task.done}
                tabIndex={-1}
                disableRipple
              />
            </ListItemIcon>
            <ListItemText 
              primary={task.text} 
              sx={{ textDecoration: task.done ? 'line-through' : 'none', color: task.done ? 'text.secondary' : 'text.primary' }} 
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}