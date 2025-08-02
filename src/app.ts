// src/app.ts
import express from 'express';
import dotenv from 'dotenv';
import { initModels, sequelize } from './models/index.js';
import authRouter from './routes/auth.js';
// … импорт остальных роутеров

dotenv.config();

export function createApp() {
  const app = express();
  app.use(express.json());

  // Инициализируем модели и связи
  initModels();
  // Синхронизируем схему БД
  sequelize.sync().catch(err => {
    console.error('DB sync failed:', err);
    process.exit(1);
  });

  // Роуты
  app.use('/api/v1/auth', authRouter);
  // app.use('/api/v1/notes', notesRouter);
  // app.use('/api/v1/comments', commentsRouter);

  return app;
}
