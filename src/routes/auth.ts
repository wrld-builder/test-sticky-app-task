// src/routes/auth.ts
import express from 'express';
import jwt from 'jsonwebtoken';
import UserService from '../services/userService.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

/**
 * Register a new user (alias: /register or /signup)
 */
async function handleSignup(req: express.Request, res: express.Response) {
  try {
    const { username, password } = req.body;
    const user = await UserService.createUser(username, password);
    res.status(201).json({ id: user.id, username: user.username });
  } catch (err) {
    res.status(400).json({ error: 'Username already exists' });
  }
}

/**
 * Authenticate a user and return JWT
 */
async function handleLogin(req: express.Request, res: express.Response) {
  const { username, password } = req.body;
  const user = await UserService.authenticate(username, password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
}

// Expose both /register and /signup for client compatibility
router.post('/register', handleSignup);
router.post('/signup', handleSignup);
router.post('/login', handleLogin);

export default router;
