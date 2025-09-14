import multer from "multer";
import cloudinary from "../config/cloudinary.config.js";
import stream from "stream";

const uploadToCloudinary = (
  fileBuffer,
  filename,
  folder = "civic-issues",
  resourceType = "auto"
) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        public_id: filename.replace(/\.[^/.]+$/, ""), // remove extension
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileBuffer);
    bufferStream.pipe(uploadStream);
  });
};

// Multer setup for memory storage (since we upload to Cloudinary directly)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Middleware to handle uploads and get URLs
const handleUploads = async (req, res, next) => {
  if (!req.files) return next();

  try {
    const photoUrls = [];

    if (req.files.photos) {
      for (const photo of req.files.photos) {
        const result = await uploadToCloudinary(
          photo.buffer,
          photo.originalname,
          "civic-issues",
          "image"
        );
        photoUrls.push(result.secure_url);
      }
      req.body.photoUrl = photoUrls;
    }

    if (req.files.audio) {
      const audio = req.files.audio[0];
      const result = await uploadToCloudinary(
        audio.buffer,
        audio.originalname,
        "civic-issues",
        "video"
      ); // audio as video type for Cloudinary
      req.body.audioUrl = result.secure_url;
    }

    next();
  } catch (err) {
    res.status(500).json({ err: "Upload failed" });
  }
};

export { upload, handleUploads };
