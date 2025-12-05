import pool from "../config/db.js";

// Get all instructors
export const getInstructors = async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name FROM instructors ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching instructors:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get single instructor by ID
export const getInstructorById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT id, name FROM instructors WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Instructor not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching instructor:", err);
    res.status(500).json({ error: "Server error" });
  }
};
