'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Divider, Paper } from '@mui/material';

interface Log {
  action: 'login' | 'logout';
  userEmail: string;
  timestamp: string;
}

export default function LogViewer() {
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    const logsRaw = localStorage.getItem('appLogs');
    if (logsRaw) {
      setLogs(JSON.parse(logsRaw));
    }
  }, []);

  return (
    <Paper elevation={0} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Registro de Actividad</Typography>
      <List sx={{ maxHeight: 400, overflow: 'auto' }}>
        {logs.length > 0 ? logs.map((log, index) => (
          <Box key={index}>
            <ListItem>
              <ListItemText
                primary={`${log.action === 'login' ? 'Inicio de Sesión' : 'Cierre de Sesión'} - ${log.userEmail}`}
                secondary={new Date(log.timestamp).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}
              />
            </ListItem>
            {index < logs.length - 1 && <Divider />}
          </Box>
        )) : (
          <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
            No hay registros de actividad.
          </Typography>
        )}
      </List>
    </Paper>
  );
}
