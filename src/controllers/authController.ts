// src/controllers/authController.ts
import { Router, Request, Response } from 'express';
import userService from '../services/userService.js';
import { signToken } from '../middlewares/auth.js';

const router = Router();

/**
 * POST /auth/signup
 *
 * Создаёт нового пользователя и возвращает JWT.
 */
router.post('/signup', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: 'username and password are required' });
  }

  try {
    const user = await userService.createUser(username, password);
    // В payload кладём только необходимые поля
    const token = signToken({ id: user.id, username: user.username });
    // Отдаём обратно только нужные данные
    res.status(201).json({ token, user: { id: user.id, username: user.username } });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * POST /auth/login
 *
 * Проверяет учётные данные и возвращает JWT.
 */
router.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: 'username and password are required' });
  }

  try {
    const user = await userService.authenticate(username, password);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = signToken({ id: user.id, username: user.username });
    res.json({ token, user: { id: user.id, username: user.username } });
  } catch (err: any) {
    res.status(500).json({ message: 'Authentication failed' });
  }
});

export default router;
