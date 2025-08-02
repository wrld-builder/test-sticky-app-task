// src/services/noteService.ts
import { Transaction } from 'sequelize';
import { Note } from '../models/Note.js';

class NoteService {
  /**
   * Создаёт новую заметку и ставит её в конец (по возрастанию order) у заданного пользователя и доски.
   */
  async createNote(userId: number, boardId: string, content: string): Promise<Note> {
    const maxOrder = await Note.max('order', { where: { userId, boardId } });
    const next = typeof maxOrder === 'number' ? maxOrder + 1 : 0;
    return Note.create({ userId, boardId, content, order: next });
  }

  /** Возвращает все заметки доски в порядке возрастания поля `order`. */
  async getNotes(userId: number, boardId: string): Promise<Note[]> {
    return Note.findAll({ where: { userId, boardId }, order: [['order', 'ASC']] });
  }

  /** Находит одну заметку по id, принадлежащую данному пользователю. */
  async getNoteById(userId: number, id: number): Promise<Note | null> {
    return Note.findOne({ where: { userId, id } });
  }

  /** Обновляет содержимое заметки. */
  async updateNote(userId: number, id: number, content: string): Promise<Note | null> {
    const note = await Note.findOne({ where: { userId, id } });
    if (!note) return null;
    note.content = content;
    await note.save();
    return note;
  }

  /** Удаляет заметку. */
  async deleteNote(userId: number, id: number): Promise<boolean> {
    const deleted = await Note.destroy({ where: { userId, id } });
    return deleted > 0;
  }

  /**
   * Перемещает заметку в указанном направлении:
   *  - 'up'     — между соседями выше,
   *  - 'down'   — между соседями ниже,
   *  - 'top'    — в начало списка (lowest order),
   *  - 'bottom' — в конец списка (highest order).
   */
  async moveNote(
    userId: number,
    id: number,
    direction: 'up' | 'down' | 'top' | 'bottom'
  ): Promise<Note | null> {
    return Note.sequelize!.transaction(async (t: Transaction) => {
      const note = await Note.findOne({ where: { userId, id }, transaction: t });
      if (!note) return null;

      // Все заметки этой доски, отсортированные по order
      const notes = await Note.findAll({
        where: { userId, boardId: note.boardId },
        order: [['order', 'ASC']],
        transaction: t,
      });
      const idx = notes.findIndex((n) => n.id === note.id);
      if (idx === -1) return null;

      const updateOrder = async (n: Note, newOrder: number) => {
        n.order = newOrder;
        await n.save({ transaction: t });
      };

      switch (direction) {
        case 'up': {
          if (idx > 0) {
            const prev = notes[idx - 1];
            const beforePrev = idx - 2 >= 0 ? notes[idx - 2] : null;
            const newOrder = beforePrev ? (prev.order + beforePrev.order) / 2 : prev.order - 1;
            await updateOrder(note, newOrder);
          }
          break;
        }
        case 'down': {
          if (idx < notes.length - 1) {
            const next = notes[idx + 1];
            const afterNext = idx + 2 < notes.length ? notes[idx + 2] : null;
            const newOrder = afterNext ? (next.order + afterNext.order) / 2 : next.order + 1;
            await updateOrder(note, newOrder);
          }
          break;
        }
        case 'top': {
          // в начало — минимальный order минус 1
          const minOrder = notes[0].order;
          await updateOrder(note, minOrder - 1);
          break;
        }
        case 'bottom': {
          // в конец — максимальный order плюс 1
          const maxOrder = notes[notes.length - 1].order;
          await updateOrder(note, maxOrder + 1);
          break;
        }
      }

      return note;
    });
  }
}

export default new NoteService();
