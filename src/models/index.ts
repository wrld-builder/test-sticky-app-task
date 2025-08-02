// src/models/index.ts
import sequelize from '../config/database.js';
import { Note } from './Note.js';
import { Comment } from './Comment.js';
import { User } from './User.js';

/**
 * Initialize all Sequelize models and configure associations.
 */
export function initModels(): void {
  Note.initModel(sequelize);
  Comment.initModel(sequelize);
  User.initModel(sequelize);

  // Associations
  Note.hasMany(Comment, { foreignKey: 'noteId', as: 'comments', onDelete: 'CASCADE' });
  Comment.belongsTo(Note, { foreignKey: 'noteId', as: 'note' });
}

export { sequelize, Note, Comment, User };