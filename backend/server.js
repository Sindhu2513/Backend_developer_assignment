require('dotenv').config();

// Strict environment variables validation on startup
if (!process.env.JWT_SECRET) {
  console.error('CRITICAL FATAL: JWT_SECRET environment variable is not defined.');
  process.exit(1);
}

if (!process.env.MONGODB_URI) {
  console.error('CRITICAL FATAL: MONGODB_URI environment variable is not defined.');
  process.exit(1);
}

const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB Database
connectDB();

// Start Express Listener
const server = app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`  Backend is running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`  Server Port: http://localhost:${PORT}`);
  console.log(`  Swagger UI Specs: http://localhost:${PORT}/api/docs`);
  console.log(`========================================`);
});

// Capture unhandled rejection issues
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection! Shutting down server...', err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Capture uncaught exception crashes
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception! Shutting down server...', err.message);
  process.exit(1);
});
