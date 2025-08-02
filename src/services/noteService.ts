// src/services/noteService.ts
import { Op, Transaction } from 'sequelize';
import { Note } from '../models/Note.js';

/**
 * Service encapsulating business logic for managing notes. Separating
 * database access into a class improves testability and keeps route
 * handlers thin and expressive.
 */
export class NoteService {
  /**
   * Create a new note. The newly created note is placed at the top of its
   * board by assigning it the highest `order` value among existing notes.
   *
   * @param boardId ID of the board the note belongs to
   * @param content The textual content of the note
   * @returns A promise resolving to the created note
   */
  async createNote(boardId: string, content: string): Promise<Note> {
    const max = await Note.max('order', { where: { boardId } });
    const nextOrder = typeof max === 'number' ? max + 1 : 0;
    return Note.create({ boardId, content, order: nextOrder });
  }

  /**
   * Retrieve all notes for a board sorted by ascending order. The sorting
   * guarantees that clients display notes consistently.
   *
   * @param boardId Board identifier
   * @returns A promise resolving to an array of notes
   */
  async getNotes(boardId: string): Promise<Note[]> {
    return Note.findAll({ where: { boardId }, order: [['order', 'ASC']] });
  }

  /**
   * Retrieve a single note by its primary key. Returns `null` if the note
   * does not exist.
   *
   * @param id Note identifier
   * @returns A promise resolving to the note or null
   */
  async getNoteById(id: number): Promise<Note | null> {
    return Note.findByPk(id);
  }

  /**
   * Update the text of an existing note. Only the content can be changed
   * through this method; the order is maintained separately via
   * `moveNote`.
   *
   * @param id ID of the note to update
   * @param content New note content
   * @returns The updated note or null if not found
   */
  async updateNote(id: number, content: string): Promise<Note | null> {
    const note = await Note.findByPk(id);
    if (!note) return null;
    note.content = content;
    await note.save();
    return note;
  }

  /**
   * Delete a note permanently. All comments associated with the note are
   * removed automatically via the `CASCADE` rule configured on the
   * association.
   *
   * @param id Identifier of the note to remove
   * @returns `true` if a note was deleted, otherwise `false`
   */
  async deleteNote(id: number): Promise<boolean> {
    const deleted = await Note.destroy({ where: { id } });
    return deleted > 0;
  }

  /**
   * Move a note relative to its neighbours or to an absolute position on
   * the board. The valid directions are:
   *  - `up`: swap with the note immediately above
   *  - `down`: swap with the note immediately below
   *  - `top`: move the note to the very top (highest order)
   *  - `bottom`: move the note to the bottom (lowest order)
   *
   * Order adjustments are performed within a transaction to ensure that
   * concurrent operations do not cause inconsistencies. The algorithm
   * computes new order values by averaging adjacent orders when possible;
   * if not, it uses integer offsets to keep values unique.
   *
   * @param id Note identifier to move
   * @param direction Direction to move the note (up|down|top|bottom)
   * @returns A promise resolving to the updated note or null if not found
   */
  async moveNote(id: number, direction: 'up' | 'down' | 'top' | 'bottom'): Promise<Note | null> {
    return Note.sequelize!.transaction(async (t: Transaction) => {
      const note = await Note.findByPk(id, { transaction: t });
      if (!note) return null;
      // Retrieve all notes on the same board sorted by order.
      const notes = await Note.findAll({
        where: { boardId: note.boardId },
        order: [['order', 'ASC']],
        transaction: t,
      });
      const idx = notes.findIndex((n) => n.id === note.id);
      if (idx === -1) return null;

      // Helper to update order and persist.
      const updateOrder = async (target: Note, newOrder: number) => {
        target.order = newOrder;
        await target.save({ transaction: t });
      };

      switch (direction) {
        case 'up': {
          if (idx === 0) {
            // Already at top; nothing to do
            return note;
          }
          const prev = notes[idx - 1];
          const beforePrev = idx - 2 >= 0 ? notes[idx - 2] : null;
          // Compute midpoint between previous neighbour and the one before
          let newOrder: number;
          if (beforePrev) {
            newOrder = (prev.order + beforePrev.order) / 2;
          } else {
            newOrder = prev.order - 1;
          }
          await updateOrder(note, newOrder);
          break;
        }
        case 'down': {
          if (idx === notes.length - 1) {
            // Already at bottom
            return note;
          }
          const next = notes[idx + 1];
          const afterNext = idx + 2 < notes.length ? notes[idx + 2] : null;
          let newOrder: number;
          if (afterNext) {
            newOrder = (next.order + afterNext.order) / 2;
          } else {
            newOrder = next.order + 1;
          }
          await updateOrder(note, newOrder);
          break;
        }
        case 'top': {
          const maxOrder = notes[notes.length - 1].order;
          await updateOrder(note, maxOrder + 1);
          break;
        }
        case 'bottom': {
          const minOrder = notes[0].order;
          await updateOrder(note, minOrder - 1);
          break;
        }
        default:
          // Unknown direction
          return note;
      }

      return note;
    });
  }
}

export default new NoteService();
