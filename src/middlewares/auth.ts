import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/**
 * Extend Express's `Request` interface to include a user property set by
 * the authentication middleware. The decoded token payload is stored
 * untyped; applications can define their own user types via declaration
 * merging if desired.
 */
export interface AuthenticatedRequest extends Request {
  user?: any;
}

/**
 * Secret used for JWT signing and verification. In a real application
 * this value should come from an environment variable and never be
 * committed to version control. For demonstration purposes a default
 * value is provided.
 */
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

/**
 * Verify a JSON Web Token sent in the `Authorization` header. If the token
 * is valid the decoded payload is attached to `req.user` and the next
 * middleware is invoked. Otherwise a 401 response is returned.
 *
 * @param req Incoming HTTP request
 * @param res HTTP response to send if authentication fails
 * @param next Callback to continue middleware chain
 */
export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Authorization header missing' });
    return;
  }
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

/**
 * Issue a new JWT for the supplied payload. Tokens are signed with the
 * shared secret and expire after one day. This helper centralizes token
 * configuration so that it can easily be adjusted.
 *
 * @param payload Arbitrary object to encode within the token
 * @returns A signed JWT string
 */
export function signToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
}