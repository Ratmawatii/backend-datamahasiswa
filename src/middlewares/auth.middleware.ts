
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { AuthPayload } from "../types/auth.js";

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Token autentikasi tidak ditemukan.",
      });
    }

    const token = authorization.split(" ")[1];
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      return res.status(500).json({
        success: false,
        message: "Konfigurasi autentikasi belum tersedia.",
      });
    }

    const decoded = jwt.verify(token, secret);

    if (typeof decoded === "string") {
      return res.status(401).json({
        success: false,
        message: "Token tidak valid.",
      });
    }

    const payload = decoded as AuthPayload;

    if (
      typeof payload.id !== "number" ||
      typeof payload.role_id !== "number" ||
      typeof payload.role_name !== "string"
    ) {
      return res.status(401).json({
        success: false,
        message: "Isi token tidak valid.",
      });
    }

    req.user = payload;

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Token tidak valid atau sudah kedaluwarsa.",
    });
  }
};

export const authorizeRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role_name)) {
      return res.status(403).json({
        success: false,
        message: "Kamu tidak memiliki izin untuk mengakses fitur ini.",
      });
    }

    next();
  };
};
