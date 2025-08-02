// src/config/database.ts
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Подгружаем переменные окружения из .env
dotenv.config();

const {
  NODE_ENV = 'development',
  DB_HOST,
  DB_PORT = '5432',
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_SSL = 'false',
  DB_LOGGING = 'false',
} = process.env;

const isTest = NODE_ENV === 'test';
const logging = DB_LOGGING === 'true' ? console.log : false;

let sequelize: Sequelize;

if (isTest) {
  // При запуске тестов используем in-memory SQLite
  sequelize = new Sequelize('sqlite::memory:', { logging });
} else {
  if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
    throw new Error('Не заданы необходимые переменные окружения для подключения к БД');
  }
  sequelize = new Sequelize(
    DB_NAME,
    DB_USER,
    DB_PASSWORD,
    {
      host: DB_HOST,
      port: parseInt(DB_PORT, 10),
      dialect: 'postgres',
      logging,
      dialectOptions: DB_SSL === 'true'
        ? {
            ssl: {
              require: true,
              rejectUnauthorized: false, // разрешить self-signed сертификаты
            },
          }
        : {},
    }
  );
}

export default sequelize;
export { sequelize };
