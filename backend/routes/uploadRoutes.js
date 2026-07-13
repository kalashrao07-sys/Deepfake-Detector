// ============================================================
// routes/uploadRoutes.js
// Accepts: images, videos, PDF, DOCX, PPTX, TXT
// ============================================================

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { uploadFile, getHistory, getReport, reportUpload } = require('../controllers/uploadController');

// ---- Multer Storage: save to backend/uploads/ ----
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname.replace(/\s/g, '_');
    cb(null, uniqueName);
  },
});

// ---- Accept all supported file types ----
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    // Images
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    // Videos
    'video/mp4', 'video/avi', 'video/mkv', 'video/mov', 'video/webm',
    // Documents (analyzed by Gemini)
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'text/plain', // .txt
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type. Please upload an image, video, PDF, DOCX, or PPTX.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
});

// POST /api/upload — upload and analyze file
router.post('/', upload.single('file'), uploadFile);

// GET /api/upload/history/:userId — get user history
router.get('/history/:userId', getHistory);

// GET /api/upload/report/:uploadId — get single report
router.get('/report/:uploadId', getReport);

// POST /api/upload/report — submit fake content report
router.post('/report', reportUpload);

module.exports = router;
