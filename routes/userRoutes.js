const router = require("express").Router();
const { register, login, logout } = require("../controller/userController");
const { verifyToken } = require("../utils/tokenVerification");

// Register a new user
router.post("/register", register);

// Login user
router.post("/login", login);

// Logout user (requires user token)
router.post("/logout", verifyToken, logout);

module.exports = router;
