import { Router, Response } from 'express';
import noteService from '../services/noteService.js';
import { authenticate, AuthenticatedRequest } from '../middlewares/auth.js';
import { emitNoteCreated, emitNoteUpdated, emitNoteDeleted } from '../socket/index.js';

const router = Router();

// Включаем авторизацию на всех роутерах
router.use(authenticate);

router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  const { boardId } = req.query;
  if (typeof boardId !== 'string') {
    return res.status(400).json({ message: 'Missing boardId' });
  }
  const notes = await noteService.getNotes(req.user.userId, boardId);
  res.json(notes);
});

router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const note = await noteService.getNoteById(req.user.userId, id);
  if (!note) {
    return res.status(404).json({ message: 'Note not found' });
  }
  res.json(note);
});

router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  const { boardId, content } = req.body;
  if (typeof boardId !== 'string' || typeof content !== 'string') {
    return res.status(400).json({ message: 'boardId and content are required' });
  }
  const note = await noteService.createNote(req.user.userId, boardId, content);
  emitNoteCreated(note);
  res.status(201).json(note);
});

router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { content } = req.body;
  if (typeof content !== 'string') {
    return res.status(400).json({ message: 'content is required' });
  }
  const updated = await noteService.updateNote(req.user.userId, id, content);
  if (!updated) {
    return res.status(404).json({ message: 'Note not found' });
  }
  emitNoteUpdated(updated);
  res.json(updated);
});

router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const ok = await noteService.deleteNote(req.user.userId, id);
  if (!ok) {
    return res.status(404).json({ message: 'Note not found' });
  }
  emitNoteDeleted(id);
  res.status(204).end();
});

router.post('/:id/move', async (req: AuthenticatedRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { direction } = req.body;
  if (!['up', 'down', 'top', 'bottom'].includes(direction)) {
    return res.status(400).json({ message: 'Invalid direction' });
  }
  const moved = await noteService.moveNote(req.user.userId, id, direction as any);
  if (!moved) {
    return res.status(404).json({ message: 'Note not found' });
  }
  emitNoteUpdated(moved);
  res.json(moved);
});

export default router;
