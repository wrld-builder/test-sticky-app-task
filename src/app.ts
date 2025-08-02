// src/app.ts
import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { initModels, sequelize } from './models/index.js';
import authRouter from './routes/auth.js';
import notesRouter from './routes/notes.js';
import commentsRouter from './routes/comments.js';

dotenv.config();

export function createApp() {
  const app = express();

  app.use(morgan('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  initModels();
  // force: true — для разработки, чтобы при изменении моделей пересоздавалась схема
  sequelize
    .sync({ force: true })
    .then(() => console.log('Database synced'))
    .catch((err) => {
      console.error('DB sync failed:', err);
      process.exit(1);
    });

  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/notes', notesRouter);
  // вложенный роутер для комментариев
  app.use('/api/v1/notes/:noteId/comments', commentsRouter);

  // глобальный обработчик ошибок
  app.use((err: any, req: any, res: any, next: any) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}
