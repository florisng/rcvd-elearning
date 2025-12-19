import pool from "../config/db.js";

// Get all instructors
export const getInstructors = async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, email, phone, bio FROM instructors ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching instructors:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get single instructor by ID with courses
export const getInstructorById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT id, name, email, phone, bio FROM instructors WHERE id = $1",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Instructor not found" });
    }
    const instructor = result.rows[0];

    // Fetch courses for this instructor
    const coursesResult = await pool.query(
      "SELECT id, title, description, price, duration FROM courses WHERE instructor_id = $1 ORDER BY id ASC",
      [id]
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
  const { instructorId } = req.params;
  try {
    const result = await pool.query(
      "SELECT id, title, description, price, duration FROM courses WHERE instructor_id = $1 ORDER BY id ASC",
      [instructorId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching instructor courses:", err);
    res.status(500).json({ error: "Server error" });
  }
};
