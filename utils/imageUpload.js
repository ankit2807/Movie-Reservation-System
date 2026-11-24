const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
const router = require("express").Router();

const uploadDir = path.resolve(__dirname, "..", "public");
fs.mkdirSync(uploadDir, { recursive: true });

const ALLOWED_EXT = /^\.(jpe?g|png|jfif|webp)$/i;
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    cb(null, `image_${Date.now()}_${crypto.randomUUID().slice(0, 8)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 1000000, // 1MB limit
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    if (!ALLOWED_EXT.test(ext) || (file.mimetype && !ALLOWED_MIME.has(file.mimetype.toLowerCase()))) {
      return cb(new Error("Please upload a valid image file (jpg, jpeg, png, jfif, webp)"), false);
    }
    cb(null, true);
  },
});

const uploadMiddleware = upload.array("image", 10);

router.post("/", (req, res) => {
  uploadMiddleware(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "File size too large. Maximum size is 1MB." });
      }
      if (err.message?.startsWith("Please upload a valid image file")) {
        return res.status(400).json({ message: err.message });
      }
      return res.status(400).json({ message: err.message || "File upload error" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    return res.status(200).json({
      message: "Images uploaded successfully",
      files: req.files.map((f) => ({
        filename: f.filename,
        size: f.size,
        mimetype: f.mimetype,
        url: `/public/${f.filename}`,
      })),
    });
  });
});

module.exports = router;
