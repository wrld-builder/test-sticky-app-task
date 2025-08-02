import { Router } from 'express';
import noteRouter from '../controllers/noteController.js';
import commentRouter from '../controllers/commentController.js';
import authRouter from '../controllers/authController.js';

/**
 * Main application router. It composes feature routers and exposes a
 * single entry point for the Express application. Additional routers
 * should be imported and attached here to keep the bootstrapping logic
 * centralized.
 */
const apiRouter = Router();

// Notes routes
apiRouter.use('/notes', noteRouter);
// Nested comments routes under notes
apiRouter.use('/notes/:noteId/comments', commentRouter);

// Authentication routes
apiRouter.use('/auth', authRouter);

export default apiRouter;