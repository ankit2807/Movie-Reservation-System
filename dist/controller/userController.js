"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.logout = exports.getSession = exports.getMe = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const validator_1 = __importDefault(require("validator"));
const userModel_1 = __importDefault(require("../models/userModel"));
const adminModel_1 = __importDefault(require("../models/adminModel"));
const getAuthCookieOptions = (maxAgeMs) => {
    const isProd = process.env.NODE_ENV === "production";
    const isSecure = process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === "true" : isProd;
    const crossOrigin = isSecure && process.env.CROSS_ORIGIN_AUTH === "true";
    const opts = {
        httpOnly: true,
        secure: isSecure,
        sameSite: crossOrigin ? "none" : "lax",
    };
    if (typeof maxAgeMs === "number") {
        opts.maxAge = maxAgeMs;
    }
    return opts;
};
const normalizePhone = (rawPhone) => {
    const digits = String(rawPhone || "").replace(/\D/g, "");
    if (digits.length === 12 && digits.startsWith("91")) {
        return digits.slice(2);
    }
    if (digits.length === 11 && digits.startsWith("0")) {
        return digits.slice(1);
    }
    return digits;
};
const sanitizeUserPayload = (doc) => {
    const obj = doc.toObject();
    delete obj.password;
    return obj;
};
/**
 * Register a new user.
 */
const register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        if (!name || !email || !password || !phone) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const cleanEmail = String(email).trim().toLowerCase();
        if (!validator_1.default.isEmail(cleanEmail)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
        const cleanPassword = String(password);
        if (cleanPassword.length < 7) {
            return res.status(400).json({ message: "Password must be at least 7 characters long" });
        }
        if (cleanPassword.toLowerCase().includes("password")) {
            return res.status(400).json({ message: 'Password cannot contain the word "password"' });
        }
        const cleanPhone = normalizePhone(phone);
        if (!/^\d{10}$/.test(cleanPhone)) {
            return res.status(400).json({ message: "Phone number must be a valid 10-digit number" });
        }
        const existingUser = await userModel_1.default.findOne({ email: cleanEmail });
        if (existingUser) {
            return res.status(409).json({ message: "Email already exists" });
        }
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(cleanPassword, salt);
        const newUser = new userModel_1.default({
            name: String(name).trim(),
            email: cleanEmail,
            password: hashedPassword,
            phone: cleanPhone,
        });
        const savedUser = await newUser.save();
        return res.status(201).json(sanitizeUserPayload(savedUser));
    }
    catch (err) {
        console.error("Registration error:", err);
        const e = err;
        if (e.name === "ValidationError") {
            return res.status(400).json({ message: e.message || "Validation error" });
        }
        if (e.code === 11000) {
            return res.status(409).json({ message: "Email already exists" });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.register = register;
/**
 * Login a user.
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        const cleanEmail = String(email).trim().toLowerCase();
        const user = await userModel_1.default.findOne({ email: cleanEmail });
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }
        const validated = await bcrypt_1.default.compare(String(password), user.password);
        if (!validated) {
            return res.status(401).json({ message: "Incorrect password" });
        }
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            return res.status(500).json({ message: "JWT secret not configured" });
        }
        const token = jsonwebtoken_1.default.sign({ id: String(user._id), isAdmin: false }, secret, { algorithm: "HS256", expiresIn: "7d" });
        const userDetails = sanitizeUserPayload(user);
        return res
            .cookie("access_token", token, getAuthCookieOptions(7 * 24 * 60 * 60 * 1000))
            .status(200)
            .json({ ...userDetails, isAdmin: false });
    }
    catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.login = login;
/**
 * Verify current authenticated user or admin from JWT cookie.
 */
const getMe = async (req, res) => {
    try {
        if (req.user?.isAdmin) {
            const admin = await adminModel_1.default.findById(req.user.id).select("-password");
            if (!admin) {
                return res.status(401).json({ message: "Session invalid" });
            }
            return res.status(200).json({
                _id: String(admin._id),
                email: admin.email,
                name: admin.name,
                isAdmin: true,
                role: "admin",
            });
        }
        const user = await userModel_1.default.findById(req.user?.id).select("-password");
        if (!user) {
            return res.status(401).json({ message: "Session invalid" });
        }
        return res.status(200).json({
            ...sanitizeUserPayload(user),
            isAdmin: false,
        });
    }
    catch (err) {
        console.error("Session check error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.getMe = getMe;
/**
 * Non-throwing session check for frontend page refresh restoration (returns 200 for both guests & signed-in users).
 */
const getSession = async (req, res) => {
    try {
        const token = req.cookies?.access_token;
        if (!token || typeof token !== "string") {
            return res.status(200).json({ authenticated: false, user: null });
        }
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            return res.status(200).json({ authenticated: false, user: null });
        }
        let decoded;
        try {
            const verified = jsonwebtoken_1.default.verify(token, secret, { algorithms: ["HS256"] });
            if (typeof verified === "string" || !verified) {
                res.clearCookie("access_token", getAuthCookieOptions());
                return res.status(200).json({ authenticated: false, user: null });
            }
            decoded = verified;
        }
        catch {
            res.clearCookie("access_token", getAuthCookieOptions());
            return res.status(200).json({ authenticated: false, user: null });
        }
        if (decoded.isAdmin) {
            const admin = await adminModel_1.default.findById(decoded.id).select("-password");
            if (!admin) {
                res.clearCookie("access_token", getAuthCookieOptions());
                return res.status(200).json({ authenticated: false, user: null });
            }
            return res.status(200).json({
                authenticated: true,
                user: {
                    _id: String(admin._id),
                    email: admin.email,
                    name: admin.name,
                    isAdmin: true,
                    role: "admin",
                },
            });
        }
        const user = await userModel_1.default.findById(decoded.id).select("-password");
        if (!user) {
            res.clearCookie("access_token", getAuthCookieOptions());
            return res.status(200).json({ authenticated: false, user: null });
        }
        return res.status(200).json({
            authenticated: true,
            user: {
                ...sanitizeUserPayload(user),
                isAdmin: false,
            },
        });
    }
    catch (err) {
        console.error("Session restore error:", err);
        return res.status(200).json({ authenticated: false, user: null });
    }
};
exports.getSession = getSession;
/**
 * Logout a user (idempotent — always clears auth cookie).
 */
const logout = async (_req, res) => {
    try {
        res.clearCookie("access_token", getAuthCookieOptions());
        return res.status(200).json({ message: "Logged out successfully" });
    }
    catch (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "An error occurred during logout" });
    }
};
exports.logout = logout;
/**
 * Update user profile.
 */
const updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, phone, gender, isMarried, birthday } = req.body;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "You are not authenticated!" });
        }
        const updateFields = {};
        if (typeof firstName === "string")
            updateFields.firstName = firstName.trim().slice(0, 40);
        if (typeof lastName === "string")
            updateFields.lastName = lastName.trim().slice(0, 40);
        const combinedName = [updateFields.firstName, updateFields.lastName]
            .filter(Boolean)
            .join(" ")
            .trim();
        if (combinedName.length >= 2) {
            updateFields.name = combinedName.slice(0, 50);
        }
        if (phone !== undefined && String(phone).trim() !== "") {
            const cleanPhone = normalizePhone(phone);
            if (!/^\d{10}$/.test(cleanPhone)) {
                return res.status(400).json({ message: "Phone number must be a valid 10-digit number" });
            }
            updateFields.phone = cleanPhone;
        }
        if (gender === "Male" || gender === "Female" || gender === "Other") {
            updateFields.gender = gender;
        }
        if (typeof isMarried === "boolean") {
            updateFields.isMarried = isMarried;
        }
        if (typeof birthday === "string") {
            updateFields.birthday = birthday.trim().slice(0, 20);
        }
        const updatedUser = await userModel_1.default.findByIdAndUpdate(userId, { $set: updateFields }, { new: true, runValidators: true }).select("-password");
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({
            ...sanitizeUserPayload(updatedUser),
            isAdmin: false,
        });
    }
    catch (err) {
        console.error("Profile update error:", err);
        const e = err;
        if (e.name === "ValidationError") {
            return res.status(400).json({ message: e.message || "Validation error" });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.updateProfile = updateProfile;
//# sourceMappingURL=userController.js.map