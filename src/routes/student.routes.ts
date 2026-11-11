
import { Router } from "express";

import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../controllers/student.controller.js";

const router = Router();

// GET semua mahasiswa
router.get("/", getAllStudents);

// GET mahasiswa berdasarkan ID
router.get("/:id", getStudentById);

// POST tambah mahasiswa
router.post("/", createStudent);

// PUT ubah mahasiswa
router.put("/:id", updateStudent);

// DELETE hapus mahasiswa
router.delete("/:id", deleteStudent);

export default router;
