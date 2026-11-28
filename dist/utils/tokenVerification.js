"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTokenAndAdmin = exports.verifyTokenAndAuthorization = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateRequest = (req, res) => {
    const token = req.cookies?.access_token;
    if (!token || typeof token !== "string") {
        res.status(401).json({ message: "You are not authenticated!" });
        return null;
    }
    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            res.status(500).json({ message: "Authentication secret not configured" });
            return null;
        }
        const decoded = jsonwebtoken_1.default.verify(token, secret, {
            algorithms: ["HS256"],
        });
        if (typeof decoded === "string" || !decoded || typeof decoded !== "object") {
            res.status(403).json({ message: "Invalid token!" });
            return null;
        }
        const user = decoded;
        req.user = user;
        return user;
    }
    catch (err) {
        const errorName = err instanceof Error ? err.name : "";
        if (errorName === "TokenExpiredError") {
            res.status(401).json({ message: "Token expired!" });
            return null;
        }
        res.status(403).json({ message: "Invalid token!" });
        return null;
    }
};
/**
 * Middleware to verify JWT token from cookies.
 */
const verifyToken = (req, res, next) => {
    const user = authenticateRequest(req, res);
    if (user)
        next();
};
exports.verifyToken = verifyToken;
/**
 * Middleware to verify token and check user authorization.
 */
const verifyTokenAndAuthorization = (req, res, next) => {
    const user = authenticateRequest(req, res);
    if (!user)
        return;
    if (String(user.id) === String(req.params.id) || user.isAdmin) {
        next();
    }
    else {
        res.status(403).json({ message: "Not allowed!" });
    }
};
exports.verifyTokenAndAuthorization = verifyTokenAndAuthorization;
/**
 * Middleware to verify token and check if user is admin.
 */
const verifyTokenAndAdmin = (req, res, next) => {
    const user = authenticateRequest(req, res);
    if (!user)
        return;
    if (user.isAdmin) {
        next();
    }
    else {
        res.status(403).json({ message: "Not allowed!" });
    }
};
exports.verifyTokenAndAdmin = verifyTokenAndAdmin;
//# sourceMappingURL=tokenVerification.js.map