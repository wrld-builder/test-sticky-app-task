// src/routes/auth.ts
import express from 'express';
import userService from '../services/userService.js';
import { signToken } from '../middlewares/auth.js';

const router = express.Router();

/**
 * POST /auth/signup
 */
router.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: 'username and password are required' });
  }

  try {
    const user = await userService.createUser(username, password);
    // Подпись токена через единый helper
    const token = signToken({ userId: user.id, username: user.username });
    return res.status(201).json({
      token,
      user: { id: user.id, username: user.username },
    });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
});

/**
 * POST /auth/login
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: 'username and password are required' });
  }

  try {
    const user = await userService.authenticate(username, password);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = signToken({ userId: user.id, username: user.username });
    return res.json({
      token,
      user: { id: user.id, username: user.username },
    });
  } catch {
    return res.status(500).json({ message: 'Authentication failed' });
  }
});

export default router;
