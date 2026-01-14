import pool from "../config/db.js";

export const createSubchapter = async (req, res) => {
  const chapterId = parseInt(req.params.chapterId, 10);
  const { title, content } = req.body;

  if (!Number.isInteger(chapterId) || !title) {
    return res.status(400).json({ error: "Invalid chapter ID or title" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO subchapters (title, content, chapter_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [title, content || null, chapterId]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating subchapter:", err);
    res.status(500).json({ error: "Server error" });
  }
};
