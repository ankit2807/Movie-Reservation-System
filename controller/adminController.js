const Admin = require("../models/adminModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/**
 * Register a new admin (Useful for seeding).
 */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(409).json({ message: "Admin already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = new Admin({
      name: name || "Admin",
      email,
      password: hashedPassword,
    });

    await newAdmin.save();
    return res.status(201).json({ message: "Admin created successfully" });
  } catch (err) {
    console.error("Admin registration error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Login an admin.
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const admin = await Admin.findOne({ email });
    // const decodedPassword = Buffer.from(password, 'base64').toString('utf-8');

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const validated = await bcrypt.compare(password, admin.password);
    if (!validated) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const token = jwt.sign(
      { id: admin._id, isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res
      .cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      })
      .status(200)
      .json({
        email: admin.email,
        name: admin.name,
        isAdmin: true,
        role: 'admin'
      });
  } catch (err) {
    console.error("Admin login error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  register,
  login,
};
