
import "dotenv/config";
import app from "./app.js";
import pool from "./config/database.js";

const PORT = Number(process.env.PORT) || 5000;

async function startServer() {
  try {
    // Memastikan koneksi database berhasil
    await pool.query("SELECT NOW()");

    console.log("PostgreSQL connection successful.");

    app.listen(PORT, () => {
      console.log(`STUDENTHUB API running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
