import crypto from 'crypto';

const SECRET = process.env.TOKEN_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-dev-secret-change-in-production';
const ACCESS_TOKEN_EXPIRY = 15 * 60 * 1000; // 15 minutos
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 días

export interface AccessTokenPayload {
  userId: number;
  role: string;
  exp: number;
}

function b64url(data: string): string {
  return Buffer.from(data).toString('base64url');
}

function fromB64url(str: string): string {
  return Buffer.from(str, 'base64url').toString('utf8');
}

function hmac(data: string): string {
  return crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
}

export function signAccessToken(userId: number, role: string): string {
  const payload: AccessTokenPayload = { userId, role, exp: Date.now() + ACCESS_TOKEN_EXPIRY };
  const payloadStr = JSON.stringify(payload);
  const encoded = b64url(payloadStr);
  const sig = hmac(encoded);
  return `${encoded}.${sig}`;
}

export function verifyAccessToken(token: string): AccessTokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [encoded, sig] = parts;
    const expectedSig = hmac(encoded);
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) return null;
    const payload: AccessTokenPayload = JSON.parse(fromB64url(encoded));
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export function generateRefreshToken(): string {
  return crypto.randomUUID();
}

export { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY };
