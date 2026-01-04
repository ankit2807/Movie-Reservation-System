const router = require("express").Router();
const { register, login, logout, updateProfile } = require("../controller/userController");
const { verifyToken } = require("../utils/tokenVerification");

// Register a new user
router.post("/register", register);

const { authLimiter } = require("../utils/rateLimiter");

// Login user
router.post("/login", authLimiter, login);

// Logout user (requires user token)
router.post("/logout", verifyToken, logout);

// Update user profile
router.put("/profile", verifyToken, updateProfile);

module.exports = router;
