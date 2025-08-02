import sequelize from '../config/database.js';
import { Note } from './Note.js';
import { Comment } from './Comment.js';

/**
 * Initialize all Sequelize models and configure associations. By
 * encapsulating model setup here we avoid circular dependency problems
 * and make it easy to import models elsewhere in the application.
 */
export function initModels(): void {
  Note.initModel(sequelize);
  Comment.initModel(sequelize);

  // Associations
  Note.hasMany(Comment, { foreignKey: 'noteId', as: 'comments', onDelete: 'CASCADE' });
  Comment.belongsTo(Note, { foreignKey: 'noteId', as: 'note' });
}

export { sequelize, Note, Comment };