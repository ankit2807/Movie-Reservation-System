const multer = require("multer");
const router = require("express").Router();
const path = require("path");

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

// Multer upload configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1000000, // 1MB limit
  },
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|jfif)$/)) {
      return cb(
        new Error("Please upload a valid image file (jpg, jpeg, png, jfif)"),
        false
      );
    }
    cb(null, true);
  },
});

// Middleware to handle multer errors
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ message: "File size too large. Maximum size is 1MB." });
    }
  }
  if (
    error.message === "Please upload a valid image file (jpg, jpeg, png, jfif)"
  ) {
    return res.status(400).json({ message: error.message });
  }
  return res.status(500).json({ message: "File upload error" });
};

// Upload route
router.post("/", upload.array("image", 10), (req, res) => {
  // Allow up to 10 images
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "No files uploaded" });
  }
  res
    .status(200)
    .json({ message: "Images uploaded successfully", files: req.files });
});

// Apply error handling middleware
router.use(handleMulterError);

module.exports = router;
