import { hashPassword, comparePassword } from '../utils/hash.js';

/**
 * A simple in‑memory representation of users for demonstration purposes. In
 * production systems this would be replaced by a proper persistent store
 * with hashed passwords and appropriate salting.
 */
interface UserRecord {
  id: number;
  username: string;
  passwordHash: string;
}

// Pre‑populate with a single test user. Password: `password`.
const users: UserRecord[] = [];
let nextId = 1;

/**
 * Create a new user given a username and password. The password is hashed
 * using bcrypt before storage. Returns the created user object without
 * exposing the password hash.
 *
 * @param username Desired username, must be unique
 * @param password Plain text password
 * @returns A promise resolving to the created user record
 */
export async function signUp(
  username: string,
  password: string
): Promise<Omit<UserRecord, 'passwordHash'>> {
  const existing = users.find((u) => u.username === username);
  if (existing) {
    throw new Error('Username already exists');
  }
  const passwordHash = await hashPassword(password);
  const newUser: UserRecord = {
    id: nextId++,
    username,
    passwordHash,
  };
  users.push(newUser);
  // Return public view of user without passwordHash
  const { passwordHash: _ignored, ...publicUser } = newUser;
  return publicUser;
}

/**
 * Authenticate a user based on username and password. If the credentials
 * match an existing user, the user record is returned. Otherwise `null`
 * is returned. Password comparison is performed using bcrypt to prevent
 * timing attacks.
 *
 * @param username Username of the user trying to log in
 * @param password Plain text password to verify
 * @returns The user record if authentication succeeds, otherwise null
 */
export async function signIn(
  username: string,
  password: string
): Promise<Omit<UserRecord, 'passwordHash'> | null> {
  const user = users.find((u) => u.username === username);
  if (!user) {
    return null;
  }
  const matches = await comparePassword(password, user.passwordHash);
  if (!matches) {
    return null;
  }
  const { passwordHash: _ignored, ...publicUser } = user;
  return publicUser;
}
