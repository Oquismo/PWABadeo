const isDev = process.env.NODE_ENV !== 'production';

export function logDebug(...args: any[]) {
  if (!isDev) return;
  console.debug('[DEBUG]', ...args);
}

export function logInfo(...args: any[]) {
  if (!isDev) return;
  console.info('[INFO]', ...args);
}

export function logWarn(...args: any[]) {
  if (!isDev) return;
  console.warn('[WARN]', ...args);
}

export function logError(...args: any[]) {
  // Always log errors even in production to stderr
  console.error('[ERROR]', ...args);
}

const loggerClient = {
  debug: logDebug,
  info: logInfo,
  warn: logWarn,
  error: logError
};

export default loggerClient;
