'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemText, IconButton, Divider, Avatar, ListItemAvatar } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { User } from '@/context/AuthContext'; // Importamos la interfaz

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetch('/api/admin/users', { credentials: 'include' })
      .then(res => res.ok ? res.json() : [])
      .then(data => setUsers(data))
      .catch(() => setUsers([]));
  }, []);

  // Eliminar usuario: solo frontend, deshabilitado hasta implementar API
  // const handleDelete = (userEmail: string) => {
  //   if (confirm(`¿Seguro que quieres eliminar al usuario ${userEmail}?`)) {
  //     // Aquí iría la llamada a la API para borrar el usuario
  //   }
  // };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Usuarios Registrados</Typography>
      <List sx={{ bgcolor: 'background.paper', borderRadius: '16px' }}>
        {users.map((user, index) => (
          <Box key={user.email}>
            <ListItem>
              <ListItemAvatar>
                <Avatar src={user.avatarUrl || undefined} />
              </ListItemAvatar>
              <ListItemText
                primary={user.name || 'Sin nombre'}
                secondary={`${user.email} - ${
                  user.school 
                    ? (typeof user.school === 'string' 
                        ? user.school 
                        : user.school.name)
                    : 'Sin escuela'
                }`}
              />
            </ListItem>
            {index < users.length - 1 && <Divider />}
          </Box>
        ))}
      </List>
    </Box>
  );
}
