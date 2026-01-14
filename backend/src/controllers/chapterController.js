import pool from "../config/db.js";

export const createChapter = async (req, res) => {
  const courseId = parseInt(req.params.courseId, 10);
  const { title } = req.body;

  if (!Number.isInteger(courseId) || !title) {
    return res.status(400).json({ error: "Invalid course ID or title" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO chapters (title, course_id)
       VALUES ($1, $2)
       RETURNING *`,
      [title, courseId]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating chapter:", err);
    res.status(500).json({ error: "Server error" });
  }
};
