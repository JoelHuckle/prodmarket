/**
 * Input validation utility
 * Centralized validation functions for common data types and constraints
 */

const { Op } = require("sequelize");

/**
 * Validate order amount
 * @param {number} amount - Amount in USD
 * @returns {object} - { valid: boolean, error?: string }
 */
exports.validateOrderAmount = (amount) => {
  const num = parseFloat(amount);

  if (isNaN(num)) {
    return { valid: false, error: "Amount must be a number" };
  }

  if (num <= 0) {
    return { valid: false, error: "Amount must be greater than 0" };
  }

  if (num > 999999) {
    return { valid: false, error: "Amount exceeds maximum limit ($999,999)" };
  }

  // Max 2 decimal places
  if (!/^\d+(\.\d{1,2})?$/.test(amount.toString())) {
    return { valid: false, error: "Amount can have at most 2 decimal places" };
  }

  return { valid: true };
};

/**
 * Validate order status transition
 * @param {string} currentStatus - Current order status
 * @param {string} newStatus - Proposed new status
 * @returns {object} - { valid: boolean, error?: string }
 */
exports.validateStatusTransition = (currentStatus, newStatus) => {
  // Define legal transitions
  const legalTransitions = {
    pending: ["awaiting_upload", "completed", "cancelled"],
    awaiting_upload: ["in_progress", "cancelled"],
    in_progress: ["awaiting_delivery", "cancelled"],
    awaiting_delivery: ["delivered", "cancelled"],
    delivered: ["completed", "disputed"],
    completed: [], // Terminal state
    cancelled: [], // Terminal state
    refunded: [], // Terminal state
    disputed: ["completed", "refunded"], // Resolved by admin
  };

  if (!legalTransitions[currentStatus]) {
    return { valid: false, error: `Unknown current status: ${currentStatus}` };
  }

  if (!legalTransitions[currentStatus].includes(newStatus)) {
    return {
      valid: false,
      error: `Cannot transition from ${currentStatus} to ${newStatus}`,
    };
  }

  return { valid: true };
};

/**
 * Validate delivery deadline (must be in future)
 * @param {Date} deadline - Proposed deadline
 * @returns {object} - { valid: boolean, error?: string }
 */
exports.validateDeliveryDeadline = (deadline) => {
  const d = new Date(deadline);

  if (isNaN(d.getTime())) {
    return { valid: false, error: "Invalid date format" };
  }

  if (d <= new Date()) {
    return { valid: false, error: "Deadline must be in the future" };
  }

  // Max 90 days in future
  const maxFuture = new Date();
  maxFuture.setDate(maxFuture.getDate() + 90);

  if (d > maxFuture) {
    return {
      valid: false,
      error: "Deadline cannot exceed 90 days in the future",
    };
  }

  return { valid: true };
};

/**
 * Validate pagination parameters
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {object} - { valid: boolean, page: number, limit: number, error?: string }
 */
exports.validatePagination = (page = 1, limit = 20) => {
  const p = parseInt(page);
  const l = parseInt(limit);

  if (isNaN(p) || p < 1) {
    return { valid: false, error: "Page must be >= 1" };
  }

  if (isNaN(l) || l < 1) {
    return { valid: false, error: "Limit must be >= 1" };
  }

  if (l > 100) {
    return { valid: false, error: "Limit cannot exceed 100" };
  }

  return { valid: true, page: p, limit: l };
};

/**
 * Validate dispute reason
 * @param {string} reason - Dispute reason
 * @returns {object} - { valid: boolean, error?: string }
 */
exports.validateDisputeReason = (reason) => {
  const validReasons = [
    "not_delivered",
    "wrong_files",
    "quality_issue",
    "communication_issue",
    "other",
  ];

  if (!validReasons.includes(reason)) {
    return {
      valid: false,
      error: `Invalid reason. Must be one of: ${validReasons.join(", ")}`,
    };
  }

  return { valid: true };
};

/**
 * Validate service type
 * @param {string} type - Service type
 * @returns {object} - { valid: boolean, error?: string }
 */
exports.validateServiceType = (type) => {
  const validTypes = [
    "collaboration",
    "subscription",
    "loop_pack",
    "drum_kit",
    "preset_kit",
  ];

  if (!validTypes.includes(type)) {
    return {
      valid: false,
      error: `Invalid type. Must be one of: ${validTypes.join(", ")}`,
    };
  }

  return { valid: true };
};

/**
 * Validate text input (length, content)
 * @param {string} text - Text to validate
 * @param {object} options - { minLength?: 1, maxLength?: 5000, required?: true }
 * @returns {object} - { valid: boolean, error?: string }
 */
exports.validateText = (text, options = {}) => {
  const { minLength = 1, maxLength = 5000, required = true } = options;

  if (required && (!text || text.trim().length === 0)) {
    return { valid: false, error: "This field is required" };
  }

  if (!text) {
    return { valid: true }; // Not required and empty is ok
  }

  if (text.length < minLength) {
    return { valid: false, error: `Minimum length is ${minLength}` };
  }

  if (text.length > maxLength) {
    return { valid: false, error: `Maximum length is ${maxLength}` };
  }

  return { valid: true };
};

/**
 * Validate file upload (type, size)
 * @param {object} file - File object from multer { originalname, mimetype, size, buffer }
 * @param {object} options - { maxSizeBytes?: 100MB, allowedMimes?: [...] }
 * @returns {object} - { valid: boolean, error?: string }
 */
exports.validateFileUpload = (file, options = {}) => {
  const {
    maxSizeBytes = 100 * 1024 * 1024, // 100MB default
    allowedMimes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
      "audio/mpeg",
      "audio/wav",
      "audio/ogg",
      "audio/flac",
      "image/jpeg",
      "image/png",
      "image/gif",
      "video/mp4",
      "video/mpeg",
      "application/zip",
      "application/x-rar-compressed",
      "application/x-7z-compressed",
    ],
  } = options;

  if (!file) {
    return { valid: false, error: "File is required" };
  }

  // Check file size
  if (file.size > maxSizeBytes) {
    const maxMB = Math.round(maxSizeBytes / (1024 * 1024));
    return { valid: false, error: `File size exceeds limit (${maxMB}MB)` };
  }

  // Check MIME type
  if (!allowedMimes.includes(file.mimetype)) {
    return {
      valid: false,
      error: `File type not allowed: ${file.mimetype}. Allowed types: ${allowedMimes.join(", ")}`,
    };
  }

  // Check filename (prevent path traversal, etc)
  if (file.originalname.includes("..") || file.originalname.includes("/")) {
    return { valid: false, error: "Invalid filename" };
  }

  return { valid: true };
};

/**
 * Validate multiple file uploads
 * @param {array} files - Array of file objects from multer
 * @param {object} options - Same as validateFileUpload
 * @returns {object} - { valid: boolean, error?: string }
 */
exports.validateMultipleFileUploads = (files, options = {}) => {
  if (!Array.isArray(files) || files.length === 0) {
    return { valid: false, error: "At least one file is required" };
  }

  if (files.length > 50) {
    return { valid: false, error: "Maximum 50 files allowed per upload" };
  }

  // Validate each file
  for (let i = 0; i < files.length; i++) {
    const validation = exports.validateFileUpload(files[i], options);
    if (!validation.valid) {
      return { valid: false, error: `File ${i + 1}: ${validation.error}` };
    }
  }

  return { valid: true };
};

/**
 * Validate contract file (PDF/DOCX)
 * @param {object} file - File object from multer
 * @returns {object} - { valid: boolean, error?: string }
 */
exports.validateContractFile = (file) => {
  return exports.validateFileUpload(file, {
    maxSizeBytes: 10 * 1024 * 1024, // 10MB
    allowedMimes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  });
};

/**
 * Validate subscription pack files (audio/archive)
 * @param {object} file - File object from multer
 * @returns {object} - { valid: boolean, error?: string }
 */
exports.validateSubscriptionPackFile = (file) => {
  return exports.validateFileUpload(file, {
    maxSizeBytes:
      parseInt(process.env.MAX_FILE_SIZE_MB) * 1024 * 1024 ||
      1024 * 1024 * 1024, // From env
    allowedMimes: [
      "audio/mpeg",
      "audio/wav",
      "audio/ogg",
      "audio/flac",
      "application/zip",
      "application/x-rar-compressed",
      "application/x-7z-compressed",
    ],
  });
};
