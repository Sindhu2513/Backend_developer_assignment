const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const adminRoutes = require('./routes/adminRoutes');
const errorMiddleware = require('./middleware/errorMiddleware');
const setupSwagger = require('./docs/swagger');
const AppError = require('./utils/appError');

const app = express();

// Security and utility Middlewares
app.use(helmet());
app.use(cors({
  origin: '*', // Allows consumption from Vite or alternative clients
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Expose API description page
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Mongoose Task API. Go to /api/docs for interactive Swagger API documentation.'
  });
});

// Configure API Swagger Docs
setupSwagger(app);

// Bind Route Gateways
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/admin', adminRoutes);

// Fallback for undefined endpoints
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server.`, 404));
});

// Centralized Error Handling Middleware
app.use(errorMiddleware);

module.exports = app;
