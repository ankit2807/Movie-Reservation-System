const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/**
 * Register a new user.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Basic input validation
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
    });

    // Save new user
    const savedUser = await newUser.save();
    const { password: _, ...userDetails } = savedUser._doc;
    return res.status(201).json(userDetails);
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Login a user.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    // const decodedPassword = Buffer.from(password, 'base64').toString('utf-8');

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const validated = await bcrypt.compare(password, user.password);
    if (!validated) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const token = jwt.sign(
      { id: user._id, isAdmin: false }, // Users are not admins
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const { password: _, ...otherDetails } = user._doc;

    return res
      .cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      })
      .status(200)
      .json({ ...otherDetails, isAdmin: user.isAdmin });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Logout a user.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const logout = async (req, res) => {
  try {
    // Clear the access_token cookie
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ message: "An error occurred during logout" });
  }
};

/**
 * Update user profile.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, gender, isMarried, birthday } = req.body;
    const userId = req.user.id;

    // Use findByIdAndUpdate for atomic update
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
        email,
        phone,
        gender,
        isMarried,
        birthday
      },
      { new: true, runValidators: true }
    ).select("-password"); // Exclude password from result

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return flattened structure to match login
    return res.status(200).json(updatedUser);
  } catch (err) {
    console.error("Profile update error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  register,
  login,
  logout,
  updateProfile,
};
