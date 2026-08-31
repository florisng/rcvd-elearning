import pool from "../config/db.js";

/**
 * Get the instructor profile ID from the authenticated user.
 */
const getInstructorId = async (userId) => {
  const result = await pool.query(
    `SELECT id
     FROM instructors
     WHERE user_id = $1`,
    [userId],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0].id;
};

/**
 * GET instructor courses
 */
export const getInstructorCourses = async (req, res) => {
  try {
    const instructorId = await getInstructorId(req.user.id);

    if (!instructorId) {
      return res.status(404).json({
        error: "Instructor profile not found.",
      });
    }

    const result = await pool.query(
      `SELECT
        id,
        title,
        description,
        price,
        duration,
        target_professional_title
      FROM courses
      WHERE instructor_id = $1
      ORDER BY created_at DESC`,
      [instructorId],
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching instructor courses:", err);

    res.status(500).json({
      error: "Server error",
    });
  }
};

/**
 * GET one instructor course with chapters and subchapters
 */
export const getInstructorCourse = async (req, res) => {
  try {
    const instructorId = await getInstructorId(req.user.id);
    const { courseId } = req.params;

    if (!instructorId) {
      return res.status(404).json({
        error: "Instructor profile not found.",
      });
    }

    const courseResult = await pool.query(
      `SELECT
        id,
        title,
        description,
        price,
        duration,
        target_professional_title
       FROM courses
       WHERE id = $1
         AND instructor_id = $2`,
      [courseId, instructorId],
    );

    if (courseResult.rows.length === 0) {
      return res.status(404).json({
        error: "Course not found or you are not authorized to access it.",
      });
    }

    const course = courseResult.rows[0];

    const chaptersResult = await pool.query(
      `SELECT
        id,
        title
       FROM chapters
       WHERE course_id = $1
       ORDER BY id`,
      [courseId],
    );

    const chapters = [];

    for (const chapter of chaptersResult.rows) {
      const subchaptersResult = await pool.query(
        `SELECT
          id,
          title,
          content
         FROM subchapters
         WHERE chapter_id = $1
         ORDER BY id`,
        [chapter.id],
      );

      chapters.push({
        ...chapter,
        subchapters: subchaptersResult.rows,
      });
    }

    res.json({
      ...course,
      chapters,
    });
  } catch (err) {
    console.error("Error fetching instructor course:", err);

    res.status(500).json({
      error: "Server error",
    });
  }
};

/**
 * CREATE course
 *
 * A course can be created without chapters.
 * Chapters and subchapters are added later through Course Builder.
 */
export const createCourse = async (req, res) => {
  try {
    const instructorId = await getInstructorId(req.user.id);

    if (!instructorId) {
      return res.status(404).json({
        error: "Instructor profile not found.",
      });
    }

    const { title, description, target_professional_title, price, duration } =
      req.body;

    // Validate course title
    if (!title || !title.trim()) {
      return res.status(400).json({
        error: "Course title is required.",
      });
    }

    // Validate professional title
    const allowedProfessionalTitles = [
      "Veterinary Technician (A1, A2)",
      "Veterinary Technologist",
      "Animal Scientist",
      "Veterinary Doctor",
    ];

    if (
      !target_professional_title ||
      !allowedProfessionalTitles.includes(target_professional_title)
    ) {
      return res.status(400).json({
        error: "Please select a valid professional title.",
      });
    }

    // Create the course
    const result = await pool.query(
      `INSERT INTO courses (
        title,
        description,
        target_professional_title,
        price,
        duration,
        instructor_id
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        title.trim(),
        description?.trim() || null,
        target_professional_title,
        price || 0,
        duration || null,
        instructorId,
      ],
    );

    const course = result.rows[0];

    // New courses start with no chapters.
    course.chapters = [];

    res.status(201).json({
      message: "Course created successfully.",
      course,
    });
  } catch (err) {
    console.error("Error creating course:", err);

    res.status(500).json({
      error: "Failed to create course.",
    });
  }
};

/**
 * UPDATE course
 */
export const updateCourse = async (req, res) => {
  try {
    const instructorId = await getInstructorId(req.user.id);

    if (!instructorId) {
      return res.status(404).json({
        error: "Instructor profile not found.",
      });
    }

    const { courseId } = req.params;

    const { title, description, target_professional_title, price, duration } =
      req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        error: "Course title is required.",
      });
    }

    const result = await pool.query(
      `UPDATE courses
       SET
         title = $1,
         description = $2,
         target_professional_title = $3,
         price = $4,
         duration = $5
       WHERE id = $6
         AND instructor_id = $7
       RETURNING *`,
      [
        title.trim(),
        description?.trim() || null,
        target_professional_title,
        price || 0,
        duration || null,
        courseId,
        instructorId,
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Course not found or you are not authorized to modify it.",
      });
    }

    res.json({
      message: "Course updated successfully.",
      course: result.rows[0],
    });
  } catch (err) {
    console.error("Error updating course:", err);

    res.status(500).json({
      error: "Server error",
    });
  }
};

/**
 * DELETE course
 *
 * The database handles cascading deletion of:
 * - Chapters
 * - Subchapters
 */
export const deleteCourse = async (req, res) => {
  try {
    const instructorId = await getInstructorId(req.user.id);

    if (!instructorId) {
      return res.status(404).json({
        error: "Instructor profile not found.",
      });
    }

    const { courseId } = req.params;

    const result = await pool.query(
      `DELETE FROM courses
       WHERE id = $1
         AND instructor_id = $2
       RETURNING id`,
      [courseId, instructorId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Course not found or you are not authorized to delete it.",
      });
    }

    res.json({
      message: "Course deleted successfully.",
    });
  } catch (err) {
    console.error("Error deleting course:", err);

    res.status(500).json({
      error: "Server error",
    });
  }
};
