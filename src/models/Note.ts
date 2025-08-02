// src/models/Note.ts
import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { formatInTimeZone } = require('date-fns-tz');

/**
 * Атрибуты для создания новой заметки.
 */
export interface NoteAttributes {
  id: number;
  userId: number;
  boardId: string;
  content: string;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type NoteCreationAttributes = Optional<NoteAttributes, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Модель Note — отдельная заметка пользователя на доске.
 */
export class Note extends Model<NoteAttributes, NoteCreationAttributes> implements NoteAttributes {
  declare id: number;
  declare userId: number;
  declare boardId: string;
  declare content: string;
  declare order: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  /**
   * Инициализация модели.
   */
  public static initModel(sequelize: Sequelize): typeof Note {
    Note.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        boardId: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        content: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        order: {
          type: DataTypes.FLOAT,
          allowNull: false,
          // unique: true  ← убрано, чтобы не падал sync({ force: true })
        },
        createdAt: {
          type: DataTypes.DATE,
          get() {
            return formatInTimeZone(
              this.getDataValue('createdAt'),
              'Etc/GMT-3',
              "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"
            );
          },
        },
        updatedAt: {
          type: DataTypes.DATE,
          get() {
            return formatInTimeZone(
              this.getDataValue('updatedAt'),
              'Etc/GMT-3',
              "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"
            );
          },
        },
      },
      {
        sequelize,
        tableName: 'notes',
      }
    );
    return Note;
  }
}
