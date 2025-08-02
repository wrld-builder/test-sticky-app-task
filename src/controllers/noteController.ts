import { Router, Request, Response } from 'express';
import noteService from '../services/noteService.js';
import { authenticate, AuthenticatedRequest } from '../middlewares/auth.js';
import { emitNoteCreated, emitNoteUpdated, emitNoteDeleted } from '../socket/index.js';

/**
 * Router encapsulating CRUD endpoints for notes. Authentication is
 * enforced on all routes. Sockets are emitted as side effects of
 * successful mutations.
 */
const router = Router();

// Ensure all note routes require authentication
router.use(authenticate);

/**
 * GET /notes
 *
 * Query all notes for a given board. The `boardId` must be supplied as a
 * query parameter. Without a boardId the request is rejected.
 */
router.get('/', async (req: Request, res: Response) => {
  const { boardId } = req.query;
  if (typeof boardId !== 'string') {
    res.status(400).json({ message: 'Missing boardId' });
    return;
  }
  const notes = await noteService.getNotes(boardId);
  res.json(notes);
});

/**
 * GET /notes/:id
 *
 * Retrieve a single note by its id. Returns 404 if the note does not
 * exist.
 */
router.get('/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const note = await noteService.getNoteById(id);
  if (!note) {
    res.status(404).json({ message: 'Note not found' });
    return;
  }
  res.json(note);
});

/**
 * POST /notes
 *
 * Create a new note on a specified board. The request body must include
 * both `boardId` and `content`. After creation the note is broadcast to
 * all connected clients via WebSocket.
 */
router.post('/', async (req: Request, res: Response) => {
  const { boardId, content } = req.body;
  if (typeof boardId !== 'string' || typeof content !== 'string') {
    res.status(400).json({ message: 'boardId and content are required' });
    return;
  }
  const note = await noteService.createNote(boardId, content);
  emitNoteCreated(note);
  res.status(201).json(note);
});

/**
 * PUT /notes/:id
 *
 * Update the content of an existing note. Only the `content` field is
 * permitted. Emits an update event on success.
 */
router.put('/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { content } = req.body;
  if (typeof content !== 'string') {
    res.status(400).json({ message: 'content is required' });
    return;
  }
  const updated = await noteService.updateNote(id, content);
  if (!updated) {
    res.status(404).json({ message: 'Note not found' });
    return;
  }
  emitNoteUpdated(updated);
  res.json(updated);
});

/**
 * DELETE /notes/:id
 *
 * Remove a note permanently. Associated comments are cascaded. Emits a
 * delete event when a note is removed.
 */
router.delete('/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const ok = await noteService.deleteNote(id);
  if (!ok) {
    res.status(404).json({ message: 'Note not found' });
    return;
  }
  emitNoteDeleted(id);
  res.status(204).end();
});

/**
 * POST /notes/:id/move
 *
 * Reorder a note relative to its peers. The request body must include
 * `direction` which can be one of `up`, `down`, `top`, or `bottom`. If
 * the note does not exist a 404 is returned. After a successful move the
 * updated note is broadcast to clients.
 */
router.post('/:id/move', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { direction } = req.body;
  if (!['up', 'down', 'top', 'bottom'].includes(direction)) {
    res.status(400).json({ message: 'Invalid direction' });
    return;
  }
  const note = await noteService.moveNote(id, direction as any);
  if (!note) {
    res.status(404).json({ message: 'Note not found' });
    return;
  }
  emitNoteUpdated(note);
  res.json(note);
});

export default router;
