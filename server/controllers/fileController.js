// controllers/fileController.js
const storageService = require("../utils/storageService");

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

    // Upload to R2
    const result = await storageService.uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    res.status(201).json({
      success: true,
      file: {
        key: result.key,
        originalName: result.originalName,
        size: result.size,
        mimeType: result.mimeType,
        uploadedBy: req.user.id,
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

    // Prepare files for upload
    const filesToUpload = req.files.map((file) => ({
      buffer: file.buffer,
      originalName: file.originalname,
      mimeType: file.mimetype,
    }));

    // Upload all files
    const results = await storageService.uploadMultipleFiles(filesToUpload);

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

    // TODO: Add ownership/access verification here
    // Check if user has purchased the file or owns it

    // Generate presigned URL
    const downloadUrl = await storageService.getDownloadUrl(fileKey);

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
// @access  Private
exports.deleteFile = async (req, res) => {
  try {
    const { fileKey } = req.params;

    if (!fileKey) {
      return res.status(400).json({
        success: false,
        error: "File key is required",
      });
    }

    // TODO: Add ownership verification
    // Check if user owns this file

    // Delete from R2
    await storageService.deleteFile(fileKey);

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

    // TODO: Retrieve file metadata from database
    // For now, just return the key

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
