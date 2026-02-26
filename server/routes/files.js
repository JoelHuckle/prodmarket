// routes/files.js
const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const { protect } = require("../middleware/auth");
const {
  uploadSingle,
  uploadMultiple,
  handleMulterError,
} = require("../middleware/upload");
const {
  uploadFile,
  uploadMultipleFiles,
  getDownloadUrl,
  deleteFile,
  getFileInfo,
} = require("../controllers/fileController");

// Stricter rate limit for download URL generation (30 per minute per IP)
const downloadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many download requests, please try again later",
  },
});

// All routes require authentication
router.use(protect);

// Upload routes
router.post("/upload", uploadSingle, handleMulterError, uploadFile);
router.post(
  "/upload-multiple",
  uploadMultiple,
  handleMulterError,
  uploadMultipleFiles
);

// Download route — rate limited
router.get("/download/:fileKey", downloadLimiter, getDownloadUrl);

// File management
router.get("/info/:fileKey", getFileInfo);
router.delete("/:fileKey", deleteFile);

module.exports = router;
