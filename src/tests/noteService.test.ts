import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { Sequelize } from 'sequelize';
import { Note } from '../models/Note.js';
import { initModels } from '../models/index.js';
import { NoteService } from '../services/noteService.js';

// Create an isolated in‑memory database for testing purposes.
const testSequelize = new Sequelize('sqlite::memory:', { logging: false });

describe('NoteService', () => {
  let service: NoteService;

  beforeAll(async () => {
    // Initialize models against the test database and sync schema
    Note.initModel(testSequelize);
    await testSequelize.sync();
    service = new NoteService();
  });

  beforeEach(async () => {
    // Clear notes table before each test
    await Note.destroy({ where: {} });
  });

  it('creates notes with increasing order', async () => {
    const first = await service.createNote('board-1', 'First');
    const second = await service.createNote('board-1', 'Second');
    expect(first.order).toBeLessThan(second.order);
  });

  it('moves a note up', async () => {
    const a = await service.createNote('board-1', 'A');
    const b = await service.createNote('board-1', 'B');
    const moved = await service.moveNote(b.id, 'up');
    if (!moved) throw new Error('move returned null');
    // After moving up, B should now have an order less than A
    const notes = await service.getNotes('board-1');
    expect(notes[0].id).toBe(b.id);
    expect(notes[1].id).toBe(a.id);
  });

  it('moves a note down', async () => {
    const a = await service.createNote('board-1', 'A');
    const b = await service.createNote('board-1', 'B');
    const moved = await service.moveNote(a.id, 'down');
    if (!moved) throw new Error('move returned null');
    const notes = await service.getNotes('board-1');
    expect(notes[0].id).toBe(b.id);
    expect(notes[1].id).toBe(a.id);
  });

  it('moves a note to the top', async () => {
    const a = await service.createNote('board-1', 'A');
    const b = await service.createNote('board-1', 'B');
    const c = await service.createNote('board-1', 'C');
    await service.moveNote(a.id, 'top');
    const notes = await service.getNotes('board-1');
    expect(notes[2].id).toBe(a.id);
  });

  it('moves a note to the bottom', async () => {
    const a = await service.createNote('board-1', 'A');
    const b = await service.createNote('board-1', 'B');
    const c = await service.createNote('board-1', 'C');
    await service.moveNote(c.id, 'bottom');
    const notes = await service.getNotes('board-1');
    expect(notes[0].id).toBe(c.id);
  });
});
