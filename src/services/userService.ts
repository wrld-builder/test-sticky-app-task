// src/services/userService.ts
import bcrypt from 'bcrypt';
import { User } from '../models/User.js';

export class UserService {
  /**
   * Register a new user with hashed password
   */
  async createUser(username: string, password: string): Promise<User> {
    const hash = await bcrypt.hash(password, 10);
    return User.create({ username, passwordHash: hash });
  }

  /**
   * Verify credentials and return user if valid
   */
  async authenticate(username: string, password: string): Promise<User | null> {
    const user = await User.findOne({ where: { username } });
    if (!user) return null;
    const match = await bcrypt.compare(password, user.passwordHash);
    return match ? user : null;
  }
}

export default new UserService();