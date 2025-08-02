import { Router, Request, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../middlewares/auth.js';
import commentService from '../services/commentService.js';
import noteService from '../services/noteService.js';
import { emitCommentCreated, emitCommentUpdated, emitCommentDeleted } from '../socket/index.js';

/**
 * Router handling CRUD operations for comments on notes. Authentication is
 * required for all operations.
 */
const router = Router({ mergeParams: true });

router.use(authenticate);

/**
 * GET /notes/:noteId/comments
 *
 * List all comments belonging to a note. Returns an empty array if the
 * note has no comments. Note existence is not checked here; if an
 * invalid noteId is supplied the result will simply be an empty list.
 */
router.get('/', async (req: Request, res: Response) => {
  const noteId = parseInt(req.params.noteId, 10);
  const comments = await commentService.getComments(noteId);
  res.json(comments);
});

/**
 * POST /notes/:noteId/comments
 *
 * Create a new comment for a note. The comment author is derived from the
 * authenticated user's username. If the note does not exist a 404 is
 * returned. The created comment is broadcast to connected clients.
 */
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  const noteId = parseInt(req.params.noteId, 10);
  const { content } = req.body;
  if (typeof content !== 'string') {
    res.status(400).json({ message: 'content is required' });
    return;
  }
  const note = await noteService.getNoteById(noteId);
  if (!note) {
    res.status(404).json({ message: 'Note not found' });
    return;
  }
  const author = req.user?.username || 'anonymous';
  const comment = await commentService.createComment(noteId, author, content);
  emitCommentCreated(comment);
  res.status(201).json(comment);
});

/**
 * PUT /comments/:id
 *
 * Update an existing comment. For simplicity this endpoint does not
 * verify the author; in a real application you would enforce that only
 * the author can edit their comment. Emits an update event on success.
 */
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { content } = req.body;
  if (typeof content !== 'string') {
    res.status(400).json({ message: 'content is required' });
    return;
  }
  const updated = await commentService.updateComment(id, content);
  if (!updated) {
    res.status(404).json({ message: 'Comment not found' });
    return;
  }
  emitCommentUpdated(updated);
  res.json(updated);
});

/**
 * DELETE /comments/:id
 *
 * Delete a comment permanently. Emits a deletion event on success.
 */
router.delete('/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const ok = await commentService.deleteComment(id);
  if (!ok) {
    res.status(404).json({ message: 'Comment not found' });
    return;
  }
  emitCommentDeleted(id);
  res.status(204).end();
});

export default router;
