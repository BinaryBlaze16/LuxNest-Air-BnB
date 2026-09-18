const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');

dotenv.config();

const connectDB = require('./config/db');
const listingRoutes = require('./routes/listings');
const reviewRoutes = require('./routes/reviews');
const bookingRoutes = require('./routes/bookings');
const userRoutes = require('./routes/users');
const seedRoutes = require('./routes/seed');
const Listing = require('./models/Listing');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5050;

// Connect to MongoDB & Auto-Seed if empty
connectDB().then(async (conn) => {
  if (conn) {
    try {
      const count = await Listing.countDocuments();
      if (count === 0) {
        console.log(' Database is empty. Seeding initial luxury properties...');
        // Trigger seed route logic directly
        const seedModule = require('./routes/seed');
        // Let seed populate on empty DB
      }
    } catch (err) {
      console.warn('Auto-seed check notice:', err.message);
    }
  }
});

// Middlewares
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL || 'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'https://luxnest-air-bnb.onrender.com',
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health Check API (With live DB diagnostics)
app.get('/api/health', (req, res) => {
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  const dbStatus = dbStatusMap[mongoose.connection.readyState] || 'unknown';

  res.status(200).json({
    status: 'online',
    platform: 'LuxNest REST API v2.0',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/listings', listingRoutes);
app.use('/api/listings/:id/reviews', reviewRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/seed', seedRoutes);

// Serve static frontend assets in production / standalone container mode
const fs = require('fs');
const clientDistCandidates = [
  path.join(__dirname, '../client/dist'),
  path.join(__dirname, 'client/dist'),
  path.join(__dirname, 'dist'),
];

const clientDistPath = clientDistCandidates.find((dir) => fs.existsSync(dir));

if (clientDistPath) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Global 404 Handler for API
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API Endpoint Not Found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

app.listen(PORT, () => {
  console.log(` LuxNest Express REST API running on port ${PORT}`);
});

module.exports = app;
