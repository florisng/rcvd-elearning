import pool from "../config/db.js";

// Get all courses
export const getCourses = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT c.id, c.title, c.description, c.duration, c.price, i.name AS instructor_name FROM courses c LEFT JOIN instructors i ON c.instructor_id = i.id ORDER BY c.id ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching courses:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get single course by ID
export const getCourseById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT c.id, c.title, c.description, c.duration, c.price, i.name AS instructor_name FROM courses c LEFT JOIN instructors i ON c.instructor_id = i.id WHERE c.id = $1",
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Course not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching course:", err);
    res.status(500).json({ error: "Server error" });
  }
};
