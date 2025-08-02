// src/services/commentService.ts
import { Comment, CommentCreationAttributes } from '../models/Comment.js';

/**
 * Business logic for managing comments. Keeping this logic separate
 * simplifies testing and promotes reuse across HTTP and WebSocket
 * handlers.
 */
export class CommentService {
  /**
   * Create a new comment attached to a note.
   *
   * @param noteId ID of the note the comment belongs to
   * @param author The username of the commenter
   * @param content The comment body
   * @returns A promise resolving to the created comment
   */
  async createComment(noteId: number, author: string, content: string): Promise<Comment> {
    return Comment.create({ noteId, author, content });
  }

  /**
   * Fetch all comments for a particular note sorted by creation time.
   *
   * @param noteId The note whose comments are requested
   * @returns An array of comments in ascending creation order
   */
  async getComments(noteId: number): Promise<Comment[]> {
    return Comment.findAll({ where: { noteId }, order: [['createdAt', 'ASC']] });
  }

  /**
   * Update the content of an existing comment.
   *
   * @param id Identifier of the comment to update
   * @param content New comment text
   * @returns The updated comment or null if it does not exist
   */
  async updateComment(id: number, content: string): Promise<Comment | null> {
    const comment = await Comment.findByPk(id);
    if (!comment) return null;
    comment.content = content;
    await comment.save();
    return comment;
  }

  /**
   * Delete a comment permanently.
   *
   * @param id ID of the comment to remove
   * @returns True if a comment was removed, otherwise false
   */
  async deleteComment(id: number): Promise<boolean> {
    const deleted = await Comment.destroy({ where: { id } });
    return deleted > 0;
  }
}

export default new CommentService();
