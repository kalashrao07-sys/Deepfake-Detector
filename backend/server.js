// ============================================================
// server.js - Main Express Server
// Entry point for the backend
// ============================================================

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const db = require('./config/db');
const app = express();
const PORT = process.env.PORT || 5000;

// ---- Middleware ----
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// ---- Serve uploaded files as static files ----
// Access via: http://localhost:5000/uploads/filename.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---- API Routes ----
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// ---- Health Check Route ----
app.get('/', (req, res) => {
  res.json({
    message: '🛡️ Deepfake Detection API is running!',
    status: 'OK',
    version: '1.0.0',
  });
});

// ---- Global Error Handler ----
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

// ---- Start Server ----
const startServer = async () => {
  try {
    if (db.initialization) {
      await db.initialization;
    }

    if (db.ensureSchema) {
      await db.ensureSchema();
    }

    app.listen(PORT, () => {
      console.log(`
  ====================================================
  🚀 Deepfake Detection Backend Running!
  ====================================================
  🌐 Server:   http://localhost:${PORT}
  📁 Uploads:  http://localhost:${PORT}/uploads
  ====================================================
  `);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
