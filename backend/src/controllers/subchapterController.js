import pool from "../config/db.js";

/**
 * Get instructor ID from authenticated user
 */
const getInstructorId = async (userId) => {
  const result = await pool.query(
    `SELECT id
     FROM instructors
     WHERE user_id = $1`,
    [userId],
  );

  return result.rows.length ? result.rows[0].id : null;
};

/**
 * CREATE subchapter
 */
export const createSubchapter = async (req, res) => {
  const chapterId = parseInt(req.params.chapterId, 10);
  const { title, content } = req.body;

  if (!Number.isInteger(chapterId) || !title?.trim()) {
    return res.status(400).json({
      error: "Invalid chapter ID or title",
    });
  }

  try {
    const instructorId = await getInstructorId(req.user.id);

    if (!instructorId) {
      return res.status(404).json({
        error: "Instructor profile not found.",
      });
    }

    // Verify chapter belongs to an unpublished course owned by this instructor
    const chapterResult = await pool.query(
      `SELECT chapters.id FROM chapters JOIN courses ON courses.id = chapters.course_id WHERE chapters.id = $1 AND courses.instructor_id = $2 AND courses.status <> 'PUBLISHED'`,
      [chapterId, instructorId],
    );

    if (chapterResult.rows.length === 0) {
      return res.status(404).json({
        error: "Chapter not found or you are not authorized to modify it.",
      });
    }

    const result = await pool.query(
      `INSERT INTO subchapters (title, content, chapter_id) VALUES ($1, $2, $3) RETURNING *`,
      [title.trim(), content || null, chapterId],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating subchapter:", err);

    res.status(500).json({
      error: "Server error",
    });
  }
};

/**
 * GET subchapters for a chapter
 */
export const getSubchapters = async (req, res) => {
  const chapterId = parseInt(req.params.chapterId, 10);

  if (!Number.isInteger(chapterId)) {
    return res.status(400).json({
      error: "Invalid chapter ID",
    });
  }

  try {
    const instructorId = await getInstructorId(req.user.id);

    if (!instructorId) {
      return res.status(404).json({
        error: "Instructor profile not found.",
      });
    }

    const result = await pool.query(
      `SELECT subchapters.*
       FROM subchapters
       JOIN chapters ON chapters.id = subchapters.chapter_id
       JOIN courses ON courses.id = chapters.course_id
       WHERE subchapters.chapter_id = $1
         AND courses.instructor_id = $2
       ORDER BY subchapters.id ASC`,
      [chapterId, instructorId],
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching subchapters:", err);

    res.status(500).json({
      error: "Server error",
    });
  }
};

/**
 * UPDATE subchapter
 */
export const updateSubchapter = async (req, res) => {
  const subchapterId = parseInt(req.params.subchapterId, 10);
  const { title, content } = req.body;

  if (!Number.isInteger(subchapterId) || !title?.trim()) {
    return res.status(400).json({
      error: "Invalid subchapter ID or title",
    });
  }

  try {
    const instructorId = await getInstructorId(req.user.id);

    if (!instructorId) {
      return res.status(404).json({
        error: "Instructor profile not found.",
      });
    }

    const result = await pool.query(
      `UPDATE subchapters SET title = $1, content = $2 WHERE subchapters.id = $3 AND EXISTS (SELECT 1 FROM chapters JOIN courses ON courses.id = chapters.course_id WHERE chapters.id = subchapters.chapter_id AND courses.instructor_id = $4 AND courses.status <> 'PUBLISHED') RETURNING subchapters.*`,
      [title.trim(), content || null, subchapterId, instructorId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Subchapter not found or you are not authorized to modify it.",
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating subchapter:", err);

    res.status(500).json({
      error: "Server error",
    });
  }
};

/**
 * DELETE subchapter
 */
export const deleteSubchapter = async (req, res) => {
  const subchapterId = parseInt(req.params.subchapterId, 10);

  if (!Number.isInteger(subchapterId)) {
    return res.status(400).json({
      error: "Invalid subchapter ID",
    });
  }

  try {
    const instructorId = await getInstructorId(req.user.id);

    if (!instructorId) {
      return res.status(404).json({
        error: "Instructor profile not found.",
      });
    }

    const result = await pool.query(
      `DELETE FROM subchapters WHERE subchapters.id = $1 AND EXISTS (SELECT 1 FROM chapters JOIN courses ON courses.id = chapters.course_id WHERE chapters.id = subchapters.chapter_id AND courses.instructor_id = $2 AND courses.status <> 'PUBLISHED') RETURNING subchapters.*`,
      [subchapterId, instructorId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Subchapter not found or you are not authorized to delete it.",
      });
    }

    res.json({
      message: "Subchapter deleted successfully.",
    });
  } catch (err) {
    console.error("Error deleting subchapter:", err);

    res.status(500).json({
      error: "Server error",
    });
  }
};
