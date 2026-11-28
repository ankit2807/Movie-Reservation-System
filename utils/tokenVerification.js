const jwt = require("jsonwebtoken");

const authenticateRequest = (req, res) => {
  const token = req.cookies?.access_token;
  if (!token || typeof token !== "string") {
    res.status(401).json({ message: "You are not authenticated!" });
    return null;
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
    req.user = user;
    return user;
  } catch (err) {
    if (err.name === "TokenExpiredError") {
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
  if (user) next();
};

/**
 * Middleware to verify token and check user authorization.
 */
const verifyTokenAndAuthorization = (req, res, next) => {
  const user = authenticateRequest(req, res);
  if (!user) return;
  if (String(user.id) === String(req.params.id) || user.isAdmin) {
    next();
  } else {
    return res.status(403).json({ message: "Not allowed!" });
  }
};

/**
 * Middleware to verify token and check if user is admin.
 */
const verifyTokenAndAdmin = (req, res, next) => {
  const user = authenticateRequest(req, res);
  if (!user) return;
  if (user.isAdmin) {
    next();
  } else {
    return res.status(403).json({ message: "Not allowed!" });
  }
};

module.exports = {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
};
