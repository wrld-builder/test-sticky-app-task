import express from 'express';
import apiRouter from './routes/index.js';
import { initModels } from './models/index.js';
import { sequelize } from './models/index.js';

// Initialize database models once. You could call `sync()` here as
// well, but many applications prefer to sync in the entrypoint file.
initModels();

/**
 * Create and configure the Express application. Middleware and routes are
 * registered here. By encapsulating this setup in its own function the
 * server can be started easily from tests and the production entrypoint.
 *
 * @returns An Express application instance
 */
export function createApp(): express.Application {
  const app = express();
  // Parse JSON payloads
  app.use(express.json());
  // Basic CORS support for development; in production configure properly
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });
  // Mount the API routes under the versioned prefix
  app.use('/api/v1', apiRouter);
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });
  return app;
}

export default createApp;