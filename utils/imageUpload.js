const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
const router = require("express").Router();
const { verifyTokenAndAdmin } = require("./tokenVerification");

const uploadDir = path.resolve(__dirname, "..", "public");
fs.mkdirSync(uploadDir, { recursive: true });

const ALLOWED_EXT = /^\.(jpe?g|png|jfif|webp)$/i;
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

// Verify actual file magic bytes on disk to prevent MIME/extension spoofing
const hasValidImageMagicBytes = (filePath) => {
  try {
    const fd = fs.openSync(filePath, "r");
    const header = Buffer.alloc(12);
    const bytesRead = fs.readSync(fd, header, 0, 12, 0);
    fs.closeSync(fd);
    if (bytesRead < 4) return false;

    // JPEG / JFIF: FF D8 FF
    if (header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff) {
      return true;
    }
    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (
      bytesRead >= 8 &&
      header[0] === 0x89 &&
      header[1] === 0x50 &&
      header[2] === 0x4e &&
      header[3] === 0x47 &&
      header[4] === 0x0d &&
      header[5] === 0x0a &&
      header[6] === 0x1a &&
      header[7] === 0x0a
    ) {
      return true;
    }
    // WEBP: "RIFF" .... "WEBP"
    if (
      bytesRead >= 12 &&
      header.subarray(0, 4).toString("ascii") === "RIFF" &&
      header.subarray(8, 12).toString("ascii") === "WEBP"
    ) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

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
    files: 10,
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    if (!ALLOWED_EXT.test(ext) || !file.mimetype || !ALLOWED_MIME.has(file.mimetype.toLowerCase())) {
      return cb(new Error("Please upload a valid image file (jpg, jpeg, png, jfif, webp)"), false);
    }
    cb(null, true);
  },
});

const uploadMiddleware = upload.array("image", 10);

// Require authenticated admin session to upload server media
router.post("/", verifyTokenAndAdmin, (req, res) => {
  uploadMiddleware(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "File size too large. Maximum size is 1MB." });
      }
      if (err.message?.startsWith("Please upload a valid image file")) {
        return res.status(400).json({ message: err.message });
      }
      return res.status(400).json({ message: "File upload error" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    for (const f of req.files) {
      if (!hasValidImageMagicBytes(f.path)) {
        for (const cleanupFile of req.files) {
          try {
            fs.unlinkSync(cleanupFile.path);
          } catch {
            // ignore cleanup errors
          }
        }
        return res.status(400).json({ message: "Invalid or corrupted image file content" });
      }
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
