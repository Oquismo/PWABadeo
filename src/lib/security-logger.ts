/**
 * Sistema de logs de seguridad para monitorear acceso a funciones administrativas
 */

interface SecurityLogEntry {
  timestamp: string;
  action: string;
  user?: string;
  ip?: string;
  userAgent?: string;
  resource: string;
  result: 'SUCCESS' | 'DENIED' | 'ERROR';
  details?: string;
}

class SecurityLogger {
  private static logs: SecurityLogEntry[] = [];
  
  static log(entry: Omit<SecurityLogEntry, 'timestamp'>) {
    const logEntry: SecurityLogEntry = {
      ...entry,
      timestamp: new Date().toISOString()
    };
    
    this.logs.push(logEntry);
    
    // Log en consola para desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔒 [SECURITY] ${logEntry.result} - ${logEntry.action} on ${logEntry.resource}`, logEntry);
    }
    
    // En producción, aquí enviarías a un servicio de logging externo
    if (process.env.NODE_ENV === 'production') {
      // TODO: Enviar a servicio de logging (ej: Winston, Sentry, etc.)
    }
    
    // Mantener solo los últimos 1000 logs en memoria
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }
  }
  
  static getLogs(): SecurityLogEntry[] {
    return [...this.logs];
  }
  
  static getRecentLogs(minutes: number = 60): SecurityLogEntry[] {
    const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
    return this.logs.filter(log => new Date(log.timestamp) > cutoffTime);
  }
  
  static logAdminAccess(resource: string, result: 'SUCCESS' | 'DENIED', request?: Request, user?: string) {
    this.log({
      action: 'ADMIN_ACCESS_ATTEMPT',
      user: user || 'unknown',
      ip: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip') || 'unknown',
      userAgent: request?.headers.get('user-agent') || 'unknown',
      resource,
      result,
      details: result === 'DENIED' ? 'Unauthorized access attempt to admin resource' : 'Admin access granted'
    });
  }
  
  static logDebugAction(action: string, result: 'SUCCESS' | 'ERROR', request?: Request, user?: string, details?: string) {
    this.log({
      action: `DEBUG_${action}`,
      user: user || 'unknown',
      ip: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip') || 'unknown',
      userAgent: request?.headers.get('user-agent') || 'unknown',
      resource: '/debug',
      result,
      details
    });
  }
}

export default SecurityLogger;
