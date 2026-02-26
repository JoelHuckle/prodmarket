// controllers/fileController.js
const storageService = require("../utils/storageService");
const { Order, Service, FileRecord } = require("../models");
const { Op } = require("sequelize");
const validator = require("../utils/validator");
const auditLog = require("../utils/auditLog");
const { scanFileAsync } = require("../utils/virusScanner");

/**
 * Check if a user has access to a file by verifying they either:
 * - Own the file (uploaded as a seller's service)
 * - Purchased access via a completed/delivered order
 */
const verifyFileAccess = async (fileKey, userId) => {
  // Check if user is seller of a service containing this file
  const service = await Service.findOne({
    where: {
      seller_id: userId,
      file_urls: { [Op.ne]: null },
    },
  });
  if (service && service.file_urls) {
    const urls = Array.isArray(service.file_urls) ? service.file_urls : [];
    if (urls.some((url) => url.includes(fileKey))) {
      return { hasAccess: true, role: "seller" };
    }
  }

  // Check if user is buyer/seller of an order containing this file.
  // Sellers can access files from in_progress onwards (they need to work on them).
  // Buyers only get access once the order is delivered or completed.
  const order = await Order.findOne({
    where: {
      [Op.or]: [
        {
          seller_id: userId,
          status: { [Op.in]: ["in_progress", "awaiting_delivery", "delivered", "completed"] },
        },
        {
          buyer_id: userId,
          status: { [Op.in]: ["delivered", "completed"] },
        },
      ],
    },
  });
  if (order) {
    const buyerFiles = Array.isArray(order.buyer_files)
      ? order.buyer_files
      : [];
    const sellerFiles = Array.isArray(order.seller_files)
      ? order.seller_files
      : [];
    const allFiles = [...buyerFiles, ...sellerFiles];
    if (
      allFiles.some((f) =>
        (typeof f === "string" ? f : f.key || "").includes(fileKey),
      )
    ) {
      return {
        hasAccess: true,
        role: order.buyer_id === userId ? "buyer" : "seller",
      };
    }
  }

  return { hasAccess: false, role: null };
};

// @desc    Upload single file
// @route   POST /api/files/upload
// @access  Private
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file provided",
      });
    }

    // Validate file
    const fileValidation = validator.validateFileUpload(req.file);
    if (!fileValidation.valid) {
      return res.status(400).json({
        success: false,
        error: fileValidation.error,
      });
    }

    // Upload to R2
    const result = await storageService.uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
    );

    // Create file record (tracks scan status)
    await FileRecord.create({
      file_key: result.key,
      original_name: result.originalName,
      mime_type: result.mimeType,
      size: result.size,
      uploaded_by: req.user.id,
      scan_status: "pending",
    });

    // Trigger async virus scan (non-blocking)
    scanFileAsync(req.file.buffer, req.file.originalname, result.key);

    // Log file upload
    auditLog.logFileAccessed(result.key, req.user.id, "upload", req);

    res.status(201).json({
      success: true,
      file: {
        key: result.key,
        originalName: result.originalName,
        size: result.size,
        mimeType: result.mimeType,
        uploadedBy: req.user.id,
        scan_status: "pending",
      },
      message: "File uploaded successfully",
    });
  } catch (error) {
    console.error("Upload File Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to upload file",
    });
  }
};

// @desc    Upload multiple files
// @route   POST /api/files/upload-multiple
// @access  Private
exports.uploadMultipleFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No files provided",
      });
    }

    // Validate all files
    const fileValidation = validator.validateMultipleFileUploads(req.files);
    if (!fileValidation.valid) {
      return res.status(400).json({
        success: false,
        error: fileValidation.error,
      });
    }

    // Prepare files for upload
    const filesToUpload = req.files.map((file) => ({
      buffer: file.buffer,
      originalName: file.originalname,
      mimeType: file.mimetype,
    }));

    // Upload all files
    const results = await storageService.uploadMultipleFiles(filesToUpload);

    // Log file uploads
    results.forEach((result) => {
      auditLog.logFileAccessed(result.key, req.user.id, "upload");
    });

    res.status(201).json({
      success: true,
      files: results.map((result) => ({
        key: result.key,
        originalName: result.originalName,
        size: result.size,
        mimeType: result.mimeType,
      })),
      count: results.length,
      message: `${results.length} files uploaded successfully`,
    });
  } catch (error) {
    console.error("Upload Multiple Files Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to upload files",
    });
  }
};

// @desc    Get download URL for a file
// @route   GET /api/files/download/:fileKey
// @access  Private
exports.getDownloadUrl = async (req, res) => {
  try {
    const { fileKey } = req.params;

    if (!fileKey) {
      return res.status(400).json({
        success: false,
        error: "File key is required",
      });
    }

    // Verify user has access to this file
    const { hasAccess } = await verifyFileAccess(fileKey, req.user.id);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: "You do not have access to this file",
      });
    }

    // Block download if file has been flagged by virus scanner
    const fileRecord = await FileRecord.findOne({ where: { file_key: fileKey } });
    if (fileRecord && fileRecord.scan_status === "flagged") {
      return res.status(403).json({
        success: false,
        error: "This file has been flagged and is unavailable for download.",
      });
    }

    // Generate presigned URL
    const downloadUrl = await storageService.getDownloadUrl(fileKey);

    // Log file download
    auditLog.logFileAccessed(fileKey, req.user.id, "download", req);

    res.status(200).json({
      success: true,
      downloadUrl,
      expiresIn: "1 hour",
      message: "Download URL generated successfully",
    });
  } catch (error) {
    console.error("Get Download URL Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate download URL",
    });
  }
};

// @desc    Delete file
// @route   DELETE /api/files/:fileKey
// @access  Private (owner only)
exports.deleteFile = async (req, res) => {
  try {
    const { fileKey } = req.params;

    if (!fileKey) {
      return res.status(400).json({
        success: false,
        error: "File key is required",
      });
    }

    // Only sellers who own the file can delete it
    const { hasAccess, role } = await verifyFileAccess(fileKey, req.user.id);
    if (!hasAccess || role !== "seller") {
      return res.status(403).json({
        success: false,
        error: "You do not have permission to delete this file",
      });
    }

    // Delete from R2
    await storageService.deleteFile(fileKey);

    // Log file deletion
    auditLog.logFileAccessed(fileKey, req.user.id, "delete", req);

    res.status(200).json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("Delete File Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete file",
    });
  }
};

// @desc    Get file info
// @route   GET /api/files/info/:fileKey
// @access  Private
exports.getFileInfo = async (req, res) => {
  try {
    const { fileKey } = req.params;

    // Verify user has access
    const { hasAccess } = await verifyFileAccess(fileKey, req.user.id);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: "You do not have access to this file",
      });
    }

    res.status(200).json({
      success: true,
      file: {
        key: fileKey,
        message: "File exists in storage",
      },
    });
  } catch (error) {
    console.error("Get File Info Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get file info",
    });
  }
};
