
import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || "studenthub_db",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD,
});

pool.on("connect", () => {
  console.log("Database PostgreSQL berhasil terhubung.");
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL error:", error);
});

export default pool;
