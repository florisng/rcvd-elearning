import pool from "../config/db.js";

/**
 * GET /api/instructors
 * Fetch all instructors
 */
export const getInstructors = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, name FROM instructors ORDER BY id ASC"
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching instructors:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/instructors/:id
 * Fetch instructor by ID
 */
// Get single instructor by ID
export const getInstructorById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT id, name, email, phone, bio
       FROM instructors
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Instructor not found" });
    }

    // Optional: fetch instructor's courses
    const coursesResult = await pool.query(
      `SELECT id, title, description, price
       FROM courses
       WHERE instructor_id = $1
       ORDER BY id ASC`,
      [id]
    );

    const instructor = result.rows[0];
    instructor.courses = coursesResult.rows;

    res.json(instructor);
  } catch (err) {
    console.error("Error fetching instructor:", err);
    res.status(500).json({ error: "Server error" });
  }
};

