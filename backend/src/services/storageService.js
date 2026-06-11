const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const path = require("path");
const fs = require("fs");

let s3Client = null;
const bucketName = process.env.R2_BUCKET_NAME;

// Initialize Cloudflare R2 client using S3-compatible API
if (
  process.env.R2_ACCOUNT_ID &&
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_SECRET_ACCESS_KEY &&
  bucketName
) {
  try {
    s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });
    console.log("Cloudflare R2 Storage client initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize Cloudflare R2 client:", error.message);
  }
} else {
  console.log("R2 credentials not found. Falling back to local storage service.");
}

/**
 * Uploads a local file to Cloudflare R2 or keeps it locally if R2 is not configured
 * @param {Object} file - Multer file object
 * @returns {Promise<string>} - The public URL or local path of the uploaded file
 */
const uploadFile = async (file) => {
  if (!file) {
    throw new Error("No file provided for upload");
  }

  // If R2 is configured, upload to bucket
  if (s3Client && bucketName) {
    try {
      const destination = `materials/${Date.now()}_${path.basename(file.originalname)}`;
      const fileStream = fs.createReadStream(file.path);
      
      const uploadParams = {
        Bucket: bucketName,
        Key: destination,
        Body: fileStream,
        ContentType: file.mimetype,
      };

      await s3Client.send(new PutObjectCommand(uploadParams));

      // Construct public URL (using R2 Public Domain or Custom Domain)
      // Custom Domain/Public URL format: e.g. https://pub-xxx.r2.dev/materials/xxx.pdf
      const r2PublicUrl = process.env.R2_PUBLIC_URL || "https://pub-dummy.r2.dev";
      const publicUrl = `${r2PublicUrl.replace(/\/$/, "")}/${destination}`;
      
      // Clean up local temp file created by multer
      fs.unlink(file.path, (err) => {
        if (err) console.error("Error removing local temp file after R2 upload:", err.message);
      });

      return publicUrl;
    } catch (error) {
      console.error("Failed to upload file to Cloudflare R2, falling back to local file path:", error.message);
      // Fallback to local path if upload fails
      return file.path;
    }
  }

  // Local storage: return the relative path (replacing backslashes for URL consistency)
  return file.path.replace(/\\/g, "/");
};

/**
 * Deletes a file from Cloudflare R2 or local filesystem
 * @param {string} fileUrl - The URL or local path of the file to delete
 * @returns {Promise<boolean>} - True if successfully deleted
 */
const deleteFile = async (fileUrl) => {
  if (!fileUrl) return false;

  const r2PublicUrl = process.env.R2_PUBLIC_URL || "r2.dev";

  // Check if it is a Cloudflare R2 url
  if (fileUrl.includes(r2PublicUrl) || (fileUrl.startsWith("http") && !fileUrl.includes("localhost"))) {
    if (s3Client && bucketName) {
      try {
        // Extract Key (filename) from the URL
        const urlObj = new URL(fileUrl);
        const key = urlObj.pathname.substring(1); // remove leading '/'

        const deleteParams = {
          Bucket: bucketName,
          Key: key,
        };

        await s3Client.send(new DeleteObjectCommand(deleteParams));
        console.log(`Successfully deleted file from R2 bucket: ${key}`);
        return true;
      } catch (error) {
        console.error("Failed to delete file from Cloudflare R2 bucket:", error.message);
        return false;
      }
    } else {
      console.warn("File was stored in R2 but R2 credentials are no longer configured.");
      return false;
    }
  }

  // Local storage delete
  try {
    const fullPath = path.resolve(__dirname, "../../../", fileUrl);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`Successfully deleted local file: ${fileUrl}`);
      return true;
    }
  } catch (error) {
    console.error(`Failed to delete local file ${fileUrl}:`, error.message);
    return false;
  }

  return false;
};

module.exports = {
  uploadFile,
  deleteFile,
};
