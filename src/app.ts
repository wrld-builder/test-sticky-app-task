// src/app.ts
import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { initModels, sequelize } from './models/index.js';
import authRouter from './routes/auth.js';
// … импорт остальных роутеров

dotenv.config();

export function createApp() {
  const app = express();

  // Логируем все входящие HTTP-запросы
  app.use(morgan('dev'));

  app.use(express.json());

  // Инициализируем модели и связи
  initModels();
  // Синхронизируем схему БД
  sequelize
    .sync()
    .then(() => console.log('Database synced'))
    .catch((err) => {
      console.error('DB sync failed:', err);
      process.exit(1);
    });

  // Роуты
  app.use('/api/v1/auth', authRouter);
  // app.use('/api/v1/notes', notesRouter);
  // app.use('/api/v1/comments', commentsRouter);

  // Обработчик ошибок
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}
