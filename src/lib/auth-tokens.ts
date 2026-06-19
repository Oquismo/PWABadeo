const SECRET = process.env.TOKEN_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-dev-secret-change-in-production';
const ACCESS_TOKEN_EXPIRY = 15 * 60 * 1000;
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000;

export interface AccessTokenPayload {
  userId: number;
  role: string;
  exp: number;
}

function toB64url(s: string): string {
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromB64url(s: string): string {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  return atob(s);
}

function uint8ToStr(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return s;
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

let cachedKey: Promise<CryptoKey> | null = null;

function getHmacKey(): Promise<CryptoKey> {
  if (!cachedKey) {
    cachedKey = crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    );
  }
  return cachedKey;
}

async function hmacSign(data: string): Promise<string> {
  const key = await getHmacKey();
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return toB64url(uint8ToStr(new Uint8Array(sig)));
}

async function hmacVerify(data: string, sig: string): Promise<boolean> {
  const key = await getHmacKey();
  const expectedRaw = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  const expected = new Uint8Array(expectedRaw);
  const sigRaw = fromB64url(sig);
  const sigBytes = new Uint8Array(sigRaw.length);
  for (let i = 0; i < sigRaw.length; i++) sigBytes[i] = sigRaw.charCodeAt(i);
  return timingSafeEqual(expected, sigBytes);
}

export async function signAccessToken(userId: number, role: string): Promise<string> {
  const payload: AccessTokenPayload = { userId, role, exp: Date.now() + ACCESS_TOKEN_EXPIRY };
  const encoded = toB64url(JSON.stringify(payload));
  const sig = await hmacSign(encoded);
  return `${encoded}.${sig}`;
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [encoded, sig] = parts;
    const valid = await hmacVerify(encoded, sig);
    if (!valid) return null;
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
