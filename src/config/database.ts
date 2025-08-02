import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Load environment variables from a .env file if present.
dotenv.config();

/**
 * Initialize a single Sequelize instance for the application. By centralizing
 * configuration here, we avoid multiple connections and make the database
 * settings easy to override via environment variables.
 */
const {
  DB_HOST = 'localhost',
  DB_PORT = '5432',
  DB_USER = 'wrld-builder',
  DB_PASSWORD = '666',
  DB_NAME = 'sticky',
  DB_SSL = 'false'
} = process.env;

export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: parseInt(DB_PORT, 10),
  dialect: 'postgres',
  // Disable logging in production to reduce noise; enable for debugging.
  logging: false,
  // Use SSL if explicitly enabled.
  ssl: DB_SSL === 'true'
});

export default sequelize;