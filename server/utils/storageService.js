// utils/storageService.js
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const crypto = require("crypto");

// Initialize R2 client
const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Upload file to R2
 * @param {Buffer} fileBuffer - File data
 * @param {String} originalName - Original filename
 * @param {String} mimeType - File MIME type
 * @returns {Promise<Object>} - File URL and metadata
 */
exports.uploadFile = async (fileBuffer, originalName, mimeType) => {
  try {
    // Generate unique filename
    const fileExtension = originalName.split(".").pop();
    const uniqueFileName = `${crypto
      .randomBytes(16)
      .toString("hex")}-${Date.now()}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: uniqueFileName,
      Body: fileBuffer,
      ContentType: mimeType,
      Metadata: {
        originalName: originalName,
      },
    });

    await s3Client.send(command);

    // Construct file URL (for internal reference)
    const fileUrl = `${process.env.R2_ENDPOINT}/${process.env.R2_BUCKET_NAME}/${uniqueFileName}`;

    return {
      success: true,
      key: uniqueFileName,
      url: fileUrl,
      originalName: originalName,
      size: fileBuffer.length,
      mimeType: mimeType,
    };
  } catch (error) {
    console.error("Upload Error:", error);
    throw new Error("Failed to upload file to storage");
  }
};

/**
 * Generate presigned download URL (expires in 1 hour)
 * @param {String} fileKey - File key in R2
 * @returns {Promise<String>} - Presigned URL
 */
exports.getDownloadUrl = async (fileKey) => {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileKey,
    });

    // Generate presigned URL that expires in 1 hour
    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    return presignedUrl;
  } catch (error) {
    console.error("Get Download URL Error:", error);
    throw new Error("Failed to generate download URL");
  }
};

/**
 * Delete file from R2
 * @param {String} fileKey - File key in R2
 * @returns {Promise<Boolean>} - Success status
 */
exports.deleteFile = async (fileKey) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileKey,
    });

    await s3Client.send(command);

    return true;
  } catch (error) {
    console.error("Delete File Error:", error);
    throw new Error("Failed to delete file from storage");
  }
};

/**
 * Upload multiple files
 * @param {Array} files - Array of file objects {buffer, originalName, mimeType}
 * @returns {Promise<Array>} - Array of uploaded file data
 */
exports.uploadMultipleFiles = async (files) => {
  try {
    const uploadPromises = files.map((file) =>
      this.uploadFile(file.buffer, file.originalName, file.mimeType)
    );

    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error("Upload Multiple Files Error:", error);
    throw new Error("Failed to upload files");
  }
};
