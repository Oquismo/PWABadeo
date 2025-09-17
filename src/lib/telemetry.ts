type TelemetryPayload = {
  type: string;
  payload?: any;
};

let userEmail: string | null = null;
let endpoint = '/api/telemetry';

const QUEUE_KEY = 'telemetryQueue_v1';

function loadQueue(): any[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveQueue(q: any[]) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(q.slice(-200)));
  } catch (e) {}
}

async function flushQueue() {
  const q = loadQueue();
  if (!q.length) return;
  for (const ev of q.slice()) {
    try {
      await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(ev) });
      // if ok, remove from queue
      const current = loadQueue();
      const idx = current.findIndex((x: any) => x._localId === ev._localId);
      if (idx !== -1) {
        current.splice(idx, 1);
        saveQueue(current);
      }
    } catch (e) {
      // stop attempting further to avoid spam
      return;
    }
  }
}

export function initTelemetry(opts: { userEmail?: string | null; endpoint?: string } = {}) {
  if (typeof window === 'undefined') return;
  userEmail = opts.userEmail ?? null;
  if (opts.endpoint) endpoint = opts.endpoint;

  // flush any queued events periodically
  setInterval(() => {
    try { flushQueue(); } catch (e) {}
  }, 5000);

  // global error handler
  window.addEventListener('error', (ev) => {
    try {
      sendTelemetryEvent('error', { message: (ev as any).message, filename: (ev as any).filename, lineno: (ev as any).lineno });
    } catch (e) {}
  });

  window.addEventListener('unhandledrejection', (ev) => {
    try {
      sendTelemetryEvent('unhandledrejection', { reason: (ev as any).reason });
    } catch (e) {}
  });
}

export function sendTelemetryEvent(type: string, payload?: any) {
  if (typeof window === 'undefined') return;
  const ev = { type, payload, userEmail, _localId: `${Date.now()}_${Math.random().toString(36).slice(2,6)}` };
  // optimistic attempt
  fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(ev) })
    .then(res => {
      if (!res.ok) throw new Error('Failed');
    })
    .catch(() => {
      const q = loadQueue();
      q.push(ev);
      saveQueue(q);
    });
}

export default { initTelemetry, sendTelemetryEvent };

// Exponer para pruebas desde consola en el navegador
try {
  if (typeof window !== 'undefined') {
    (window as any).__telemetry__ = { initTelemetry, sendTelemetryEvent };
  }
} catch (e) {}
