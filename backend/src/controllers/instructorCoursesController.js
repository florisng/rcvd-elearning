import pool from "../config/db.js";

/**
 * GET instructor courses
 */
export const getInstructorCourses = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT id, title, description, price, duration
       FROM courses
       WHERE instructor_id = $1
       ORDER BY id DESC`,
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching instructor courses:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * CREATE course
 */
export const createCourse = async (req, res) => {
  const { id } = req.params;
  const { title, description, price, duration } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO courses (title, description, price, duration, instructor_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title, description, price, duration, id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating course:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * UPDATE course
 */
export const updateCourse = async (req, res) => {
  const { courseId } = req.params;
  const { title, description, price, duration } = req.body;

  try {
    await pool.query(
      `UPDATE courses
       SET title=$1, description=$2, price=$3, duration=$4
       WHERE id=$5`,
      [title, description, price, duration, courseId]
    );

    res.json({ message: "Course updated successfully" });
  } catch (err) {
    console.error("Error updating course:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * DELETE course
 */
export const deleteCourse = async (req, res) => {
  const { courseId } = req.params;

  try {
    await pool.query("DELETE FROM courses WHERE id=$1", [courseId]);
    res.json({ message: "Course deleted successfully" });
  } catch (err) {
    console.error("Error deleting course:", err);
    res.status(500).json({ error: "Server error" });
  }
};
