// ============================================================
// routes/adminRoutes.js - Admin Panel Routes
// ============================================================

const express = require('express');
const router = express.Router();
const { getAllUploads, getAllUsers, deleteUpload, getStats } = require('../controllers/adminController');

// GET /api/admin/uploads - Get all uploads
router.get('/uploads', getAllUploads);

// GET /api/admin/users - Get all users
router.get('/users', getAllUsers);

// DELETE /api/admin/upload/:id - Delete a specific upload
router.delete('/upload/:id', deleteUpload);

// GET /api/admin/stats - Get dashboard statistics
router.get('/stats', getStats);

module.exports = router;
