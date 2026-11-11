
import pool from "../config/database.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { AuthPayload } from "../types/auth.js";

interface RegisterData {
  full_name: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

const generateToken = (user: AuthPayload): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET belum dikonfigurasi.");
  }

  return jwt.sign(user, secret, {
    expiresIn: "1d",
  });
};

export const registerUser = async (data: RegisterData) => {
  const fullName = data.full_name.trim();
  const email = data.email.trim().toLowerCase();

  if (!fullName || !email || !data.password) {
    throw new Error("Semua field wajib diisi.");
  }

  if (data.password.length < 8) {
    throw new Error("Password minimal 8 karakter.");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const existingUser = await client.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new Error("Email sudah terdaftar.");
    }

    const roleResult = await client.query(
      "SELECT id FROM roles WHERE role_name = $1",
      ["siswa"]
    );

    if (roleResult.rows.length === 0) {
      throw new Error("Role siswa tidak ditemukan.");
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const userResult = await client.query(
      `INSERT INTO users
       (full_name, email, password_hash, role_id, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, full_name, email, role_id, status`,
      [
        fullName,
        email,
        passwordHash,
        roleResult.rows[0].id,
        "active",
      ]
    );

    await client.query("COMMIT");

    const user: AuthPayload = {
      id: userResult.rows[0].id,
      full_name: userResult.rows[0].full_name,
      email: userResult.rows[0].email,
      role_id: userResult.rows[0].role_id,
      role_name: "siswa",
    };

    return {
      user,
      token: generateToken(user),
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const loginUser = async (data: LoginData) => {
  const email = data.email.trim().toLowerCase();

  const result = await pool.query(
    `SELECT
      u.id,
      u.full_name,
      u.email,
      u.password_hash,
      u.role_id,
      u.status,
      r.role_name
    FROM users u
    JOIN roles r ON r.id = u.role_id
    WHERE u.email = $1`,
    [email]
  );

  if (result.rows.length === 0) {
    throw new Error("Email atau password salah.");
  }

  const userData = result.rows[0];

  if (userData.status !== "active") {
    throw new Error("Akun tidak aktif. Hubungi administrator.");
  }

  const passwordValid = await bcrypt.compare(
    data.password,
    userData.password_hash
  );

  if (!passwordValid) {
    throw new Error("Email atau password salah.");
  }

  const user: AuthPayload = {
    id: userData.id,
    full_name: userData.full_name,
    email: userData.email,
    role_id: userData.role_id,
    role_name: userData.role_name,
  };

  return {
    user,
    token: generateToken(user),
  };
};
