// src/services/commentService.ts
import { Comment } from '../models/Comment.js';

class CommentService {
  async createComment(userId: number, noteId: number, content: string): Promise<Comment> {
    return Comment.create({ author: userId, noteId, content });
  }

  async getComments(userId: number, noteId: number): Promise<Comment[]> {
    return Comment.findAll({
      where: { author: userId, noteId },
      order: [['createdAt', 'ASC']]
    });
  }

  async updateComment(
    userId: number,
    noteId: number,
    id: number,
    content: string
  ): Promise<Comment | null> {
    const c = await Comment.findOne({ where: { author: userId, noteId, id } });
    if (!c) return null;
    c.content = content;
    await c.save();
    return c;
  }

  async deleteComment(userId: number, noteId: number, id: number): Promise<boolean> {
    const deleted = await Comment.destroy({ where: { author: userId, noteId, id } });
    return deleted > 0;
  }
}

export default new CommentService();
