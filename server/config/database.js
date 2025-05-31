const { Pool } = require("pg");
require("dotenv").config();

// Configure database connection
const dbConfig = {};

// Use either connection string (for production) or individual params (for development)
if (process.env.DATABASE_URL) {
  // Production database (Render) - always use SSL
  dbConfig.connectionString = process.env.DATABASE_URL;
  dbConfig.ssl = { rejectUnauthorized: false };
} else {
  // Local development - no SSL
  dbConfig.host = process.env.DB_HOST || "localhost";
  dbConfig.port = process.env.DB_PORT || 5432;
  dbConfig.database = process.env.DB_NAME || "blogify";
  dbConfig.user = process.env.DB_USER || "postgres";
  dbConfig.password = process.env.DB_PASSWORD;
  dbConfig.ssl = false;
}

const pool = new Pool(dbConfig);

// Test the connection
pool.on("connect", () => {
  console.log("Connected to PostgreSQL database");
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

module.exports = pool;
