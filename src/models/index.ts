// src/models/index.ts
import sequelize from '../config/database.js';
import { Note } from './Note.js';
import { Comment } from './Comment.js';
import { User } from './User.js';

/**
 * Инициализируем все модели и задаём связи между ними.
 */
export function initModels(): void {
  Note.initModel(sequelize);
  Comment.initModel(sequelize);
  User.initModel(sequelize);

  // Пользователь — заметки
  User.hasMany(Note, { foreignKey: 'userId', as: 'notes' });
  Note.belongsTo(User, { foreignKey: 'userId', as: 'author' });

  // Заметка — комментарии
  Note.hasMany(Comment, { foreignKey: 'noteId', as: 'comments', onDelete: 'CASCADE' });
  Comment.belongsTo(Note, { foreignKey: 'noteId', as: 'note' });
}

export { sequelize, Note, Comment, User };
