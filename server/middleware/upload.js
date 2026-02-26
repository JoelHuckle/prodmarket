// middleware/upload.js
const multer = require("multer");

// Allowed file types
const ALLOWED_AUDIO_TYPES = [
  "audio/wav",
  "audio/mpeg",
  "audio/mp3",
  "audio/x-wav",
];
const ALLOWED_ARCHIVE_TYPES = [
  "application/zip",
  "application/x-zip-compressed",
];
const ALLOWED_MIDI_TYPES = ["audio/midi", "audio/x-midi"];

const ALL_ALLOWED_TYPES = [
  ...ALLOWED_AUDIO_TYPES,
  ...ALLOWED_ARCHIVE_TYPES,
  ...ALLOWED_MIDI_TYPES,
];

// File size limit: 1GB (1024MB)
const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1GB in bytes

// Configure multer to store files in memory (buffer)
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  // Check if file type is allowed
  if (ALL_ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type: ${file.mimetype}. Allowed types: WAV, MP3, MIDI, ZIP`
      ),
      false
    );
  }
};

// Create multer upload middleware
const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: fileFilter,
});

// Error handler for multer errors
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: "File too large. Maximum size is 1GB.",
      });
    }
    return res.status(400).json({
      success: false,
      error: `Upload error: ${err.message}`,
    });
  } else if (err) {
    // Other errors
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }
  next();
};

module.exports = {
  // Single file upload
  uploadSingle: upload.single("file"),

  // Multiple files upload (max 10 files)
  uploadMultiple: upload.array("files", 10),

  // Error handler
  handleMulterError,
};
