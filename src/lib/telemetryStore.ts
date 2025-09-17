type TelemetryEvent = {
  id: string;
  type: string;
  userEmail?: string | null;
  payload?: any;
  timestamp: string;
};

const MAX_EVENTS = 1000;

const store: TelemetryEvent[] = [];

export function pushEvent(e: TelemetryEvent) {
  store.push(e);
  // keep last MAX_EVENTS
  if (store.length > MAX_EVENTS) store.splice(0, store.length - MAX_EVENTS);
}

export function getEvents() {
  return store.slice().reverse(); // newest first
}

export function getSummary() {
  const summary: Record<string, number> = {};
  for (const e of store) {
    summary[e.type] = (summary[e.type] || 0) + 1;
  }
  return {
    total: store.length,
    byType: summary
  };
}

export default { pushEvent, getEvents, getSummary };
