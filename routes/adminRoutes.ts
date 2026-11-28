import express from "express";
import { register, login, getDashboardStats } from "../controller/adminController";
import { authLimiter } from "../utils/rateLimiter";
import { verifyTokenAndAdmin } from "../utils/tokenVerification";

const router = express.Router();

// Creating additional admins requires an authenticated admin token
router.post("/register", authLimiter, verifyTokenAndAdmin, register);
router.post("/login", authLimiter, login);
router.get("/stats", verifyTokenAndAdmin, getDashboardStats);

export default router;
