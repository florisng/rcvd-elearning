import pool from "../config/db.js";

/**
 * Get all courses
 *
 * Public course listing.
 */
export const getCourses = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.id,
        c.title,
        c.description,
        c.price,
        c.created_at,
        c.target_professional_title,
        i.firstname || ' ' || i.lastname AS instructor_name
      FROM courses c
      LEFT JOIN instructors i
        ON c.instructor_id = i.id

      WHERE
        c.status = 'PUBLISHED'
        AND TRIM(COALESCE(c.title, '')) <> ''
        AND TRIM(COALESCE(c.description, '')) <> ''

        AND EXISTS (
          SELECT 1
          FROM chapters ch
          WHERE ch.course_id = c.id
        )

        AND EXISTS (
          SELECT 1
          FROM subchapters s
          JOIN chapters ch
            ON ch.id = s.chapter_id
          WHERE ch.course_id = c.id
            AND TRIM(COALESCE(s.title, '')) <> ''
            AND TRIM(COALESCE(s.content, '')) <> ''
        )

        AND EXISTS (
          SELECT 1
          FROM tests t
          WHERE t.course_id = c.id
        )

        AND EXISTS (
          SELECT 1
          FROM tests t
          JOIN test_questions tq
            ON tq.test_id = t.id
          WHERE t.course_id = c.id
        )
      ORDER BY c.created_at DESC, c.id DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching courses:", err);

    res.status(500).json({
      error: "Server error",
    });
  }
};

/**
 * Get course by ID
 *
 * Returns:
 * - Course information
 * - Instructor information
 * - Chapters
 * - Subchapters
 */
export const getCourseById = async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch course information with instructor name
    const courseResult = await pool.query(
      `
      SELECT 
        c.*,
        i.firstname || ' ' || i.lastname AS instructor_name
      FROM courses c
      LEFT JOIN instructors i ON c.instructor_id = i.id
      WHERE c.id = $1
      `,
      [id],
    );

    if (courseResult.rows.length === 0) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    const course = courseResult.rows[0];

    // Fetch chapters
    const chaptersResult = await pool.query(
      `
      SELECT *
      FROM chapters
      WHERE course_id = $1
      ORDER BY id
      `,
      [id],
    );

    const chapters = chaptersResult.rows;

    // Fetch subchapters for each chapter
    for (const chapter of chapters) {
      const subchaptersResult = await pool.query(
        `
        SELECT *
        FROM subchapters
        WHERE chapter_id = $1
        ORDER BY id
        `,
        [chapter.id],
      );

      chapter.subchapters = subchaptersResult.rows;
    }

    course.chapters = chapters;

    res.json(course);
  } catch (err) {
    console.error("Error fetching course by ID:", err);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const publishCourse = async (req, res) => {
  const courseId = parseInt(req.params.id, 10);

  if (!Number.isInteger(courseId)) {
    return res.status(400).json({
      error: "Invalid course ID.",
    });
  }

  try {
    // Make sure the course belongs to this instructor
    const courseResult = await pool.query(
      `SELECT id, status
       FROM courses
       WHERE id = $1
         AND instructor_id = (
           SELECT id
           FROM instructors
           WHERE user_id = $2
         )`,
      [courseId, req.user.id],
    );

    if (courseResult.rows.length === 0) {
      return res.status(404).json({
        error: "Course not found or you are not authorized to publish it.",
      });
    }

    // Check minimum course requirements
    const validationResult = await pool.query(
      `SELECT
        EXISTS (
          SELECT 1
          FROM chapters
          WHERE course_id = $1
        ) AS has_chapter,

        EXISTS (
          SELECT 1
          FROM subchapters s
          JOIN chapters ch
            ON ch.id = s.chapter_id
          WHERE ch.course_id = $1
            AND TRIM(COALESCE(s.title, '')) <> ''
            AND TRIM(COALESCE(s.content, '')) <> ''
        ) AS has_subchapter,

        EXISTS (
          SELECT 1
          FROM tests
          WHERE course_id = $1
        ) AS has_test,

        EXISTS (
          SELECT 1
          FROM tests t
          JOIN test_questions tq
            ON tq.test_id = t.id
          WHERE t.course_id = $1
        ) AS has_question`,
      [courseId],
    );

    const validation = validationResult.rows[0];

    const missing = [];

    if (!validation.has_chapter) {
      missing.push("at least one chapter");
    }

    if (!validation.has_subchapter) {
      missing.push("at least one subchapter with content");
    }

    if (!validation.has_test) {
      missing.push("a test");
    }

    if (!validation.has_question) {
      missing.push("at least one test question");
    }

    if (missing.length > 0) {
      return res.status(400).json({
        error: "Course is not ready to publish.",
        missing,
      });
    }

    // Publish the course
    const result = await pool.query(
      `UPDATE courses
       SET status = 'PUBLISHED'
       WHERE id = $1
       RETURNING *`,
      [courseId],
    );

    res.json({
      message: "Course published successfully.",
      course: result.rows[0],
    });
  } catch (err) {
    console.error("Error publishing course:", err);

    res.status(500).json({
      error: "Server error.",
    });
  }
};

export const unpublishCourse = async (req, res) => {
  const courseId = parseInt(req.params.id, 10);

  if (!Number.isInteger(courseId)) {
    return res.status(400).json({
      error: "Invalid course ID.",
    });
  }

  try {
    // Make sure the course belongs to this instructor
    const courseResult = await pool.query(
      `SELECT id, status
       FROM courses
       WHERE id = $1
         AND instructor_id = (
           SELECT id
           FROM instructors
           WHERE user_id = $2
         )`,
      [courseId, req.user.id],
    );

    if (courseResult.rows.length === 0) {
      return res.status(404).json({
        error: "Course not found or you are not authorized to unpublish it.",
      });
    }

    // Change the course back to draft
    const result = await pool.query(
      `UPDATE courses
       SET status = 'DRAFT'
       WHERE id = $1
       RETURNING *`,
      [courseId],
    );

    res.json({
      message: "Course unpublished successfully.",
      course: result.rows[0],
    });
  } catch (err) {
    console.error("Error unpublishing course:", err);

    res.status(500).json({
      error: "Server error.",
    });
  }
};
