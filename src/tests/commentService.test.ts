import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { initModels, sequelize, User, Note, Comment } from '../models/index.js';
import noteService from '../services/noteService.js';
import commentService from '../services/commentService.js';

describe('CommentService', () => {
  let userId: number;
  let noteId: number;

  beforeAll(async () => {
    // Инициализируем модели и связи
    initModels();
    // Синхронизируем базу заново
    await sequelize.sync({ force: true });

    // Создаём пользователя
    const user = await User.create({
      username: 'commenter',
      passwordHash: 'dummy'
    });
    userId = user.id;
  });

  beforeEach(async () => {
    // Очищаем комментарии и заметки
    await Comment.destroy({ where: {} });
    await Note.destroy({ where: {} });

    // Создаём новую заметку для тестов
    const note = await noteService.createNote(userId, 'board-X', 'Test note');
    noteId = note.id;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('creates a comment for a note', async () => {
    const comment = await commentService.createComment(userId, noteId, 'Nice!');
    expect(comment).toBeTruthy();
    expect(comment.content).toBe('Nice!');
    expect(comment.noteId).toBe(noteId);
    expect(comment.author).toBe(userId);
  });

  it('updates a comment', async () => {
    const comment = await commentService.createComment(userId, noteId, 'First');
    const updated = await commentService.updateComment(userId, noteId, comment.id, 'Edited');
    expect(updated).not.toBeNull();
    expect(updated!.content).toBe('Edited');
  });

  it('deletes a comment', async () => {
    const comment = await commentService.createComment(userId, noteId, 'ToDelete');
    const ok = await commentService.deleteComment(userId, noteId, comment.id);
    expect(ok).toBe(true);
    // Убедимся, что такого комментария больше нет
    const still = await Comment.findByPk(comment.id);
    expect(still).toBeNull();
  });
});
