"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const tokenVerification_1 = require("./tokenVerification");
const router = express_1.default.Router();
const projectRoot = fs_1.default.existsSync(path_1.default.resolve(__dirname, "..", "package.json"))
    ? path_1.default.resolve(__dirname, "..")
    : path_1.default.resolve(__dirname, "..", "..");
const uploadDir = path_1.default.join(projectRoot, "public");
fs_1.default.mkdirSync(uploadDir, { recursive: true });
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
        const fd = fs_1.default.openSync(filePath, "r");
        const header = Buffer.alloc(12);
        const bytesRead = fs_1.default.readSync(fd, header, 0, 12, 0);
        fs_1.default.closeSync(fd);
        if (bytesRead < 4)
            return false;
        // JPEG / JFIF: FF D8 FF
        if (header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff) {
            return true;
        }
        // PNG: 89 50 4E 47 0D 0A 1A 0A
        if (bytesRead >= 8 &&
            header[0] === 0x89 &&
            header[1] === 0x50 &&
            header[2] === 0x4e &&
            header[3] === 0x47 &&
            header[4] === 0x0d &&
            header[5] === 0x0a &&
            header[6] === 0x1a &&
            header[7] === 0x0a) {
            return true;
        }
        // WEBP: "RIFF" .... "WEBP"
        if (bytesRead >= 12 &&
            header.subarray(0, 4).toString("ascii") === "RIFF" &&
            header.subarray(8, 12).toString("ascii") === "WEBP") {
            return true;
        }
        return false;
    }
    catch {
        return false;
    }
};
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname || "").toLowerCase();
        cb(null, `image_${Date.now()}_${crypto_1.default.randomUUID().slice(0, 8)}${ext}`);
    },
});
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 1000000, // 1MB limit
        files: 10,
    },
    fileFilter: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname || "");
        if (!ALLOWED_EXT.test(ext) || !file.mimetype || !ALLOWED_MIME.has(file.mimetype.toLowerCase())) {
            cb(new Error("Please upload a valid image file (jpg, jpeg, png, jfif, webp)"));
            return;
        }
        cb(null, true);
    },
});
const uploadMiddleware = upload.array("image", 10);
// Require authenticated admin session to upload server media
router.post("/", tokenVerification_1.verifyTokenAndAdmin, (req, res) => {
    uploadMiddleware(req, res, (err) => {
        if (err) {
            if (err instanceof multer_1.default.MulterError && err.code === "LIMIT_FILE_SIZE") {
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
                        fs_1.default.unlinkSync(cleanupFile.path);
                    }
                    catch {
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
exports.default = router;
//# sourceMappingURL=imageUpload.js.map