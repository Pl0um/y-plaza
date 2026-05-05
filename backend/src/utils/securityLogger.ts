// Logger de sécurité — KreAgency
// Trace les événements sensibles au format JSON structuré.
// En production, ces logs peuvent être redirigés vers un SIEM ou un service d'alerting.

type SecurityEvent =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGIN_COMPTE_DESACTIVE'
  | 'LOGOUT'
  | 'REGISTER_SUCCESS'
  | 'ROLE_CHANGED'
  | 'COMPTE_DESACTIVE'
  | 'BIEN_DELETED'
  | 'INVITE_SENT'
  | 'UNAUTHORIZED_ACCESS';

interface SecurityLogEntry {
  timestamp:  string;
  event:      SecurityEvent;
  ip:         string;
  details?:   Record<string, unknown>;
}

export function logSecurityEvent(
  event:   SecurityEvent,
  ip:      string,
  details?: Record<string, unknown>
): void {
  const entry: SecurityLogEntry = {
    timestamp: new Date().toISOString(),
    event,
    ip: ip || 'unknown',
    ...(details && { details }),
  };

  // warn pour les événements à surveiller, info pour les succès normaux
  const isAlert = [
    'LOGIN_FAILED',
    'LOGIN_COMPTE_DESACTIVE',
    'UNAUTHORIZED_ACCESS',
  ].includes(event);

  if (isAlert) {
    console.warn('[SECURITY]', JSON.stringify(entry));
  } else {
    console.info('[SECURITY]', JSON.stringify(entry));
  }
}
