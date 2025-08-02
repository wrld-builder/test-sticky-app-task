import { initModels, Note, sequelize } from './models/index.js';

async function showAllNotes() {
  try {
    // Initialize models and database connection
    initModels();
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    // Fetch all notes
    const notes = await Note.findAll({
      order: [['createdAt', 'DESC']],
    });

    const plainNotes = notes.map((note) => note.toJSON());

    console.log('--- All Notes ---');
    console.log(JSON.stringify(plainNotes, null, 2));
  } catch (error) {
    console.error('Unable to connect to the database or fetch notes:', error);
  } finally {
    // Close the database connection
    await sequelize.close();
  }
}

showAllNotes();
