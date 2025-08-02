import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { Sequelize } from 'sequelize';
import { Note } from '../models/Note.js';
import { Comment } from '../models/Comment.js';
import { CommentService } from '../services/commentService.js';
import { NoteService } from '../services/noteService.js';

// Use an in‑memory SQLite database
const sequelize = new Sequelize('sqlite::memory:', { logging: false });

describe('CommentService', () => {
  let commentService: CommentService;
  let noteService: NoteService;
  let noteId: number;

  beforeAll(async () => {
    Note.initModel(sequelize);
    Comment.initModel(sequelize);
    // Establish association
    Note.hasMany(Comment, { foreignKey: 'noteId', as: 'comments' });
    Comment.belongsTo(Note, { foreignKey: 'noteId', as: 'note' });
    await sequelize.sync();
    commentService = new CommentService();
    noteService = new NoteService();
  });

  beforeEach(async () => {
    await Comment.destroy({ where: {} });
    await Note.destroy({ where: {} });
    const note = await noteService.createNote('board-1', 'Test note');
    noteId = note.id;
  });

  it('creates a comment for a note', async () => {
    const comment = await commentService.createComment(noteId, 'alice', 'Hello');
    expect(comment.noteId).toBe(noteId);
    expect(comment.author).toBe('alice');
  });

  it('updates a comment', async () => {
    const comment = await commentService.createComment(noteId, 'alice', 'Hello');
    const updated = await commentService.updateComment(comment.id, 'Updated');
    expect(updated).not.toBeNull();
    expect(updated!.content).toBe('Updated');
  });

  it('deletes a comment', async () => {
    const comment = await commentService.createComment(noteId, 'alice', 'Hello');
    const ok = await commentService.deleteComment(comment.id);
    expect(ok).toBe(true);
    const found = await Comment.findByPk(comment.id);
    expect(found).toBeNull();
  });
});