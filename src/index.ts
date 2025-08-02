import http from 'http';
import { createApp } from './app.js';
import { sequelize } from './models/index.js';
import { initSocket } from './socket/index.js';

const PORT = parseInt(process.env.PORT || '3000', 10);

async function bootstrap() {
  try {
    // Synchronize database schema. In production consider migrations.
    await sequelize.sync();
    const app = createApp();
    const server = http.createServer(app);
    // Initialize WebSocket server
    initSocket(server);
    server.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

bootstrap();