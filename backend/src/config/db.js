import dotenv from "dotenv";
import pkg from "pg";

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// pool
//   .query("SELECT NOW()")
//   .then(() => console.log("✅ PostgreSQL connection successful"))
//   .catch((err) =>
//     console.error("❌ PostgreSQL connection failed:", err.message),
//   );

export default pool;
