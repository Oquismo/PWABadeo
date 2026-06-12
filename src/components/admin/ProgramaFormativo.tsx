'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
} from '@mui/material';
import {
  School as SchoolIcon,
  Sync as SyncIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  Today as TodayIcon,
  AutoFixHigh as AutoIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import AutoSyncHelp from './AutoSyncHelp';

interface SchoolEvent {
  id: number;
  uid: string;
  title: string;
  description: string | null;
  date: string;
  endDate: string;
  location: string | null;
  category: string | null;
  who: string | null;
  isAllDay: boolean;
  schoolId: number;
}

interface SchoolWithEvents {
  school: { id: number; name: string };
  events: SchoolEvent[];
}

export default function ProgramaFormativo() {
  const [data, setData] = useState<SchoolWithEvents[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/schools/sync-ics', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        setData(json.schools || []);
        // Check last event creation date as proxy for last sync
        const dates = (json.schools || []).flatMap((s: any) =>
          s.events.map((e: any) => new Date(e.date))
        );
        if (dates.length > 0) {
          const max = new Date(Math.max(...dates.map((d: any) => d.getTime())));
          setLastSync(max.toLocaleDateString('es-ES'));
        }
      } else {
        setError('Error al cargar datos');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Check if auto-sync is configured (CRON_SECRET env var)
    fetch('/api/cron/sync-events?token=check')
      .then(r => r.json())
      .then(data => {
        if (data.success) setAutoSyncEnabled(true);
      })
      .catch(() => {
        // Auto-sync not configured
      });
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/admin/schools/sync-ics', {
        method: 'POST',
        credentials: 'include',
      });
      const json = await res.json();

      if (res.ok) {
        const r = json.results;
        const messages = [];
        if (r.eventsCreated > 0) messages.push(`${r.eventsCreated} creados`);
        if (r.eventsUpdated > 0) messages.push(`${r.eventsUpdated} actualizados`);
        if (r.eventsDeleted > 0) messages.push(`${r.eventsDeleted} pasados borrados`);
        if (r.eventsObsolete > 0) messages.push(`${r.eventsObsolete} obsoletos borrados`);
        if (r.schoolsCreated > 0) messages.push(`${r.schoolsCreated} escuelas nuevas`);
        
        setSuccess(
          messages.length > 0 
            ? `Sincronizado: ${messages.join(', ')}`
            : 'Sin cambios - todo está actualizado'
        );
        loadData();
      } else {
        setError(json.error || 'Error al sincronizar');
      }
    } catch (err) {
      setError('Error de conexión al sincronizar');
    } finally {
      setSyncing(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isUpcoming = (dateStr: string) => {
    return new Date(dateStr) >= new Date();
  };

  // Filtrar escuelas que tengan eventos en el filtro actual
  const filtered = data.filter(s => {
    const matchesSearch = s.school.name.toLowerCase().includes(searchTerm.toLowerCase());
    const hasEventsInFilter = s.events.filter(ev => {
      if (filter === 'upcoming') return isUpcoming(ev.date);
      if (filter === 'past') return !isUpcoming(ev.date);
      return true;
    }).length > 0;
    return matchesSearch && hasEventsInFilter;
  });

  const totalEvents = data.reduce((sum, s) => sum + s.events.length, 0);
  const activeSchools = data.filter(s => s.events.some(ev => isUpcoming(ev.date))).length;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <SchoolIcon />
            Programa Formativo
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="body2" color="text.secondary">
              {activeSchools} escuelas activas · {totalEvents} eventos futuros
            </Typography>
            {lastSync && (
              <Chip
                icon={<ScheduleIcon fontSize="small" />}
                label={`Actualizado: ${lastSync}`}
                size="small"
                variant="outlined"
                sx={{ height: 24, fontSize: '0.7rem' }}
              />
            )}
            {autoSyncEnabled && (
              <Chip
                icon={<AutoIcon fontSize="small" />}
                label="Auto-sync activo"
                size="small"
                color="success"
                variant="outlined"
                sx={{ height: 24, fontSize: '0.7rem' }}
              />
            )}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoSyncHelp />
          <Button
            variant="contained"
            startIcon={syncing ? <CircularProgress size={20} color="inherit" /> : <SyncIcon />}
            onClick={handleSync}
            disabled={syncing}
            sx={{ borderRadius: 2 }}
          >
            {syncing ? 'Sincronizando...' : 'Sincronizar ahora'}
          </Button>
        </Box>
      </Box>

      {/* Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Search */}
      <TextField
        fullWidth
        placeholder="Buscar escuela..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
      />

      {/* Filter tabs */}
      <Tabs value={filter} onChange={(_, v) => setFilter(v)} sx={{ mb: 2 }}>
        <Tab label="Próximos" value="upcoming" />
        <Tab label="Todos" value="all" />
        <Tab label="Pasados" value="past" />
      </Tabs>

      {/* Content */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : filtered.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 4 }}>
          <CardContent>
            <SchoolIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {filter === 'upcoming' 
                ? 'No hay escuelas con eventos próximos' 
                : 'No hay escuelas con eventos'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {filter === 'upcoming' 
                ? 'Las escuelas sin eventos futuros no aparecen aquí. Pulsa "Sincronizar ahora" para actualizar desde Teamup.'
                : 'Pulsa "Sincronizar ahora" para importar desde Teamup.'}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {filtered.map((item) => {
            const events = item.events.filter(ev => {
              if (filter === 'upcoming') return isUpcoming(ev.date);
              if (filter === 'past') return !isUpcoming(ev.date);
              return true;
            });

            return (
              <Accordion key={item.school.id}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <SchoolIcon color="primary" />
                    <Typography variant="subtitle1" fontWeight="medium">
                      {item.school.name}
                    </Typography>
                    <Chip
                      label={`${events.length} eventos`}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ ml: 'auto' }}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  {events.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                      No hay eventos en este filtro
                    </Typography>
                  ) : (
                    <List dense>
                      {events.map((event, idx) => (
                        <Box key={event.id}>
                          <ListItem
                            sx={{
                              borderRadius: 2,
                              mb: 0.5,
                              bgcolor: isUpcoming(event.date) ? 'action.hover' : 'transparent',
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 40 }}>
                              {event.isAllDay ? (
                                <TodayIcon color="primary" fontSize="small" />
                              ) : (
                                <TimeIcon color="primary" fontSize="small" />
                              )}
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography variant="body2" fontWeight="medium">
                                  {event.title}
                                </Typography>
                              }
                              secondary={
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                                  <Typography variant="caption" color="text.secondary">
                                    {formatDate(event.date)}
                                    {!event.isAllDay && ` · ${formatTime(event.date)}`}
                                  </Typography>
                                  {event.location && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      <LocationIcon sx={{ fontSize: 12 }} />
                                      <Typography variant="caption" color="text.secondary">
                                        {event.location}
                                      </Typography>
                                    </Box>
                                  )}
                                  {event.who && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      <PersonIcon sx={{ fontSize: 12 }} />
                                      <Typography variant="caption" color="text.secondary">
                                        {event.who}
                                      </Typography>
                                    </Box>
                                  )}
                                  {event.category && (
                                    <Chip label={event.category} size="small" sx={{ height: 18, fontSize: '0.65rem' }} />
                                  )}
                                </Box>
                              }
                            />
                          </ListItem>
                          {idx < events.length - 1 && <Divider />}
                        </Box>
                      ))}
                    </List>
                  )}
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
