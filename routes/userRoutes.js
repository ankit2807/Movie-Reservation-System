const router = require("express").Router();
const { register, login, logout, updateProfile } = require("../controller/userController");
const { verifyToken } = require("../utils/tokenVerification");
const { authLimiter } = require("../utils/rateLimiter");

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/logout", verifyToken, logout);
router.put("/profile", verifyToken, updateProfile);

module.exports = router;
