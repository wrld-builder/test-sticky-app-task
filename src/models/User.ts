// src/models/User.ts
import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { formatInTimeZone } = require('date-fns-tz');

/**
 * Attributes for a user account. Stores username and hashed password.
 */
export interface UserAttributes {
  id: number;
  username: string;
  passwordHash: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserCreationAttributes = Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * The User model represents a registered user. Authentication logic
 * operates on this data.
 */
export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  // Declare fields to avoid shadowing Sequelize getters/setters
  declare id: number;
  declare username: string;
  declare passwordHash: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  /**
   * Initialize the User model. Call during app startup.
   * @param sequelize A Sequelize connection instance.
   */
  public static initModel(sequelize: Sequelize): typeof User {
    User.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        username: {
          type: DataTypes.STRING(64),
          unique: true,
          allowNull: false,
        },
        passwordHash: {
          type: DataTypes.STRING(128),
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
        tableName: 'users',
      }
    );
    return User;
  }
}
