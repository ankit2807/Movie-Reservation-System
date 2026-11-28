const router = require("express").Router();
const { register, login, logout, getMe, getSession, updateProfile } = require("../controller/userController");
const { verifyToken } = require("../utils/tokenVerification");
const { authLimiter } = require("../utils/rateLimiter");

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/logout", logout);
router.get("/session", getSession);
router.get("/me", verifyToken, getMe);
router.put("/profile", verifyToken, updateProfile);

module.exports = router;
