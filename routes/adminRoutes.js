const express = require("express");
const { register, login, getDashboardStats } = require("../controller/adminController");
const { authLimiter } = require("../utils/rateLimiter");
const { verifyTokenAndAdmin } = require("../utils/tokenVerification");

const router = express.Router();

// Creating additional admins requires an authenticated admin token
router.post("/register", authLimiter, verifyTokenAndAdmin, register);
router.post("/login", authLimiter, login);
router.get("/stats", verifyTokenAndAdmin, getDashboardStats);

module.exports = router;
