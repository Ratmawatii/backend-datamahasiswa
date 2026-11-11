
import type { Request, Response } from "express";
import pool from "../config/database.js";

// GET: Menampilkan semua mahasiswa

export const getAllStudents = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));

    const offset = (page - 1) * limit;

    // Hitung total data mahasiswa
    const countResult = await pool.query(
      "SELECT COUNT(*) FROM students"
    );

    const totalData = Number(countResult.rows[0].count);
    const totalPages = Math.ceil(totalData / limit);

    // Ambil data sesuai halaman
    const result = await pool.query(
      `SELECT * FROM students
       ORDER BY id DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return res.status(200).json({
      success: true,
      message: "Data mahasiswa berhasil diambil",
      data: result.rows,
      pagination: {
        currentPage: page,
        limit,
        totalData,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error("Error getAllStudents:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data mahasiswa"
    });
  }
};


// GET: Menampilkan mahasiswa berdasarkan ID
export const getStudentById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID mahasiswa tidak valid",
      });
    }

    const result = await pool.query(
      "SELECT * FROM students WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Mahasiswa tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil detail mahasiswa",
    });
  }
};

// POST: Menambahkan mahasiswa
export const createStudent = async (req: Request, res: Response) => {
  try {
    const {
      nim,
      full_name,
      gender,
      birth_place,
      birth_date,
      class_name,
      address,
      mother_name,
      guardian_phone,
      notes,
    } = req.body;

    if (!nim || !full_name || !gender) {
      return res.status(400).json({
        success: false,
        message: "NIM, nama lengkap, dan jenis kelamin wajib diisi",
      });
    }

    if (!["Laki-laki", "Perempuan"].includes(gender)) {
      return res.status(400).json({
        success: false,
        message: "Jenis kelamin tidak valid",
      });
    }

    const result = await pool.query(
      `INSERT INTO students
      (nim, full_name, gender, birth_place, birth_date, class_name,
       address, mother_name, guardian_phone, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        nim,
        full_name,
        gender,
        birth_place || null,
        birth_date || null,
        class_name || null,
        address || null,
        mother_name || null,
        guardian_phone || null,
        notes || null,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Mahasiswa berhasil ditambahkan",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Gagal menambahkan mahasiswa. Periksa kemungkinan NIM duplikat.",
    });
  }
};

// PUT: Mengubah data mahasiswa
export const updateStudent = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID mahasiswa tidak valid",
      });
    }

    const {
      nim,
      full_name,
      gender,
      birth_place,
      birth_date,
      class_name,
      address,
      mother_name,
      guardian_phone,
      notes,
    } = req.body;

    if (!nim || !full_name || !gender) {
      return res.status(400).json({
        success: false,
        message: "NIM, nama lengkap, dan jenis kelamin wajib diisi",
      });
    }

    if (!["Laki-laki", "Perempuan"].includes(gender)) {
      return res.status(400).json({
        success: false,
        message: "Jenis kelamin tidak valid",
      });
    }

    const result = await pool.query(
      `UPDATE students SET
        nim = $1,
        full_name = $2,
        gender = $3,
        birth_place = $4,
        birth_date = $5,
        class_name = $6,
        address = $7,
        mother_name = $8,
        guardian_phone = $9,
        notes = $10,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING *`,
      [
        nim,
        full_name,
        gender,
        birth_place || null,
        birth_date || null,
        class_name || null,
        address || null,
        mother_name || null,
        guardian_phone || null,
        notes || null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Mahasiswa tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      message: "Data mahasiswa berhasil diperbarui",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Gagal memperbarui data mahasiswa",
    });
  }
};

// DELETE: Menghapus mahasiswa
export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID mahasiswa tidak valid",
      });
    }

    const result = await pool.query(
      "DELETE FROM students WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Mahasiswa tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      message: "Mahasiswa berhasil dihapus",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Gagal menghapus mahasiswa",
    });
  }
};
