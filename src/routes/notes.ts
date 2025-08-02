// src/routes/notes.ts
import { Router, Response } from 'express';
import noteService from '../services/noteService.js';
import { authenticate, AuthenticatedRequest } from '../middlewares/auth.js';

const router = Router();
router.use(authenticate);

router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  const boardId = req.query.boardId;
  if (typeof boardId !== 'string') {
    return res.status(400).json({ error: 'Missing boardId' });
  }
  const notes = await noteService.getNotes(req.user.userId, boardId);
  res.json(notes);
});

router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  const { boardId, content } = req.body;
  if (typeof boardId !== 'string' || typeof content !== 'string') {
    return res.status(400).json({ error: 'boardId and content are required' });
  }
  const note = await noteService.createNote(req.user.userId, boardId, content);
  res.status(201).json(note);
});

router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
  const note = await noteService.getNoteById(req.user.userId, id);
  if (!note) return res.status(404).json({ error: 'Note not found' });
  res.json(note);
});

router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const id = Number(req.params.id);
  const { content } = req.body;
  if (isNaN(id) || typeof content !== 'string') {
    return res.status(400).json({ error: 'Invalid parameters' });
  }
  const updated = await noteService.updateNote(req.user.userId, id, content);
  if (!updated) return res.status(404).json({ error: 'Note not found' });
  res.json(updated);
});

router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
  const ok = await noteService.deleteNote(req.user.userId, id);
  if (!ok) return res.status(404).json({ error: 'Note not found' });
  res.status(204).end();
});

router.post('/:id/move', async (req: AuthenticatedRequest, res: Response) => {
  const id = Number(req.params.id);
  const { direction } = req.body;
  if (isNaN(id) || !['up','down','top','bottom'].includes(direction)) {
    return res.status(400).json({ error: 'Invalid parameters' });
  }
  const moved = await noteService.moveNote(req.user.userId, id, direction);
  if (!moved) return res.status(404).json({ error: 'Note not found' });
  res.json(moved);
});

export default router;
