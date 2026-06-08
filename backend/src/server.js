const app = require('./app');
const { setupDatabase } = require('./config/db');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Run database schemas and check connections
    await setupDatabase();
    
    // Start Express listener
    app.listen(PORT, () => {
      console.log(`========================================`);
      console.log(`  Server is running in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`  Listening on Port: http://localhost:${PORT}`);
      console.log(`  Swagger Docs: http://localhost:${PORT}/api/docs`);
      console.log(`========================================`);
    });
  } catch (error) {
    console.error('Critical: Failed to start backend server due to database error:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection at Promise:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
  process.exit(1);
});

startServer();
