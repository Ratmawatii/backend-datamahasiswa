
import express from "express";
import cors from "cors";
import studentRoutes from "./routes/student.routes.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "STUDENTHUB API is running!",
  });
});

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "STUDENTHUB API is healthy",
    timestamp: new Date().toISOString(),
  });
});

// Authentication
app.use("/api/auth", authRoutes);

// Student CRUD
app.use("/api/students", studentRoutes);

export default app;
