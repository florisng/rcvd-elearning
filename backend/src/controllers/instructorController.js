import pool from "../config/db.js";

// Get all instructors
export const getInstructors = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, firstname, lastname, email, phone, bio FROM instructors ORDER BY id ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching instructors:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get single instructor by ID with courses
export const getInstructorById = async (req, res) => {
  try {
    const numericId = parseInt(req.params.id, 10); // Ensure it's a number

    const instructorResult = await pool.query(
      `SELECT id, firstname, lastname, email, phone, bio, password
       FROM instructors
       WHERE id = $1`,
      [numericId]
    );

    if (instructorResult.rows.length === 0) {
      return res.status(404).json({ error: "Instructor not found" });
    }

    const instructor = instructorResult.rows[0];

    const coursesResult = await pool.query(
      `SELECT id, title, description, price, duration
       FROM courses
       WHERE instructor_id = $1
       ORDER BY id ASC`,
      [numericId]
    );

    instructor.courses = coursesResult.rows;

    res.json(instructor);
  } catch (err) {
    console.error("Error fetching instructor:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get courses of a specific instructor (for dashboard)
export const getInstructorCourses = async (req, res) => {
  const { id } = req.params; // Use same param as route: /instructor/:id/courses
  try {
    const result = await pool.query(
      "SELECT id, title, description, price, duration FROM courses WHERE instructor_id = $1 ORDER BY id ASC",
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching instructor courses:", err);
    res.status(500).json({ error: "Server error" });
  }
};
