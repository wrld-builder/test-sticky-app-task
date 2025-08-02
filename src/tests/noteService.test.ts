// src/tests/noteService.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { initModels, sequelize, User } from '../models/index.js';
import service from '../services/noteService.js';

describe('NoteService', () => {
  let userId: number;

  beforeAll(async () => {
    // Инициализируем модели и связи
    initModels();
    // Пересоздаём все таблицы
    await sequelize.sync({ force: true });

    // Создаём тестового пользователя
    const user = await User.create({
      username: 'testuser',
      passwordHash: 'dummy-hash'
    });
    userId = user.id;
  });

  afterAll(async () => {
    // Закрываем соединение с БД
    await sequelize.close();
  });

  it('creates and retrieves a note', async () => {
    const note = await service.createNote(userId, 'board-1', 'Hello');
    expect(note.boardId).toBe('board-1');
    expect(note.content).toBe('Hello');

    const fetched = await service.getNoteById(userId, note.id);
    expect(fetched).not.toBeNull();
    expect(fetched!.id).toBe(note.id);
  });

  it('lists notes in order', async () => {
    await service.createNote(userId, 'board-2', 'First');
    await service.createNote(userId, 'board-2', 'Second');
    await service.createNote(userId, 'board-2', 'Third');

    const notes = await service.getNotes(userId, 'board-2');
    expect(notes.map(n => n.content)).toEqual(['First', 'Second', 'Third']);
  });

  it('updates a note', async () => {
    const note = await service.createNote(userId, 'board-3', 'Old');
    const updated = await service.updateNote(userId, note.id, 'New');
    expect(updated).not.toBeNull();
    expect(updated!.content).toBe('New');
  });

  it('deletes a note', async () => {
    const note = await service.createNote(userId, 'board-4', 'ToDelete');
    const ok = await service.deleteNote(userId, note.id);
    expect(ok).toBe(true);

    const shouldBeNull = await service.getNoteById(userId, note.id);
    expect(shouldBeNull).toBeNull();
  });

  it('moves a note to the top', async () => {
    const a = await service.createNote(userId, 'board-5', 'A');
    const b = await service.createNote(userId, 'board-5', 'B');
    const c = await service.createNote(userId, 'board-5', 'C');

    // Перемещаем 'C' наверх
    await service.moveNote(userId, c.id, 'top');
    const notes = await service.getNotes(userId, 'board-5');
    expect(notes[0].id).toBe(c.id);
  });

  it('moves a note to the bottom', async () => {
    const a = await service.createNote(userId, 'board-6', 'A');
    const b = await service.createNote(userId, 'board-6', 'B');
    const c = await service.createNote(userId, 'board-6', 'C');

    // Перемещаем 'A' вниз
    await service.moveNote(userId, a.id, 'bottom');
    const notes = await service.getNotes(userId, 'board-6');
    expect(notes[notes.length - 1].id).toBe(a.id);
  });
});
