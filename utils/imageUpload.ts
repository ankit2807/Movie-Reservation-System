import fs from "fs";
import path from "path";
import crypto from "crypto";
import express, { Request, Response } from "express";
import multer from "multer";
import { verifyTokenAndAdmin } from "./tokenVerification";

const router = express.Router();

const projectRoot = fs.existsSync(path.resolve(__dirname, "..", "package.json"))
  ? path.resolve(__dirname, "..")
  : path.resolve(__dirname, "..", "..");

const uploadDir = path.join(projectRoot, "public");
fs.mkdirSync(uploadDir, { recursive: true });

const ALLOWED_EXT = /^\.(jpe?g|png|jfif|webp)$/i;
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

// Verify actual file magic bytes on disk to prevent MIME/extension spoofing
const hasValidImageMagicBytes = (filePath: string): boolean => {
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
      cb(new Error("Please upload a valid image file (jpg, jpeg, png, jfif, webp)"));
      return;
    }
    cb(null, true);
  },
});

const uploadMiddleware = upload.array("image", 10);

// Require authenticated admin session to upload server media
router.post("/", verifyTokenAndAdmin, (req: Request, res: Response) => {
  uploadMiddleware(req, res, (err: unknown) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
        res.status(400).json({ message: "File size too large. Maximum size is 1MB." });
        return;
      }
      if (err instanceof Error && err.message.startsWith("Please upload a valid image file")) {
        res.status(400).json({ message: err.message });
        return;
      }
      res.status(400).json({ message: "File upload error" });
      return;
    }

    const uploadedFiles = Array.isArray(req.files) ? req.files : [];
    if (uploadedFiles.length === 0) {
      res.status(400).json({ message: "No files uploaded" });
      return;
    }

    for (const f of uploadedFiles) {
      if (!hasValidImageMagicBytes(f.path)) {
        for (const cleanupFile of uploadedFiles) {
          try {
            fs.unlinkSync(cleanupFile.path);
          } catch {
            // ignore cleanup errors
          }
        }
        res.status(400).json({ message: "Invalid or corrupted image file content" });
        return;
      }
    }

    res.status(200).json({
      message: "Images uploaded successfully",
      files: uploadedFiles.map((f) => ({
        filename: f.filename,
        size: f.size,
        mimetype: f.mimetype,
        url: `/public/${f.filename}`,
      })),
    });
  });
});

export default router;
