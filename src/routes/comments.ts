// src/routes/comments.ts
import { Router, Response } from 'express';
import commentService from '../services/commentService.js';
import { authenticate, AuthenticatedRequest } from '../middlewares/auth.js';

const router = Router({ mergeParams: true });
router.use(authenticate);

router
  .route('/')
  .get(async (req: AuthenticatedRequest, res: Response) => {
    const noteId = Number(req.params.noteId);
    if (isNaN(noteId)) return res.status(400).json({ error: 'Invalid noteId' });
    const comments = await commentService.getComments(req.user.userId, noteId);
    res.json(comments);
  })
  .post(async (req: AuthenticatedRequest, res: Response) => {
    const noteId = Number(req.params.noteId);
    const { content } = req.body;
    if (isNaN(noteId) || typeof content !== 'string') {
      return res.status(400).json({ error: 'noteId and content are required' });
    }
    const comment = await commentService.createComment(req.user.userId, noteId, content);
    res.status(201).json(comment);
  });

router
  .route('/:id')
  .put(async (req: AuthenticatedRequest, res: Response) => {
    const noteId = Number(req.params.noteId);
    const id     = Number(req.params.id);
    const { content } = req.body;
    if (isNaN(noteId) || isNaN(id) || typeof content !== 'string') {
      return res.status(400).json({ error: 'Invalid parameters' });
    }
    const updated = await commentService.updateComment(req.user.userId, noteId, id, content);
    if (!updated) return res.status(404).json({ error: 'Comment not found' });
    res.json(updated);
  })
  .delete(async (req: AuthenticatedRequest, res: Response) => {
    const noteId = Number(req.params.noteId);
    const id     = Number(req.params.id);
    if (isNaN(noteId) || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid parameters' });
    }
    const ok = await commentService.deleteComment(req.user.userId, noteId, id);
    if (!ok) return res.status(404).json({ error: 'Comment not found' });
    res.status(204).end();
  });

export default router;
