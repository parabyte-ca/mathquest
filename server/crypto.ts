import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export const sha256 = (s: string): string => createHash('sha256').update(s).digest('hex');
export const randomToken = (bytes = 32): string => randomBytes(bytes).toString('base64url');

export function randomDigits(n: number): string {
  let out = '';
  while (out.length < n) {
    const b = randomBytes(1)[0]!;
    if (b < 250) out += String(b % 10); // rejection sampling, no modulo bias
  }
  return out;
}

const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 32 };

export function hashPin(pin: string): string {
  const salt = randomBytes(16);
  const key = scryptSync(pin, salt, SCRYPT.keylen, { N: SCRYPT.N, r: SCRYPT.r, p: SCRYPT.p });
  return `s1$${salt.toString('base64')}$${key.toString('base64')}`;
}

export function verifyPin(pin: string, stored: string): boolean {
  const [v, saltB64, keyB64] = stored.split('$');
  if (v !== 's1' || !saltB64 || !keyB64) return false;
  const key = Buffer.from(keyB64, 'base64');
  const test = scryptSync(pin, Buffer.from(saltB64, 'base64'), key.length, { N: SCRYPT.N, r: SCRYPT.r, p: SCRYPT.p });
  return test.length === key.length && timingSafeEqual(test, key);
}

// Burn the same CPU for unknown usernames so timing does not reveal which exist.
const DUMMY = hashPin('0000');
export const dummyVerify = (pin: string): void => void verifyPin(pin, DUMMY);
