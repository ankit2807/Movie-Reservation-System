import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { JwtUserPayload } from "../types/express";

const authenticateRequest = (req: Request, res: Response): JwtUserPayload | null => {
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
    const decoded = jwt.verify(token, secret, {
      algorithms: ["HS256"],
    });
    if (typeof decoded === "string" || !decoded || typeof decoded !== "object") {
      res.status(403).json({ message: "Invalid token!" });
      return null;
    }
    const user = decoded as JwtUserPayload;
    req.user = user;
    return user;
  } catch (err: unknown) {
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
export const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
  const user = authenticateRequest(req, res);
  if (user) next();
};

/**
 * Middleware to verify token and check user authorization.
 */
export const verifyTokenAndAuthorization = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const user = authenticateRequest(req, res);
  if (!user) return;
  if (String(user.id) === String(req.params.id) || user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: "Not allowed!" });
  }
};

/**
 * Middleware to verify token and check if user is admin.
 */
export const verifyTokenAndAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const user = authenticateRequest(req, res);
  if (!user) return;
  if (user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: "Not allowed!" });
  }
};
