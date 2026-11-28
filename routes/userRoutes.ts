import express from "express";
import { register, login, logout, getMe, getSession, updateProfile } from "../controller/userController";
import { verifyToken } from "../utils/tokenVerification";
import { authLimiter } from "../utils/rateLimiter";

const router = express.Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/logout", logout);
router.get("/session", getSession);
router.get("/me", verifyToken, getMe);
router.put("/profile", verifyToken, updateProfile);

export default router;
