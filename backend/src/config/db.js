// backend/src/config/db.js
import pkg from "pg";
const { Pool } = pkg;

// Update with your PostgreSQL credentials
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "elearning",
  password: "12321",
  port: 5432,
});

export default pool;
