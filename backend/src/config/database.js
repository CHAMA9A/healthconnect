const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || "healthconnect",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
});

pool.on("connect", () => {
  console.log("✅ Connecté à PostgreSQL");
});

pool.on("error", (err) => {
  console.error("❌ Erreur de connexion PostgreSQL :", err.message);
});

module.exports = pool;