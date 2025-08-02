import { Router, Request, Response } from 'express';
import { signIn, signUp } from '../auth/userService.js';
import { signToken } from '../middlewares/auth.js';

/**
 * Router exposing authentication endpoints. These allow clients to
 * register and obtain JWTs for authenticated requests. Passwords are
 * hashed before storage.
 */
const router = Router();

/**
 * POST /auth/signup
 *
 * Create a new account. Requires unique `username` and non‑empty
 * `password`. Returns a JWT on success.
 */
router.post('/signup', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (typeof username !== 'string' || typeof password !== 'string') {
    res.status(400).json({ message: 'username and password are required' });
    return;
  }
  try {
    const user = await signUp(username, password);
    const token = signToken(user);
    res.status(201).json({ token, user });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * POST /auth/login
 *
 * Authenticate an existing user. Returns a JWT if credentials are valid.
 */
router.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (typeof username !== 'string' || typeof password !== 'string') {
    res.status(400).json({ message: 'username and password are required' });
    return;
  }
  const user = await signIn(username, password);
  if (!user) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }
  const token = signToken(user);
  res.json({ token, user });
});

export default router;