'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemText, IconButton, Divider, Avatar, ListItemAvatar } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { User } from '@/context/AuthContext'; // Importamos la interfaz

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const usersRaw = localStorage.getItem('allUsers');
    if (usersRaw) {
      setUsers(JSON.parse(usersRaw));
    }
  }, []);

  const handleDelete = (userEmail: string) => {
    if (confirm(`¿Seguro que quieres eliminar al usuario ${userEmail}?`)) {
      const updatedUsers = users.filter(user => user.email !== userEmail);
      setUsers(updatedUsers);
      localStorage.setItem('allUsers', JSON.stringify(updatedUsers));
      alert('Usuario eliminado.');
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Usuarios Registrados</Typography>
      <List sx={{ bgcolor: 'background.paper', borderRadius: '16px' }}>
        {users.map((user, index) => (
          <Box key={user.email}>
            <ListItem
              secondaryAction={
                <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(user.email)}>
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemAvatar>
                <Avatar src={user.avatarUrl} />
              </ListItemAvatar>
              <ListItemText
                primary={user.name}
                secondary={`${user.email} - ${user.school}`}
              />
            </ListItem>
            {index < users.length - 1 && <Divider />}
          </Box>
        ))}
      </List>
    </Box>
  );
}
