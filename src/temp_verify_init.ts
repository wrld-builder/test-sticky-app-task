import { initModels, sequelize } from './models/index.js';

async function testInit() {
  try {
    console.log('Attempting to initialize models...');
    initModels();
    await sequelize.authenticate();
    console.log('Model initialization and database connection successful.');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await sequelize.close();
  }
}

testInit();
