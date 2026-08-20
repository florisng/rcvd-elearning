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
 * CREATE chapter
 */
export const createChapter = async (req, res) => {
  const courseId = parseInt(req.params.courseId, 10);
  const { title } = req.body;

  if (!Number.isInteger(courseId) || !title?.trim()) {
    return res.status(400).json({
      error: "Invalid course ID or title",
    });
  }

  try {
    const instructorId = await getInstructorId(req.user.id);

    if (!instructorId) {
      return res.status(404).json({
        error: "Instructor profile not found.",
      });
    }

    const courseResult = await pool.query(
      `SELECT id
       FROM courses
       WHERE id = $1
         AND instructor_id = $2`,
      [courseId, instructorId],
    );

    if (courseResult.rows.length === 0) {
      return res.status(404).json({
        error: "Course not found or you are not authorized to modify it.",
      });
    }

    const result = await pool.query(
      `INSERT INTO chapters (title, course_id)
       VALUES ($1, $2)
       RETURNING *`,
      [title.trim(), courseId],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating chapter:", err);

    res.status(500).json({
      error: "Server error",
    });
  }
};

/**
 * GET chapters for instructor's course
 */
export const getChapters = async (req, res) => {
  const courseId = parseInt(req.params.courseId, 10);

  if (!Number.isInteger(courseId)) {
    return res.status(400).json({
      error: "Invalid course ID",
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
      `SELECT chapters.*
       FROM chapters
       JOIN courses ON courses.id = chapters.course_id
       WHERE chapters.course_id = $1
         AND courses.instructor_id = $2
       ORDER BY chapters.id ASC`,
      [courseId, instructorId],
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching chapters:", err);

    res.status(500).json({
      error: "Server error",
    });
  }
};

/**
 * UPDATE chapter
 */
export const updateChapter = async (req, res) => {
  const chapterId = parseInt(req.params.chapterId, 10);
  const { title } = req.body;

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

    const result = await pool.query(
      `UPDATE chapters
       SET title = $1
       WHERE chapters.id = $2
         AND EXISTS (
           SELECT 1
           FROM courses
           WHERE courses.id = chapters.course_id
             AND courses.instructor_id = $3
         )
       RETURNING chapters.*`,
      [title.trim(), chapterId, instructorId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Chapter not found or you are not authorized to modify it.",
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating chapter:", err);

    res.status(500).json({
      error: "Server error",
    });
  }
};

/**
 * DELETE chapter
 */
export const deleteChapter = async (req, res) => {
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
      `DELETE FROM chapters
       WHERE chapters.id = $1
         AND EXISTS (
           SELECT 1
           FROM courses
           WHERE courses.id = chapters.course_id
             AND courses.instructor_id = $2
         )
       RETURNING chapters.*`,
      [chapterId, instructorId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Chapter not found or you are not authorized to delete it.",
      });
    }

    res.json({
      message: "Chapter deleted successfully.",
    });
  } catch (err) {
    console.error("Error deleting chapter:", err);

    res.status(500).json({
      error: "Server error",
    });
  }
};
