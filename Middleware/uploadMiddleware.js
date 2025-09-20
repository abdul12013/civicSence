// upload.js (ESM)

import multer from "multer";

// Configure storage (save files to local disk under /uploads)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

// Create multer instance
const upload = multer({ storage });

export default upload;
