// src/models/Comment.ts
import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { formatInTimeZone } = require('date-fns-tz');

/**
 * Attributes for a comment attached to a sticky note. Each comment belongs
 * to a single note (`noteId`) and stores the author's name along with
 * content. The timestamps are managed automatically by Sequelize.
 */
export interface CommentAttributes {
  id: number;
  noteId: number;
  author: string;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type CommentCreationAttributes = Optional<
  CommentAttributes,
  'id' | 'createdAt' | 'updatedAt'
>;

/**
 * The Comment model represents a small piece of discussion attached to a
 * note. Comments can only be created by authenticated users and are
 * broadcast in real time to other clients.
 */
export class Comment
  extends Model<CommentAttributes, CommentCreationAttributes>
  implements CommentAttributes
{
  // Declare fields to avoid shadowing Sequelize getters/setters
  declare id: number;
  declare noteId: number;
  declare author: string;
  declare content: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  /**
   * Initialize the Comment model. This method should be called during
   * application startup after the Sequelize connection has been created.
   *
   * @param sequelize A Sequelize connection instance.
   */
  public static initModel(sequelize: Sequelize): typeof Comment {
    Comment.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        noteId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        author: {
          type: DataTypes.STRING(64),
          allowNull: false,
        },
        content: {
          type: DataTypes.TEXT,
          allowNull: false,
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
        tableName: 'comments',
      }
    );
    return Comment;
  }
}
