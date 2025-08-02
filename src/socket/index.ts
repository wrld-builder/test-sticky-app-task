import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import type { Note } from '../models/Note.js';
import type { Comment } from '../models/Comment.js';

/**
 * Singleton instance of socket.io used to broadcast real‑time events. It is
 * initialized once via `initSocket` and then exported for use by
 * controllers and services. Keeping a single reference avoids creating
 * multiple servers on hot reload.
 */
let io: Server | null = null;

/**
 * Set up a Socket.IO server on top of the existing HTTP server. The
 * instance is stored in a module‑level variable for later use.
 *
 * @param server A Node.js HTTP server used by Express
 * @returns The created Socket.IO server
 */
export function initSocket(server: HttpServer): Server {
  io = new Server(server, {
    cors: {
      origin: '*'
    }
  });

  io.on('connection', (socket: Socket) => {
    // For debugging: log new connections and their ids
    // eslint-disable-next-line no-console
    console.log(`Client connected: ${socket.id}`);
    socket.on('disconnect', () => {
      // eslint-disable-next-line no-console
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

/**
 * Retrieve the current Socket.IO instance. Throws if called before
 * initialization.
 */
export function getIO(): Server {
    if (!io) {
      throw new Error('Socket.io server not initialized');
    }
    return io;
}

// ----- Event emission helpers -----

/**
 * Emit a `noteCreated` event to all connected clients.
 *
 * @param note Note that has been created
 */
export function emitNoteCreated(note: Note): void {
  getIO().emit('noteCreated', note);
}

/**
 * Emit a `noteUpdated` event to all connected clients.
 *
 * @param note Note that has been updated
 */
export function emitNoteUpdated(note: Note): void {
  getIO().emit('noteUpdated', note);
}

/**
 * Emit a `noteDeleted` event. Clients can remove the note from their
 * view once they receive this message.
 *
 * @param id Identifier of the note that was deleted
 */
export function emitNoteDeleted(id: number): void {
  getIO().emit('noteDeleted', { id });
}

/**
 * Emit a `commentCreated` event when a new comment is added.
 *
 * @param comment The newly created comment
 */
export function emitCommentCreated(comment: Comment): void {
  getIO().emit('commentCreated', comment);
}

/**
 * Emit a `commentUpdated` event when a comment is edited.
 *
 * @param comment The updated comment
 */
export function emitCommentUpdated(comment: Comment): void {
  getIO().emit('commentUpdated', comment);
}

/**
 * Emit a `commentDeleted` event when a comment is removed.
 *
 * @param id Identifier of the deleted comment
 */
export function emitCommentDeleted(id: number): void {
  getIO().emit('commentDeleted', { id });
}