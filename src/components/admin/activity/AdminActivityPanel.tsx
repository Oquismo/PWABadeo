"use client";
import { useEffect, useState } from 'react';
import { Paper, Box, Typography, Chip, Stack, Divider, IconButton, Tooltip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

interface LogItem { id: number; action: string; createdAt: string; user?: { id: number; email: string }; }

export default function AdminActivityPanel() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [logsRes, usersRes] = await Promise.all([
        fetch('/api/admin/logs?page=1&pageSize=10', { credentials: 'include' }).then(r=>r.json()),
        fetch('/api/admin/active-users', { credentials: 'include' }).then(r=>r.json())
      ]);
      setLogs(logsRes.items || []);
      setActiveUsers(usersRes.users || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); const i = setInterval(load, 15000); return () => clearInterval(i); }, []);

  return (
    <Paper sx={{ p:2, mt:2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" fontWeight={600}>Actividad (Beta)</Typography>
        <Tooltip title="Refrescar">
          <span>
            <IconButton size="small" onClick={load} disabled={loading}>
              <RefreshIcon fontSize="small" sx={{ animation: loading? 'spin 1s linear infinite':'none' }} />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
      <Stack direction="row" spacing={1} sx={{ mt:1, flexWrap:'wrap' }}>
        <Chip label={`Usuarios activos: ${activeUsers.length}`} color={activeUsers.length? 'success':'default'} size="small" />
        <Chip label={`Logs recientes: ${logs.length}`} size="small" />
      </Stack>
      <Divider sx={{ my:1.5 }} />
      <Stack spacing={1} sx={{ maxHeight:260, overflow:'auto' }}>
        {logs.map(l => (
          <Box key={l.id} sx={{ display:'flex', justifyContent:'space-between', fontSize:13, border:'1px solid', borderColor:'divider', p:0.8, borderRadius:1 }}>
            <Box>
              <Typography variant="caption" sx={{ fontWeight:600 }}>{l.action}</Typography>
              <Typography variant="caption" display="block" color="text.secondary">{l.user?.email || '—'}</Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">{new Date(l.createdAt).toLocaleTimeString()}</Typography>
          </Box>
        ))}
        {logs.length===0 && <Typography variant="caption" color="text.secondary">Sin registros.</Typography>}
      </Stack>
      <style jsx global>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </Paper>
  );
}
