"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, Card, CardContent, Grid, Button, List, ListItem, ListItemText, Chip } from '@mui/material';

type EventItem = {
  time: string;
  events: Array<any>;
};

export default function TelemetryPanel() {
  const [summary, setSummary] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch('/api/telemetry')
      .then(r => r.json())
      .then(data => { if (mounted && data?.ok) setSummary(data.summary); })
      .catch(() => {});

    // SSE
    const es = new EventSource('/api/telemetry?action=stream');
    esRef.current = es;
    es.onmessage = (ev) => {
      try {
        const parsed = JSON.parse(ev.data) as EventItem;
        // parsed.events is newest-first list from server
        setEvents(prev => {
          const merged = [...(parsed.events || []), ...prev];
          // limit size
          return merged.slice(0, 200);
        });
      } catch (e) {
        // ignore
      }
    };
    es.onerror = () => {
      // close on error and try reconnect after a bit
      try { es.close(); } catch (e) {}
      esRef.current = null;
      setTimeout(() => {
        if (!esRef.current) {
          const retry = new EventSource('/api/telemetry?action=stream');
          esRef.current = retry;
          retry.onmessage = es.onmessage;
          retry.onerror = es.onerror;
        }
      }, 3000);
    };

    return () => {
      mounted = false;
      try { es.close(); } catch (e) {}
    };
  }, []);

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ p: 1 }}>
            <CardContent>
              <Typography variant="h6">Resumen</Typography>
              {summary ? (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2">Total: {summary.total}</Typography>
                  <Box sx={{ mt: 1 }}>
                    {Object.entries(summary.byType || {}).map(([k, v]) => (
                      <Chip key={k} label={`${k}: ${v}`} sx={{ mr: 1, mb: 1 }} />
                    ))}
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">Cargando resumen...</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card elevation={0} sx={{ p: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Eventos (en tiempo real)</Typography>
                <Button size="small" onClick={() => { setEvents([]); }}>Limpiar</Button>
              </Box>
              <Box sx={{ mt: 2, maxHeight: '60vh', overflow: 'auto' }}>
                <List dense>
                  {events.map((ev, idx) => (
                    <ListItem key={idx} divider>
                      <ListItemText
                        primary={ev.type || ev.id || 'evento'}
                        secondary={
                          <>
                            <Typography component="span" variant="caption">{ev.timestamp || ev.time || ''}</Typography>
                            <br />
                            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(ev.payload || ev, null, 2)}</pre>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
