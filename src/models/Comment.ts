// src/models/Comment.ts
import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { formatInTimeZone } = require('date-fns-tz');

export interface CommentAttributes {
  id: number;
  noteId: number;
  author: number;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}
export type CommentCreationAttributes = Optional<CommentAttributes, 'id' | 'createdAt' | 'updatedAt'>;

export class Comment extends Model<CommentAttributes, CommentCreationAttributes> implements CommentAttributes {
  declare id: number;
  declare noteId: number;
  declare author: number;
  declare content: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  public static initModel(sequelize: Sequelize): typeof Comment {
    Comment.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        noteId: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        author: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        content: {
          type: DataTypes.TEXT,
          allowNull: false
        },
        createdAt: {
          type: DataTypes.DATE,
          get() {
            return formatInTimeZone(
              this.getDataValue('createdAt'),
              'Etc/GMT-3',
              "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"
            );
          }
        },
        updatedAt: {
          type: DataTypes.DATE,
          get() {
            return formatInTimeZone(
              this.getDataValue('updatedAt'),
              'Etc/GMT-3',
              "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"
            );
          }
        }
      },
      {
        sequelize,
        tableName: 'comments'
      }
    );
    return Comment;
  }
}
