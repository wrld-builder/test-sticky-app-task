import crypto from 'crypto';

import { createRequire } from 'module';

// Attempt to load bcrypt dynamically when running under ESM. If the
// dependency is missing or fails to load, we fall back to a simple
// SHA‑256 implementation below.
let bcrypt: any = null;
try {
  const requireFn = createRequire(import.meta.url);
  bcrypt = requireFn('bcrypt');
} catch {
  bcrypt = null;
}

/**
 * Hash a password using bcrypt if available; otherwise hash via SHA‑256. The
 * fallback does not provide the same security guarantees but allows the
 * application to function without the optional dependency.
 *
 * @param password Plain text password
 * @returns A promise resolving to the hash
 */
export async function hashPassword(password: string): Promise<string> {
  if (bcrypt) {
    return bcrypt.hash(password, 10);
  }
  return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * Compare a plain text password with a stored hash. Uses bcrypt
 * comparison when available, otherwise performs a direct hash comparison.
 *
 * @param password Plain text password
 * @param hash Stored hash
 * @returns Whether the password matches the hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  if (bcrypt) {
    return bcrypt.compare(password, hash);
  }
  const hashed = crypto.createHash('sha256').update(password).digest('hex');
  return hashed === hash;
}