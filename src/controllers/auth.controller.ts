
import type { Request, Response } from "express";
import {
  registerUser,
  loginUser,
} from "../services/auth.service.js";

export const register = async (req: Request, res: Response) => {
  try {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Nama lengkap, email, dan password wajib diisi.",
      });
    }

    if (
      typeof full_name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Format data tidak valid.",
      });
    }

    const result = await registerUser({
      full_name,
      email,
      password,
    });

    return res.status(201).json({
      success: true,
      message: "Registrasi berhasil.",
      data: result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Registrasi gagal.";

    const status = message === "Email sudah terdaftar." ? 409 : 400;

    return res.status(status).json({
      success: false,
      message,
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email dan password wajib diisi.",
      });
    }

    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({
        success: false,
        message: "Format data tidak valid.",
      });
    }

    const result = await loginUser({
      email,
      password,
    });

    return res.status(200).json({
      success: true,
      message: "Login berhasil.",
      data: result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Login gagal.";

    const status = message === "Email atau password salah." ? 401 : 400;

    return res.status(status).json({
      success: false,
      message,
    });
  }
};

export const getMe = (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "Data akun berhasil diambil.",
    data: {
      user: req.user,
    },
  });
};
