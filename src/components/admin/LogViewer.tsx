'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Divider, Paper } from '@mui/material';
import ArchiveRoundedIcon from '@mui/icons-material/ArchiveRounded';
import M3Button from '@/components/ui/M3Button';

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

  // --- NUEVA FUNCIÓN PARA ARCHIVAR Y LIMPIAR ---
  const handleArchiveAndClear = () => {
    if (logs.length === 0) {
      alert("No hay registros para archivar.");
      return;
    }

    try {
      // 1. Convertimos los logs a un string JSON
      const logsJson = JSON.stringify(logs, null, 2);
      // 2. Creamos un objeto 'Blob' que es como un archivo en memoria
      const blob = new Blob([logsJson], { type: 'application/json' });
      // 3. Creamos una URL temporal para ese archivo
      const url = URL.createObjectURL(blob);
      
      // 4. Creamos un enlace invisible, le hacemos clic para descargar y lo eliminamos
      const a = document.createElement('a');
      a.href = url;
      a.download = `logs-${new Date().toISOString().split('T')[0]}.json`; // ej: logs-2025-07-31.json
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url); // Limpiamos la URL temporal

      // 5. Limpiamos los logs
      localStorage.removeItem('appLogs');
      setLogs([]);
      alert('Registros archivados y limpiados con éxito.');

    } catch (error) {
      console.error("Error al archivar los logs:", error);
      alert("No se pudieron archivar los registros.");
    }
  };

  return (
    <Paper elevation={0} sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6" gutterBottom>Registro de Actividad</Typography>
        {/* --- NUEVO BOTÓN --- */}
        <M3Button m3variant="outlined" startIcon={<ArchiveRoundedIcon />} onClick={handleArchiveAndClear} disabled={logs.length === 0}>
          Archivar y Limpiar
        </M3Button>
      </Box>
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
