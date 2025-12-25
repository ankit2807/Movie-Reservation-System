const jwt = require("jsonwebtoken");

/**
 * Middleware to verify JWT token from cookies.
 * Sets req.user if token is valid.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) {
    return res.status(401).json({ message: "You are not authenticated!" });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired!" });
    }
    return res.status(403).json({ message: "Invalid token!" });
  }
};

/**
 * Middleware to verify token and check user authorization.
 * Allows access if user ID matches params ID or user is admin.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const verifyTokenAndAuthorization = (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) {
    return res.status(401).json({ message: "You are not authenticated!" });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    if (req.user.id === req.params.id || req.user.isAdmin) {
      next();
    } else {
      return res.status(403).json({ message: "Not allowed!" });
    }
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired!" });
    }
    return res.status(403).json({ message: "Invalid token!" });
  }
};

/**
 * Middleware to verify token and check if user is admin.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const verifyTokenAndAdmin = (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) {
    return res.status(401).json({ message: "You are not authenticated!" });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    if (req.user.isAdmin) {
      next();
    } else {
      return res.status(403).json({ message: "Not allowed!" });
    }
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired!" });
    }
    return res.status(403).json({ message: "Invalid token!" });
  }
};

module.exports = {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
};
