const router = require("express").Router();
const { register, login, logout } = require("../controller/adminController");
const { verifyTokenAndAdmin } = require("../utils/tokenVerification");

// Register a new admin
router.post("/register", register);

// Login admin
router.post("/login", login);

// Logout admin (requires admin token)
router.post("/logout", verifyTokenAndAdmin, logout);

module.exports = router;
