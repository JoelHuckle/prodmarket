// routes/files.js
const express = require("express");
const router = express.Router();
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

// Download route
router.get("/download/:fileKey", getDownloadUrl);

// File management
router.get("/info/:fileKey", getFileInfo);
router.delete("/:fileKey", deleteFile);

module.exports = router;
