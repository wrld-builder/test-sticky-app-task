// src/config/database.ts
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Загружаем переменные окружения из .env, если есть
dotenv.config();

const {
  DB_HOST = 'localhost',
  DB_PORT = '5432',
  DB_USER = 'wrld-builder',
  DB_PASSWORD = '666',
  DB_NAME = 'sticky',
  DB_SSL = 'false',
  NODE_ENV = '',
} = process.env;

// При запуске в режиме тестов (Vitest устанавливает NODE_ENV='test')
// используем SQLite в памяти, чтобы каждый тест жил в чистой БД.
const isTest = NODE_ENV === 'test';

export const sequelize = isTest
  ? new Sequelize('sqlite::memory:', {
      // отключаем логирование для чистоты тестов
      logging: false,
    })
  : new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
      host: DB_HOST,
      port: parseInt(DB_PORT, 10),
      dialect: 'postgres',
      logging: false,           // отключаем логирование SQL
      ssl: DB_SSL === 'true',   // включаем SSL, если задано в env
    });

export default sequelize;
