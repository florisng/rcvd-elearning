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
        c.duration,
        c.price,
        c.created_at,
        c.target_professional_title,
        i.firstname || ' ' || i.lastname AS instructor_name
      FROM courses c
      LEFT JOIN instructors i ON c.instructor_id = i.id
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
