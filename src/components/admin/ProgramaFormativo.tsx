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
} from '@mui/icons-material';

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

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/schools/sync-ics', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        setData(json.schools || []);
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
        setSuccess(
          `Sincronizado: ${r.schoolsCreated} escuelas nuevas, ${r.schoolsFound} existentes, ${r.eventsCreated} eventos creados, ${r.eventsUpdated} actualizados`
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

  const filtered = data.filter(s =>
    s.school.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalEvents = data.reduce((sum, s) => sum + s.events.length, 0);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SchoolIcon />
            Programa Formativo
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {data.length} escuelas · {totalEvents} eventos
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={syncing ? <CircularProgress size={20} color="inherit" /> : <SyncIcon />}
          onClick={handleSync}
          disabled={syncing}
          sx={{ borderRadius: 2 }}
        >
          {syncing ? 'Sincronizando...' : 'Sincronizar ICS'}
        </Button>
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
              No hay escuelas con eventos
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pulsa "Sincronizar ICS" para importar el programa formativo desde Teamup
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
